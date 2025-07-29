const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/etudiantsController');
const authMiddleware = require('../middlewares/authMiddleware');     
const { isAdmin } = require('../middlewares/roleMiddleware');     

router.get('/',  ctrl.liste);
router.get('/ajouter',  isAdmin, ctrl.formAjout);
router.post('/ajouter', isAdmin, ctrl.ajouter);
router.get('/modifier/:id', isAdmin, ctrl.formulaireEdit);
router.post('/modifier/:id', isAdmin, ctrl.modifier);
router.post('/supprimer/:id', isAdmin, ctrl.supprimer);
router.get('/search', ctrl.rechercher);

module.exports = router;
