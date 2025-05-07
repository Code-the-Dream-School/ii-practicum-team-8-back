const axios = require('axios');

const geminiClient = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  headers: {
    'Content-Type': 'application/json',
  },
  params: {
    key: process.env.GEMINI_API_KEY
  }
});

module.exports = geminiClient;
