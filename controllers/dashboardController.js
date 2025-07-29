const db = require('../models/db');  // ta connexion MySQL

exports.showDashboard = async (req, res) => {
  try {
    // Requête pour récupérer tous les étudiants
    const [rows] = await db.promise().query('SELECT * FROM etudiants');
    const etudiants = rows.map(e => {
    return {
        ...e,
        date_naiss: new Date(e.date_naiss).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
            }) 
        };
    }); 
    res.render('dashboard', {
      user: req.user,
      etudiants: etudiants
    });
  } catch (error) {
    console.error(error);
    res.render('dashboard', {
      user: req.user,
      etudiants: [],
      error: 'Erreur serveur, impossible de charger les étudiants.'
    });
  }
};
