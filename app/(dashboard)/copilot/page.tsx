'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Sparkles, Scale, BookOpen, Clock, AlertTriangle, FileText, ChevronRight, MessageSquare } from 'lucide-react';

const QUICK_PROMPTS = [
  "Summarize all HIGH priority overdue compliance actions",
  "What cases have contempt of court risk?",
  "Draft a weekly compliance status report",
  "Which department has the most pending actions?",
  "List all cases with financial penalties above ₹10 lakh",
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function CopilotPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Hello! I am your AI Co-Pilot. I can help you analyze legal compliance, draft reports, and monitor risks across all your cases. How can I assist you today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const askCopilot = async (question: string) => {
    if (!question.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Failed to fetch response:", error);
      const errorMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I encountered an error while processing your request. Please try again.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0A0D14]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-w-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-[#0A0D14]/90 backdrop-blur flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                AI Co-Pilot
                <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-full font-medium">
                  Llama 3.3 70B
                </span>
              </h1>
              <p className="text-xs text-gray-400">Legal Intelligence Assistant</p>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-blue-500/10 border border-blue-500/20'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-blue-400" />}
                </div>
                
                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md' 
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm shadow-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%]"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mt-1">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-md">
                <div className="flex space-x-1.5 items-center">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 bg-blue-500 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }} className="w-2 h-2 bg-blue-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }} className="w-2 h-2 bg-blue-300 rounded-full" />
                </div>
                <span className="text-xs text-gray-400 font-medium">Analyzing cases...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0A0D14]/90 backdrop-blur-md border-t border-white/5 relative z-10">
          <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-black/40 p-2 rounded-2xl border border-white/10 focus-within:border-blue-500/50 focus-within:bg-black/60 transition-all shadow-inner">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  askCopilot(input);
                }
              }}
              placeholder="Ask anything about cases, compliance, or insights..."
              className="flex-1 bg-transparent text-white px-3 py-3 max-h-32 min-h-[44px] resize-none focus:outline-none text-sm scrollbar-thin placeholder:text-gray-500"
              rows={1}
            />
            <button 
              onClick={() => askCopilot(input)} 
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl p-3 flex-shrink-0 transition-all duration-200 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-500 mt-3 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Co-Pilot uses Llama 3.3. Verify important legal information.
          </p>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto hidden lg:flex scrollbar-none pb-4">
        
        {/* Suggested Actions */}
        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-yellow-500/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            <h3 className="text-sm font-semibold text-white">Suggested Prompts</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {QUICK_PROMPTS.slice(0, 4).map((p, idx) => (
              <button 
                key={idx} 
                onClick={() => { setInput(p); askCopilot(p); }}
                className="text-left text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 hover:border-white/10 px-4 py-3 rounded-xl transition-all flex items-center justify-between group"
              >
                <span className="line-clamp-2 pr-2 leading-relaxed">{p}</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Current Context (Mocked) */}
        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-5 shadow-xl backdrop-blur-md flex-1">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
              <Scale className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Active Context</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2.5">Scope</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-200 font-medium">All Cases & Depts</span>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium bg-blue-400/10 px-2 py-1 rounded-md">Edit</button>
              </div>
            </div>

            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-3">Data Sources Engaged</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="p-1.5 bg-indigo-500/10 rounded-md">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <span className="flex-1">Judgments Database</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="p-1.5 bg-orange-500/10 rounded-md">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="flex-1">Compliance Tracker</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="p-1.5 bg-teal-500/10 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <span className="flex-1">Real-time Audits</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}