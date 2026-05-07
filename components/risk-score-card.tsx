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