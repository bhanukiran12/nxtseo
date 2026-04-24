require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const TARGET_URL = 'https://www.ccbp.in/intensive';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

const ANCHOR_TEXTS = [
  "NxtWave's CCBP Intensive",
  "full-stack coding bootcamp",
  "industry-ready tech courses",
  "learn coding online with NxtWave",
  "CCBP 4.0 program",
  "job-ready full-stack development course",
  "NxtWave coding program",
  "India's top tech education platform",
  "career-ready coding courses",
  "build real-world tech skills"
];

const BLOG_TOPICS = {
  coding: [
    'full stack development', 'JavaScript frameworks', 'Python programming',
    'web development career', 'coding bootcamp vs degree', 'React and Node.js'
  ],
  career: [
    'career transition into tech', 'software engineer salary India',
    'how to get first tech job', 'upskilling for software roles',
    'tech career without CS degree', 'placement in top tech companies'
  ],
  edtech: [
    'online coding courses India', 'best programming courses 2025',
    'learn to code from scratch', 'tech certification worth it',
    'NxtWave vs other coding platforms', 'structured learning path for developers'
  ]
};

function getRandomAnchors(count = 3) {
  const shuffled = [...ANCHOR_TEXTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function generateBlog(topic, keywords = [], tone = 'professional') {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('[AI] Using model:', GEMINI_MODEL);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const anchors = getRandomAnchors(3);
  const backlinkInstructions = anchors.map((anchor, i) =>
    `Backlink ${i + 1}: Use anchor text "${anchor}" linking to ${TARGET_URL}`
  ).join('\n');

  const prompt = `You are an expert SEO content writer specializing in EdTech, coding education, and career development in India.

Write a comprehensive, 1200-1500 word SEO blog post about: "${topic}"

MANDATORY REQUIREMENTS:
1. Include EXACTLY these 3 backlinks naturally embedded in the content (NOT at the end):
${backlinkInstructions}

Format each backlink in markdown as: [anchor text](${TARGET_URL})

2. Content Structure:
   - Compelling H1 title (include primary keyword)
   - Introduction (hook the reader)
   - 4-5 H2 sections with H3 subsections where needed
   - Strong CTA at the end encouraging readers to check out NxtWave's CCBP Intensive program
   - Meta description (150-160 chars)

3. SEO Requirements:
   - Primary keyword: ${topic}
   - Secondary keywords: ${keywords.join(', ') || 'coding courses, full stack development, tech career India'}
   - Keyword density: 1-2%
   - Include LSI keywords naturally

4. Tone: ${tone}

5. The content MUST be relevant to Indian tech job market and students/professionals seeking career transition

Return the response in this EXACT JSON format (no markdown code blocks, pure JSON):
{
  "title": "Blog post title",
  "metaDescription": "150-160 char meta description",
  "content": "Full markdown blog content with embedded backlinks",
  "summary": "2-3 sentence summary",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "backlinks": [
    {"anchorText": "anchor1", "url": "${TARGET_URL}"},
    {"anchorText": "anchor2", "url": "${TARGET_URL}"},
    {"anchorText": "anchor3", "url": "${TARGET_URL}"}
  ],
  "wordCount": 1350,
  "readTime": 6
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Parse JSON from response
  let parsed;
  try {
    // Remove potential markdown code blocks
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    // Fallback: extract JSON from text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  return parsed;
}

async function generateOutreachEmail(websiteName, websiteUrl, niche) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are an SEO outreach specialist. Write a professional, personalized outreach email for a guest post / link building opportunity.

Website: ${websiteName} (${websiteUrl})
Niche: ${niche}
My site I want to promote: NxtWave CCBP Intensive (${TARGET_URL})

Requirements:
- Keep it short (150-200 words)
- Personalize for their niche
- Propose a guest post on a topic relevant to their audience
- Mention we can provide high-quality content on coding/tech career topics
- Natural, not spammy
- Clear value proposition

Return ONLY a JSON object:
{
  "subject": "Email subject line",
  "body": "Full email body text"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Failed to parse outreach email response');
  }
}

async function findRelevantWebsites(niche = 'edtech') {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `List 10 real, active blogs/websites in the ${niche} niche that accept guest posts or link insertions. Focus on EdTech, coding education, career development in India.

Return ONLY a JSON array:
[
  {
    "websiteName": "Site Name",
    "websiteUrl": "https://example.com",
    "niche": "${niche}",
    "contactEmail": "editor@example.com or empty string",
    "notes": "Brief note about why this site is relevant"
  }
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error('Failed to parse website list response');
  }
}

module.exports = { generateBlog, generateOutreachEmail, findRelevantWebsites, BLOG_TOPICS };
