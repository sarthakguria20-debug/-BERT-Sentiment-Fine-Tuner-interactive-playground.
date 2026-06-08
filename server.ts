import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI server-side using recommended SDK practices
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// A robust list of education-oriented WordPiece tokens to support authentic-looking token IDs
const DEFAULT_VOCAB: Record<string, number> = {
  "[PAD]": 0,
  "[UNK]": 100,
  "[CLS]": 101,
  "[SEP]": 102,
  "[MASK]": 103,
  "the": 1996,
  "a": 1037,
  "an": 2019,
  "and": 1997,
  "of": 1997,
  "to": 2000,
  "is": 2003,
  "was": 2001,
  "it": 2009,
  "this": 2023,
  "that": 2008,
  "i": 1045,
  "movie": 3185,
  "film": 2143,
  "story": 2466,
  "acting": 3772,
  "plot": 5436,
  "characters": 3494,
  "not": 2025,
  "but": 2021,
  "very": 2200,
  "so": 2061,
  "great": 2307,
  "good": 2204,
  "amazing": 6429,
  "awesome": 13915,
  "outstanding": 5013,
  "masterpiece": 11333,
  "love": 2293,
  "enjoyed": 5632,
  "perfect": 3269,
  "highly": 3811,
  "recommend": 16755,
  "bad": 2919,
  "worst": 5410,
  "terrible": 6659,
  "horrible": 9180,
  "boring": 11771,
  "waste": 5949,
  "garbage": 9974,
  "disaster": 7183,
  "disappointed": 8454,
  "fail": 8452,
  "awful": 9734,
};

// WordPiece Subword Tokenizer Simulation function
function wordPieceTokenize(text: string): { token: string; id: number; typeId: number; mask: number }[] {
  const result: { token: string; id: number; typeId: number; mask: number }[] = [];
  
  // Add CLS token at index 0
  result.push({ token: "[CLS]", id: 101, typeId: 0, mask: 1 });

  // Clean and split by whitespace/punctuation
  const rawWords = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, " $& ")
    .split(/\s+/)
    .filter(Boolean);

  for (const word of rawWords) {
    if (DEFAULT_VOCAB[word] !== undefined) {
      result.push({ token: word, id: DEFAULT_VOCAB[word], typeId: 0, mask: 1 });
    } else {
      // Simple WordPiece segmenter simulation (e.g. dissecting suffix if possible)
      const suffixes = ["ing", "ed", "er", "ly", "able", "ful", "ness", "s"];
      let matched = false;
      
      for (const suffix of suffixes) {
        if (word.length > suffix.length && word.endsWith(suffix)) {
          const root = word.substring(0, word.length - suffix.length);
          const rootId = DEFAULT_VOCAB[root] || Math.floor(Math.random() * 15000) + 10000;
          const suffixWord = `##${suffix}`;
          const suffixId = DEFAULT_VOCAB[suffixWord] || Math.floor(Math.random() * 15000) + 10000;
          
          result.push({ token: root, id: rootId, typeId: 0, mask: 1 });
          result.push({ token: suffixWord, id: suffixId, typeId: 0, mask: 1 });
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        // Assign a pseudo-random hash ID for this vocabulary word to feel authentic
        const hashId = Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0) * 17 % 20000 + 4000;
        result.push({ token: word, id: hashId, typeId: 0, mask: 1 });
      }
    }
  }

  // Add SEP token at the end
  result.push({ token: "[SEP]", id: 102, typeId: 0, mask: 1 });
  return result;
}

// REST APIs

// 1. Interactive Tokenizer Route
app.post("/api/tokenize", (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const tokenInfo = wordPieceTokenize(text);
    res.json({ text, tokens: tokenInfo });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to tokenize text" });
  }
});

