# 🚀 SmartConnect AI Backend

AI-powered professional networking platform that intelligently matches users based on skills, interests, and industry alignment.

## ✨ Features

- **User Registration & Authentication** with JWT
- **LinkedIn Profile Scraping** to auto-fill user data
- **AI Profile Enrichment** using OpenAI GPT models
- **Embedding Generation** for semantic profile matching
- **Smart Matchmaking** with cosine similarity
- **AI-Generated Connection Reasons** explaining why users should connect

## 🛠️ Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- OpenAI API (GPT-4 & Embeddings)
- Puppeteer (LinkedIn scraping)
- JWT Authentication
- bcryptjs for password hashing

## 📦 Installation

1. **Clone and install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://localhost:27017/smartconnect
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

3. **Start MongoDB:**

```bash
# Make sure MongoDB is running locally or use MongoDB Atlas
mongod
```

4. **Run the server:**

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

## 🔌 API Endpoints

### Authentication

**POST** `/api/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "bio": "Software engineer passionate about AI",
  "skills": ["JavaScript", "Python", "Machine Learning"],
  "interests": ["AI", "Blockchain", "Web3"],
  "linkedinURL": "https://linkedin.com/in/johndoe"
}
```

**POST** `/api/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### User Profile

**GET** `/api/profile/:id`
Headers: `Authorization: Bearer <token>`

### AI Suggestions

**POST** `/api/suggest/:id`
Headers: `Authorization: Bearer <token>`

Returns top 5 AI-matched connections with explanations.

## 🧠 How It Works

1. **Registration Flow:**
   - User submits profile data
   - If LinkedIn URL provided → scrape public data
   - AI enriches bio and skills using GPT-4
   - Generate embedding vector using text-embedding-3-large
   - Store in MongoDB

2. **Matchmaking Flow:**
   - Compute cosine similarity between user embeddings
   - Rank by similarity score
   - Generate personalized connection reasons using GPT-4
   - Return top 5 matches with explanations

## ⚠️ Important Notes

- **LinkedIn Scraping:** May not work for all profiles (many require login). The system gracefully handles failures.
- **OpenAI Costs:** Each profile enrichment and match reason generation uses API calls. Monitor your usage.
- **Rate Limits:** Consider implementing caching for embeddings and rate limiting for API endpoints.

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT tokens expire after 30 days
- Protected routes require valid authentication

## 📝 Example Response

**GET** `/api/suggest/123`

```json
{
  "user": "John Doe",
  "userIndustry": "Technology",
  "userSkills": ["JavaScript", "React", "Node.js", "AI", "ML"],
  "suggestions": [
    {
      "match": "Jane Smith",
      "reason": "You both work in AI-driven web development — collaboration could accelerate your machine learning integration projects.",
      "similarity": 0.89,
      "email": "jane@example.com",
      "linkedin": "https://linkedin.com/in/janesmith",
      "industry": "Technology",
      "skills": ["Python", "TensorFlow", "React", "AI", "Data Science"]
    }
  ]
}
```

## 🚧 Future Enhancements

- Add real-time chat between matched users
- Implement caching layer (Redis) for embeddings
- Add user preferences and filters
- Create recommendation engine based on interaction history
- Build admin dashboard for analytics

## 📄 License

MIT

---

Built with ❤️ using Node.js, OpenAI, and MongoDB
```

---

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Create .env file with your keys
cp .env.example .env
# Edit .env with your actual credentials

# Start MongoDB
mongod

# Run the server
npm start
```

The server will start on `http://localhost:5000`

## 🧪 Test the API

```bash
# Register a new user
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "bio": "Software developer",
    "skills": ["JavaScript", "Node.js"],
    "interests": ["AI", "Web Development"]
  }'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get profile (use token from login)
curl http://localhost:5000/api/profile/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get suggestions
curl -X POST http://localhost:5000/api/suggest/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```