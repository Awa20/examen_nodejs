const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');

dotenv.config();

const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const etudiantsRoutes = require('./routes/etudiantsRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
app.use((req, res, next) => {
  res.locals.success = req.query.success || null;
  res.locals.error = req.query.error || null;
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.use('/', userRoutes);
app.use('/dashboard', authMiddleware, dashboardRoutes);
app.use('/etudiants', authMiddleware, etudiantsRoutes);
app.get('/', (req, res) => {
  res.redirect('/login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
