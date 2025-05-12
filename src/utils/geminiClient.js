const axios = require("axios");
require("dotenv").config();

const generateAiTravelPlan = async (prompt) => {
  console.log(process.env.GEMINI_API_KEY);
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };
  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return result;
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    throw new Error("Failed to generate travel plan from Gemini API.");
  }
};

module.exports = { generateAiTravelPlan };
