const express = require('express');
const { getProfile, updateProfile, deleteAccount, uploadAvatar } = require('../controllers/userController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.delete('/profile', auth, deleteAccount);
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar);

module.exports = router;