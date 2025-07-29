const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

exports.register = async (req, res) => {
  const { name, username, password, role } = req.body;

  try {
    
    const [rows] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      return res.render('register', { error: 'Ce nom d’utilisateur est déjà utilisé.', user: req.user });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [usersCount] = await db.promise().query('SELECT COUNT(*) AS total FROM users');
    const isFirstUser = usersCount[0].total === 0;

    let finalRole = 'user'; 

    if (role === 'admin') {
      if (isFirstUser || (req.user && req.user.role === 'admin')) {
        finalRole = 'admin'; 
      } else {
        return res.render('register', { error: 'Vous n’êtes pas autorisé à créer un compte admin.', user: req.user });
      }
    }

    await db.promise().query(
      'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
      [name, username, hashedPassword, finalRole]
    );

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Erreur lors de l’inscription.', user: req.user });
  }
};


// 👉 Connexion
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [[user]] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return res.render('login', { error: 'Email incorrect', username });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.render('login', { error: 'Mot de passe incorrect', username });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 heure
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Erreur serveur, réessayez plus tard.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.redirect('/login');
};
