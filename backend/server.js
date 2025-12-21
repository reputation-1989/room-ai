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
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'allenai/olmo-3.1-32b-think:free',
      messages: [{role: 'user', content: prompt}]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      finalAnswer: response.data.choices[0].message.content,
      models: { modelA: 'Olmo3.1-Free', modelB: 'Olmo3.1-Free' },
      debateSteps: [{stage: 'AI Complete', status: 'success'}]
    });
  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI service error', details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
