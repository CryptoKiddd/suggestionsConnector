const axios = require('axios');

/**
 * Scrape LinkedIn profile using People Data Labs API
 * @param {string} linkedinUrl - LinkedIn profile URL
 * @returns {Object} Normalized profile data
 */
async function scrapeLinkedIn(linkedinUrl) {
  try {
    console.log(`🔍 Fetching LinkedIn data for: ${linkedinUrl}`);
    
    const response = await axios.get('https://api.peopledatalabs.com/v5/person/enrich', {
      params: {
        profile: linkedinUrl,
        pretty: true
      },
      headers: {
        'X-Api-Key': process.env.PDL_API_KEY || 'a7291424af9cee8e3af7ee04cbbbd2984e1f6a3115e487ad2f77d7c2eba03bce'
      },
      timeout: 10000 // 10 second timeout
    });

    const person = response.data?.data;
    
    if (!person) {
      console.warn('⚠️ No profile data found in response');
      return null;
    }

    // Normalize education data
    let education = [];
    if (Array.isArray(person.education)) {
      education = person.education.map(e => ({
        school: e.school?.name || e.school_name || '',
        degree: Array.isArray(e.degrees) ? e.degrees[0] : e.degree || '',
        fieldOfStudy: e.majors?.[0] || e.field_of_study || '',
        startDate: e.start_date || '',
        endDate: e.end_date || ''
      }));
    } else if (person.education && typeof person.education === 'object') {
      education = [{
        school: person.education.school?.name || person.education.school_name || '',
        degree: Array.isArray(person.education.degrees) ? person.education.degrees[0] : '',
        fieldOfStudy: person.education.majors?.[0] || '',
        startDate: person.education.start_date || '',
        endDate: person.education.end_date || ''
      }];
    }

    // Normalize experience data
    let experience = [];
    if (Array.isArray(person.experience)) {
      experience = person.experience.map(exp => ({
        title: exp.title?.name || exp.job_title || '',
        company: exp.company?.name || exp.company_name || '',
        location: exp.location?.name || exp.location || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date || exp.is_current ? 'Present' : '',
        description: exp.summary || ''
      }));
    }

    // Get current job info
    const currentJob = experience.find(exp => exp.endDate === 'Present' || !exp.endDate) || {};

    // Normalize skills and interests
    const skills = Array.isArray(person.skills) ? person.skills.slice(0, 20) : [];
    const interests = Array.isArray(person.interests) ? person.interests.slice(0, 15) : [];

    // Build comprehensive summary
    const summary = {
      name: person.full_name || '',
      title: person.job_title || currentJob.title || '',
      company: person.job_company_name || currentJob.company || '',
      industry: person.industry || person.job_company_industry || '',
      location: person.location_name || person.job_company_location_region || '',
      headline: Array.isArray(person.job_title_levels) && person.job_title_levels.length > 0
        ? person.job_title_levels[0]
        : person.job_title || '',
      about: person.summary || '',
      education,
      experience,
      currentJob: {
        title: currentJob.title || person.job_title || '',
        company: currentJob.company || person.job_company_name || '',
        location: currentJob.location || person.job_company_location_region || '',
        startDate: currentJob.startDate || person.job_start_date || ''
      },
      skills,
      interests,
      linkedinUrl: person.linkedin_url ? `https://${person.linkedin_url}` : linkedinUrl,
      profilePictureUrl: person.profile_pic_url || '',
      connections: person.linkedin_connections || 0
    };

    console.log(`✅ LinkedIn data scraped successfully:`, {
      name: summary.name,
      title: summary.title,
      skills: summary.skills.length,
      education: summary.education.length,
      experience: summary.experience.length
    });

    return summary;

  } catch (error) {
    if (error.response) {
      console.error('⚠️ PDL API Error:', {
        status: error.response.status,
        message: error.response.data?.error?.message || error.response.statusText
      });
    } else if (error.request) {
      console.error('⚠️ No response from PDL API:', error.message);
    } else {
      console.error('⚠️ LinkedIn scraping error:', error.message);
    }
    
    return null;
  }
}

module.exports = { scrapeLinkedIn };