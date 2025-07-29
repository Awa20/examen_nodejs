const db = require('../models/db');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');     
const { isAdmin } = require('../middlewares/roleMiddleware');  
router.get('/register', (req, res) => {
  const error = req.query.error || null;
  res.render('register', { error });
});
router.post('/register', userController.register);
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', userController.login);
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.redirect('/login');
});
router.get('/admin/users', authMiddleware,isAdmin, (req, res) => {
  db.query('SELECT id, name, username, role FROM users', (err, results) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.render('listeuser', { users: results, user: null });
  });
});
router.get('/admin/users/create-form', authMiddleware, isAdmin, (req, res) => {
  res.render('user', {
    user: null
  });
});
router.post('/admin/users/create', authMiddleware, isAdmin, (req, res) => {
  const { name, username, password, role } = req.body;

  // Vérifie si un champ est manquant
  if (!name || !username || !password || !role) {
    return res.status(400).send("Veuillez remplir tous les champs !");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    'INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)',
    [name, username, hashedPassword, role],
    (err) => {
      if (err) {
        console.error('❌ Erreur SQL :', err);
        return res.status(500).send('Erreur lors de la création');
      }
      res.redirect('/admin/users');
    }
  );
});
router.post('/admin/users/delete/:id', authMiddleware, isAdmin, (req, res) => {
  const userId = req.params.id;

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Erreur suppression utilisateur:', err);
      return res.status(500).send('Erreur lors de la suppression');
    }
    res.redirect('/admin/users');
  });
});
router.get('/admin/users/edit/:id', authMiddleware, isAdmin, (req, res) => {
  const userId = req.params.id;

  db.query('SELECT id, name, username, role FROM users WHERE id = ?', [userId], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send('Utilisateur non trouvé');
    }
    res.render('edituser', { user: results[0] });
  });
});
router.post('/admin/users/edit/:id', authMiddleware, isAdmin, (req, res) => {
   console.log("REQ.BODY =>", req.body);
  const userId = req.params.id;
  const { name, username, role } = req.body;

  if (!name || !username || !role) {
    return res.status(400).send('Veuillez remplir tous les champs.');
  }

  db.query(
    'UPDATE users SET name = ?, username = ?, role = ? WHERE id = ?',
    [name, username, role, userId],
    (err) => {
      if (err) {
        console.error('Erreur lors de la modification:', err);
        return res.status(500).send('Erreur lors de la modification');
      }
      res.redirect('/admin/users');
    }
  );
});
module.exports = router;
