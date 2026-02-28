const express = require('express');
const { 
  createReport, getReports, getReportById, updateReport, deleteReport,
  likeReport, shareReport, getUserReports, getCategories, getCategoryById,
  reportReport, verifyReport
} = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const router = express.Router();

// Routes pour les catégories
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Routes pour les signalements
router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), createReport);

router.get('/', getReports);
router.get('/user/:utilisateur_id', auth, getUserReports);
router.get('/:id', getReportById);
router.put('/:id', auth, updateReport);
router.delete('/:id', auth, deleteReport);

// Actions sur les signalements
router.post('/:id/like', auth, likeReport);
router.post('/:id/share', shareReport);
router.post('/:id/report', auth, reportReport);
router.post('/:id/verify', auth, verifyReport); // Admin uniquement

module.exports = router;