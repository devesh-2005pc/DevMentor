const Groq = require('groq-sdk');
require('dotenv').config();

let _groq = null;

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_API_KEYY;
  if (!_groq || _groq.apiKey !== apiKey) {
    _groq = new Groq({
      apiKey: apiKey || 'placeholder_groq_api_key_to_prevent_startup_crash',
    });
  }
  return _groq;
};

module.exports = {
  get groq() {
    return getGroqClient();
  }
};
