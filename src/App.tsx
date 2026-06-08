import React, { useState } from "react";
import DatasetBuilder, { IMDB_PRESET, TWITTER_PRESET, APPSTORE_PRESET } from "./components/DatasetBuilder";
import HyperparameterPanel from "./components/HyperparameterPanel";
import TokenInspector from "./components/TokenInspector";
import TrainingTerminal from "./components/TrainingTerminal";
import InferencePlayground from "./components/InferencePlayground";
import CodeExporter from "./components/CodeExporter";
import AdvisorChat from "./components/AdvisorChat";
import { SentimentSample, Hyperparameters, EpochMetric } from "./types";
import {
  Sparkles,
  BookOpen,
  LayoutDashboard,
  Zap,
  Code2,
  FileCode,
  GraduationCap,
  MessageSquareCode,
  CheckCircle2,
  GitMerge,
  Eye,
  Settings
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "arena" | "coder">("dashboard");
  const [selectedPreset, setSelectedPreset] = useState<"imdb" | "twitter" | "appstore">("imdb");
  const [samples, setSamples] = useState<SentimentSample[]>(IMDB_PRESET);
  const [hasTrained, setHasTrained] = useState(false);
  const [trainingMetrics, setTrainingMetrics] = useState<EpochMetric[]>([]);

  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>({
    learningRate: 3e-5,
    batchSize: 16,
    epochs: 3,
    dropoutRate: 0.1,
    optimizer: "AdamW",
    maxLen: 64,
    warmupRatio: 0.1,
  });

  const handleAddCustomSample = (text: string, label: "positive" | "negative") => {
    const newSample: SentimentSample = {
      id: `custom-${Date.now()}`,
      text,
      label,
      isCustom: true,
    };
    setSamples((prev) => [newSample, ...prev]);
  };

  const handleDeleteSample = (id: string) => {
    setSamples((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetPreset = (preset: "imdb" | "twitter" | "appstore") => {
    setSelectedPreset(preset);
    let targetDataset = IMDB_PRESET;
    if (preset === "twitter") targetDataset = TWITTER_PRESET;
    if (preset === "appstore") targetDataset = APPSTORE_PRESET;
    setSamples(targetDataset);
  };

  const handleTrainSuccess = (metrics: EpochMetric[]) => {
    setTrainingMetrics(metrics);
    setHasTrained(true);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white" id="main-app-container">
      {/* Top Header Banner */}
      <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 py-4 px-6 md:px-12 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/15">
              <Sparkles className="w-6 h-6 animate-pulse" id="sparkles-app-header-icon" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-indigo-950/85 text-indigo-300 border border-indigo-800/60 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  BERT Core Playground
                </span>
                {hasTrained && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    Fine-tuned Saved
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white mt-0.5" id="app-main-title">
                BERT Sentiment Fine-Tuner
              </h1>
            </div>
          </div>

          {/* Navigation Control Tabs */}
          <nav className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 shadow-sm" id="main-navigation">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 py-2 px-4 text-xs md:text-sm font-semibold rounded-lg transition-all border ${
                activeTab === "dashboard"
                  ? "bg-slate-800 text-white border-slate-700/60 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-100 border-transparent hover:bg-slate-800/40"
              }`}
              id="nav-dashboard-tab"
            >
              <LayoutDashboard className="w-4 h-4" />
              Configure & Train
            </button>
            <button
              onClick={() => setActiveTab("arena")}
              className={`flex items-center gap-2 py-2 px-4 text-xs md:text-sm font-semibold rounded-lg transition-all border ${
                activeTab === "arena"
                  ? "bg-slate-805 bg-indigo-600/10 text-indigo-300 border-indigo-500/20 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-100 border-transparent hover:bg-slate-800/40"
              }`}
              id="nav-arena-tab"
            >
              <Zap className="w-4 h-4 text-orange-400" />
              Inference Arena
            </button>
            <button
              onClick={() => setActiveTab("coder")}
              className={`flex items-center gap-2 py-2 px-4 text-xs md:text-sm font-semibold rounded-lg transition-all border ${
                activeTab === "coder"
                  ? "bg-slate-805 bg-indigo-600/10 text-indigo-300 border-indigo-500/20 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-100 border-transparent hover:bg-slate-800/40"
              }`}
              id="nav-coder-tab"
            >
              <Code2 className="w-4 h-4 text-indigo-400" />
              Python Code & Chat
            </button>
          </nav>
        </div>
      </header>

      {/* Primary educational hero intro */}
      <div className="bg-slate-900/40 backdrop-blur-sm text-white py-5 px-6 md:px-12 border-b border-slate-800/80 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-mono text-indigo-450 text-indigo-400 font-semibold flex items-center gap-2 uppercase tracking-widest">
              <GraduationCap className="w-3.5 h-3.5" /> Bidirectional Encoder Representations from Transformers
            </p>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed mt-2.5">
              BERT is an NLP milestone. By stack-processing text sequence-tokens left-to-right and right-to-left simultaneously, its multi-head attention blocks capture deep, bidirectionally aware semantic contextual vectors. Fine-Tuning uncouples BERT’s general pre-trained weights to fit specialized sentiment classifications on small datasets with minimal computer layers.
            </p>
          </div>
          
          {/* Quick learning card */}
          <div className="hidden lg:block bg-slate-905 bg-slate-900 border border-slate-800 p-3 rounded-lg text-[11px] leading-relaxed max-w-xs shrink-0 shadow-lg">
            <span className="font-bold text-indigo-300 flex items-center gap-1 mb-1 font-mono uppercase tracking-widest text-[9px]">
              <GitMerge className="w-3.5 h-3.5 text-indigo-500" /> Forward Pass Summary
            </span>
            WordPiece Embeddings ➔ Word Segment ID ➔ Position Shufflers ➔ Layer 12 Self-Attention Heads ➔ Feed-Forward Classifier ➔ Softmax Sentiment logit bounds!
          </div>
        </div>
      </div>

      {/* Main active workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6" id="workspace-wrapper">
        
        {/* TAB 1: Dashboard, Dataset Construction and Training loop */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Top Config Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Dataset Custom list builder */}
              <div className="lg:col-span-4">
                <DatasetBuilder
                  samples={samples}
                  selectedPreset={selectedPreset}
                  onAddSample={handleAddCustomSample}
                  onDeleteSample={handleDeleteSample}
                  onResetPreset={handleResetPreset}
                />
              </div>

              {/* BERT Hyperparameter selection */}
              <div className="lg:col-span-4">
                <HyperparameterPanel
                  config={hyperparameters}
                  onChange={(updated) => setHyperparameters((prev) => ({ ...prev, ...updated }))}
                />
              </div>

              {/* Tokenization Inspector */}
              <div className="lg:col-span-4">
                <TokenInspector />
              </div>
            </div>

            {/* Backprop Sim Core */}
            <TrainingTerminal
              hyperparameters={hyperparameters}
              dataset={samples}
              selectedPresetName={selectedPreset}
              onTrainSuccess={handleTrainSuccess}
            />
          </div>
        )}

        {/* TAB 2: Side-by-side Comparative Prediction and self-attention heat mapping */}
        {activeTab === "arena" && (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-950/35 border border-indigo-900/60 rounded-xl leading-normal text-xs md:text-sm text-indigo-200 flex gap-3 glow-accent-indigo">
              <Eye className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-white block mb-1">How does attention work inside BERT Sentiment?</span>
                Notice how the Pre-trained model distributes its weights flatly or stays fixated on syntax tokens like <b>[CLS]</b>, <b>[SEP]</b>, and basic operators. Once fine-tuned on sentiment, BERT’s self-attention head adjusts backpropagation parameters so that the 12th layer focuses attention values onto emotional adjectives and negations (e.g. <i>"not"</i>, <i>"incredible"</i>, <i>"disappointed"</i>).
              </div>
            </div>

            <InferencePlayground hasTrained={hasTrained} />
          </div>
        )}

        {/* TAB 3: Code script exporter and conversational advice chatbot */}
        {activeTab === "coder" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Exporter */}
            <div className="lg:col-span-12 xl:col-span-7">
              <CodeExporter hyperparameters={hyperparameters} dataset={samples} />
            </div>

            {/* Chatbot Advisor */}
            <div className="lg:col-span-12 xl:col-span-5">
              <AdvisorChat />
            </div>
          </div>
        )}

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 mt-12 py-5 px-6 text-center text-xs text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <span>© 2026 AI Studio - Powered by Google DeepMind (Gemini 2.5 Flash)</span>
        <span className="flex items-center gap-2">
          <span>BERT Sentiment Classification fine-tuning and token visualization platform</span>
        </span>
      </footer>
    </div>
  );
}
