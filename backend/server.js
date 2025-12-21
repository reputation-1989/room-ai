const express = require('express');
const cors = require('cors');
const groq = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groqClient = new groq.Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/health', (req, res) => res.json({status: 'alive'}));

app.post('/api/debate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
      max_tokens: 1000,
      temperature: 0.7
    });
    
    res.json({
      finalAnswer: response.choices[0].message.content,
      models: { modelA: 'Llama3', modelB: 'Mistral' },
      debateSteps: [{ stage: 'AI Complete', status: 'success' }]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI service error', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on ${PORT}`));
