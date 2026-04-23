const axios = require('axios');
const Backlink = require('../models/Backlink');

/**
 * Verifies if a backlink is live on the given URL.
 * Checks for the target link and anchor text in the HTML content.
 */
async function verifyBacklink(backlinkId) {
  const backlink = await Backlink.findById(backlinkId);
  if (!backlink || !backlink.blogUrl) return { success: false, error: 'No URL to check' };

  try {
    // Fetch page content
    const response = await axios.get(backlink.blogUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = response.data.toLowerCase();
    const target = (backlink.targetLink || 'https://www.ccbp.in/intensive').toLowerCase();
    const anchor = backlink.anchorText.toLowerCase();

    // Check if target link exists
    const hasLink = html.includes(target);
    
    // Check if anchor text exists anywhere in the page (simple check)
    // A better check would be to see if they are part of the same <a> tag, but this is a good start.
    const hasAnchor = html.includes(anchor);

    const isLive = hasLink && hasAnchor;

    backlink.verified = true;
    backlink.isLive = isLive;
    backlink.lastChecked = new Date();
    await backlink.save();

    return { 
      success: true, 
      isLive, 
      foundLink: hasLink, 
      foundAnchor: hasAnchor,
      lastChecked: backlink.lastChecked 
    };
  } catch (err) {
    console.error(`Verification failed for ${backlink.blogUrl}:`, err.message);
    backlink.verified = true;
    backlink.isLive = false;
    backlink.lastChecked = new Date();
    await backlink.save();
    return { success: false, error: err.message };
  }
}

module.exports = { verifyBacklink };
