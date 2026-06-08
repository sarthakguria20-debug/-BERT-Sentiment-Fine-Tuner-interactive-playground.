import React, { useState, useEffect } from "react";
import { Hyperparameters, SentimentSample } from "../types";
import { Copy, FileCode, Check, RefreshCw, Terminal, ExternalLink } from "lucide-react";

interface CodeExporterProps {
  hyperparameters: Hyperparameters;
  dataset: SentimentSample[];
}

export default function CodeExporter({ hyperparameters, dataset }: CodeExporterProps) {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateScript = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/generate-hf-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hyperparameters, dataset }),
      });
      if (!res.ok) throw new Error("Could not fetch the compilation script.");
      const data = await res.json();
      setScript(data.script || "");
    } catch (err: any) {
      setErrorMsg(err.message || "An issue occurred. Try regenerating.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerateScript();
  }, [hyperparameters, dataset]);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 font-sans" id="code-exporter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/30 text-indigo-400 rounded-lg">
            <FileCode className="w-5 h-5" id="code-file-icon" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg font-display">PyTorch / Hugging Face Exporter</h2>
            <p className="text-xs text-slate-400">Compile your exact hyperparameters and dataset into an executable ML Python script</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerateScript}
            disabled={loading}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800 transition-all cursor-pointer"
            title="Refresh code script"
            id="regenerate-script-btn"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleCopy}
            disabled={!script}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer border border-indigo-500/20 transition-colors"
            id="copy-script-btn"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-450 text-emerald-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Script
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs p-3 text-rose-300 bg-rose-950/50 border border-rose-900/60 rounded-lg mb-4">
          {errorMsg}
        </div>
      )}

      <div className="space-y-4">
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span>Ready to compile in Google Colab (TPU/GPU runtimes)</span>
          </div>
          <a
            href="https://colab.research.google.com"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1.5 cursor-pointer"
          >
            Open Colab <ExternalLink className="w-3" />
          </a>
        </div>

        {/* Console view */}
        <div className="relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center bg-slate-950 border border-slate-800 text-slate-500 font-mono text-xs rounded-xl p-12 h-[350px]">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
              <span>Compiling Python script block with Gemini...</span>
            </div>
          ) : (
            <pre className="bg-black/90 text-indigo-200 font-mono text-[10px] md:text-xs rounded-xl p-4 overflow-auto h-[350px] border border-slate-800 shadow-inner leading-relaxed scrollbar-thin">
              <code>{script || "# No script compiled. Adjust parameters."}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
