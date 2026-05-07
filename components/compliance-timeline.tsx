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