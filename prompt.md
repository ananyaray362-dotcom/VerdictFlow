# VerdictFlow — Hackathon Feature Upgrade Prompt

Paste this into Cursor/Windsurf. Implement all features below into the existing Next.js 14 + Supabase + Tailwind project.

---

## PROJECT CONTEXT

- Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- Supabase (Postgres + Auth + Storage)
-  llama 3.3 70B for PDF analysis
- Llama 3.3 via Groq API (free tier) for fast chat/co-pilot features
- Dark-themed government dashboard UI already exists
- 6 existing tabs: Dashboard, Upload Judgment, Cases Directory, Pending Review, Analytics, Settings

---

## FEATURE 1 — "Chat with Judgment" (RAG Chatbot) 💬

Add a chat sidebar on the case detail page at `/cases/[id]`. After a PDF is analyzed, officers can ask natural language questions about it.

### Add to `app/api/chat-judgment/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { question, judgmentText, chatHistory } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const systemPrompt = `You are VerdictFlow Legal Assistant, an expert in Indian court judgments.
You have been given the full text of a court judgment. Answer the officer's question using ONLY information from this judgment.
Always cite the relevant section or paragraph when answering.
If the answer is not in the judgment, say "This information is not mentioned in the judgment."

JUDGMENT TEXT:
${judgmentText?.slice(0, 12000)}`;

  const messages = [
    ...chatHistory.map((m: any) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question }
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 800,
    temperature: 0.1,
  });

  return NextResponse.json({
    answer: response.choices[0].message.content
  });
}
```


### Add Chat UI component at `components/chat-judgment.tsx`:

```tsx
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
```

Add `<ChatJudgment judgmentText={caseData.raw_text} caseTitle={caseData.title} />` to your case detail page.

---

## FEATURE 2 — AI Risk Score + Financial Impact Card 💰

### Update `app/api/analyze/route.ts` — extend the Llama 3.3 70B prompt to also extract:

Add these fields to the existing JSON prompt:

```
"riskScore": <number 1-10, where 10 is highest risk>,
"riskReasoning": "One sentence explaining the risk score",
"financialImpact": {
  "totalLiability": <number in INR or null>,
  "penalties": <number in INR or null>,
  "compensation": <number in INR or null>,
  "currency": "INR"
},
"urgencyLevel": "CRITICAL or HIGH or MEDIUM or LOW",
"contemptRisk": <true or false - is there contempt of court risk if not complied>
```

### Add Risk Score Card component `components/risk-score-card.tsx`:

```tsx
'use client';
import { AlertTriangle, TrendingUp, IndianRupee } from 'lucide-react';

interface FinancialImpact {
  totalLiability: number | null;
  penalties: number | null;
  compensation: number | null;
}

export function RiskScoreCard({
  riskScore, riskReasoning, financialImpact, urgencyLevel, contemptRisk
}: {
  riskScore: number;
  riskReasoning: string;
  financialImpact: FinancialImpact;
  urgencyLevel: string;
  contemptRisk: boolean;
}) {
  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (score >= 5) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    return 'text-green-400 border-green-500/30 bg-green-500/10';
  };

  const formatCrore = (amount: number | null) => {
    if (!amount) return 'Not specified';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Risk Score */}
      <div className={`rounded-xl border p-5 ${getRiskColor(riskScore)}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span className="font-semibold">Risk Score</span>
          </div>
          <span className="text-3xl font-bold">{riskScore}<span className="text-lg">/10</span></span>
        </div>
        <p className="text-sm opacity-80">{riskReasoning}</p>
        {contemptRisk && (
          <div className="mt-3 text-xs bg-red-500/20 text-red-300 px-3 py-1.5 rounded-lg border border-red-500/30">
            ⚠️ Contempt of Court risk if non-compliant
          </div>
        )}
        <div className="mt-3">
          <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(riskScore)}`}>
            {urgencyLevel} URGENCY
          </span>
        </div>
      </div>

      {/* Financial Impact */}
      <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee size={18} className="text-purple-400" />
          <span className="font-semibold text-purple-400">Financial Impact</span>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Total Liability', value: financialImpact?.totalLiability },
            { label: 'Penalties', value: financialImpact?.penalties },
            { label: 'Compensation', value: financialImpact?.compensation },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{label}</span>
              <span className={`text-sm font-semibold ${value ? 'text-white' : 'text-gray-500'}`}>
                {formatCrore(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## FEATURE 3 — Visual Compliance Timeline (Gantt Chart) 📅

Add `components/compliance-timeline.tsx`:

```tsx
'use client';
import { format, differenceInDays, parseISO } from 'date-fns';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface Action {
  action: string;
  deadline: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
  responsibleDepartment: string;
}

