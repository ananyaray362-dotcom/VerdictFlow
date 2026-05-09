"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle2, XCircle, Filter, Clock, AlertTriangle,
  CheckSquare, Square, Trash2, Inbox, FileSignature, X, Copy, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { MOCK_CASES, type MockCase } from "@/lib/mockData"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/* ─── Helpers ─── */
function getDaysLeft(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  const days = Math.floor(diff / 86400000)
  if (diff <= 0)  return { label: "OVERDUE",   urgent: true,  days: -1 }
  if (days === 0) return { label: "Due Today", urgent: true,  days: 0  }
  if (days === 1) return { label: "1 day left", urgent: true, days: 1  }
  return { label: `${days} days left`, urgent: days < 7, days }
}

/* ─── Review Card ─── */
function ReviewCard({
  c, checked, onToggle, onApprove, onRevision, onDraftNotice,
}: {
  c: MockCase
  checked: boolean
  onToggle: () => void
  onApprove: () => void
  onRevision: () => void
  onDraftNotice: (c: MockCase) => void
}) {
  const dl = getDaysLeft(c.deadline)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem] border bg-card/60 backdrop-blur-xl p-6 space-y-5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        checked ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]" : "border-border/50 hover:border-blue-500/30"
      )}
    >
      {/* Background glow effect based on priority */}
      <div className={cn("absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-5 group-hover:opacity-20 transition-opacity", 
        c.priority === 'critical' ? 'bg-red-500' : c.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
      )} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggle}
            className="mt-0.5 shrink-0 transition-transform hover:scale-110"
          >
            {checked
              ? <CheckSquare className="h-5 w-5 text-blue-400" />
              : <Square className="h-5 w-5 text-muted-foreground" />}
          </button>
          <div>
            <p className="font-mono text-[13px] tracking-wider font-black text-blue-400 uppercase">{c.case_number}</p>
            <p className="text-[15px] font-bold mt-1 leading-snug group-hover:text-blue-400 transition-colors">{c.case_title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={c.priority} size="sm" />
          <StatusBadge status={c.department.toLowerCase() as any} size="sm" className="bg-slate-500/15 text-slate-400 border-slate-500/30" />
        </div>
      </div>

      {/* Action summary */}
      <p className="text-[13px] font-medium text-muted-foreground leading-relaxed line-clamp-3 pl-8">
        {c.action_summary}
      </p>

      {/* Compliance actions preview */}
      <div className="pl-8 space-y-1.5">
        {c.compliance_actions.slice(0, 2).map((a, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="h-4 w-4 rounded-full bg-blue-500/15 text-blue-400 text-[10px] flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
            <span className="text-muted-foreground line-clamp-1">{a}</span>
          </div>
        ))}
        {c.compliance_actions.length > 2 && (
          <p className="text-[11px] text-muted-foreground pl-6">+{c.compliance_actions.length - 2} more actions</p>
        )}
      </div>

      {/* Deadline + court */}
      <div className="flex items-center justify-between pl-8 gap-3">
        <div className="flex items-center gap-1.5">
          <Clock className={cn("h-3.5 w-3.5 shrink-0", dl.urgent ? "text-red-400" : "text-muted-foreground")} />
          <span className={cn("text-xs font-semibold", dl.urgent ? "text-red-400" : "text-muted-foreground")}>
            {dl.label}
          </span>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-xs text-muted-foreground">
            {new Date(c.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{c.court}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 pl-8 pt-2 flex-wrap">
        <Button
          size="sm"
          onClick={onApprove}
          className="gap-2 h-9 text-xs rounded-xl bg-emerald-600/90 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white flex-1 font-bold"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve & Verify
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRevision}
          className="gap-2 h-9 text-xs rounded-xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10 flex-1 font-bold"
        >
          <XCircle className="h-4 w-4" />
          Request Revision
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDraftNotice(c)}
          className="gap-2 h-9 text-xs rounded-xl border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold w-full mt-1"
        >
          <FileSignature className="h-4 w-4" />
          Draft Formal Notice
        </Button>
      </div>
    </motion.div>
  )
}

