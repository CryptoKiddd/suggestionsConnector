const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Enrich user profile using GPT
const enrichProfile = async (userData) => {
  try {
    const prompt = `
You are a professional profile enhancement assistant helping a marketing company in Georgia connect 
tourism, tech, and business professionals for collaboration.

Given this user data, rewrite and enrich their profile with a focus on **who they should connect with**.

Name: ${userData.name}
Bio: ${userData.bio || 'Not provided'}
Skills: ${userData.skills.join(', ') || 'Not provided'}
Interests: ${userData.interests.join(', ') || 'Not provided'}
${userData.linkedinData ? `LinkedIn Info: ${JSON.stringify(userData.linkedinData)}` : ''}

Your tasks:
1. Rewrite the bio in 2–3 sentences to sound professional and clear.
2. Suggest 5–10 relevant, categorized professional skills.
3. Identify their main **industry**.
4. Suggest their **location** if visible in the data.
5. Analyze their role and describe **what type of professionals they would most benefit from connecting with** 
   (for example: “hotel manager → software developer / travel platform founder”).

Return a JSON object with:
{
  "enrichedBio": "...",
  "enrichedSkills": ["...", "..."],
  "industry": "...",
  "location": "...",
  "collaborationTargets": ["...", "..."] 
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      enrichedBio: result.enrichedBio || userData.bio,
      enrichedSkills: result.enrichedSkills || userData.skills,
      industry: result.industry || '',
      location: result.location || '',
      collaborationTargets: result.collaborationTargets || []
    };

  } catch (error) {
    console.error('OpenAI enrichment error:', error.message);
    throw error;
  }
};
// Generate embedding for profile
const generateEmbedding = async (user) => {
  try {
    const text = `
Name: ${user.name}
Bio: ${user.enrichedBio || user.bio}
Skills: ${(user.enrichedSkills || user.skills).join(', ')}
Industry: ${user.industry || 'Not specified'}
They want to connect with: ${user.collaborationTargets.join(', ')}
I am looking to connect with or collaborate with professionals that complement my work —
for example, partners, clients, or experts that help me expand my services.
`;

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: text,
      encoding_format: 'float'
    });

    return response.data[0].embedding;

  } catch (error) {
    console.error('OpenAI embedding error:', error.message);
    throw error;
  }
};

module.exports = { enrichProfile, generateEmbedding };