require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Enrich profile with AI analysis and generate collaboration targets
 * @param {Object} profileData - User profile data including LinkedIn info
 * @returns {Object} Enriched profile with collaboration suggestions
 */
async function enrichProfile(profileData) {
  try {
    // Build comprehensive context from all available data
    const context = buildProfileContext(profileData);
    
    const prompt = `
You are an expert professional networking and business collaboration AI. Your goal is to deeply analyze a professional's profile and identify the most strategic collaboration opportunities that would be mutually beneficial.

${context}

Your Tasks:

1. **Professional Bio Enhancement**: Write a compelling 2-3 sentence professional bio that captures their expertise, unique value proposition, and professional identity.

2. **Skills Categorization**: Expand and organize their skills into professional domains with proper categorization (e.g., Technical, Management, Communication, Domain-Specific).

3. **Industry & Role Confirmation**: Determine their precise industry and role based on all available data.

4. **Interest Analysis**: Identify professional interests that align with their career trajectory and could lead to collaboration opportunities.

5. **Strategic Collaboration Targets** (MOST IMPORTANT): Identify 6-8 highly specific collaboration targets. For each target, think deeply about:
   - WHO would complement their skills and fill gaps in their expertise
   - WHY the collaboration makes strategic business sense
   - WHAT concrete projects or initiatives they could work on together
   - HOW both parties would mutually benefit (be specific about value exchange)
   - PRIORITY level (1-10) based on strategic fit and mutual benefit potential

Quality over quantity: Each collaboration target should be:
- Specific and actionable (not generic like "any marketing professional")
- Based on complementary skills/needs, not similar ones
- Focused on mutual value creation
- Grounded in their actual experience and aspirations

Examples of GOOD targets:
- "Product Designer with UX/UI expertise and startup experience" (if user is a developer building a product)
- "Sales Director in B2B SaaS with enterprise client relationships" (if user has a technical product needing distribution)
- "Financial Controller specializing in fundraising and investor relations" (if user is a founder needing capital)

Examples of BAD targets:
- "Marketing professional" (too generic)
- "Another software developer" (not complementary unless specific gap identified)
- "Business consultant" (unclear value proposition)

Return ONLY valid JSON in this exact structure (no markdown, no explanations):

{
  "enrichedBio": "string",
  "enrichedSkills": ["skill1", "skill2", "skill3"],
  "role": "string",
  "industry": "string",
  "businessType": "string",
  "location": "string",
  "analyzedInterests": ["interest1", "interest2"],
  "collaborationTargets": [
    {
      "type": "Specific Role/Profession Title",
      "reason": "Clear explanation of why this collaboration makes strategic sense",
      "potentialCollaboration": "Specific project, initiative, or partnership opportunity",
      "keywords": ["relevant", "searchable", "terms"],
      "industries": ["relevant", "industries"],
      "roles": ["specific", "job", "titles"],
      "mutualBenefit": "Explicit value exchange - what each party gains",
      "priority": 8
    }
  ]
}
`;

    console.log('🤖 Sending profile to OpenAI for enrichment...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert professional networking strategist and business matchmaker. Return only valid JSON with deeply analyzed, specific collaboration opportunities. Focus on complementary skills and mutual value creation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    console.log('🤖 OpenAI Response Length:', content.length, 'characters');

    // Parse and validate the response
    let enrichedData = JSON.parse(content);

    // Validate and normalize collaboration targets
    if (enrichedData.collaborationTargets && Array.isArray(enrichedData.collaborationTargets)) {
      enrichedData.collaborationTargets = enrichedData.collaborationTargets
        .map(target => normalizeCollaborationTarget(target))
        .filter(target => target !== null) // Remove invalid targets
        .sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Sort by priority
    } else {
      enrichedData.collaborationTargets = [];
    }

    // Build result with safe fallbacks
    const result = {
      enrichedBio: enrichedData.enrichedBio || profileData.bio || '',
      enrichedSkills: Array.isArray(enrichedData.enrichedSkills) && enrichedData.enrichedSkills.length > 0
        ? enrichedData.enrichedSkills
        : profileData.skills || [],
      role: enrichedData.role || profileData.role || '',
      industry: enrichedData.industry || profileData.industry || '',
      businessType: enrichedData.businessType || profileData.businessType || '',
      location: enrichedData.location || profileData.location || '',
      analyzedInterests: Array.isArray(enrichedData.analyzedInterests) && enrichedData.analyzedInterests.length > 0
        ? enrichedData.analyzedInterests
        : profileData.interests || [],
      collaborationTargets: enrichedData.collaborationTargets
    };

    console.log('✅ Profile enriched successfully:', {
      bio: result.enrichedBio.substring(0, 50) + '...',
      skills: result.enrichedSkills.length,
      targets: result.collaborationTargets.length
    });

    return result;

  } catch (error) {
    console.error('❌ OpenAI enrichment error:', error.message);
    
    if (error.response) {
      console.error('API Error Details:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    // Return safe defaults that preserve original data
    return {
      enrichedBio: profileData.bio || '',
      enrichedSkills: profileData.skills || [],
      role: profileData.role || '',
      industry: profileData.industry || '',
      businessType: profileData.businessType || '',
      location: profileData.location || '',
      analyzedInterests: profileData.interests || [],
      collaborationTargets: []
    };
  }
}

/**
 * Build comprehensive profile context for AI analysis
 */
function buildProfileContext(profileData) {
  const parts = [];
  
  parts.push(`**Profile Information:**`);
  parts.push(`- Name: ${profileData.name || 'N/A'}`);
  parts.push(`- Current Role: ${profileData.role || profileData.linkedinSummary?.title || 'N/A'}`);
  parts.push(`- Company: ${profileData.linkedinSummary?.company || 'N/A'}`);
  parts.push(`- Industry: ${profileData.industry || profileData.linkedinSummary?.industry || 'N/A'}`);
  parts.push(`- Business Type: ${profileData.businessType || 'N/A'}`);
  parts.push(`- Location: ${profileData.location || profileData.linkedinSummary?.location || 'N/A'}`);
  
  if (profileData.bio || profileData.linkedinSummary?.about) {
    parts.push(`\n**About:**`);
    parts.push(profileData.bio || profileData.linkedinSummary?.about);
  }
  
  if (profileData.skills && profileData.skills.length > 0) {
    parts.push(`\n**Skills:** ${profileData.skills.join(', ')}`);
  } else if (profileData.linkedinSummary?.skills?.length > 0) {
    parts.push(`\n**Skills:** ${profileData.linkedinSummary.skills.join(', ')}`);
  }
  
  if (profileData.interests && profileData.interests.length > 0) {
    parts.push(`\n**Interests:** ${profileData.interests.join(', ')}`);
  } else if (profileData.linkedinSummary?.interests?.length > 0) {
    parts.push(`\n**Interests:** ${profileData.linkedinSummary.interests.join(', ')}`);
  }
  
  if (profileData.linkedinSummary?.currentJob?.title) {
    parts.push(`\n**Current Position:**`);
    parts.push(`- Title: ${profileData.linkedinSummary.currentJob.title}`);
    parts.push(`- Company: ${profileData.linkedinSummary.currentJob.company}`);
    if (profileData.linkedinSummary.currentJob.location) {
      parts.push(`- Location: ${profileData.linkedinSummary.currentJob.location}`);
    }
  }
  
  if (profileData.education?.length > 0 || profileData.linkedinSummary?.education?.length > 0) {
    const edu = profileData.education || profileData.linkedinSummary?.education || [];
    parts.push(`\n**Education:**`);
    edu.slice(0, 3).forEach(e => {
      parts.push(`- ${e.degree || ''} ${e.fieldOfStudy || ''} at ${e.school || ''}`);
    });
  }
  
  if (profileData.linkedinSummary?.experience?.length > 0) {
    parts.push(`\n**Experience Highlights:**`);
    profileData.linkedinSummary.experience.slice(0, 3).forEach(exp => {
      parts.push(`- ${exp.title || ''} at ${exp.company || ''}`);
    });
  }
  
  return parts.join('\n');
}

/**
 * Normalize and validate collaboration target object
 */
function normalizeCollaborationTarget(target) {
  if (!target || typeof target !== 'object') return null;
  
  // Must have at least type and reason
  if (!target.type || !target.reason) return null;
  
  return {
    type: String(target.type).trim(),
    reason: String(target.reason).trim(),
    potentialCollaboration: String(target.potentialCollaboration || '').trim(),
    keywords: Array.isArray(target.keywords) 
      ? target.keywords.filter(k => k && typeof k === 'string').map(k => k.trim())
      : [],
    industries: Array.isArray(target.industries)
      ? target.industries.filter(i => i && typeof i === 'string').map(i => i.trim())
      : [],
    roles: Array.isArray(target.roles)
      ? target.roles.filter(r => r && typeof r === 'string').map(r => r.trim())
      : [],
    mutualBenefit: String(target.mutualBenefit || '').trim(),
    priority: typeof target.priority === 'number' 
      ? Math.max(0, Math.min(10, target.priority))
      : 5
  };
}

module.exports = { enrichProfile };