# Professional Networking & Collaboration Platform

A sophisticated backend system that uses LinkedIn data scraping, AI-powered profile enrichment, and intelligent matching algorithms to connect professionals with complementary skills and mutual collaboration opportunities.

## 🚀 Key Features

- **LinkedIn Profile Scraping**: Automatically extracts education, experience, skills, and interests from LinkedIn profiles using People Data Labs API
- **AI Profile Enrichment**: Uses OpenAI GPT-4 to generate professional bios, categorize skills, and identify strategic collaboration targets
- **Intelligent Matching Algorithm**: Multi-factor scoring system that finds users with complementary skills and mutual benefits
- **Collaboration Suggestions**: AI-generated specific project ideas and partnership opportunities
- **Connection Management**: Send/accept connection requests between matched professionals

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- OpenAI API Key
- People Data Labs API Key (optional, for LinkedIn scraping)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd professional-networking-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/professional-networking
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# People Data Labs (for LinkedIn scraping)
PDL_API_KEY=your-pdl-api-key-here
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
├── models/
│   └── User.js              # User schema with collaboration targets
├── controllers/
│   ├── authController.js    # Registration, login, profile management
│   └── matchingController.js # Matching and connection logic
├── services/
│   ├── linkedinService.js   # LinkedIn profile scraping
│   ├── openaiService.js     # AI profile enrichment
│   └── matchingService.js   # Match scoring algorithms
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   └── index.js             # API routes
└── server.js                # Express app setup
```

## 🔑 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "bio": "Optional bio",
  "skills": ["JavaScript", "React"],
  "interests": ["Startups", "AI"],
  "linkedinURL": "https://linkedin.com/in/johndoe",
  "role": "Software Developer",
  "businessType": "Freelancer",
  "industry": "Technology",
  "location": "San Francisco, CA"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "AI-enriched professional bio...",
    "skills": ["JavaScript", "React", "Node.js", ...],
    "collaborationTargets": [
      {
        "type": "UX/UI Designer",
        "reason": "To complement technical skills...",
        "potentialCollaboration": "Build a SaaS product together",
        "keywords": ["design", "user experience"],
        "industries": ["Technology", "SaaS"],
        "roles": ["Product Designer", "UX Designer"],
        "mutualBenefit": "Developer provides technical implementation...",
        "priority": 9
      }
    ],
    "profileEnriched": true
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "bio": "Updated bio",
  "skills": ["New", "Skills"],
  "location": "New York, NY"
}
```

### Matching & Connections

#### Get Collaboration Matches
```http
GET /api/matches?limit=10&minScore=30
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "match_user_id",
      "name": "Jane Smith",
      "role": "Product Designer",
      "industry": "Technology",
      "location": "San Francisco, CA",
      "bio": "Experienced product designer...",
      "skills": ["Figma", "User Research", "Prototyping"],
      "matchScore": 87,
      "matchReasons": [
        {
          "type": "target_match",
          "reason": "Matches your target: UX/UI Designer",
          "detail": "To complement technical skills with design expertise"
        },
        {
          "type": "complementary_skills",
          "reason": "Has complementary skills you might need",
          "detail": "Figma, User Research, Design Systems"
        }
      ],
      "collaborationSuggestions": [
        {
          "type": "project",
          "title": "Collaborate on: UX/UI Designer",
          "description": "Build a SaaS product together",
          "mutualBenefit": "Developer provides technical implementation, designer creates user experience"
        }
      ]
    }
  ]
}
```

#### Get Match Score with Specific User
```http
GET /api/matches/:userId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "Jane Smith",
      "role": "Product Designer",
      ...
    },
    "matchScore": 87,
    "breakdown": {
      "yourInterestInThem": 92,
      "theirInterestInYou": 82
    },
    "whyYouMatch": [...],
    "whyTheyMatch": [...]
  }
}
```

#### Send Connection Request
```http
POST /api/matches/connect/:userId
Authorization: Bearer <token>
```

#### Accept Connection Request
```http
PUT /api/matches/connect/:userId/accept
Authorization: Bearer <token>
```

