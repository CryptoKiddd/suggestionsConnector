const User = require('../models/User');
const { findMatches, generateMatchReason } = require('../services/matchService');

// @route   POST /api/suggest/:id
// @desc    Get AI-powered connection suggestions
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const userId = req.params.id;

  
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!currentUser.embedding || currentUser.embedding.length === 0) {
      return res.status(400).json({ 
        error: 'User profile not ready for matching. Please try again later.' 
      });
    }

    console.log(`🔍 Finding matches for ${currentUser.name}...`);

    const allUsers = await User.find({ 
      _id: { $ne: userId },
      embedding: { $exists: true, $ne: [] }
    });

    if (allUsers.length === 0) {
      return res.json({
        user: currentUser.name,
        suggestions: [],
        message: 'No other users available for matching yet.'
      });
    }

   
    const matches = findMatches(currentUser, allUsers, 5);

    // Generate reasons for each match
    const suggestions = await Promise.all(
      matches.map(async (match) => {
        try {
          const reason = await generateMatchReason(currentUser, match.user);
          return {
            match: match.user.name,
            reason: reason,
            similarity: parseFloat(match.similarity.toFixed(2)),
            email: match.user.email,
            linkedin: match.user.linkedinURL || '',
            industry: match.user.industry || '',
            skills: match.user.enrichedSkills.length > 0 
              ? match.user.enrichedSkills.slice(0, 5) 
              : match.user.skills.slice(0, 5)
          };
        } catch (error) {
          console.error('Error generating reason:', error);
          return {
            match: match.user.name,
            reason: 'You share similar professional interests and could benefit from connecting.',
            similarity: parseFloat(match.similarity.toFixed(2)),
            email: match.user.email,
            linkedin: match.user.linkedinURL || '',
            industry: match.user.industry || '',
            skills: match.user.enrichedSkills.length > 0 
              ? match.user.enrichedSkills.slice(0, 5) 
              : match.user.skills.slice(0, 5)
          };
        }
      })
    );

    res.json({
      user: currentUser.name,
      userIndustry: currentUser.industry,
      userSkills: currentUser.enrichedSkills.slice(0, 5),
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestions', 
      message: error.message 
    });
  }
};

module.exports = { getSuggestions };