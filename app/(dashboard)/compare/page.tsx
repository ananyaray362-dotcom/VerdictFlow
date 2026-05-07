'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Scale } from 'lucide-react';
import { toast } from 'sonner';

export default function CompareCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [case1Id, setCase1Id] = useState('');
  const [case2Id, setCase2Id] = useState('');
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchCases = async () => {
      const { data } = await supabase.from('cases').select('id, title');
      if (data) setCases(data);
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
      // Fetch full case details and compliance actions
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
    } catch (err: any) {
      toast.error("Failed to compare cases");
    } finally {
      setComparing(false);
    }
  };

  if (loading) return <div className="p-6">Loading cases...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <Scale className="text-blue-400" /> Compare Cases
      </h1>
      <p className="text-gray-400">Select two cases to identify conflicting directives or overlaps using Llama 3.3.</p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Case 1</label>
          <select value={case1Id} onChange={e => setCase1Id(e.target.value)} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm">
            <option value="">Select a case...</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Case 2</label>
          <select value={case2Id} onChange={e => setCase2Id(e.target.value)} className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-600 focus:outline-none focus:border-blue-500 text-sm">
            <option value="">Select a case...</option>
            {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      <button onClick={handleCompare} disabled={comparing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors flex justify-center items-center gap-2">
        {comparing ? <><Loader2 className="animate-spin h-4 w-4" /> Analyzing...</> : 'Compare Directives'}
      </button>

      {result && (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
            <h3 className="font-semibold text-red-400 mb-2">Contradictions & Conflicts</h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              {result.contradictions?.map((c: string, i: number) => <li key={i}>{c}</li>)}
              {!result.contradictions?.length && <li>None found.</li>}
            </ul>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">
            <h3 className="font-semibold text-yellow-400 mb-2">Overlaps</h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              {result.overlaps?.map((o: string, i: number) => <li key={i}>{o}</li>)}
              {!result.overlaps?.length && <li>None found.</li>}
            </ul>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
            <h3 className="font-semibold text-green-400 mb-2">Recommendation</h3>
            <p className="text-sm text-gray-300">{result.recommendation || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
}