const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const Settings = require('../models/Settings');

const TARGET_URL = 'https://www.ccbp.in/intensive';

// Fallback chain for Gemini
const GEMINI_FALLBACK_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-pro-latest'
].filter(Boolean);

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

/**
 * Call Ollama API
 */
async function callOllama(prompt) {
  // Get settings from DB or env
  const dbSettings = await Settings.find({ key: { $in: ['OLLAMA_BASE_URL', 'OLLAMA_MODEL', 'OLLAMA_API_KEY'] } });
  const settingsMap = {};
  dbSettings.forEach(s => { settingsMap[s.key] = s.value; });

  const baseUrl = settingsMap['OLLAMA_BASE_URL'] || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const model = settingsMap['OLLAMA_MODEL'] || process.env.OLLAMA_MODEL || 'llama3';
  const apiKey = settingsMap['OLLAMA_API_KEY'] || process.env.OLLAMA_API_KEY;

  console.log(`[AI] Trying Ollama model: ${model} at ${baseUrl}`);
  
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['X-API-Key'] = apiKey;
  }

  const response = await axios.post(`${baseUrl}/api/generate`, {
    model: model,
    prompt: prompt,
    stream: false,
    format: 'json'
  }, { headers, timeout: 90000 }); // Longer timeout for local LLMs

  return response.data.response;
}

/**
 * Universal Generate Hub
 */
async function generateWithAI(prompt) {
  let lastError = null;

  // Get all AI settings from DB
  const dbSettings = await Settings.find({ key: { $in: ['GEMINI_API_KEY', 'GEMINI_MODEL', 'OLLAMA_API_KEY', 'OLLAMA_BASE_URL', 'OLLAMA_MODEL'] } });
  const settingsMap = {};
  dbSettings.forEach(s => { settingsMap[s.key] = s.value; });

  const geminiKey = settingsMap['GEMINI_API_KEY'] || process.env.GEMINI_API_KEY;
  const geminiModel = settingsMap['GEMINI_MODEL'] || process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  // 1. Try Gemini first
  if (geminiKey) {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const models = [geminiModel, 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-pro-latest'].filter((v, i, a) => a.indexOf(v) === i);
    
    for (const modelName of models) {
      try {
        console.log('[AI] Trying Gemini model:', modelName);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        lastError = err;
        console.warn(`[AI] Gemini ${modelName} failed:`, err.message);
      }
    }
  }

  // 2. Fallback to Ollama
  try {
    const ollamaResponse = await callOllama(prompt);
    return ollamaResponse;
  } catch (err) {
    lastError = err;
    console.error(`[AI] Ollama failed:`, err.message);
  }

  throw new Error(`AI Generation failed. All providers (Gemini & Ollama) exhausted. Last error: ${lastError?.message}`);
}

async function generateBlog(topic, keywords = [], tone = 'professional') {
  const anchors = getRandomAnchors(3);
  const backlinkInstructions = anchors.map((anchor, i) =>
    `Backlink ${i + 1}: Use anchor text "${anchor}" linking to ${TARGET_URL}`
  ).join('\n');

  const prompt = `Write a 1200-1500 word SEO blog post about: "${topic}"
Include EXACTLY these 3 backlinks naturally:
${backlinkInstructions}
Format: [anchor text](${TARGET_URL})

Return response as pure JSON:
{
  "title": "Blog post title",
  "metaDescription": "150-160 char meta description",
  "content": "Full markdown blog content",
  "summary": "2-3 sentence summary",
  "keywords": ["kw1", "kw2"],
  "backlinks": [{"anchorText": "...", "url": "${TARGET_URL}"}]
}`;

  const text = await generateWithAI(prompt);
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

async function generateOutreachEmail(websiteName, websiteUrl, niche) {
  const prompt = `Write outreach email for ${websiteName} (${websiteUrl}). Niche: ${niche}. My site: ${TARGET_URL}.
Return ONLY JSON: {"subject": "...", "body": "..."}`;
  
  const text = await generateWithAI(prompt);
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

async function findRelevantWebsites(niche = 'edtech') {
  const prompt = `List 10 websites in ${niche} niche for guest updates. Return JSON array: [{"websiteName": "...", "websiteUrl": "..."}]`;
  
  const text = await generateWithAI(prompt);
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
}

module.exports = { generateBlog, generateOutreachEmail, findRelevantWebsites, BLOG_TOPICS };
