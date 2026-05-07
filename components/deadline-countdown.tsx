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
                <p className="text-xs text-gray-400">{a.cases?.case_number || a.cases?.title} • {a.responsible_department}</p>
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