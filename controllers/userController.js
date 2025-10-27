const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { scrapeLinkedIn } = require('../services/scrapeLinkedIn');
const { enrichProfile, generateEmbedding } = require('../services/openaiService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Protect routes middleware
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
};

// @route   POST /api/register
// @desc    Register new user with AI enrichment
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, bio, skills, interests, linkedinURL } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create initial user object
    let userData = {
      name,
      email,
      password,
      bio: bio || '',
      skills: skills || [],
      interests: interests || [],
      linkedinURL: linkedinURL || '',
      collaborationTargets: '' || [],
    };

    // Step 1: Scrape LinkedIn if URL provided
    if (linkedinURL) {
      console.log('🔍 Scraping LinkedIn profile...');
      try {
        const linkedinData = await scrapeLinkedIn(linkedinURL);
        userData.linkedinData = linkedinData;
        
        // Merge LinkedIn data into profile
        if (linkedinData.about && !userData.bio) {
          userData.bio = linkedinData.about;
        }
        if (linkedinData.skills && linkedinData.skills.length > 0) {
          userData.skills = [...new Set([...userData.skills, ...linkedinData.skills])];
        }
      } catch (error) {
        console.log('⚠️  LinkedIn scraping failed:', error.message);
        // Continue without LinkedIn data
      }
    }

    // Step 2: Enrich profile with OpenAI
    console.log('🤖 Enriching profile with AI...');
    try {
      const enrichedData = await enrichProfile({
        name: userData.name,
        bio: userData.bio,
        skills: userData.skills,
        interests: userData.interests,
        linkedinData: userData.linkedinData,
        
      });

      userData.enrichedBio = enrichedData.enrichedBio;
      userData.enrichedSkills = enrichedData.enrichedSkills;
      userData.industry = enrichedData.industry;
      userData.location = enrichedData.location;
      userData.collaborationTargets = enrichedData.collaborationTargets;
    } catch (error) {
      console.log('⚠️  Profile enrichment failed:', error.message);
      // Continue with basic data
      userData.enrichedBio = userData.bio;
      userData.enrichedSkills = userData.skills;
      userData.collaborationTargets = "Failed";

    }

    // Step 3: Generate embedding
    console.log('🧠 Generating profile embedding...');
    try {
      const profileText = `${userData.name}. ${userData.enrichedBio}. Skills: ${userData.enrichedSkills.join(', ')}. Interests: ${userData.interests.join(', ')}. Industry: ${userData.industry || 'General'}, collaborationTargets: ${userData.collaborationTargets.join(', ')}`;
      const embedding = await generateEmbedding(profileText);
      userData.embedding = embedding;
    } catch (error) {
      console.log('⚠️  Embedding generation failed:', error.message);
      userData.embedding = [];
    }

    // Create user
    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.enrichedBio,
      skills: user.enrichedSkills,
      interests: user.interests,
      industry: user.industry,
      location: user.location,
      collaborationTargets:userData.collaborationTargets,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
};

// @route   POST /api/login
// @desc    Authenticate user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
};

// @route   GET /api/profile/:id
// @desc    Get user profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -embedding');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.enrichedBio || user.bio,
      skills: user.enrichedSkills.length > 0 ? user.enrichedSkills : user.skills,
      interests: user.interests,
      industry: user.industry,
      location: user.location,
      linkedinURL: user.linkedinURL,
      linkedinData: user.linkedinData,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
  }
};

module.exports = { register, login, getProfile, protect };