/* ─── Page ─── */
export default function PendingReviewPage() {
  const initialQueue = MOCK_CASES.filter(c =>
    c.status === "pending_review" || c.status === "in_review"
  )

  const [queue,     setQueue]     = useState<MockCase[]>(initialQueue)
  const [selected,  setSelected]  = useState<Set<string>>(new Set())
  const [priorityF, setPriorityF] = useState("")
  const [deptF,     setDeptF]     = useState("")
  const [noticeModal, setNoticeModal] = useState<{ open: boolean; case: MockCase | null; notice: string; loading: boolean }>({
    open: false, case: null, notice: '', loading: false
  })

  const stats = useMemo(() => ({
    total:    queue.length,
    high:     queue.filter(c => c.priority === "high" || c.priority === "critical").length,
    dueToday: queue.filter(c => {
      const diff = new Date(c.deadline).getTime() - Date.now()
      return diff >= 0 && diff < 86400000
    }).length,
    overdue:  queue.filter(c => new Date(c.deadline).getTime() < Date.now()).length,
  }), [queue])

  const filtered = useMemo(() => {
    let rows = [...queue]
    if (priorityF) rows = rows.filter(c => c.priority === priorityF)
    if (deptF)     rows = rows.filter(c => c.department === deptF)
    // Sort: critical/overdue first
    rows.sort((a, b) => {
      const pA = a.priority === "critical" ? 0 : a.priority === "high" ? 1 : 2
      const pB = b.priority === "critical" ? 0 : b.priority === "high" ? 1 : 2
      return pA - pB
    })
    return rows
  }, [queue, priorityF, deptF])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const approve = (id: string) => {
    setQueue(q => q.filter(c => c.id !== id))
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
    toast.success("Case approved and verified ✅")
  }

  const revision = (id: string) => {
    setQueue(q => q.filter(c => c.id !== id))
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
    toast.info("Revision request sent 📝")
  }

  const bulkApprove = () => {
    const ids = Array.from(selected)
    setQueue(q => q.filter(c => !ids.includes(c.id)))
    setSelected(new Set())
    toast.success(`${ids.length} cases approved & verified ✅`)
  }

  const handleDraftNotice = async (c: MockCase) => {
    setNoticeModal({ open: true, case: c, notice: '', loading: true })
    try {
      const overdue = c.compliance_actions?.[0] || 'Pending compliance action'
      const res = await fetch('/api/draft-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: overdue,
          caseName: c.case_title,
          department: c.department,
          deadline: c.deadline,
          officerName: 'Compliance Officer'
        }),
      })
      const data = await res.json()
      setNoticeModal(prev => ({ ...prev, notice: data.notice || 'Failed to generate notice.', loading: false }))
    } catch {
      setNoticeModal(prev => ({ ...prev, notice: 'Error generating notice. Please try again.', loading: false }))
      toast.error('Failed to draft notice')
    }
  }

  const toggleAll = () => {
    if (selected.size === filtered.length)
      setSelected(new Set())
    else
      setSelected(new Set(filtered.map(c => c.id)))
  }
  const departments = Array.from(new Set(queue.map(c => c.department)))

  return (
    <>
      <div className="space-y-6 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-3xl font-extrabold tracking-tight">Pending Review</h1>
        <p className="text-muted-foreground mt-1">Review, approve, or request revisions for extracted judgments.</p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Pending",  value: stats.total,    icon: Inbox,         bg: "bg-blue-500/10",    text: "text-blue-400"    },
          { label: "High Priority",  value: stats.high,     icon: AlertTriangle, bg: "bg-red-500/10",     text: "text-red-400"     },
          { label: "Due Today",      value: stats.dueToday, icon: Clock,         bg: "bg-amber-500/10",   text: "text-amber-400"   },
          { label: "Overdue",        value: stats.overdue,  icon: XCircle,       bg: "bg-rose-600/10",    text: "text-rose-400"    },
        ].map(({ label, value, icon: Icon, bg, text }) => (
          <div key={label} className={cn("rounded-[1.5rem] border border-border p-5 flex items-center gap-4 bg-card/40 backdrop-blur-md shadow-sm hover:shadow-lg transition-all", bg + "/10")}>
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner", bg)}>
              <Icon className={cn("h-6 w-6", text)} />
            </div>
            <div>
              <p className={cn("text-3xl font-black tracking-tight", text)}>{value}</p>
              <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filter:
        </div>
        {[
          { label: "All Priority", value: priorityF, onChange: setPriorityF, options: ["critical","high","medium","low"] },
          { label: "All Depts",    value: deptF,     onChange: setDeptF,     options: departments },
        ].map(({ label, value, onChange, options }) => (
          <select
            key={label}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="h-9 rounded-xl border border-border bg-secondary/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {(priorityF || deptF) && (
          <Button variant="ghost" size="sm" onClick={() => { setPriorityF(""); setDeptF("") }}
            className="text-xs text-muted-foreground h-9 px-3 rounded-xl">
            Clear
          </Button>
        )}

        {/* Select all */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs h-9 gap-2 rounded-xl">
            {selected.size === filtered.length && filtered.length > 0
              ? <><CheckSquare className="h-4 w-4" /> Deselect All</>
              : <><Square className="h-4 w-4" /> Select All</>}
          </Button>
        </div>
      </motion.div>

      {/* Card Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Queue is clear!</h3>
          <p className="text-sm text-muted-foreground">All pending reviews have been processed.</p>
        </motion.div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map(c => (
              <ReviewCard
                key={c.id}
                c={c}
                checked={selected.has(c.id)}
                onToggle={() => toggleSelect(c.id)}
                onApprove={() => approve(c.id)}
                onRevision={() => revision(c.id)}
                onDraftNotice={handleDraftNotice}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Sticky bulk actions bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-card border border-border rounded-2xl px-6 py-3.5 shadow-2xl z-40"
          >
            <span className="text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-bold">{selected.size}</span> selected
            </span>
            <div className="h-4 w-px bg-border" />
            <Button
              size="sm"
              onClick={bulkApprove}
              className="gap-2 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(new Set())}
              className="h-9 rounded-xl text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

      {/* Notice Modal */}
      <AnimatePresence>
        {noticeModal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setNoticeModal(prev => ({ ...prev, open: false }))}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0A0D14] border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <FileSignature className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Automated Legal Notice</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Generated by Llama 3.3 · {noticeModal.case?.case_title}</p>
                  </div>
                </div>
                <button onClick={() => setNoticeModal(prev => ({ ...prev, open: false }))}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 bg-black/30 border border-white/5 rounded-2xl p-6 min-h-[300px]">
                {noticeModal.loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
                    <div className="flex space-x-1.5">
                      <motion.div animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0 }} className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                      <motion.div animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.15 }} className="w-2.5 h-2.5 bg-purple-400 rounded-full" />
                      <motion.div animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 0.7, delay: 0.3 }} className="w-2.5 h-2.5 bg-purple-300 rounded-full" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">Drafting formal legal notice...</p>
                  </div>
                ) : (
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed font-mono">{noticeModal.notice}</pre>
                )}
              </div>

              {!noticeModal.loading && (
                <div className="flex gap-3 mt-5">
                  <button onClick={() => { navigator.clipboard.writeText(noticeModal.notice); toast.success('Notice copied to clipboard!') }}
                    className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-5 py-3 text-sm font-bold transition-all">
                    <Copy className="h-4 w-4" /> Copy Notice
                  </button>
                  <button onClick={() => handleDraftNotice(noticeModal.case!)}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-5 py-3 text-sm font-bold transition-all">
                    <Loader2 className="h-4 w-4" /> Regenerate
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
