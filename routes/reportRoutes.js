const express = require('express');
const { createReport, getReports, getReportById, likeReport, shareReport } = require('../controllers/reportController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const router = express.Router();

router.post('/', auth, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'document', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/:id/like', auth, likeReport);
router.post('/:id/share', auth, shareReport);

module.exports = router;