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
    
    // Llama3 via OpenRouter
    const llamaResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'meta-llama/llama-3.1-70b-instruct:free',
      messages: [{role: 'user', content: prompt}]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Mistral via OpenRouter  
    const mistralResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'mistralai/mistral-nemo:latest',
      messages: [{role: 'user', content: prompt}]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const finalAnswer = `**Llama3:** ${llamaResponse.data.choices[0].message.content}\n\n**Mistral:** ${mistralResponse.data.choices[0].message.content}`;

    res.json({
      finalAnswer,
      models: { modelA: 'Llama3', modelB: 'Mistral' },
      debateSteps: [
        {stage: 'Llama3 Complete', status: 'success'},
        {stage: 'Mistral Complete', status: 'success'}
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'OpenRouter API error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
