require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Try different model names
const modelNames = [
  'gemini-2.0-flash-exp',
  'gemini-exp-1206',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
  'gemini-pro'
];

async function testModels() {
  for (const modelName of modelNames) {
    try {
      console.log(`\nTrying model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hello');
      const response = await result.response;
      console.log(`✅ SUCCESS with model: ${modelName}`);
      console.log(`Response: ${response.text().substring(0, 50)}...`);
      break; // Stop after first success
    } catch (error) {
      console.log(`❌ Failed: ${error.message.substring(0, 100)}`);
    }
  }
}

testModels();