export function ComplianceTimeline({ actions }: { actions: Action[] }) {
  const today = new Date();

  const sorted = [...actions]
    .filter(a => a.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  const getStatus = (deadline: string, status: string) => {
    if (status === 'completed') return { color: 'bg-green-500', icon: CheckCircle, label: 'Done' };
    const days = differenceInDays(parseISO(deadline), today);
    if (days < 0) return { color: 'bg-red-500', icon: AlertCircle, label: `${Math.abs(days)}d overdue` };
    if (days <= 7) return { color: 'bg-orange-500', icon: Clock, label: `${days}d left` };
    return { color: 'bg-blue-500', icon: Clock, label: `${days}d left` };
  };

  const priorityBorder = { HIGH: 'border-red-500/40', MEDIUM: 'border-yellow-500/40', LOW: 'border-green-500/40' };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <Clock size={16} className="text-blue-400" />
        Compliance Timeline
      </h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />

        <div className="space-y-4">
          {sorted.map((action, i) => {
            const { color, icon: Icon, label } = getStatus(action.deadline!, action.status);
            return (
              <div key={i} className="flex gap-4 pl-10 relative">
                {/* Dot */}
                <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full ${color} ring-2 ring-gray-900`} />

                <div className={`flex-1 bg-gray-800 rounded-lg p-4 border ${priorityBorder[action.priority]}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-white">{action.action}</p>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full text-white ${color}`}>
                      {label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>📅 {format(parseISO(action.deadline!), 'dd MMM yyyy')}</span>
                    <span>🏛️ {action.responsibleDepartment}</span>
                    <span className={`px-1.5 py-0.5 rounded text-white ${
                      action.priority === 'HIGH' ? 'bg-red-600/50' :
                      action.priority === 'MEDIUM' ? 'bg-yellow-600/50' : 'bg-green-600/50'
                    }`}>{action.priority}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

---

## FEATURE 4 — Officer Co-Pilot (Llama 3.3 Draft Reply Memo) ✍️

Add a button on case detail pages: "Draft Official Reply". Llama writes a formal government memo responding to the court.

### Add `app/api/draft-memo/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
  const { caseTitle, courtName, judgmentDate, summary, complianceActions, department } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `Draft a formal official government reply memo to the ${courtName} regarding:

Case: ${caseTitle}
Judgment Date: ${judgmentDate}
Summary: ${summary}
Department: ${department}
Compliance Actions to be taken:
${complianceActions.map((a: any, i: number) => `${i+1}. ${a.action} (Deadline: ${a.deadline || 'TBD'})`).join('\n')}

Write a formal, professional government memo (To the Registrar, Subject, Body with specific compliance commitments, From the Officer). Use Indian government memo format. Include specific dates and department names. Keep it under 400 words.`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.2,
  });

  return NextResponse.json({ memo: response.choices[0].message.content });
}
```

### Add Draft Memo Button UI (add to case detail page):

```tsx
const [memo, setMemo] = useState('');
const [draftingMemo, setDraftingMemo] = useState(false);

const handleDraftMemo = async () => {
  setDraftingMemo(true);
  try {
    const res = await fetch('/api/draft-memo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseTitle: caseData.title,
        courtName: caseData.court,
        judgmentDate: caseData.judgment_date,
        summary: caseData.summary,
        complianceActions: caseData.compliance_actions,
        department: caseData.department,
      }),
    });
    const data = await res.json();
    setMemo(data.memo);
  } finally {
    setDraftingMemo(false);
  }
};

// In JSX:
<button onClick={handleDraftMemo} disabled={draftingMemo}
  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
  {draftingMemo ? '✍️ Drafting...' : '✍️ Draft Official Reply Memo'}
</button>

{memo && (
  <div className="mt-4 bg-gray-800 border border-gray-600 rounded-xl p-6">
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-semibold text-white">📄 Draft Official Reply</h4>
      <button onClick={() => navigator.clipboard.writeText(memo)}
        className="text-xs text-blue-400 hover:text-blue-300">Copy</button>
    </div>
    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{memo}</pre>
  </div>
)}
```

---

## FEATURE 5 — Multi-Document Contradiction Detector 🔍

A new tab "Compare Cases". Select 2 cases, Llama finds conflicting directives.

### Add `app/api/compare-cases/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: NextRequest) {
  const { case1, case2 } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a legal analyst. Compare these two court judgments and identify:
1. Contradictions or conflicts between their directives
2. Overlapping compliance requirements
3. Recommendation on which takes precedence

CASE 1: ${case1.title}
Directives: ${case1.keyDirectives?.join('; ')}
Compliance Actions: ${case1.complianceActions?.map((a: any) => a.action).join('; ')}

CASE 2: ${case2.title}
Directives: ${case2.keyDirectives?.join('; ')}
Compliance Actions: ${case2.complianceActions?.map((a: any) => a.action).join('; ')}

Respond as JSON: { "contradictions": [...], "overlaps": [...], "recommendation": "..." }`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.1,
  });

  const text = response.choices[0].message.content ?? '{}';
  const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  const result = JSON.parse(cleaned);

  return NextResponse.json(result);
}
```

---

## FEATURE 6 — Dashboard Upgrade: Live Deadline Countdown Widget

Add to your dashboard page. Shows cases with deadlines in the next 30 days sorted by urgency.

```tsx
// components/deadline-countdown.tsx
'use client';
import { useEffect, useState } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { AlertTriangle, Clock } from 'lucide-react';

export function DeadlineCountdown({ actions }: { actions: any[] }) {
  const today = new Date();

  const upcoming = actions
    .filter(a => a.deadline && a.status !== 'completed')
    .map(a => ({ ...a, daysLeft: differenceInDays(parseISO(a.deadline), today) }))
    .filter(a => a.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-orange-400" />
        <h3 className="font-semibold text-white">⏰ Upcoming Deadlines</h3>
      </div>
      {upcoming.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No upcoming deadlines in 30 days</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((a, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${
              a.daysLeft < 0 ? 'bg-red-500/10 border-red-500/30' :
              a.daysLeft <= 7 ? 'bg-orange-500/10 border-orange-500/30' :
              'bg-gray-800 border-gray-700'
            }`}>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{a.action}</p>
                <p className="text-xs text-gray-400">{a.cases?.case_number} • {a.responsible_department}</p>
              </div>
              <div className={`shrink-0 ml-3 text-right text-sm font-bold ${
                a.daysLeft < 0 ? 'text-red-400' :
                a.daysLeft <= 7 ? 'text-orange-400' : 'text-blue-400'
              }`}>
                {a.daysLeft < 0 ? `${Math.abs(a.daysLeft)}d overdue` : `${a.daysLeft}d left`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

Fetch data and pass it:
```typescript
// In dashboard page
const { data: actions } = await supabase
  .from('compliance_actions')
  .select('*, cases(case_number, title)')
  .neq('status', 'completed')
  .not('deadline', 'is', null)
  .order('deadline', { ascending: true })
  .limit(20);
```

---

## FEATURE 7 — New Sidebar Tab: "⚡ AI Co-Pilot" Page

Add a 7th sidebar entry. This is a standalone Llama-powered assistant page for officers.

Create `app/(dashboard)/copilot/page.tsx`:

```tsx
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
```

Add `app/api/copilot/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  const supabase = createServerSupabaseClient();

  // Fetch summary context from DB
  const { data: cases } = await supabase
    .from('cases')
    .select('case_number, title, status, priority, department, summary')
    .limit(20);

  const { data: actions } = await supabase
    .from('compliance_actions')
    .select('action, status, deadline, priority, responsible_department')
    .neq('status', 'completed')
    .limit(30);

  const context = `
Current cases in system:
${JSON.stringify(cases?.slice(0, 10), null, 2)}

Pending compliance actions:
${JSON.stringify(actions?.slice(0, 15), null, 2)}`;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: `You are VerdictFlow AI Co-Pilot for Indian government legal compliance officers. Answer questions using the provided case data. Be concise, helpful, and cite case numbers when relevant.\n\nCASE DATA:\n${context}` },
      { role: 'user', content: question }
    ],
    max_tokens: 600,
    temperature: 0.2,
  });

  return NextResponse.json({ answer: response.choices[0].message.content });
}
```

Add to sidebar navigation:
```tsx
{ href: '/copilot', label: 'AI Co-Pilot', icon: Zap }
```

---

## FEATURE 8 — "One-Click Penalty Payment" (Razorpay Integration) 💳

If the AI extracts a financial penalty from the judgment, allow officers or concerned parties to instantly initiate a penalty payment using Razorpay.

### Add `app/api/create-payment/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const { amount, receipt } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}
```

### Add a Pay Button in Case Detail or `components/risk-score-card.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import Script from 'next/script';

export function PayPenaltyButton({ amount, caseId }: { amount: number, caseId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on server
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `receipt_${caseId}` }),
      });
      const order = await res.json();

      // 2. Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: "VerdictFlow",
        description: "Court Penalty Payment",
        order_id: order.id,
        handler: function (response: any) {
          alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Payment failed", error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm transition-colors mt-3 w-full justify-center"
      >
        <IndianRupee size={16} />
        {loading ? 'Processing...' : `Pay Penalty (₹${amount.toLocaleString('en-IN')})`}
      </button>
    </>
  );
}
```

---

## INSTALL DEPENDENCIES

```bash
npm install groq-sdk date-fns razorpay
```

---

## ENV VARS TO ADD

```env
GROQ_API_KEY=your_api_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

## IMPLEMENTATION ORDER

1. `npm install groq-sdk date-fns razorpay`
2. Add `GROQ_API_KEY`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` to `.env.local`
3. Feature 1 — Chat with Judgment (biggest wow factor for demo)
4. Feature 2 — Risk Score + Financial Impact (extends existing analyze route)
5. Feature 8 — One-Click Penalty Payment (integrates with financial impact)
6. Feature 3 — Compliance Timeline (pure UI, quick win)
7. Feature 6 — Deadline Countdown on Dashboard (immediate visual impact)
8. Feature 7 — AI Co-Pilot tab (standalone, new sidebar entry)
9. Feature 4 — Draft Memo (quick Llama integration)
10. Feature 5 — Contradiction Detector (advanced, do last)