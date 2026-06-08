import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, Send, Sparkles, MessageSquare, Terminal } from "lucide-react";

interface HelpMessage {
  role: "user" | "advisor";
  content: string;
}

const EXPERT_PROMPTS = [
  "Why do we pre-train BERT bidirectionally instead of autoregressively (like GPT)?",
  "How does learning rate warm-up stabilize initial training?",
  "What math is behind the BERT Attention multi-head calculations?",
  "Explain standard CrossEntropyLoss for binary sentiment tracking.",
];

export default function AdvisorChat() {
  const [history, setHistory] = useState<HelpMessage[]>([
    {
      role: "advisor",
      content:
        "Greetings! I am your interactive BERT Machine Learning Advisor. Ask me anything about pre-training objectives, self-attention equations, learning rates, or backpropagation adjustments!",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [fetching, setFetching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim() || fetching) return;
    
    setInputMsg("");
    const userMsg: HelpMessage = { role: "user", content: msg };
    setHistory((prev) => [...prev, userMsg]);
    setFetching(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          chatHistory: [...history, userMsg],
        }),
      });

      if (!res.ok) throw new Error("Our ML Advisor backend went offline. Try rewriting.");
      const data = await res.json();

      setHistory((prev) => [...prev, { role: "advisor", content: data.text }]);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        { role: "advisor", content: `Apologies, but I struggled to analyze that query. Reason: ${err.message}` },
      ]);
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg p-6 flex flex-col h-full font-sans" id="advisor-assistant">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-950/80 border border-indigo-800/30 text-indigo-400 rounded-lg">
            <MessageSquare className="w-5 h-5" id="chat-icon-indicator" />
          </div>
          <div>
            <h2 className="font-semibold text-white text-lg font-display">BERT Advisor Chat</h2>
            <p className="text-xs text-slate-400">Ask conceptual inquiries about neural mappings and Transformer math</p>
          </div>
        </div>
      </div>

      {/* Preset bubbles */}
      <div className="mb-3">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Suggested ML Questions</span>
        <div className="flex flex-wrap gap-1.5">
          {EXPERT_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="py-1.5 px-3 text-left text-[10px] bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium leading-normal max-w-full truncate cursor-pointer"
              id={`preset-chat-${idx}`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto max-h-[300px] border border-slate-800 rounded-xl mb-4 p-4 space-y-3 bg-slate-950/40">
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-indigo-600 text-white self-end ml-auto border border-indigo-500/20 shadow-md"
                : "bg-slate-950 border border-slate-800 text-slate-100 self-start"
            }`}
            id={`chat-bubble-${idx}`}
          >
            <span className={`font-bold uppercase tracking-wider mb-1 text-[9px] ${
              msg.role === "user" ? "text-indigo-200" : "text-slate-400"
            }`}>
              {msg.role === "user" ? "YOU" : "BERT ADVISOR"}
            </span>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        {fetching && (
          <div className="text-slate-400 text-xs flex items-center gap-1.5 self-start p-2.5 bg-slate-950 border border-slate-800 rounded-2xl">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>Analyzing calculations...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Submit Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputMsg.trim()) handleSendMessage(inputMsg);
        }}
        className="flex gap-2"
        id="advisor-chat-form"
      >
        <input
          type="text"
          value={inputMsg}
          disabled={fetching}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask about fine-tuning, optimizer choice, or gradient steps..."
          className="flex-1 text-xs p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-150"
          id="advisor-input-text"
        />
        <button
          type="submit"
          disabled={fetching || !inputMsg.trim()}
          className="p-3 bg-indigo-600 text-white border border-indigo-500/10 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all flex items-center justify-center shrink-0 cursor-pointer"
          id="advisor-send-btn"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
