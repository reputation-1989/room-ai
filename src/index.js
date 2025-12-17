import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import { executeAllCodeBlocks, generateTestCases } from './codeExecutor.js';
import { classifyQuery } from './queryClassifier.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODELS = {
  modelA: 'meta-llama/llama-3.3-70b-instruct:free',
  modelB: 'mistralai/mistral-7b-instruct:free'
};

class DebateEngine {
  constructor(modelA, modelB) {
    this.modelA = modelA;
    this.modelB = modelB;
    this.transcript = [];
  }

  async callModel(modelName, prompt) {
    try {
      const completion = await openrouter.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error(`Error calling ${modelName}:`, error.message);
      throw error;
    }
  }

  async runDebate(userPrompt, classification) {
    this.transcript = [];
    const startTime = Date.now();
    console.log('🔥 Debate started...');

    console.log('📝 Phase 1: Independent reasoning...');
    const promptText = `You are an expert problem solver. Solve this:\n\n${userPrompt}\n\nProvide a clear, well-reasoned solution.`;
    const [responseA, responseB] = await Promise.all([
      this.callModel(this.modelA, promptText),
      this.callModel(this.modelB, promptText)
    ]);

    this.transcript.push({
      phase: 'Independent Solutions',
      modelA: { name: this.modelA, response: responseA },
      modelB: { name: this.modelB, response: responseB }
    });

    let updatedResponseA = responseA;
    let updatedResponseB = responseB;

    if (classification.enableCodeExecution) {
      console.log('🔍 Checking for code blocks...');
      const codeResultsA = await executeAllCodeBlocks(responseA);
      const codeResultsB = await executeAllCodeBlocks(responseB);
      
      if (codeResultsA || codeResultsB) {
        console.log('⚡ Executing code...');
        console.log('🧪 Generating test cases...');
        
        this.transcript.push({
          phase: 'Code Execution & Testing',
          modelA: codeResultsA ? { executed: true, results: codeResultsA } : { executed: false },
          modelB: codeResultsB ? { executed: true, results: codeResultsB } : { executed: false }
        });
        
        let executionSummary = '\n\n--- CODE EXECUTION RESULTS ---\n';
        
        if (codeResultsA) {
          executionSummary += '\nYour code (Model A) execution:\n';
          codeResultsA.forEach((result, idx) => {
            executionSummary += `Code block ${idx + 1} (${result.language}):\n`;
            executionSummary += `Output: ${result.output}\n`;
            executionSummary += `Exit code: ${result.exitCode}\n`;
            executionSummary += result.exitCode !== 0 ? '⚠️ RUNTIME ERROR\n' : '✅ Success\n';
          });
        }
        
        if (codeResultsB) {
          executionSummary += '\nOther model code (Model B) execution:\n';
          codeResultsB.forEach((result, idx) => {
            executionSummary += `Code block ${idx + 1} (${result.language}):\n`;
            executionSummary += `Output: ${result.output}\n`;
            executionSummary += `Exit code: ${result.exitCode}\n`;
            executionSummary += result.exitCode !== 0 ? '⚠️ RUNTIME ERROR\n' : '✅ Success\n';
          });
        }
        
        console.log('🔥 Initiating harsh debugging mode...');
        
        const harshPrompt = `Code execution results:\n${executionSummary}\n\nBe HARSH. Generate 3 edge case tests to break the other model code. Consider: empty inputs, large numbers, negatives, special chars, boundaries. Format: TEST: <input> | EXPECTED: <result>\n\nExplain why challenging.`;
        
        const harshDebugA = await this.callModel(this.modelA, harshPrompt);
        const harshDebugB = await this.callModel(this.modelB, harshPrompt);
        
        this.transcript.push({
          phase: 'Harsh Debugging - Test Case Generation',
          modelA: { testCases: harshDebugA, strategy: 'Adversarial test cases for Model B' },
          modelB: { testCases: harshDebugB, strategy: 'Adversarial test cases for Model A' }
        });
        
        console.log('💥 Test cases generated!');
        
        updatedResponseA = `${responseA}\n\n${executionSummary}\n\nTest cases from other model:\n${harshDebugB}`;
        updatedResponseB = `${responseB}\n\n${executionSummary}\n\nTest cases from other model:\n${harshDebugA}`;
      }
    }

    console.log('🔍 Phase 2: Cross-examination...');
    const questionFromA = await this.callModel(this.modelA, `Review this:\n\n${updatedResponseB}\n\nAsk ONE critical question.`);
    const defenseB = await this.callModel(this.modelB, `You said:\n${updatedResponseB}\n\nChallenge: ${questionFromA}\n\nDefend.`);
    const questionFromB = await this.callModel(this.modelB, `Review this:\n\n${updatedResponseA}\n\nAsk ONE critical question.`);
    const defenseA = await this.callModel(this.modelA, `You said:\n${updatedResponseA}\n\nChallenge: ${questionFromB}\n\nDefend.`);

    this.transcript.push({
      phase: 'Cross-Examination',
      modelA: { question: questionFromB, defense: defenseA },
      modelB: { question: questionFromA, defense: defenseB }
    });

    console.log('⚔️ Phase 3: Mutual critique...');
    const [critiqueA, critiqueB] = await Promise.all([
      this.callModel(this.modelA, `Analyze this for flaws:\n\n${updatedResponseB}\n\nList 2-3 weaknesses.`),
      this.callModel(this.modelB, `Analyze this for flaws:\n\n${updatedResponseA}\n\nList 2-3 weaknesses.`)
    ]);

    this.transcript.push({
      phase: 'Critique',
      modelA: { critique: critiqueA, target: this.modelB },
      modelB: { critique: critiqueB, target: this.modelA }
    });

    console.log('🎯 Phase 4: Generating final answer...');
    const synthesisPrompt = `Two AIs debated: "${userPrompt}"\n\nA: ${updatedResponseA}\n\nB: ${updatedResponseB}\n\nCritiques: A said: ${critiqueA}\nB said: ${critiqueB}\n\nSynthesize best answer.`;
    const synthesis = await this.callModel(this.modelA, synthesisPrompt);

    this.transcript.push({
      phase: 'Final Synthesis',
      synthesis
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Debate completed in ${duration}s`);

    return {
      success: true,
      userPrompt,
      models: { modelA: this.modelA, modelB: this.modelB },
      transcript: this.transcript,
      finalAnswer: synthesis,
      metadata: {
        duration: `${duration}s`,
        timestamp: new Date().toISOString(),
        provider: 'OpenRouter (100% FREE)'
      }
    };
  }
}

app.get('/', (req, res) => {
  res.json({
    project: '🏛️ room.ai',
    description: 'Multi-LLM Debate & Collaboration Engine',
    status: 'online',
    version: '3.0.0',
    provider: 'OpenRouter (100% FREE)',
    features: ['Smart Query Detection', 'Code Execution', 'Harsh Debugging', 'Universal Adaptation'],
    models: MODELS,
    endpoints: {
      debate: 'POST /api/debate',
      health: 'GET /health',
      models: 'GET /models'
    }
  });
});

app.post('/api/debate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
        example: { prompt: 'Explain quantum computing' }
      });
    }

    const classification = classifyQuery(prompt);
    console.log(`\n🎯 Query Type: ${classification.type.toUpperCase()}`);
    console.log(`📋 Mode: ${classification.mode}`);
    console.log(`🎲 Strategy: ${classification.strategy}\n`);

    const engine = new DebateEngine(MODELS.modelA, MODELS.modelB);
    const result = await engine.runDebate(prompt, classification);

    res.json({ ...result, classification });
  } catch (error) {
    console.error('Debate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/models', (req, res) => {
  res.json({
    available: MODELS,
    provider: 'OpenRouter',
    cost: '100% FREE',
    note: 'Smart query detection with code execution'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 room.ai v3.0 running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`⚡ Powered by OpenRouter (100% FREE)`);
  console.log(`🤖 Models: Llama 3.3 (70B) vs Mistral 7B`);
  console.log(`🧠 Smart Query Detection: ENABLED`);
  console.log(`🌐 Press Ctrl+C to stop\n`);
});
