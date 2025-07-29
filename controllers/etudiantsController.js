const db = require('../models/db');
const dayjs = require('dayjs');

exports.liste = (req, res) => {
  db.query('SELECT * FROM etudiants', (err, rows) => {
    if (err) {
      return res.status(500).render('index', {
        etudiants: [],
        error: 'Erreur de base de données.',
        success: null,
        user: null
      });
    }

    const etudiants = rows.map(e => ({
      ...e,
      date_naiss: e.date_naiss ? dayjs(e.date_naiss).format('DD/MM/YYYY') : '',
    }));

    res.render('index', {
      etudiants,
      error: null,
      success: null,
      user: null
    });
  });
};


exports.rechercher = (req, res) => {
  const search = req.query.q;

  db.query(
    'SELECT * FROM etudiants WHERE nom LIKE ? OR matricule = ?',
    [`%${search}%`, search],
    (err, results) => {
      if (err) {
        return res.status(500).render('index', {
          etudiants: [],
          error: "Erreur lors de la recherche",
          success: null,
          user: null,
          query: search
        });
      }

      // Conversion de la date avant d'envoyer à la vue
      const etudiants = results.map(e => ({
        ...e,
        date_naiss: e.date_naiss ? dayjs(e.date_naiss).format('DD/MM/YYYY') : ''
      }));

      if (etudiants.length === 0) {
        return res.render('index', {
          etudiants: [],
          error: `Aucun étudiant trouvé pour : "${search}"`,
          success: null,
          query: search,
          user: null
        });
      }

      res.render('index', {
        etudiants,
        error: null,
        success: null,
        query: search,
        user: null
      });
    }
  );
};
exports.formAjout = (req, res) => {
  res.render('add');
};
exports.ajouter = (req, res) => {
  const { matricule, nom, prenom, date_naiss, classe, filiere, universite, adresse, sexe, nationalite } = req.body;

  if (!matricule || !nom || !prenom) {
    return res.status(400).json({ success: false, error: 'Matricule, nom et prénom sont obligatoires.' });
  }

  const sql = `INSERT INTO etudiants (matricule, nom, prenom, date_naiss, classe, filiere, universite, adresse, sexe, nationalite)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [matricule, nom, prenom, date_naiss, classe, filiere, universite, adresse, sexe, nationalite];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erreur ajout étudiant:', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de l’ajout de l’étudiant.' });
    }

     res.redirect('/etudiants');
  });
};
exports.formulaireEdit = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM etudiants WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.send('Étudiant non trouvé');
     const etudiant = {
      ...results[0],
      date_naiss: results[0].date_naiss ? dayjs(results[0].date_naiss).format('YYYY-MM-DD') : ''
    };

    res.render('edit', { etudiant: results[0] });
  });
};
exports.modifier = (req, res) => {
  const { matricule, nom, prenom, date_naiss, classe, filiere, universite, adresse, sexe, nationalite } = req.body;
  const id = req.params.id;

  if (!id) return res.status(400).json({ success: false, error: 'ID requis' });

  const sql = `UPDATE etudiants 
               SET matricule = ?, nom = ?, prenom = ?, date_naiss = ?, classe = ?, filiere = ?, universite = ?, adresse = ?, sexe = ?, nationalite = ?
               WHERE id = ?`;
  const values = [matricule, nom, prenom, date_naiss, classe, filiere, universite, adresse, sexe, nationalite, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erreur modification étudiant:', err);
      return res.status(500).json({ success: false, error: 'Erreur lors de la modification de l’étudiant.' });
    }

    res.json({ success: true, message: 'Étudiant modifié avec succès.' });
  });
};

exports.supprimer = (req, res) => {
  const id = req.params.id;

  if (!id) return res.status(400).json({ success: false, error: 'ID requis' });

  db.query('DELETE FROM etudiants WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Erreur suppression étudiant:', err);
      return res.status(500).json({ success: false, error: 'Erreur suppression étudiant' });
    }

    res.json({ success: true, message: 'Étudiant supprimé' });
  });
};