#### Get All Connections
```http
GET /api/matches/connections
Authorization: Bearer <token>
```

## 🧠 How the Matching Algorithm Works

### Match Score Calculation (0-100%)

The algorithm uses weighted multi-factor scoring:

1. **Collaboration Target Match (40%)**: Checks if the other user matches your specific collaboration targets based on:
   - Role match (30%)
   - Industry match (20%)
   - Keyword/skill match (50%)
   - Priority multiplier

2. **Complementary Skills (30%)**: Evaluates how well skills complement rather than duplicate:
   - Optimal: 20-40% skill overlap (shows related domain)
   - High complementary skills score

3. **Industry Alignment (15%)**: 
   - Exact match: 100%
   - Partial match: 70%
   - Related industries: 60%
   - Different: 30%

4. **Location Proximity (10%)**:
   - Same city: 100%
   - Same region/country: 70%
   - Different (remote-friendly): 40%

5. **Shared Interests (5%)**: Jaccard similarity of interests

### Collaboration Target Structure

Each user gets 6-8 AI-generated collaboration targets:

```javascript
{
  "type": "Specific Role Title",
  "reason": "Why this collaboration makes strategic sense",
  "potentialCollaboration": "Concrete project idea",
  "keywords": ["searchable", "terms"],
  "industries": ["relevant", "industries"],
  "roles": ["specific", "job", "titles"],
  "mutualBenefit": "Value exchange for both parties",
  "priority": 8  // 1-10 scale
}
```

## 🔧 Configuration Options

### Registration Flow

1. **User Input**: Basic info + optional LinkedIn URL
2. **LinkedIn Scraping** (if URL provided): Extracts comprehensive profile data
3. **Data Merging**: Combines user input with LinkedIn data
4. **AI Enrichment**: 
   - Generates professional bio
   - Categorizes and expands skills
   - Analyzes interests
   - Creates strategic collaboration targets
5. **Database Storage**: Saves enriched profile

### Match Finding Options

```javascript
findCollaborationMatches(userId, {
  limit: 10,           // Max number of matches
  minScore: 0.3,       // Minimum score threshold (0-1)
  excludeConnected: true  // Skip already connected users
})
```

## 🚨 Error Handling

All endpoints include comprehensive error handling:

- **400**: Validation errors, missing required fields
- **401**: Authentication errors, invalid/expired tokens
- **404**: Resource not found
- **500**: Server errors (with detailed logs in development)

## 🔐 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT token authentication
- Password field never returned in queries
- Input validation and sanitization
- Protected routes with middleware

## 📊 Database Indexes

Optimized queries with indexes on:
- `email` (unique)
- `collaborationTargets.keywords`
- `collaborationTargets.industries`
- `collaborationTargets.roles`
- `industry` + `role` (compound)

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "Developer",
    "skills": ["JavaScript", "React"]
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'

# Get matches (replace TOKEN)
curl http://localhost:5000/api/matches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variable for `token`
3. Use Bearer token authentication
4. Test each endpoint sequentially

## 🐛 Troubleshooting

### LinkedIn Scraping Fails
- Check PDL_API_KEY is valid
- Verify LinkedIn URL format
- Check API rate limits
- System continues without LinkedIn data

### AI Enrichment Fails
- Verify OPENAI_API_KEY
- Check OpenAI API credits
- Review prompt length limits
- Falls back to original data

### Matching Returns No Results
- Lower `minScore` threshold
- Check if enough users in database
- Verify collaboration targets exist
- Review user profile completeness

## 📈 Future Enhancements

- [ ] WebSocket real-time notifications
- [ ] Email notifications for matches
- [ ] Advanced filtering (location, industry)
- [ ] Team/group matching
- [ ] Collaboration history tracking
- [ ] Recommendation system improvements
- [ ] Profile completeness scoring
- [ ] Activity feed

## 📝 License

MIT

## 👥 Contributing

Pull requests welcome! Please ensure:
- Code follows existing style
- All tests pass
- Documentation updated
- Commit messages are clear

## 📧 Support

For issues or questions, please open a GitHub issue or contact support.