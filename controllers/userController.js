const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { scrapeLinkedIn } = require('../services/linkedinService');
const { enrichProfile } = require('../services/openaiService');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

/**
 * Ensure array format with safe defaults
 */
const ensureArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // If it's a comma-separated string
      return value.split(',').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
};

/**
 * Merge arrays without duplicates
 */
const mergeArrays = (...arrays) => {
  const merged = arrays.flat().filter(Boolean);
  return [...new Set(merged)];
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user with LinkedIn scraping and AI enrichment
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      bio,
      skills,
      interests,
      linkedinURL,
      role,
      businessType,
      industry,
      location
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    console.log(`\n📝 Registration started for: ${name} (${email})`);

    // Initialize user data with safe defaults
    let userData = {
      name,
      email,
      password,
      bio: bio || '',
      skills: ensureArray(skills),
      interests: ensureArray(interests),
      education: [],
      experience: [],
      linkedinURL: linkedinURL || '',
      role: role || '',
      businessType: businessType || '',
      industry: industry || '',
      location: location || '',
      linkedinSummary: {}
    };

    // STEP 1: Scrape LinkedIn if provided
    let linkedinData = null;
    if (linkedinURL && linkedinURL.trim()) {
      console.log(`🔍 Step 1: Scraping LinkedIn profile...`);
      try {
        linkedinData = await scrapeLinkedIn(linkedinURL.trim());
        
        if (linkedinData) {
          userData.linkedinSummary = linkedinData;

          // Merge LinkedIn data with user input (user input takes priority)
          userData.bio = userData.bio || linkedinData.about || '';
          userData.role = userData.role || linkedinData.title || linkedinData.headline || '';
          userData.industry = userData.industry || linkedinData.industry || '';
          userData.location = userData.location || linkedinData.location || '';
          
          // Merge arrays
          userData.skills = mergeArrays(userData.skills, linkedinData.skills);
          userData.interests = mergeArrays(userData.interests, linkedinData.interests);
          userData.education = linkedinData.education || [];
          userData.experience = linkedinData.experience || [];

          console.log(`✅ LinkedIn data merged:`, {
            skills: userData.skills.length,
            interests: userData.interests.length,
            education: userData.education.length,
            experience: userData.experience.length
          });
        } else {
          console.log(`⚠️  LinkedIn scraping returned no data`);
        }
      } catch (error) {
        console.log(`⚠️  LinkedIn scraping failed: ${error.message}`);
        // Continue with registration even if LinkedIn scraping fails
      }
    } else {
      console.log(`⏭️  Step 1: Skipped (no LinkedIn URL provided)`);
    }

    // STEP 2: AI Profile Enrichment
    console.log(`🤖 Step 2: Enriching profile with AI...`);
    try {
      const aiInput = {
        name: userData.name,
        bio: userData.bio,
        skills: userData.skills,
        interests: userData.interests,
        role: userData.role,
        industry: userData.industry,
        businessType: userData.businessType,
        location: userData.location,
        education: userData.education,
        linkedinSummary: userData.linkedinSummary
      };

      const enrichedData = await enrichProfile(aiInput);

      // Apply enriched data (preserve user input where it exists)
      userData.enrichedBio = enrichedData.enrichedBio || userData.bio;
      userData.enrichedSkills = enrichedData.enrichedSkills.length > 0 
        ? enrichedData.enrichedSkills 
        : userData.skills;
      userData.role = enrichedData.role || userData.role;
      userData.industry = enrichedData.industry || userData.industry;
      userData.businessType = enrichedData.businessType || userData.businessType;
      userData.location = enrichedData.location || userData.location;
      userData.interests = mergeArrays(userData.interests, enrichedData.analyzedInterests);
      userData.collaborationTargets = enrichedData.collaborationTargets || [];
      userData.profileEnrichedAt = new Date();

      console.log(`✅ Profile enriched successfully:`, {
        enrichedSkills: userData.enrichedSkills.length,
        collaborationTargets: userData.collaborationTargets.length,
        topTargets: userData.collaborationTargets.slice(0, 3).map(t => ({
          type: t.type,
          priority: t.priority
        }))
      });
    } catch (error) {
      console.error(`❌ Profile enrichment failed:`, error.message);
      // Use original data as fallbacks
      userData.enrichedBio = userData.bio;
      userData.enrichedSkills = userData.skills;
      userData.collaborationTargets = [];
    }

    // STEP 3: Create user in database
    console.log(`💾 Step 3: Creating user in database...`);

    const user = await User.create(userData);

    console.log(`✅ User created successfully:`, {
      id: user._id,
      name: user.name,
      role: user.role,
      industry: user.industry,
      collaborationTargets: user.collaborationTargets.length
    });

    // Generate token
    const token = generateToken(user._id);

    // Return response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.enrichedBio,
        skills: user.enrichedSkills,
        interests: user.interests,
        role: user.role,
        businessType: user.businessType,
        industry: user.industry,
        location: user.location,
        collaborationTargets: user.collaborationTargets,
        linkedinURL: user.linkedinURL,
        profileEnriched: !!user.profileEnrichedAt,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user (include password for verification)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    console.log(`✅ User logged in: ${user.name} (${user._id})`);

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.enrichedBio || user.bio,
        skills: user.enrichedSkills || user.skills,
        interests: user.interests,
        role: user.role,
        industry: user.industry,
        businessType: user.businessType,
        location: user.location,
        collaborationTargets: user.collaborationTargets,
        profileEnriched: !!user.profileEnrichedAt
      },
      token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'bio', 'skills', 'interests', 'role', 
      'businessType', 'industry', 'location', 'linkedinURL'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (['skills', 'interests'].includes(field)) {
          updates[field] = ensureArray(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toSafeObject()
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

module.exports = { register, login, getMe, updateProfile };