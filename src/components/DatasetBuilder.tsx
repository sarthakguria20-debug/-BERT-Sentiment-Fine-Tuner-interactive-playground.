import React, { useState } from "react";
import { SentimentSample } from "../types";
import { Database, Plus, Trash2, Undo, Check, HelpCircle } from "lucide-react";

interface DatasetBuilderProps {
  samples: SentimentSample[];
  onAddSample: (text: string, label: "positive" | "negative") => void;
  onDeleteSample: (id: string) => void;
  onResetPreset: (presetName: "imdb" | "twitter" | "appstore") => void;
  selectedPreset: "imdb" | "twitter" | "appstore";
}

export const IMDB_PRESET: SentimentSample[] = [
  { id: "imdb-1", text: "This cinematic masterpiece has wonderful acting and a brilliant engaging script.", label: "positive" },
  { id: "imdb-2", text: "An absolute disaster with a boring plot, flat characters, and awful execution.", label: "negative" },
  { id: "imdb-3", text: "I highly recommend this movie. The casting is perfect and the emotions feel so genuine.", label: "positive" },
  { id: "imdb-4", text: "A complete waste of time. The dialogue is terrible and the pacing is horrible.", label: "negative" },
  { id: "imdb-5", text: "The film was actually enjoyably charming and surprisingly deep beneath its simple cover.", label: "positive" },
  { id: "imdb-6", text: "I was deeply disappointed. The storyline was boring, clichéd, and plain rubbish.", label: "negative" },
];

export const TWITTER_PRESET: SentimentSample[] = [
  { id: "tw-1", text: "Amazing support! My issue was resolved instantly. Best customer support team ever!", label: "positive" },
  { id: "tw-2", text: "Worst service. They charged me twice and are refusing to issue a refund. Avoid at all costs!", label: "negative" },
  { id: "tw-3", text: "So excited that my order just arrived early, super cool quality! Highly recommend them.", label: "positive" },
  { id: "tw-4", text: "Avoid buying this app. It keeps crashing on startup and is a garbage waste of money.", label: "negative" },
  { id: "tw-5", text: "Simple, elegant, and functional. Out of all competitors, this product is outstanding.", label: "positive" },
  { id: "tw-6", text: "Terrible customer experience. Nobody replies to chats or emails. Extremely useless.", label: "negative" },
];

export const APPSTORE_PRESET: SentimentSample[] = [
  { id: "app-1", text: "This task manager saves me hours a day. The user interface is beautiful and works cleanly.", label: "positive" },
  { id: "app-2", text: "Disappointed with the recent update, features are broken and it keeps lagging constantly.", label: "negative" },
  { id: "app-3", text: "An awesome app that works perfectly on all devices. No annoying ads, perfect model.", label: "positive" },
  { id: "app-4", text: "Horrible battery drain. It eats 25% of charge in an hour. Utterly useless on mobile.", label: "negative" },
  { id: "app-5", text: "The offline mode works brilliantly. Easy file export. Kudos to the development team!", label: "positive" },
  { id: "app-6", text: "Expensive subscription model for almost zero useful premium features. Completely disappointed.", label: "negative" },
];

