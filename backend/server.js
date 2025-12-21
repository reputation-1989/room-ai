const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'alive'}));
app.post('/api/debate', (req, res) => {
  res.json({
    finalAnswer: `✅ **Room AI IS WORKING!**\n\nYour question: "${req.body.prompt || 'test'}"\n\n**Backend stable and ready for Render deploy!** 🚀`,
    models: {modelA: 'Llama', modelB: 'Mistral'},
    debateSteps: [{stage: 'Test', status: 'complete'}]
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});
