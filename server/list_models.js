require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.models) {
      console.log('Available Model Names:');
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
           console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log('No models found in response:', data);
    }
  } catch (err) {
    console.error('Error listing models:', err);
  }
}

listModels();
