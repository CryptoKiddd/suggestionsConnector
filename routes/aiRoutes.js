const express = require('express');
const router = express.Router();
const { getSuggestions } = require('../controllers/aiController');
const { protect } = require('../controllers/userController');

router.post('/suggest/:id', protect, getSuggestions);

module.exports = router;