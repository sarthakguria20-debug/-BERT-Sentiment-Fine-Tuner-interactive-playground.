import React, { useState, useEffect, useRef } from "react";
import { EpochMetric, SentimentSample, Hyperparameters, TrainingSimulationResult } from "../types";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from "recharts";
import { Brain, Cpu, RefreshCw, Layers, Play, PlayCircle, Loader2, Terminal, FileText, CheckCircle2, TrendingUp } from "lucide-react";

interface TrainingTerminalProps {
  hyperparameters: Hyperparameters;
  dataset: SentimentSample[];
  onTrainSuccess: (metrics: EpochMetric[]) => void;
  selectedPresetName: string;
}

export default function TrainingTerminal({
  hyperparameters,
  dataset,
  onTrainSuccess,
  selectedPresetName,
}: TrainingTerminalProps) {
  const [training, setTraining] = useState(false);
  const [currentStep, setCurrentStep] = useState<"idle" | "weight_init" | "running_epochs" | "completed">("idle");
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeEpoch, setActiveEpoch] = useState(0);
  const [metrics, setMetrics] = useState<EpochMetric[]>([]);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [analysisReport, setAnalysisReport] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const allLogsRef = useRef<string[]>([]);

  // Safe console auto-scroll
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [visibleLogs]);

  const handleStartTraining = async () => {
    if (dataset.length < 4) {
      setErrorMsg("Please ensure your dataset contains at least 4 items before initiating backpropagation tuning.");
      return;
    }
    
    setTraining(true);
    setErrorMsg("");
    setCurrentStep("weight_init");
    setMetrics([]);
    setVisibleLogs([]);
    setAnalysisReport("");
    setProgressPercent(5);

    // Initial output logs mimicking PyTorch initialization checks
    const initialLogs = [
      `[INFO] Starting BERT-base-uncased Sequence Classification Setup`,
      `[INFO] Target Device: CUDA (NVIDIA Tesla Tensor Core GPU)`,
      `[INFO] Vocabulary mapping size: 30,522 tokens`,
      `[INFO] Input Dataset Loaded: Domain Preset [${selectedPresetName.toUpperCase()}] containing ${dataset.length} samples.`,
      `[INFO] Batch Size configured: ${hyperparameters.batchSize} | Sequence Padding truncation length: ${hyperparameters.maxLen}`,
      `[INFO] Initializing linear layers on top of BERT Attention Layer 12...`,
      `[INFO] Dropout regularizer: ${hyperparameters.dropoutRate} | Warmup Scheduler steps configured with ratio: ${hyperparameters.warmupRatio}`,
      `[INFO] Total Trainable Parameters in Class Head: 1,538 weights`,
      `[OK] Weight tensor bounds initialized using Xavier Uniform criteria. Preparing gradients...`,
      `============================== FINE-TUNING CYCLE START ==============================`
    ];

    allLogsRef.current = [];
    
    // Animate initial logs step-by-step
    for (let i = 0; i < initialLogs.length; i++) {
      allLogsRef.current.push(initialLogs[i]);
      setVisibleLogs([...allLogsRef.current]);
      setProgressPercent((prev) => Math.min(prev + 2, 20));
      await new Promise((r) => setTimeout(r, 120));
    }

    try {
      setCurrentStep("running_epochs");
      
      const res = await fetch("/api/simulate-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, hyperparameters }),
      });

      if (!res.ok) throw new Error("Backend simulator failed to execute backpropagation.");
      
      const result: TrainingSimulationResult = await res.json();
      
      setAnalysisReport(result.reportMarkdown);
      const simulatedSteps = result.logs || [];
      const generatedMetrics = result.metrics || [];

      // Stream the training epoch logs to mimic PyTorch training output
      for (let i = 0; i < simulatedSteps.length; i++) {
        allLogsRef.current.push(simulatedSteps[i]);
        setVisibleLogs([...allLogsRef.current]);
        
        // Match the model epochs count dynamically
        const epochMatch = simulatedSteps[i].match(/Epoch\s+(\d+)\/\d+/i);
        if (epochMatch) {
          const ep = parseInt(epochMatch[1]);
          setActiveEpoch(ep);
          // Append metrics sequentially
          const matchingMetric = generatedMetrics.find((m) => m.epoch === ep);
          if (matchingMetric) {
            setMetrics((prev) => {
              const updated = [...prev, matchingMetric];
              onTrainSuccess(updated);
              return updated;
            });
          }
        }

        setProgressPercent((prev) => Math.min(prev + Math.floor(70 / simulatedSteps.length), 95));
        await new Promise((r) => setTimeout(r, 450));
      }

      // Conclude Training cycles
      allLogsRef.current.push(`=====================================================================`);
      allLogsRef.current.push(`[FINISH] Backpropagation tuning completed. Successfully saved model checkpoint!`);
      allLogsRef.current.push(`[EXPORT] Saved PyTorch Weights to ./results/bert_sentiment_classifier/pytorch_model.bin`);
      allLogsRef.current.push(`[OK] Model evaluation results fully synchronized supporting fine-tuned inference arena.`);
      
      setVisibleLogs([...allLogsRef.current]);
      setProgressPercent(100);
      setCurrentStep("completed");
      
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during gradient calculation. Try tuning parameters.");
      setCurrentStep("idle");
    } finally {
      setTraining(false);
    }
  };

  // Convert simple markdown string to clean JSX
  const renderSimpleMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (line.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-1.5 font-display">{line.replace("###", "").trim()}</h4>;
      }
      if (line.startsWith("##")) {
        return <h3 key={idx} className="text-base font-bold text-indigo-350 text-indigo-300 mt-5 mb-2 border-b border-slate-800 pb-1 font-display">{line.replace("##", "").trim()}</h3>;
      }
      if (line.startsWith("-") || line.startsWith("*")) {
        const item = line.substring(1).trim();
        return (
          <ul key={idx} className="list-disc pl-5 mt-1 text-xs text-slate-300">
            <li>{item}</li>
          </ul>
        );
      }
      // Simple bold replacements inside lines
      const parts = line.split("**");
      if (parts.length > 2) {
        return (
          <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-semibold text-white">{p}</strong> : p)}
          </p>
        );
      }
      return <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2">{line}</p>;
    });
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6" id="training-terminal">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/30 rounded-lg">
            <Brain className="w-5 h-5" id="brain-gradient-icon" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg font-display">BERT Backpropagation Simulator</h2>
            <p className="text-xs text-slate-400">Kickstart gradient updates to optimize BERT layers for sentiment</p>
          </div>
        </div>

        <button
          onClick={handleStartTraining}
          disabled={training || dataset.length < 4}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs md:text-sm font-semibold shadow-sm transition-all border ${
            training
              ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
              : dataset.length < 4
              ? "bg-slate-800 text-slate-550 text-slate-505 border-slate-800 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer border-indigo-500 hover:shadow-indigo-500/10 hover:shadow-sm"
          }`}
          id="initiate-fit-btn"
        >
          {training ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Fine-Tuning Active
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Initiate Fine-Tuning
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="text-xs text-rose-300 bg-rose-950/50 border border-rose-900/60 p-3 rounded-lg mb-4" id="train-error">
          {errorMsg}
        </div>
      )}

      {/* Progress Bars */}
      {training && (
        <div className="mb-6 p-4 bg-slate-950/80 border border-slate-800 rounded-lg">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-455 text-indigo-400 animate-spin" />
              {currentStep === "weight_init" ? "Initializing Layer Shuffling..." : `Tuning Epoch ${activeEpoch}/${hyperparameters.epochs}...`}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-550 bg-indigo-500 h-2 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Term logs */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            PyTorch Console logs
          </div>
          <div className="bg-black/95 border border-slate-800 rounded-xl p-4 font-mono text-[10px] md:text-xs text-emerald-400 h-[280px] overflow-y-auto flex flex-col justify-start shadow-inner">
            {visibleLogs.length === 0 ? (
              <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-2 font-sans py-12">
                <Terminal className="w-8 h-8 text-slate-700 mb-1" />
                <span className="font-semibold text-slate-400 text-xs">Awaiting Execution</span>
                <span className="text-[11px] max-w-xs text-center text-slate-500">
                  Click 'Initiate Fine-Tuning' above to inspect live BERT backpropagation steps and loss reduction logs.
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                {visibleLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed whitespace-pre-wrap">
                    {log}
                  </div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Real-time Loss visual Chart using Recharts */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Loss & Val Accuracy Progress
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[280px] flex items-center justify-center">
            {metrics.length === 0 ? (
              <div className="text-slate-500 text-xs text-center flex flex-col items-center gap-1.5 p-6">
                <TrendingUp className="w-8 h-8 text-slate-700 mb-1" />
                <span>No training epochs executed yet</span>
                <span className="text-[10px] text-slate-500">Lines for Train Loss, Val Loss, and Val Accuracy update dynamically</span>
              </div>
            ) : (
              <div className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="epoch"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: "Epochs", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94a3b8" }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, "auto"]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                      label={{ value: "Acc %", angle: 90, position: "insideRight", offset: -5, fontSize: 10, fill: "#94a3b8" }}
                    />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8, backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: 9, paddingTop: 10 }} />
                    <Line yAxisId="left" type="monotone" dataKey="trainLoss" stroke="#6366f1" strokeWidth={2} name="Train Loss" dot={{ r: 3 }} />
                    <Line yAxisId="left" type="monotone" dataKey="valLoss" stroke="#f43f5e" strokeWidth={2} name="Val Loss" dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="valAccuracy" stroke="#14b8a6" strokeWidth={2} name="Val Accuracy %" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis report written beautifully by Gemini API */}
      {currentStep === "completed" && analysisReport && (
        <div className="mt-6 p-5 border border-slate-800 rounded-xl bg-slate-950/40 shadow-inner glow-accent-emerald" id="analysis-report-wrapper">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-850 border-slate-800">
            <div className="p-1.5 bg-emerald-950/85 border border-emerald-800/40 text-emerald-450 text-emerald-400 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm font-display">Fine-Tuning Convergence Analysis</h3>
          </div>
          <div className="prose prose-sm max-w-none text-slate-300">
            {renderSimpleMarkdown(analysisReport)}
          </div>
        </div>
      )}
    </div>
  );
}
