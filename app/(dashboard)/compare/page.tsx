'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, Loader2, ArrowRight, AlertTriangle, Layers, CheckCircle2,
  GitMerge, Lightbulb, ChevronRight, RefreshCw, FileText, Building, BarChart3
} from 'lucide-react';
import { toast } from 'sonner';

// Mock cases to use when database is empty
const MOCK_CASES = [
  { id: 'mock-1', title: 'State of Maharashtra vs. Reliance Infra Ltd', case_number: 'WP 1242/2024', department: 'PWD', priority: 'HIGH' },
  { id: 'mock-2', title: 'Union of India vs. Green Earth NGO', case_number: 'PIL 442/2024', department: 'Forest', priority: 'CRITICAL' },
  { id: 'mock-3', title: 'Municipal Corp vs. Health First Ltd', case_number: 'CA 889/2023', department: 'Health', priority: 'MEDIUM' },
  { id: 'mock-4', title: 'Delhi Govt vs. Transport Unions', case_number: 'SLP 334/2024', department: 'Transport', priority: 'HIGH' },
  { id: 'mock-5', title: 'Haryana PCB vs. Industrial Units', case_number: 'WP 2011/2024', department: 'Environment', priority: 'CRITICAL' },
];

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  LOW: 'text-green-400 bg-green-500/10 border-green-500/20',
};

