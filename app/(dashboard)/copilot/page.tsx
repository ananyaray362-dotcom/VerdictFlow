'use client';
import { useState } from 'react';

const QUICK_PROMPTS = [
  "Summarize all HIGH priority overdue compliance actions",
  "What cases have contempt of court risk?",
  "Draft a weekly compliance status report",
  "Which department has the most pending actions?",
  "List all cases with financial penalties above ₹10 lakh",
];

export default function CopilotPage() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askCopilot = async (question: string) => {
    setLoading(true);
    setResponse('');
    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponse(data.answer);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          ⚡ AI Co-Pilot
          <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-1 rounded-full">
            Llama 3.3 70B
          </span>
        </h1>
        <p className="text-gray-400 mt-1">Your AI assistant for legal compliance queries across all cases.</p>
      </div>

      {/* Quick prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => { setInput(p); askCopilot(p); }}
            className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors">
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && askCopilot(input)}
          placeholder="Ask anything about your cases..."
          className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm" />
        <button onClick={() => askCopilot(input)} disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors">
          {loading ? '...' : 'Ask'}
        </button>
      </div>

      {/* Response */}
      {response && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{response}</p>
        </div>
      )}
    </div>
  );
}