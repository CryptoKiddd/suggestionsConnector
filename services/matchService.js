const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🧮 Calculate cosine similarity between two vectors
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
};

// 🧩 Find top N complementary matches for a user
const findMatches = (currentUser, allUsers, topN = 5) => {
  const matches = allUsers.map(user => {
    let similarity = cosineSimilarity(currentUser.embedding, user.embedding);

    // Optional bonus: encourage complementary industries
    const complementaryPairs = [
      ['Tourism', 'Technology'],
      ['Hospitality', 'Software'],
      ['Real Estate', 'Marketing'],
      ['Travel', 'Photography'],
      ['Event Management', 'Content Creation']
    ];

    if (complementaryPairs.some(pair =>
      pair.includes(currentUser.industry) && pair.includes(user.industry)
    )) {
      similarity += 0.05; // small collaboration boost
    }

    return { user, similarity };
  });

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, topN);
};

// 💬 Generate natural explanation for why two users should connect
const generateMatchReason = async (user1, user2) => {
  try {
    const prompt = `
You are a professional networking assistant helping connect people in Georgia’s tourism,
real estate, and tech ecosystem.

Your task is to create **collaboration-based** connection reasons — not based on similar jobs,
but on **how they can help each other**.

Examples:
- "A hotel owner could collaborate with a software developer to build a hotel management system."
- "A real estate agent could work with a marketing specialist to promote luxury properties."
- "A tour operator and a photographer could collaborate to create visual travel campaigns."

Now, generate a short (1–2 sentence) reason for why these two users should connect:

Person 1:
${user1.name}
Bio: ${user1.enrichedBio || user1.bio}
Skills: ${(user1.enrichedSkills || user1.skills).join(', ')}
Industry: ${user1.industry || 'Not specified'}

Person 2:
${user2.name}
Bio: ${user2.enrichedBio || user2.bio}
Skills: ${(user2.enrichedSkills || user2.skills).join(', ')}
Industry: ${user2.industry || 'Not specified'}

Focus on **mutual benefit** and **complementary goals**. 
Be specific, clear, and natural.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 100
    });

    return response.choices[0].message.content.trim();

  } catch (error) {
    console.error('Match reason generation error:', error.message);
    return 'These two professionals could collaborate based on complementary skills and shared business interests.';
  }
};

// 🧠 Generate embedding for collaborative matching


module.exports = { findMatches, generateMatchReason };
