const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'alive'}));

app.post("/api/debate", async (req, res) => {
  const { prompt, model = "nous-hermes3:free" } = req.body;
  
  const agents = [
    { name: "Alex", role: "optimist", model: "deepseek-r1:free" },
    { name: "Bella", role: "critic", model: "qwen2.5-coder:free" },
    { name: "Charlie", role: "realist", model: "gemma-2-27b:free" },
    { name: "Dana", role: "innovator", model: "mixtral:free" }
  ];
  
  let debate = `USER: ${prompt}\n\n`;
  
  for (let agent of agents) {
    const response = await openrouter.chat.completions.create({
      model: agent.model,
      messages: [{role: "user", content: `${agent.role.toUpperCase()}: ${prompt}`}] 
    });
    debate += `${agent.name} (${agent.role}): ${response.choices[0].message.content}\n\n`;
  }
  
  const finalResponse = await openrouter.chat.completions.create({
    model: model,
    messages: [{role: "user", content: `Summarize this debate: ${debate}`}] 
  });
  
  res.json({ debate, summary: finalResponse.choices[0].message.content });
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
