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
  console.log("🔥 MODEL:", model);
  const response = await openrouter.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }]
  });
  res.json({ response: response.choices[0].message.content, model_used: model });
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
      debateSteps: [{stage: 'AI Complete', status: 'success'}]
    });
  } catch (error) {
    console.error('OpenRouter Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'AI service error', details: error.response?.data });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