export default function CompareCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [case1Id, setCase1Id] = useState('');
  const [case2Id, setCase2Id] = useState('');
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase.from('cases').select('id, title, case_number, department, priority');
      if (data && data.length > 0) setCases(data);
      else setCases(MOCK_CASES);
      setLoading(false);
    };
    fetchCases();
  }, []);

  const handleCompare = async () => {
    if (!case1Id || !case2Id || case1Id === case2Id) {
      toast.error("Please select two different cases");
      return;
    }
    setComparing(true);
    setResult(null);

    try {
      const isMock = case1Id.startsWith('mock-');
      
      if (isMock) {
        // Simulate API call with mock result
        await new Promise(r => setTimeout(r, 2000));
        const c1 = MOCK_CASES.find(c => c.id === case1Id);
        const c2 = MOCK_CASES.find(c => c.id === case2Id);
        setResult({
          contradictions: [
            `${c1?.title} mandates immediate remediation while ${c2?.title} allows a 90-day window, creating a conflicting compliance timeline.`,
            "Jurisdictional overlap between the two orders may cause ambiguity in enforcement authority for the nodal department.",
          ],
          overlaps: [
            "Both cases direct the respective respondents to submit a detailed action taken report (ATR) to the court registry.",
            "Both orders carry financial penalty clauses for non-compliance, ranging from ₹5 lakh to ₹50 lakh.",
          ],
          recommendation: `Given the conflicting timelines and overlapping financial penalty clauses, it is recommended to consolidate compliance reporting for these two matters. The nodal officer should file a unified compliance plan within 30 days, addressing directives from both orders to avoid contempt of court proceedings. Prioritize the CRITICAL matter (${c2?.title}) first given its urgency.`,
        });
      } else {
        const [{ data: c1 }, { data: c2 }] = await Promise.all([
          supabase.from('cases').select('*').eq('id', case1Id).single(),
          supabase.from('cases').select('*').eq('id', case2Id).single(),
        ]);
        const [{ data: a1 }, { data: a2 }] = await Promise.all([
          supabase.from('compliance_actions').select('*').eq('case_id', case1Id),
          supabase.from('compliance_actions').select('*').eq('case_id', case2Id),
        ]);
        const payload = {
          case1: { title: c1.title, keyDirectives: c1.tags || [], complianceActions: a1 || [] },
          case2: { title: c2.title, keyDirectives: c2.tags || [], complianceActions: a2 || [] },
        };
        const res = await fetch('/api/compare-cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setResult(data);
      }

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err: any) {
      toast.error("Failed to compare cases");
    } finally {
      setComparing(false);
    }
  };

  const case1 = cases.find(c => c.id === case1Id);
  const case2 = cases.find(c => c.id === case2Id);
  const canCompare = case1Id && case2Id && case1Id !== case2Id;

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="text-sm font-bold uppercase tracking-widest text-gray-400 animate-pulse">Loading Cases...</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Powered by Llama 3.3 70B</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white">Compare <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Cases</span></h1>
        <p className="text-gray-400 mt-2 text-base font-medium">Identify conflicting directives, overlaps, and get AI-powered recommendations across two judgments.</p>
      </div>

      {/* Case Selection */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-6">
        {/* Case 1 */}
        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400">
            <div className="h-6 w-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-[10px]">1</div>
            Select First Case
          </div>
          <select
            value={case1Id}
            onChange={e => setCase1Id(e.target.value)}
            className="w-full bg-black/40 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-blue-500/50 text-sm font-medium appearance-none cursor-pointer transition-all"
          >
            <option value="">— Select a case —</option>
            {cases.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === case2Id}>{c.title}</option>
            ))}
          </select>

          {/* Case 1 Preview */}
          <AnimatePresence>
            {case1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 font-mono">{case1.case_number || 'N/A'}</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">{case1.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {case1.department && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Building className="h-2.5 w-2.5" />{case1.department}
                      </span>
                    )}
                    {case1.priority && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded-lg ${PRIORITY_COLORS[case1.priority?.toUpperCase()] || 'text-gray-400'}`}>
                        {case1.priority}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VS Divider */}
        <div className="flex flex-col items-center justify-center pt-12">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white font-black text-sm">VS</div>
        </div>

        {/* Case 2 */}
        <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400">
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-[10px]">2</div>
            Select Second Case
          </div>
          <select
            value={case2Id}
            onChange={e => setCase2Id(e.target.value)}
            className="w-full bg-black/40 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:border-indigo-500/50 text-sm font-medium appearance-none cursor-pointer transition-all"
          >
            <option value="">— Select a case —</option>
            {cases.map(c => (
              <option key={c.id} value={c.id} disabled={c.id === case1Id}>{c.title}</option>
            ))}
          </select>

          {/* Case 2 Preview */}
          <AnimatePresence>
            {case2 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 font-mono">{case2.case_number || 'N/A'}</span>
                  </div>
                  <p className="text-sm font-bold text-white leading-snug">{case2.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {case2.department && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg flex items-center gap-1">
                        <Building className="h-2.5 w-2.5" />{case2.department}
                      </span>
                    )}
                    {case2.priority && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-1 rounded-lg ${PRIORITY_COLORS[case2.priority?.toUpperCase()] || 'text-gray-400'}`}>
                        {case2.priority}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Compare Button */}
      <button
        onClick={handleCompare}
        disabled={comparing || !canCompare}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl px-6 py-4 font-bold text-base transition-all flex justify-center items-center gap-3 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] border border-indigo-400/30"
      >
        {comparing ? (
          <>
            <div className="flex space-x-1 items-center">
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0 }} className="w-2 h-2 bg-white rounded-full" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.15 }} className="w-2 h-2 bg-white rounded-full" />
              <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.3 }} className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span>Analyzing with Llama 3.3...</span>
          </>
        ) : (
          <>
            <Scale className="h-5 w-5" />
            Compare Directives
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Result Header */}
            <div className="flex items-center gap-3 py-4 border-b border-white/5">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-black text-white">AI Comparative Analysis</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">Complete</span>
            </div>

            {/* Contradictions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-red-500/5 border border-red-500/20 rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-red-300 text-base">Contradictions & Conflicts</h3>
                  <p className="text-xs text-red-400/60 font-medium">{result.contradictions?.length || 0} conflicts identified</p>
                </div>
              </div>
              <div className="space-y-3 pl-1">
                {result.contradictions?.map((c: string, i: number) => (
                  <div key={i} className="flex gap-3 p-3 bg-red-500/10 rounded-2xl border border-red-500/10">
                    <span className="h-5 w-5 rounded-full bg-red-500/20 text-red-400 text-[10px] flex items-center justify-center shrink-0 font-black mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">{c}</p>
                  </div>
                ))}
                {!result.contradictions?.length && <p className="text-sm text-gray-400 pl-3">No direct contradictions found.</p>}
              </div>
            </motion.div>

            {/* Overlaps */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <Layers className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-black text-yellow-300 text-base">Overlaps & Shared Directives</h3>
                  <p className="text-xs text-yellow-400/60 font-medium">{result.overlaps?.length || 0} overlaps found</p>
                </div>
              </div>
              <div className="space-y-3 pl-1">
                {result.overlaps?.map((o: string, i: number) => (
                  <div key={i} className="flex gap-3 p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/10">
                    <GitMerge className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300 leading-relaxed">{o}</p>
                  </div>
                ))}
                {!result.overlaps?.length && <p className="text-sm text-gray-400 pl-3">No significant overlaps detected.</p>}
              </div>
            </motion.div>

            {/* Recommendation */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-7 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <Lightbulb className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-emerald-300 text-base">AI Recommendation</h3>
                  <p className="text-xs text-emerald-400/60 font-medium">Llama 3.3 suggested course of action</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed pl-1">{result.recommendation || "No specific recommendation generated."}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}