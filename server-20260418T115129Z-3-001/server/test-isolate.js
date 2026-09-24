require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testSimple() {
  try {
    console.log('Testing Simple Gemini Call...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log('Simple Response:', result.response.text());
  } catch (err) {
    console.error('Simple Test Failed:', err.message);
  }
}

async function testSystem() {
  try {
    console.log('\nTesting System Instruction Gemini Call...');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are a helpful assistant." 
    });
    const result = await model.generateContent("Say hello");
    console.log('System Response:', result.response.text());
  } catch (err) {
    console.error('System Test Failed:', err.message);
  }
}

testSimple().then(testSystem);