// 2. Fine-tuning simulation powered by server-side Gemini 3.5 Flash
app.post("/api/simulate-training", async (req, res) => {
  try {
    const { dataset, hyperparameters } = req.body;
    
    if (!dataset || !hyperparameters) {
      return res.status(400).json({ error: "Missing dataset or hyperparameters" });
    }

    const systemPrompt = `You are a machine learning trainer simulator inside an educational interactive app.
You will assess a sentiment dataset containing custom and raw examples, along with BERT fine-tuning hyperparameters.
Provide:
1. Training metrics (trainLoss, valLoss, valAccuracy) for each epoch up to requested count. Keep it high-fidelity and scientifically accurate based on hyperparameters (e.g. optimizer, learning rate too high triggers divergence, epoch values, dropout rate reduces overfitting, custom dataset content bias shifts performance).
2. PyTorch Hugging Face trainer style simulation console logs (epochs, progress bar percents, throughput items/sec, learning rate schedule, steps).
3. A detailed pedagogical ML summary card in Markdown detailing model convergence, evaluation, recommendations for dataset improvements, and learning rate adjustments.
Output MUST strictly fit the requested JSON schema.`;

    const modelInput = `Dataset Details (label positive or negative):
${JSON.stringify(dataset, null, 2)}

User Hyperparameters:
Learning Rate: ${hyperparameters.learningRate}
Batch Size: ${hyperparameters.batchSize}
Epochs: ${hyperparameters.epochs}
Dropout Rate: ${hyperparameters.dropoutRate}
Optimizer: ${hyperparameters.optimizer}
Warmup Ratio: ${hyperparameters.warmupRatio}
Max Token Length: ${hyperparameters.maxLen}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: modelInput,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metrics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  epoch: { type: Type.INTEGER },
                  trainLoss: { type: Type.NUMBER },
                  valLoss: { type: Type.NUMBER },
                  valAccuracy: { type: Type.NUMBER },
                  lr: { type: Type.NUMBER },
                },
                required: ["epoch", "trainLoss", "valLoss", "valAccuracy", "lr"],
              },
            },
            logs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            reportMarkdown: { type: Type.STRING },
          },
          required: ["metrics", "logs", "reportMarkdown"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText.trim());
    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to simulate training session" });
  }
});

// 3. Side-by-Side Inference Engine with Attention Weight Generation
app.post("/api/infer-comparison", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text prompt is required" });
    }

    const tokens = wordPieceTokenize(text).map(t => t.token);

    const systemPrompt = `You are a BERT model attention and prediction analyzer.
You will assess a word token sequence and simulate:
1. Base BERT: Un-tuned model designed for generic Masked Language Modeling. It has poor/neutral classification on sentiment or relies heavily on surface features, with high attention weights on structural symbols ($CLS, $SEP, period, of, the) in the classification head.
2. Fine-Tuned BERT: Emotion-specific classification weights. High confidence predictions on correct sentiment, with self-attention weights focused tightly on emotional adjectives and negation words.

Tokens: ${JSON.stringify(tokens)}
Text: "${text}"

Assign attention scores for each token so that they sum up to exactly 1.0 (or very close) for both models. Return classification label and score.
Follow JSON schema carefully.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Calculate sentiment and self-attention scores on ${JSON.stringify(tokens)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            baseModel: {
              type: Type.OBJECT,
              properties: {
                sentiment: { type: Type.STRING, description: "sentiment predicted ('positive' or 'negative')" },
                score: { type: Type.NUMBER, description: "confidence score between 0.50 and 1.0" },
                attentionScores: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: `Attention weight score per token (matching tokens array length of ${tokens.length})`,
                }
              },
              required: ["sentiment", "score", "attentionScores"],
            },
            fineTunedModel: {
              type: Type.OBJECT,
              properties: {
                sentiment: { type: Type.STRING, description: "sentiment predicted ('positive' or 'negative')" },
                score: { type: Type.NUMBER, description: "confidence score between 0.55 and 1.00" },
                attentionScores: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: `Attention weight score per token (matching tokens array length of ${tokens.length})`,
                }
              },
              required: ["sentiment", "score", "attentionScores"],
            }
          },
          required: ["baseModel", "fineTunedModel"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText.trim());

    // Reinforce that attentionScores length matches tokens length exactly in case Gemini drifted
    const adjustScores = (scores: number[], len: number): number[] => {
      if (scores.length === len) return scores;
      if (scores.length < len) {
        const diff = len - scores.length;
        return [...scores, ...Array(diff).fill(0.01)];
      }
      return scores.slice(0, len);
    };

    data.baseModel.attentionScores = adjustScores(data.baseModel.attentionScores || [], tokens.length);
    data.fineTunedModel.attentionScores = adjustScores(data.fineTunedModel.attentionScores || [], tokens.length);
    data.tokens = tokens;
    data.text = text;

    res.json(data);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to compare model inference" });
  }
});

// 4. PyTorch / HF script auto-generation
app.post("/api/generate-hf-script", async (req, res) => {
  try {
    const { hyperparameters, dataset } = req.body;
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Write a standalone PyTorch python script using Hugging Face's transformers library to fine-tune 'bert-base-uncased' on a Sentiment Analysis dataset with these hyperparameters:
Learning Rate: ${hyperparameters.learningRate}
Batch Size: ${hyperparameters.batchSize}
Epochs: ${hyperparameters.epochs}
Dropout: ${hyperparameters.dropoutRate}
Optimizer: ${hyperparameters.optimizer}

Also, seed the script with the following dataset samples so it compiles and runs out of the box:
${JSON.stringify(dataset || [])}

Include:
- WordPiece tokenization loading
- Trainer subclass/arguments setup
- Train loops, evaluations, and final inference testing on a mock string.
- Explanations inside comments.`,
    });

    res.json({ script: response.text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to generate Python Trainer script" });
  }
});

// 5. ML Advisor Chat Companion
app.post("/api/chat", async (req, res) => {
  try {
    const { message, chatHistory } = req.body;
    
    const formattedHistory = (chatHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: formattedHistory,
      config: {
        systemInstruction: `You are an expert BERT Fine-Tuning advisor. Explain concepts clearly.
Keep explanations friendly, simple, and pedagogical. You understand self-attention heads, positional embeddings, AdamW optimizers, and hugging face transformers library natively.
If asked for code snippets, write high-quality python trainer structures.`,
      },
    });

    const response = await chat.sendMessage({ message: message });
    res.json({ text: response.text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to query advice companion" });
  }
});

// Start full-stack web application
async function bootstrap() {
  // Mount Vite middleware in development or serve built assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BERT App Server] listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
