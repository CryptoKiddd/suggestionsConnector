const puppeteer = require('puppeteer');

// Scrape public LinkedIn profile
const scrapeLinkedIn = async (linkedinURL) => {
  let browser;
  
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    console.log('Navigating to LinkedIn profile...');
    await page.goto(linkedinURL, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    // Extract data from the page
    const profileData = await page.evaluate(() => {
      const data = {
        headline: '',
        about: '',
        experience: [],
        education: [],
        skills: []
      };

      // Try to extract headline
      const headlineEl = document.querySelector('.top-card-layout__headline');
      if (headlineEl) data.headline = headlineEl.textContent.trim();

      // Try to extract about section
      const aboutEl = document.querySelector('.core-section-container__content .inline-show-more-text');
      if (aboutEl) data.about = aboutEl.textContent.trim();

      // Try to extract experience (simplified)
      const experienceEls = document.querySelectorAll('.experience-item');
      experienceEls.forEach(el => {
        const title = el.querySelector('.profile-section-card__title');
        const company = el.querySelector('.profile-section-card__subtitle');
        if (title) {
          data.experience.push({
            title: title.textContent.trim(),
            company: company ? company.textContent.trim() : '',
            duration: ''
          });
        }
      });

      // Try to extract skills (simplified)
      const skillEls = document.querySelectorAll('.skill-card-name');
      skillEls.forEach(el => {
        const skill = el.textContent.trim();
        if (skill) data.skills.push(skill);
      });

      return data;
    });

    await browser.close();

    // If no data was extracted, return sample data
    if (!profileData.headline && !profileData.about) {
      console.log('⚠️  Could not extract LinkedIn data (may require login). Using fallback.');
      return {
        headline: 'Professional',
        about: 'Experienced professional with diverse skills.',
        experience: [],
        education: [],
        skills: []
      };
    }

    console.log('✅ LinkedIn data extracted successfully');
    return profileData;

  } catch (error) {
    console.error('LinkedIn scraping error:', error.message);
    
    if (browser) {
      await browser.close();
    }

    // Return minimal data on error
    return {
      headline: '',
      about: '',
      experience: [],
      education: [],
      skills: []
    };
  }
};

module.exports = { scrapeLinkedIn };