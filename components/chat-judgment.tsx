'use client';
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message { role: 'user' | 'assistant'; content: string; }

export function ChatJudgment({ judgmentText, caseTitle }: { judgmentText: string; caseTitle: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `I've analyzed **${caseTitle}**. Ask me anything about this judgment — penalties, deadlines, directives, or parties involved.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What is the exact penalty amount?",
    "Who are the presiding judges?",
    "What is the compliance deadline?",
    "What statutes were invoked?",
  ];

  const sendMessage = async (question: string) => {
    if (!question.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat-judgment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          judgmentText,
          chatHistory: messages.slice(-6),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error processing your question. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl border border-gray-700">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <Bot className="text-blue-400" size={20} />
        <span className="font-semibold text-white">Chat with Judgment</span>
        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Llama 3.3</span>
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div className="p-3 flex flex-wrap gap-2">
          {suggestedQuestions.map(q => (
            <button key={q} onClick={() => sendMessage(q)}
              className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/20 transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <Bot size={16} className="text-blue-400 mt-1 shrink-0" />}
            <div className={`max-w-[80%] rounded-xl p-3 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-200'
            }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && <User size={16} className="text-gray-400 mt-1 shrink-0" />}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <Bot size={16} className="text-blue-400 mt-1" />
            <div className="bg-gray-800 rounded-xl p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask anything about this judgment..."
          className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
        />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
