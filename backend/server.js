const express = require('express');
const cors = require('cors');
const OpenRouter = require('openrouter-js');

const app = express();
app.use(cors());
app.use(express.json());

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

app.post('/api/debate', async (req, res) => {
  const { prompt, model = 'deepseek-r1:free' } = req.body;
  
  console.log('🔥 USING MODEL:', model);
  
  try {
    const response = await openrouter.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    });
    
    res.json({ 
      response: response.choices[0].message.content, 
      model_used: model 
    });
  } catch (error) {
    console.error('ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
