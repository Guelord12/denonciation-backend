const express = require('express');
const { fetchAndSaveNews, getNewsFromDB } = require('../controllers/newsController');
const router = express.Router();

router.get('/', fetchAndSaveNews);
router.get('/local', getNewsFromDB); // si on veut les news en base

module.exports = router;