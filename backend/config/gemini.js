const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

let _model = null;
let _currentKey = null;

const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!_model || _currentKey !== apiKey) {
    _currentKey = apiKey;
    const genAI = new GoogleGenerativeAI(
      apiKey || 'placeholder_api_key_to_prevent_startup_crash'
    );
    _model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
    });
  }
  return _model;
};

module.exports = {
  get model() {
    return getGeminiModel();
  }
};

