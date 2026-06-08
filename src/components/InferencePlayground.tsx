import React, { useState, useEffect } from "react";
import { InferenceResult } from "../types";
import { HelpCircle, ChevronRight, Activity, Zap, CheckCircle2, AlertCircle } from "lucide-react";

interface InferencePlaygroundProps {
  hasTrained: boolean;
}

const SAMPLE_PROMPTS = [
  "This movie was not great, actually it was a complete boring waste of time.",
  "An outstanding performance! The actors were highly talented and perfect.",
  "I was disappointed because the screenplay was awful, but the sound was good.",
  "Very enjoyable film. The storytelling is amazing and perfect for kids.",
];

export default function InferencePlayground({ hasTrained }: InferencePlaygroundProps) {
  const [text, setText] = useState("I highly recommend this incredible masterpiece, though the start was a bit slow.");
  const [fetching, setFetching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tokens, setTokens] = useState<string[]>([]);
  
  const [baseResult, setBaseResult] = useState<{
    sentiment: "positive" | "negative";
    score: number;
    attentionScores: number[];
  } | null>(null);

  const [tunedResult, setTunedResult] = useState<{
    sentiment: "positive" | "negative";
    score: number;
    attentionScores: number[];
  } | null>(null);

  const [hoveredTokenIdx, setHoveredTokenIdx] = useState<number | null>(null);
  const [hoveredModel, setHoveredModel] = useState<"base" | "tuned" | null>(null);

  const handlePredict = async (inputText: string) => {
    if (!inputText.trim()) return;
    setFetching(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/infer-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!res.ok) throw new Error("Failed to compute inferences from model service.");
      const data = await res.json();
      
      setTokens(data.tokens || []);
      setBaseResult(data.baseModel);
      setTunedResult(data.fineTunedModel);
    } catch (err: any) {
      setErrorMsg(err.message || "An issue occurred querying comparative models.");
    } finally {
      setFetching(false);
    }
  };

  // Run initial prediction on load
  useEffect(() => {
    handlePredict(text);
  }, []);

  const getAttentionColor = (score: number, maxScore: number, sentiment: string) => {
    if (score === 0) return "rgba(226, 232, 240, 0.2)";
    const ratio = score / (maxScore || 1);
    // Base a soft heat highlight opacity on relative weights
    if (sentiment === "positive") {
      return `rgba(20, 184, 166, ${Math.min(0.1 + ratio * 0.85, 0.95)})`;
    } else {
      return `rgba(244, 63, 94, ${Math.min(0.1 + ratio * 0.85, 0.95)})`;
    }
  };

  const getMaxScore = (scores: number[]) => (scores && scores.length > 0 ? Math.max(...scores) : 0.1);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-lg p-6 font-sans" id="inference-arena">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/30 rounded-lg">
            <Activity className="w-5 h-5" id="arena-activity-icon" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg font-display">Inference & Self-Attention Arena</h2>
            <p className="text-xs text-slate-400">Test live models side-by-side to inspect sentiment predictions and self-attention mappings</p>
          </div>
        </div>
      </div>

      {/* Untrained warning banner */}
      {!hasTrained && (
        <div className="mb-4 p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs leading-relaxed text-slate-300 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <span className="font-semibold text-amber-300 block mb-0.5">Note: BERT Training Checklist Pending</span>
            Below, we simulate a standard Pre-trained general model compared to the sentiment-tuned model. Initialize the <b>BERT backpropagation simulator</b> above to synchronize custom weights with your curated dataset!
          </div>
        </div>
      )}

      {/* Custom prompt selectors */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preset Test Sentences</label>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(prompt);
                handlePredict(prompt);
              }}
              className="py-1.5 px-3 text-[11px] font-medium rounded-full bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all text-left truncate max-w-xs cursor-pointer"
              id={`preset-prompt-${idx}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive text field with predict trigger */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter custom sentence (e.g., 'The plot was awful, but acting is nice!')"
          className="flex-1 text-xs md:text-sm p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-150 font-semibold"
          id="arena-text-input"
        />
        <button
          onClick={() => handlePredict(text)}
          disabled={fetching}
          className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/25 text-white text-xs md:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center justify-center shrink-0 cursor-pointer"
          id="predict-trigger"
        >
          {fetching ? "Running..." : "Evaluate"}
        </button>
      </div>

      {errorMsg && (
        <div className="text-xs p-3 text-rose-355 text-rose-300 bg-rose-950/50 border border-rose-900/50 rounded-lg mb-4">
          {errorMsg}
        </div>
      )}

      {/* Side-by-Side Model results columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="comparison-arena-columns">
        
        {/* Model 1: Pre-Trained Base BERT */}
        <div className="border border-slate-800 rounded-xl p-5 bg-slate-950/40 shadow-sm flex flex-col justify-between" id="base-model-box">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">BERT-Base-Uncased (Raw)</span>
              <span className="text-[10px] bg-slate-900 border border-slate-700/60 text-slate-300 font-bold px-2 py-0.5 rounded-full">Pre-trained only</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-slate-400 font-medium font-sans">Predicted Sentiment:</span>
                <span className="font-extrabold text-slate-205 text-slate-200">
                  {baseResult ? baseResult.sentiment.toUpperCase() : "AWAITING..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium font-sans">Confidence Probability:</span>
                <span className="font-mono text-slate-205 text-slate-200 bg-slate-900 border border-slate-850 border-slate-800 px-1.5 py-0.5 rounded font-bold">
                  {baseResult ? `${(baseResult.score * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
            </div>

            {/* Token Highlight attention mapping */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Self-Attention Mapping (Layer 12, Head 1)</span>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-slate-800 bg-slate-950/60 min-h-[90px]">
                {fetching ? (
                  <div className="text-slate-400 text-xs py-4 px-2 w-full text-center">Processing weights...</div>
                ) : !baseResult ? (
                  <div className="text-slate-400 text-xs py-4 px-2 w-full text-center">Click evaluate to load</div>
                ) : (
                  tokens.map((token, idx) => {
                    const score = baseResult.attentionScores[idx] || 0;
                    const max = getMaxScore(baseResult.attentionScores);
                    const isSpecial = token === "[CLS]" || token === "[SEP]";
                    
                    return (
                      <span
                        key={idx}
                        onMouseEnter={() => {
                          setHoveredTokenIdx(idx);
                          setHoveredModel("base");
                        }}
                        onMouseLeave={() => {
                          setHoveredTokenIdx(null);
                          setHoveredModel(null);
                        }}
                        style={{ backgroundColor: getAttentionColor(score, max, "negative") }}
                        className={`text-xs font-mono px-2 py-1 rounded-md cursor-help border transition-all duration-150 ${
                          isSpecial ? "font-bold text-slate-450 text-slate-400 border-dashed border-slate-700 bg-slate-900/50" : "border-transparent text-white font-medium"
                        } ${hoveredTokenIdx === idx && hoveredModel === "base" ? "scale-105 shadow-md border-indigo-500/50 font-bold" : ""}`}
                      >
                        {token}
                      </span>
                    );
                  })
                )}
              </div>
              <p className="text-[10px] leading-relaxed text-slate-450 text-slate-400">
                Notice: Base model weights tend to have dispersed attention, often focusing heavily on punctuation or generic connectors.
              </p>
            </div>
          </div>

          {/* Hover helper metrics */}
          {hoveredTokenIdx !== null && hoveredModel === "base" && baseResult && (
            <div className="mt-4 p-2 bg-slate-950 border border-slate-805 border-slate-800 text-slate-205 text-slate-200 rounded text-[11px] font-mono shadow-md flex items-center justify-between">
              <span>Token: <span className="text-amber-300 font-bold">"{tokens[hoveredTokenIdx]}"</span></span>
              <span>Attention Weight: <span className="text-indigo-400 font-extrabold font-mono">{(baseResult.attentionScores[hoveredTokenIdx] || 0).toFixed(4)}</span></span>
            </div>
          )}
        </div>

        {/* Model 2: Fine-Tuned Sentiment BERT */}
        <div className="border border-indigo-905 border-indigo-900/30 rounded-xl p-5 bg-gradient-to-b from-indigo-950/20 to-slate-950/40 shadow-xl glow-accent-indigo flex flex-col justify-between hover:border-indigo-500/30 transition-colors" id="tuned-model-box">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-indigo-900/50">
              <span className="text-[11px] font-bold text-indigo-305 text-indigo-350 text-indigo-300 uppercase tracking-wider">BERT-Base-Sentiment</span>
              <span className="text-[10px] bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                {hasTrained ? "Trained & Aligned" : "Simulated tuned"}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="text-slate-400 font-medium font-sans">Predicted Sentiment:</span>
                <span className={`font-extrabold ${tunedResult?.sentiment === "positive" ? "text-teal-400" : "text-rose-400"}`}>
                  {tunedResult ? tunedResult.sentiment.toUpperCase() : "AWAITING..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium font-sans">Confidence Probability:</span>
                <span className="font-mono text-white bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded font-bold">
                  {tunedResult ? `${(tunedResult.score * 100).toFixed(1)}%` : "0%"}
                </span>
              </div>
            </div>

            {/* Token Highlight attention mapping */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Self-Attention Mapping (Layer 12, Head 1)</span>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-slate-800 bg-slate-950/60 min-h-[90px]">
                {fetching ? (
                  <div className="text-slate-400 text-xs py-4 px-2 w-full text-center">Processing weights...</div>
                ) : !tunedResult ? (
                  <div className="text-slate-400 text-xs py-4 px-2 w-full text-center">Click evaluate to load</div>
                ) : (
                  tokens.map((token, idx) => {
                    const score = tunedResult.attentionScores[idx] || 0;
                    const max = getMaxScore(tunedResult.attentionScores);
                    const isSpecial = token === "[CLS]" || token === "[SEP]";
                    
                    return (
                      <span
                        key={idx}
                        onMouseEnter={() => {
                          setHoveredTokenIdx(idx);
                          setHoveredModel("tuned");
                        }}
                        onMouseLeave={() => {
                          setHoveredTokenIdx(null);
                          setHoveredModel(null);
                        }}
                        style={{ backgroundColor: getAttentionColor(score, max, tunedResult.sentiment) }}
                        className={`text-xs font-mono px-2 py-1 rounded-md cursor-help border transition-all duration-150 ${
                          isSpecial ? "font-bold text-slate-450 text-slate-400 border-dashed border-slate-700 bg-slate-900/50" : "border-transparent text-white font-medium"
                        } ${hoveredTokenIdx === idx && hoveredModel === "tuned" ? "scale-105 shadow-md border-indigo-400/50 font-bold" : ""}`}
                      >
                        {token}
                      </span>
                    );
                  })
                )}
              </div>
              <p className="text-[10px] leading-relaxed text-slate-450 text-slate-400">
                Notice: Fine-tuned model attention shifts distinctively to emotional words (e.g. "masterpiece", "waste", "not") to perform classifications.
              </p>
            </div>
          </div>

          {/* Hover helper metrics */}
          {hoveredTokenIdx !== null && hoveredModel === "tuned" && tunedResult && (
            <div className="mt-4 p-2 bg-slate-950 border border-slate-850 border-slate-800 text-slate-205 text-slate-200 rounded text-[11px] font-mono shadow-md flex items-center justify-between">
              <span>Token: <span className="text-amber-300 font-bold">"{tokens[hoveredTokenIdx]}"</span></span>
              <span>Attention Weight: <span className="text-emerald-450 text-emerald-450 text-emerald-400 font-extrabold font-mono">{(tunedResult.attentionScores[hoveredTokenIdx] || 0).toFixed(4)}</span></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
