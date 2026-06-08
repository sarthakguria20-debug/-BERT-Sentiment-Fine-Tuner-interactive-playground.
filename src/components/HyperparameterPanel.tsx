import React from "react";
import { Hyperparameters } from "../types";
import { Sliders, HelpCircle, Flame, Layers } from "lucide-react";

interface HyperparameterPanelProps {
  config: Hyperparameters;
  onChange: (updated: Partial<Hyperparameters>) => void;
  disabled?: boolean;
}

export default function HyperparameterPanel({ config, onChange, disabled }: HyperparameterPanelProps) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800/80 shadow-lg p-6 flex flex-col justify-between h-full" id="hyperparams-panel">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/30 rounded-lg">
              <Sliders className="w-5 h-5" id="sliders-icon" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-lg font-display">BERT Hyperparameters</h2>
              <p className="text-xs text-slate-400">Tune optimization criteria and network regularizations</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Learning Rate Slider with Explanation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-300">Learning Rate (η)</span>
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-56 p-2.5 bg-slate-950 text-slate-205 text-slate-200 text-[10px] rounded border border-slate-850 border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed font-normal">
                    BERT learning rates are typically very small (e.g. 2e-5 to 5e-5) to prevent <b>catastrophic forgetting</b> of general language features! Bigger learning rates (like 1e-2) can corrupt pre-trained mappings.
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-indigo-405 text-indigo-300 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded font-bold">
                {config.learningRate.toExponential(1)}
              </span>
            </div>
            <input
              type="range"
              min="-6"
              max="-3"
              step="0.5"
              disabled={disabled}
              value={Math.log10(config.learningRate)}
              onChange={(e) => {
                const val = Math.pow(10, parseFloat(e.target.value));
                onChange({ learningRate: val });
              }}
              className="w-full h-1.5 bg-slate-950 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
              id="lr-slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
              <span>1e-6 (Conservative)</span>
              <span>1e-3 (Aggressive)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Optimizer */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-350 text-slate-300 mb-1.5">
                Optimizer
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-52 p-2.5 bg-slate-950 text-slate-200 text-[10px] rounded border border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed font-normal">
                    <b>AdamW</b> is standard for transformer architectures. It optimizes weight decay separately from loss gradients to correct regularization mismatches.
                  </div>
                </div>
              </label>
              <select
                disabled={disabled}
                value={config.optimizer}
                onChange={(e) => onChange({ optimizer: e.target.value as any })}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-250 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                id="opt-select"
              >
                <option value="AdamW" className="bg-slate-900 text-white">AdamW</option>
                <option value="Adam" className="bg-slate-900 text-white">Adam</option>
                <option value="SGD" className="bg-slate-900 text-white">SGD (Standard)</option>
              </select>
            </div>

            {/* Batch Size */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-350 text-slate-300 mb-1.5">
                Batch Size
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-52 p-2.5 bg-slate-950 text-slate-200 text-[10px] rounded border border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed font-normal">
                    Number of training samples parsed together during one forward/backward pass. Larger batches require higher GPU memory.
                  </div>
                </div>
              </label>
              <select
                disabled={disabled}
                value={config.batchSize}
                onChange={(e) => onChange({ batchSize: parseInt(e.target.value) })}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-250 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                id="batch-select"
              >
                <option value="8" className="bg-slate-900 text-white">8</option>
                <option value="16" className="bg-slate-900 text-white">16 (Standard)</option>
                <option value="32" className="bg-slate-900 text-white">32</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Max Length */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-350 text-slate-300 mb-1.5">
                Max Length
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-52 p-2.5 bg-slate-950 text-slate-200 text-[10px] rounded border border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed font-normal">
                    Controls sequence truncation and [PAD] padding extent. Longer limits preserve contexts but increase training time exponentially (self-attention is O(N²)).
                  </div>
                </div>
              </label>
              <select
                disabled={disabled}
                value={config.maxLen}
                onChange={(e) => onChange({ maxLen: parseInt(e.target.value) })}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-250 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                id="maxlen-select"
              >
                <option value="32" className="bg-slate-900 text-white">32 Tokens</option>
                <option value="64" className="bg-slate-900 text-white">64 Tokens</option>
                <option value="128" className="bg-slate-900 text-white">128 Tokens</option>
              </select>
            </div>

            {/* Epochs count */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-350 text-slate-300 mb-1.5">
                Training Epochs
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-52 p-2.5 bg-slate-950 text-slate-200 text-[10px] rounded border border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-55 training-epochs-tipping z-50 leading-relaxed font-normal">
                    Full sweeps over entire training dataset. BERT usually requires very few epochs (3 to 5) to fit custom classification layers without overfitting.
                  </div>
                </div>
              </label>
              <select
                disabled={disabled}
                value={config.epochs}
                onChange={(e) => onChange({ epochs: parseInt(e.target.value) })}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-250 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                id="epochs-select"
              >
                <option value="3" className="bg-slate-900 text-white">3 Epochs</option>
                <option value="4" className="bg-slate-900 text-white">4 Epochs</option>
                <option value="5" className="bg-slate-900 text-white">5 Epochs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Dropout Rate */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-350 text-slate-300 mb-1.5">
                Dropout Rate
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full left-0 mb-2 w-52 p-2.5 bg-slate-950 text-slate-200 text-[10px] rounded border border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed font-normal">
                    Probability of zeroing hidden units randomly during backpropagation. Serves as key regularizer to discourage co-adaptation of features.
                  </div>
                </div>
              </label>
              <select
                disabled={disabled}
                value={config.dropoutRate}
                onChange={(e) => onChange({ dropoutRate: parseFloat(e.target.value) })}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-250 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                id="dropout-select"
              >
                <option value="0" className="bg-slate-900 text-white">0.0 (None)</option>
                <option value="0.1" className="bg-slate-900 text-white">0.1 (Recommend)</option>
                <option value="0.3" className="bg-slate-900 text-white">0.3 (High)</option>
              </select>
            </div>

            {/* Warmup ratio */}
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-350 text-slate-300 mb-1.5">
                Warmup Steps Ratio
                <div className="group relative">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-52 p-2.5 bg-slate-950 text-slate-200 text-[10px] rounded border border-slate-800 shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 leading-relaxed font-normal">
                    Gradually increases η from zero to maximum during the first steps, then decays. This reduces instability near initial epochs.
                  </div>
                </div>
              </label>
              <select
                disabled={disabled}
                value={config.warmupRatio}
                onChange={(e) => onChange({ warmupRatio: parseFloat(e.target.value) })}
                className="w-full text-xs p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-250 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                id="warmup-select"
              >
                <option value="0" className="bg-slate-900 text-white">0% (None)</option>
                <option value="0.1" className="bg-slate-900 text-white">10% (Default)</option>
                <option value="0.2" className="bg-slate-900 text-white">20%</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 p-3 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-400 text-[11px] leading-relaxed flex gap-2">
        <Flame className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-400 block mb-0.5">GPU Compute Ready</span>
          In actual training environments, fine-tuning BERT leverages Google Cloud Tensor Processing Units (TPUs) or NVIDIA GPUs to parallelize deep self-attention headers.
        </div>
      </div>
    </div>
  );
}
