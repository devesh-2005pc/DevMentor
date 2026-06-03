require('dotenv').config();
const { callGroq, callGemini, callOllama } = require('./services/aiService');

async function runHealthChecks() {
  console.log('🔍 [HYBRID AI SYSTEM DIAGNOSTIC]');
  console.log('-----------------------------------------');
  console.log('GROQ_API_KEY present:  ', !!(process.env.GROQ_API_KEY || process.env.GROQ_API_KEYY));
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
  console.log('OLLAMA_URL configured: ', process.env.OLLAMA_URL || 'default (http://localhost:11434)');
  console.log('-----------------------------------------\n');

  // 1. Test Groq Connection (Primary)
  console.log('⚡ [1/3] Testing Groq API (Primary Model: llama-3.3-70b-versatile)...');
  try {
    const response = await callGroq("Respond with: 'Groq is operational!'");
    console.log('✅ Groq operational. Response:', response.trim());
  } catch (err) {
    console.error('❌ Groq failed. Error:', err.message);
  }

  // 2. Test Gemini Connection (Fallback)
  console.log('\n⚡ [2/3] Testing Gemini API (Fallback Model: gemini-2.0-flash)...');
  try {
    const response = await callGemini("Respond with: 'Gemini is operational!'");
    console.log('✅ Gemini operational. Response:', response.trim());
  } catch (err) {
    console.error('❌ Gemini failed. Error:', err.message);
  }

  // 3. Test Ollama Connection (Local Offline LLM)
  console.log('\n⚡ [3/3] Testing Ollama API (Local Model)...');
  try {
    const response = await callOllama("Respond with: 'Ollama is operational!'");
    console.log('✅ Ollama operational. Response:', response.trim());
  } catch (err) {
    console.error('❌ Ollama failed. Error:', err.message);
    console.log('ℹ️ Note: Ollama is optional and will run if installed locally.');
  }

  console.log('\n-----------------------------------------');
  console.log('💡 Diagnostic complete.');
}

runHealthChecks();