export default function DatasetBuilder({
  samples,
  onAddSample,
  onDeleteSample,
  onResetPreset,
  selectedPreset,
}: DatasetBuilderProps) {
  const [newText, setNewText] = useState("");
  const [newLabel, setNewLabel] = useState<"positive" | "negative">("positive");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) {
      setErrorMsg("Please enter text for the sample.");
      return;
    }
    if (newText.trim().length < 8) {
      setErrorMsg("For robust training, please provide a slightly longer sample (at least 8 characters).");
      return;
    }
    onAddSample(newText.trim(), newLabel);
    setNewText("");
    setErrorMsg("");
  };

  const getPresetLabel = (preset: typeof selectedPreset) => {
    switch (preset) {
      case "imdb": return "IMDb Movies (Long, descriptive)";
      case "twitter": return "Twitter (Short, conversational)";
      case "appstore": return "App Store (Direct feedback)";
    }
  };

  const posCount = samples.filter((s) => s.label === "positive").length;
  const negCount = samples.filter((s) => s.label === "negative").length;

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-lg p-6 flex flex-col h-full" id="dataset-builder-container">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/30 rounded-lg">
            <Database className="w-5 h-5" id="dataset-icon" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg font-display">Fine-Tuning Dataset Builder</h2>
            <p className="text-xs text-slate-400">Curate labeled text examples to guide gradient descent updates</p>
          </div>
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Preset Domain</label>
        <div className="grid grid-cols-3 gap-2">
          {(["imdb", "twitter", "appstore"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => onResetPreset(preset)}
              className={`py-2 px-3 text-xs md:text-sm font-semibold rounded-lg border transition-all ${
                selectedPreset === preset
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/10"
                  : "bg-slate-950 text-slate-350 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
              }`}
              id={`preset-${preset}-btn`}
            >
              {preset.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Training balance display */}
      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-lg border border-slate-800 mb-4 text-xs font-medium">
        <div className="flex items-center justify-between px-2 py-1 border-r border-slate-800">
          <span className="text-slate-400">Positive Labeled:</span>
          <span className="text-teal-400 font-bold text-sm">{posCount}</span>
        </div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-slate-400">Negative Labeled:</span>
          <span className="text-rose-450 text-rose-450 text-rose-400 font-bold text-sm">{negCount}</span>
        </div>
      </div>

      {/* Dataset quick logs */}
      <div className="flex-1 overflow-y-auto max-h-[300px] border border-slate-800 rounded-lg mb-4 p-2 space-y-1.5 bg-slate-950/50">
        {samples.map((s) => (
          <div
            key={s.id}
            className="flex items-start justify-between bg-slate-900 border border-slate-800/80 p-2.5 rounded-md hover:border-indigo-500/30 transition-colors text-xs"
            id={`sample-${s.id}`}
          >
            <div className="flex-1 pr-2">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1.5 ${
                s.label === "positive" 
                  ? "bg-teal-950/80 text-teal-400 border border-teal-900/50" 
                  : "bg-rose-950/80 text-rose-400 border border-rose-900/50"
              }`}>
                {s.label.toUpperCase()}
              </span>
              <span className="text-slate-200 leading-relaxed">{s.text}</span>
            </div>
            <button
              onClick={() => onDeleteSample(s.id)}
              className="text-slate-500 hover:text-rose-450 hover:text-rose-400 p-1 rounded-md hover:bg-slate-800/60 transition-colors"
              title="Delete sample"
              id={`delete-${s.id}-btn`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new sample form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 pt-4" id="add-sample-form">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Inject Custom Label</h3>
        
        {errorMsg && (
          <div className="text-[11px] text-rose-300 bg-rose-950/50 border border-rose-900/55 px-2.5 py-1.5 rounded-lg mb-2">
            {errorMsg}
          </div>
        )}

        <div className="space-y-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Type a sentiment review (e.g. 'This film was an absolute masterpiece because...')"
            rows={2}
            className="w-full text-xs p-2.5 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-550 focus:ring-indigo-500 text-slate-100 resize-none transition-all placeholder:text-slate-500"
            id="custom-sample-input"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setNewLabel("positive")}
                className={`py-1 px-3 text-[11px] font-bold rounded-md transition-all ${
                  newLabel === "positive"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-205 hover:text-white"
                }`}
                id="label-positive-picker"
              >
                Positive label
              </button>
              <button
                type="button"
                onClick={() => setNewLabel("negative")}
                className={`py-1 px-3 text-[11px] font-bold rounded-md transition-all ${
                  newLabel === "negative"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-205 hover:text-white"
                }`}
                id="label-negative-picker"
              >
                Negative label
              </button>
            </div>

            <button
              type="submit"
              className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-650 bg-indigo-655 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold shadow-md hover:shadow-lg hover:shadow-indigo-500/10 transition-all border border-indigo-500/20"
              id="add-sample-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sample
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
