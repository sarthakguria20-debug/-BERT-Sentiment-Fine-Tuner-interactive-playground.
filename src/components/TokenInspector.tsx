import React, { useState, useEffect } from "react";
import { TokenInfo } from "../types";
import { SearchCode, HelpCircle, ArrowRight, Table, Fingerprint } from "lucide-react";

export default function TokenInspector() {
  const [inputText, setInputText] = useState("We thoroughly enjoyed this incredible cinematic masterpiece!");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleTokenize = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to contact tokenizer API.");
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch (err: any) {
      setErrorMsg(err.message || "An issue occurred during tokenization.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      handleTokenize(inputText);
    }, 450);
    return () => clearTimeout(handler);
  }, [inputText]);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6" id="tokenizer-inspector">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/80 text-indigo-400 border border-indigo-800/30 rounded-lg">
            <SearchCode className="w-5 h-5" id="tokenizer-search-icon" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg font-display">BERT WordPiece Tokenizer</h2>
            <p className="text-xs text-slate-400">Inspect sentence splitting into discrete embeddings with token markers</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Token Input field */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 font-sans">Test Vocabulary Dissection</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder="Type a word or phrase..."
            className="w-full text-xs md:text-sm p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950 text-slate-100 font-semibold transition-all"
            id="tokenize-input-text"
          />
        </div>

        {errorMsg && (
          <div className="text-xs p-2 text-rose-350 bg-rose-950/50 border border-rose-900/50 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Visual Token list */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 font-sans">Tokenized Result Sequence</label>
          
          <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-slate-950 rounded-lg border border-slate-800/85">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5 px-2">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-500"></div>
                Analyzing subwords...
              </div>
            ) : tokens.length === 0 ? (
              <span className="text-xs text-slate-450 p-1">No tokens generated</span>
            ) : (
              tokens.map((token, idx) => {
                const isSpecial = token.token === "[CLS]" || token.token === "[SEP]";
                const isSubword = token.token.startsWith("##");
                
                return (
                  <div
                    key={`${token.token}-${idx}`}
                    className={`flex flex-col items-center p-2 rounded-lg border text-center font-mono ${
                      isSpecial
                        ? "bg-amber-950/55 border-amber-900/70 text-amber-300"
                        : isSubword
                        ? "bg-cyan-955 bg-cyan-950/50 border-cyan-900/60 text-cyan-300"
                        : "bg-slate-900 border-slate-800 text-slate-200 shadow-sm"
                    }`}
                    id={`token-box-${idx}`}
                  >
                    <span className="text-xs font-bold px-1 max-w-[100px] truncate">{token.token}</span>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1">ID: {token.id}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dense Grid Explanations */}
        {tokens.length > 0 && !loading && (
          <div className="overflow-x-auto border border-slate-800 rounded-lg" id="token-table-wrapper">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-2.5 font-bold text-slate-450 text-slate-400 font-sans">Rank</th>
                  <th className="p-2.5 font-bold text-slate-450 text-slate-400 font-sans">Subword Token</th>
                  <th className="p-2.5 font-bold text-slate-450 text-slate-400 font-sans">Vocabulary Index (ID)</th>
                  <th className="p-2.5 font-bold text-slate-450 text-slate-400 font-sans">Type ID (Segment)</th>
                  <th className="p-2.5 font-bold text-slate-450 text-slate-400 font-sans">Attention Mask ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px] font-mono">
                {tokens.map((token, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/20">
                    <td className="p-2 text-slate-500">{idx}</td>
                    <td className="p-2 font-semibold">
                      <span className={token.token.startsWith("##") ? "text-indigo-400 font-semibold" : "text-slate-205"}>
                        {token.token}
                      </span>
                    </td>
                    <td className="p-2 text-indigo-400 font-bold">{token.id}</td>
                    <td className="p-2 text-slate-450 text-slate-400">{token.typeId}</td>
                    <td className="p-2 text-emerald-400 font-bold">{token.mask}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Interactive Pedagogy info */}
        <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed text-slate-350 pt-1">
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 animate-fade">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              Why do we have [CLS] and [SEP]?
            </span>
            <b>[CLS]</b> (Classification) is prepended to capture aggregated bidirectional vector attention. Its hidden state represents the unified sentiment classification embedding. <b>[SEP]</b> (Separator) signals sequence termination.
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 animate-fade">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              The WordPiece mechanism
            </span>
            BERT bypasses out-of-vocabulary blocks using subwords labeled with <b>##</b>. For example, <i>"incredible"</i> can be segmented into root and suffixes, allowing robust representation of raw words.
          </div>
        </div>
      </div>
    </div>
  );
}
