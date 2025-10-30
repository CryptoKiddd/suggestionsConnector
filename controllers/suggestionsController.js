const { findCollaborationMatches, getMutualMatchScore } = require('../services/matchService');
const User = require('../models/User');

/**
 * @route   GET /api/matches
 * @desc    Get collaboration matches for current user
 * @access  Private
 */
const getMatches = async (req, res) => {
  try {
    const {
      limit = 5,
      minScore = 30 // Minimum score percentage (0-100)
    } = req.query;

    const matches = await findCollaborationMatches(req.user.id, {
      limit: parseInt(limit),
      minScore: parseInt(minScore) / 100,
      excludeConnected: true
    });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('❌ Get matches error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find matches',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/matches/:userId
 * @desc    Get match score with specific user
 * @access  Private
 */
const getMatchWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if target user exists
    const targetUser = await User.findById(userId).select('-password');
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const matchData = await getMutualMatchScore(req.user.id, userId);

    res.json({
      success: true,
      data: {
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          role: targetUser.role,
          industry: targetUser.industry,
          location: targetUser.location,
          bio: targetUser.enrichedBio || targetUser.bio,
          skills: targetUser.enrichedSkills || targetUser.skills
        },
        matchScore: matchData.mutualScore,
        breakdown: {
          yourInterestInThem: matchData.user1ToUser2Score,
          theirInterestInYou: matchData.user2ToUser1Score
        },
        whyYouMatch: matchData.reasons1to2,
        whyTheyMatch: matchData.reasons2to1
      }
    });
  } catch (error) {
    console.error('❌ Get match with user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate match score',
      message: error.message
    });
  }
};

/**
 * @route   POST /api/matches/connect/:userId
 * @desc    Send connection request to a user
 * @access  Private
 */
const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot connect with yourself'
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if connection already exists
    const currentUser = await User.findById(currentUserId);
    const existingConnection = currentUser.connections.find(
      conn => conn.userId.toString() === userId
    );

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        error: `Connection already ${existingConnection.status}`
      });
    }

    // Add connection to current user
    currentUser.connections.push({
      userId: userId,
      status: 'pending',
      connectedAt: new Date()
    });
    await currentUser.save();

    // Add reverse connection to target user
    targetUser.connections.push({
      userId: currentUserId,
      status: 'pending',
      connectedAt: new Date()
    });
    await targetUser.save();

    console.log(`✅ Connection request sent from ${currentUser.name} to ${targetUser.name}`);

    res.json({
      success: true,
      message: 'Connection request sent',
      data: {
        status: 'pending',
        connectedAt: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Send connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send connection request',
      message: error.message
    });
  }
};

/**
 * @route   PUT /api/matches/connect/:userId/accept
 * @desc    Accept connection request
 * @access  Private
 */
const acceptConnection = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const connection = currentUser.connections.find(
      conn => conn.userId.toString() === userId && conn.status === 'pending'
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection request not found'
      });
    }

    // Update both users' connection status
    connection.status = 'accepted';
    await currentUser.save();

    const targetUser = await User.findById(userId);
    const reverseConnection = targetUser.connections.find(
      conn => conn.userId.toString() === currentUserId
    );
    if (reverseConnection) {
      reverseConnection.status = 'accepted';
      await targetUser.save();
    }

    console.log(`✅ Connection accepted between ${currentUser.name} and ${targetUser.name}`);

    res.json({
      success: true,
      message: 'Connection accepted',
      data: {
        status: 'accepted'
      }
    });
  } catch (error) {
    console.error('❌ Accept connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept connection',
      message: error.message
    });
  }
};

/**
 * @route   GET /api/matches/connections
 * @desc    Get all connections for current user
 * @access  Private
 */
const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'connections.userId',
      select: 'name email role industry location bio enrichedBio skills enrichedSkills'
    });

    const connections = user.connections.map(conn => ({
      user: conn.userId,
      status: conn.status,
      connectedAt: conn.connectedAt
    }));

    res.json({
      success: true,
      count: connections.length,
      data: connections
    });
  } catch (error) {
    console.error('❌ Get connections error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch connections',
      message: error.message
    });
  }
};

module.exports = {
  getMatches,
  getMatchWithUser,
  sendConnectionRequest,
  acceptConnection,
  getConnections
};