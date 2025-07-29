const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login?error=Veuillez vous connecter.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    res.locals.user = decoded;
    next();
  } catch (err) {
    console.error('JWT error:', err.message);
    res.clearCookie('token');
    return res.redirect('/login?error=Session expirée. Veuillez vous reconnecter.');
  }
};
