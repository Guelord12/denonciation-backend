const express = require('express');
const { 
  createLiveStream, 
  getActiveStreams, 
  getStreamById, 
  startStream, 
  stopStream, 
  addDonation,
  getMessages,
  sendMessage
} = require('../controllers/liveController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/', auth, createLiveStream);
router.get('/', getActiveStreams);
router.get('/:id', getStreamById);
router.post('/webhook/start', startStream); // pas d'auth (interne)
router.post('/webhook/stop', stopStream);
router.post('/:id/donate', auth, addDonation);
router.get('/:streamId/messages', getMessages);
router.post('/:streamId/messages', auth, sendMessage);

module.exports = router;