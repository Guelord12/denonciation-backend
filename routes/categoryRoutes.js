const express = require('express');
const { getCategories } = require('../controllers/reportController');
const router = express.Router();

router.get('/', getCategories);

module.exports = router;