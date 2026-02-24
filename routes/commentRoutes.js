const express = require('express');
const { createComment, getComments, deleteComment } = require('../controllers/commentController');
const auth = require('../middlewares/auth');
const router = express.Router({ mergeParams: true }); // pour avoir signalement_id

router.post('/', auth, createComment);
router.get('/', getComments);
router.delete('/:id', auth, deleteComment);

module.exports = router;