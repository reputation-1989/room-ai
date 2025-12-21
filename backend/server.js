const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'alive'}));
app.post('/api/debate', (req, res) => {
  res.json({
    models: {modelA: 'Llama', modelB: 'Mistral'},
    debateSteps: [{stage: 'Test', status: 'complete'}]
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});

const groq = require('groq-sdk');
const groqClient = new groq.Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/debate', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await groqClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-70b-versatile',
      max_tokens: 1000
    });
    
    res.json({
      finalAnswer: response.choices[0].message.content,
      models: { modelA: 'Llama', modelB: 'Mistral' },
      debateSteps: [{ stage: 'AI Debate Complete', status: 'success' }]
    });
  } catch (error) {
    res.status(500).json({ error: 'AI service unavailable' });
  }
});
