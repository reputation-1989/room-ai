// room.ai - Multi-LLM Debate Engine (OpenRouter - 100% FREE)
import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import { executeAllCodeBlocks } from './codeExecutor.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Initialize OpenRouter client (uses OpenAI SDK)
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// 100% FREE models on OpenRouter (no credits needed)
// 100% FREE models on OpenRouter (confirmed working)
// 100% FREE models on OpenRouter (CONFIRMED WORKING Nov 2025)
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
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1024
      });

      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error(`Error calling ${modelName}:`, error.message);
      throw error;
    }
  }

  async runDebate(userPrompt) {
    this.transcript = [];
    const startTime = Date.now();

    console.log('🔥 Debate started...');

    // PHASE 1: Independent Solutions
    console.log('📝 Phase 1: Independent reasoning...');
    const [responseA, responseB] = await Promise.all([
      this.callModel(
        this.modelA,
        `You are an expert problem solver. Solve this:\n\n${userPrompt}\n\nProvide a clear, well-reasoned solution.`
      ),
      this.callModel(
        this.modelB,
        `You are an expert problem solver. Solve this:\n\n${userPrompt}\n\nProvide a clear, well-reasoned solution.`
      )
    ]);

    this.transcript.push({
      phase: 'Independent Solutions',
      modelA: { name: this.modelA, response: responseA },
      modelB: { name: this.modelB, response: responseB }
    });

    // CODE EXECUTION: Check if responses contain code
    console.log('🔍 Checking for code blocks...');
    const codeResultsA = await executeAllCodeBlocks(responseA);
    const codeResultsB = await executeAllCodeBlocks(responseB);
    
    if (codeResultsA || codeResultsB) {
      console.log('⚡ Executing code...');
      
      // Add execution results to transcript
      this.transcript.push({
        phase: 'Code Execution',
        modelA: codeResultsA ? {
          executed: true,
          results: codeResultsA
        } : { executed: false },
        modelB: codeResultsB ? {
          executed: true,
          results: codeResultsB
        } : { executed: false }
      });
      
      // Create execution summary for models to see
      let executionSummary = '\n\n--- CODE EXECUTION RESULTS ---\n';
      
      if (codeResultsA) {
        executionSummary += `\nModel A's code execution:\n`;
        codeResultsA.forEach((result, idx) => {
          executionSummary += `Code block ${idx + 1} (${result.language}):\n`;
          executionSummary += `Output: ${result.output}\n`;
          executionSummary += `Exit code: ${result.exitCode}\n`;
        });
      }
      
      if (codeResultsB) {
        executionSummary += `\nModel B's code execution:\n`;
        codeResultsB.forEach((result, idx) => {
          executionSummary += `Code block ${idx + 1} (${result.language}):\n`;
          executionSummary += `Output: ${result.output}\n`;
          executionSummary += `Exit code: ${result.exitCode}\n`;
        });
      }
      
      // Update responses to include execution results for next phases
      responseA += executionSummary;
      responseB += executionSummary;
    }

    // PHASE 2: Cross-Examination
    console.log('🔍 Phase 2: Cross-examination...');
    const questionFromA = await this.callModel(
      this.modelA,
      `Review this solution:\n\n${responseB}\n\nAsk ONE critical question to test its validity.`
    );

    const defenseB = await this.callModel(
      this.modelB,
      `You said:\n${responseB}\n\nYou're challenged with: ${questionFromA}\n\nDefend your reasoning.`
    );

    const questionFromB = await this.callModel(
      this.modelB,
      `Review this solution:\n\n${responseA}\n\nAsk ONE critical question.`
    );

    const defenseA = await this.callModel(
      this.modelA,
      `Your solution:\n${responseA}\n\nChallenge: ${questionFromB}\n\nRespond.`
    );

    this.transcript.push({
      phase: 'Cross-Examination',
      modelA: {
        question: questionFromB,
        defense: defenseA
      },
      modelB: {
        question: questionFromA,
        defense: defenseB
      }
    });

    // PHASE 3: Critique
    console.log('⚔️ Phase 3: Mutual critique...');
    const [critiqueA, critiqueB] = await Promise.all([
      this.callModel(
        this.modelA,
        `Analyze this solution for flaws:\n\n${responseB}\n\nList 2-3 specific weaknesses.`
      ),
      this.callModel(
        this.modelB,
        `Analyze this solution for flaws:\n\n${responseA}\n\nList 2-3 specific weaknesses.`
      )
    ]);

    this.transcript.push({
      phase: 'Critique',
      modelA: { critique: critiqueA, target: this.modelB },
      modelB: { critique: critiqueB, target: this.modelA }
    });

    // PHASE 4: Final Synthesis
    console.log('🎯 Phase 4: Generating final answer...');
    const synthesis = await this.callModel(
      this.modelA,
      `Two expert AIs debated:\n\n"${userPrompt}"\n\nSolution A:\n${responseA}\n\nSolution B:\n${responseB}\n\nCritiques:\n- A's critique: ${critiqueA}\n- B's critique: ${critiqueB}\n\nSynthesize the BEST aspects into one superior answer.`
    );

    this.transcript.push({
      phase: 'Final Synthesis',
      synthesis
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Debate completed in ${duration}s`);

    return {
      success: true,
      userPrompt,
      models: {
        modelA: this.modelA,
        modelB: this.modelB
      },
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

// API Routes
app.get('/', (req, res) => {
  res.json({
    project: '🏛️ room.ai',
    description: 'Multi-LLM Debate & Collaboration Engine',
    status: 'online',
    version: '2.0.0',
    provider: 'OpenRouter (100% FREE)',
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

    const engine = new DebateEngine(MODELS.modelA, MODELS.modelB);
    const result = await engine.runDebate(prompt);

    res.json(result);
  } catch (error) {
    console.error('Debate error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/models', (req, res) => {
  res.json({
    available: MODELS,
    provider: 'OpenRouter',
    cost: '100% FREE',
    note: 'Using free-tier models (DeepSeek R1 & Llama 3.3)'
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
  console.log(`\n🚀 room.ai v2.0 running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`⚡ Powered by OpenRouter (100% FREE)`);
      console.log(`🤖 Models: Llama 3.3 (70B) vs Mistral 7B`);
  console.log(`🌐 Press Ctrl+C to stop\n`);
});
