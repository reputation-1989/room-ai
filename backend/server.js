const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'alive'}));
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on ${PORT}`);
});

const groq = require('groq-sdk');
const groqClient = new groq.Groq({ apiKey: process.env.GROQ_API_KEY });

