const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'alive'}));

app.post('/api/debate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // VERIFIED WORKING FREE MODELS
    const llamaResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemma-2-9b-it:free',
      messages: [{role: 'user', content: prompt}]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const mistralResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'microsoft/phi-3-mini-128k-instruct:free',
      messages: [{role: 'user', content: prompt}]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const finalAnswer = `**Gemma2:** ${llamaResponse.data.choices[0].message.content}\n\n**Phi3:** ${mistralResponse.data.choices[0].message.content}`;

    res.json({
      finalAnswer,
      models: { modelA: 'Gemma2', modelB: 'Phi3' },
      debateSteps: [{stage: 'AI Debate Complete', status: 'success'}]
    });
  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI service error', details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
