const express = require('express');
const router = express.Router();

// Import controllers
const { 
  register, 
  login, 
  getMe, 
  updateProfile 
} = require('../controllers/userController');

const {
  getMatches,
  getMatchWithUser,
  sendConnectionRequest,
  acceptConnection,
  getConnections
} = require('../controllers/suggestionsController');

// Import middleware
const { protect } = require('../middleware/auth');

// ===== Auth Routes =====
// @route   POST /api/auth/register
router.post('/auth/register', register);

// @route   POST /api/auth/login
router.post('/auth/login', login);

// @route   GET /api/auth/me
router.get('/auth/me', protect, getMe);

// @route   PUT /api/auth/profile
router.put('/auth/profile', protect, updateProfile);

// ===== Matching Routes =====
// @route   GET /api/matches
router.get('/matches', protect, getMatches);

// @route   GET /api/matches/:userId
router.get('/matches/:userId', protect, getMatchWithUser);

// @route   POST /api/matches/connect/:userId
router.post('/matches/connect/:userId', protect, sendConnectionRequest);

// @route   PUT /api/matches/connect/:userId/accept
router.put('/matches/connect/:userId/accept', protect, acceptConnection);

// @route   GET /api/matches/connections
router.get('/matches/connections', protect, getConnections);

module.exports = router;