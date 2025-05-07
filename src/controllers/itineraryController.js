const geminiClient = require('../utils/geminiClient')
const buildPrompt = require('../utils/promptBuilder')

const generateItinerary = async (req, res) =>{
    const userData = req.body;

    try {
        const prompt = buildPrompt(userData)
        const geminiRes = await geminiClient.post(
            '/models/gemini-pro:generateContent',
            {contents:[{parts: [{text: prompt}]}]}
        );

        const raw = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if(!raw) {
            throw new Error('Invalid responser format');
        }

        const jsonStart = raw.indexOf('{');
        const itinerary = JSON.parse(raw.slice(jsonStart))

        res.status(200).json({ itinerary })
    } catch (err) {
        console.error('Itinerary generation error:', err.message);
        res.status(500).json({error: 'Failed to generate itinerary', message: err.message});
    }
};

module.exports = {generateItinerary};
