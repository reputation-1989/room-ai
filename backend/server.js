const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/debate', async (req, res) => {
  console.log('📥 REQUEST:', req.body);
  
  const { prompt, model = 'deepseek-r1:free' } = req.body;
  console.log('🔥 MODEL:', model, 'PROMPT:', prompt);
  
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'NO API KEY' });
  }
  
  try {
    console.log('🌐 CALLING OPENROUTER...');
    const apiResp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://room-ai.onrender.com'
      },
      body: JSON.stringify({
        model: model,
        messages: [{role: 'user', content: prompt}]
      })
    });
    
    console.log('📡 STATUS:', apiResp.status);
    const data = await apiResp.json();
    console.log('🔍 FULL RESPONSE:', JSON.stringify(data, null, 2));
    
    res.json({ 
      response: data.choices?.[0]?.message?.content || data.error || 'ERROR',
      model_used: model 
    });
  } catch (error) {
    console.error('💥 ERROR:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('✅ Server OK'));
