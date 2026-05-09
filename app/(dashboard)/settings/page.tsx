"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Loader2, Save, User, Building, Shield,
  ExternalLink, BookOpen, Scale, Gavel, FileText,
  ShieldCheck, Lock, Bell, Globe,
  FileBadge, Info, MessageSquareCode, X, Search, Download, ChevronRight,
  BookMarked, AlertTriangle, Layers, ArrowUpRight
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Legal Archive Data ───
const LEGAL_DOCUMENTS = [
  {
    id: 1, title: "Constitution of India", code: "Article 226 & 232", icon: Scale, category: "Constitutional",
    description: "Writs of Habeas Corpus, Mandamus, Prohibition, Quo Warranto, and Certiorari. Article 226 empowers High Courts and Article 232 empowers the Supreme Court to issue writs for enforcement of fundamental rights.",
    tags: ["Fundamental Rights", "Writs", "High Court", "Supreme Court"],
    url: "https://legislative.gov.in/constitution-of-india/",
    lastUpdated: "2024-01-15"
  },
  {
    id: 2, title: "Supreme Court Guidelines", code: "Manual v2.4", icon: Gavel, category: "Procedural",
    description: "Comprehensive guidelines issued by the Supreme Court of India governing practice and procedure. Includes rules for filing petitions, serving notices, and compliance timelines.",
    tags: ["Procedure", "Filing", "Notices", "Timelines"],
    url: "https://sci.gov.in/rules-procedure/",
    lastUpdated: "2024-03-08"
  },
  {
    id: 3, title: "Departmental SOPs", code: "Internal Doc v3.1", icon: FileBadge, category: "Internal",
    description: "Standard Operating Procedures for government departments on processing court orders, filing compliance reports, and escalating high-priority judgments to senior officers.",
    tags: ["Compliance", "Reporting", "Escalation"],
    url: "#",
    lastUpdated: "2025-01-01"
  },
  {
    id: 4, title: "National Green Tribunal Act, 2010", code: "Act No. 19 of 2010", icon: BookMarked, category: "Environmental",
    description: "Establishes the National Green Tribunal for effective and expeditious disposal of cases relating to environmental protection, conservation of forests, and other natural resources.",
    tags: ["Environment", "NGT", "Forest", "Natural Resources"],
    url: "https://ngtnainital.gov.in/",
    lastUpdated: "2023-07-20"
  },
  {
    id: 5, title: "Right to Information Act, 2005", code: "Act No. 22 of 2005", icon: FileText, category: "Transparency",
    description: "Mandates timely response to citizen requests for government information. Establishes Central and State Information Commissions for grievance redressal.",
    tags: ["Transparency", "RTI", "Public Information"],
    url: "https://cic.gov.in/",
    lastUpdated: "2023-11-10"
  },
  {
    id: 6, title: "Prevention of Corruption Act, 1988", code: "Act No. 49 of 1988", icon: AlertTriangle, category: "Anti-Corruption",
    description: "Makes provisions for the prevention of and punishment for corruption and related offences. Amended by the Prevention of Corruption (Amendment) Act, 2018.",
    tags: ["Corruption", "CBI", "Public Servants", "Bribery"],
    url: "https://cvc.gov.in/",
    lastUpdated: "2024-02-28"
  },
]

const CATEGORIES = ["All", "Constitutional", "Procedural", "Internal", "Environmental", "Transparency", "Anti-Corruption"]

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [settingsFormData, setSettingsFormData] = useState({ full_name: "", department: "", role: "" })
  const [archiveSearch, setArchiveSearch] = useState("")
  const [archiveCategory, setArchiveCategory] = useState("All")
  const [selectedDoc, setSelectedDoc] = useState<typeof LEGAL_DOCUMENTS[0] | null>(null)
  const [alertSettings, setAlertSettings] = useState({ email: true, overdue: true, highPriority: false })

  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setSettingsFormData({ full_name: data.full_name || "", department: data.department || "", role: data.role || "" })
      } catch (err) { console.error('Error fetching profile:', err) }
      finally { setIsLoading(false) }
    }
    fetchProfile()
  }, [supabase])

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...settingsFormData, updated_at: new Date().toISOString() })
      if (error) throw error
      toast.success('Settings saved successfully!')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const filteredDocs = LEGAL_DOCUMENTS.filter(doc => {
    const matchesSearch = archiveSearch === "" ||
      doc.title.toLowerCase().includes(archiveSearch.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(archiveSearch.toLowerCase()))
    const matchesCategory = archiveCategory === "All" || doc.category === archiveCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="text-sm font-bold uppercase tracking-widest text-gray-400 animate-pulse">Synchronizing Profiles...</p>
    </div>
  )

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white">Global <span className="text-blue-400">Settings</span></h1>
          <p className="text-gray-400 mt-2 font-medium">Configure your command center preferences and legal references.</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}
          className="rounded-2xl h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Commit Changes
        </Button>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Settings */}
        <div className="lg:col-span-2 space-y-7">
          {/* Account Profile */}
          <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="px-8 py-6 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-xl font-black text-white flex items-center gap-3"><User className="h-5 w-5 text-blue-400" /> Account Profile</h3>
              <p className="text-gray-400 text-sm font-medium mt-1">Update your identification data for the judicial network.</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Officer Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input value={settingsFormData.full_name} onChange={e => setSettingsFormData({ ...settingsFormData, full_name: e.target.value })}
                    className="pl-11 h-12 rounded-xl bg-black/40 border-white/10 text-white focus:border-blue-500/50 font-semibold placeholder:text-gray-600"
                    placeholder="Enter full legal name" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Department Unit</Label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input value={settingsFormData.department} onChange={e => setSettingsFormData({ ...settingsFormData, department: e.target.value })}
                      className="pl-11 h-12 rounded-xl bg-black/40 border-white/10 text-white focus:border-blue-500/50 font-semibold placeholder:text-gray-600"
                      placeholder="e.g. Revenue, PWD" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Jurisdiction Role</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input value={settingsFormData.role} onChange={e => setSettingsFormData({ ...settingsFormData, role: e.target.value })}
                      className="pl-11 h-12 rounded-xl bg-black/40 border-white/10 text-white focus:border-blue-500/50 font-semibold placeholder:text-gray-600"
                      placeholder="e.g. Senior Reviewer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert System */}
          <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <h3 className="text-xl font-black text-white flex items-center gap-3 mb-6"><Bell className="h-5 w-5 text-amber-400" /> Alert System</h3>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive compliance alerts via registered email' },
                { key: 'overdue', label: 'Overdue Action Alerts', desc: 'Alert when compliance deadlines are missed' },
                { key: 'highPriority', label: 'High Priority Updates', desc: 'Instant alert for CRITICAL case updates' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-sm font-bold text-white">{label}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{desc}</p>
                  </div>
                  <button onClick={() => setAlertSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={cn("relative h-6 w-11 rounded-full transition-colors duration-300 shrink-0",
                      alertSettings[key as keyof typeof alertSettings] ? "bg-blue-600" : "bg-white/10"
                    )}>
                    <div className={cn("absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300",
                      alertSettings[key as keyof typeof alertSettings] ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Encrypted Keys */}
          <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-md">
            <h3 className="text-xl font-black text-white flex items-center gap-3 mb-2"><Lock className="h-5 w-5 text-emerald-400" /> Encrypted Keys</h3>
            <p className="text-gray-400 text-sm font-medium mb-6">Manage API credentials and security tokens.</p>
            <div className="space-y-3">
              {[
                { label: 'Groq API Key', value: '••••••••••••••••••••••gk93', status: 'Active' },
                { label: 'Supabase Anon Key', value: '••••••••••••••••••••••eyJh', status: 'Active' },
              ].map((key, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{key.label}</p>
                    <p className="text-sm font-mono text-white mt-1">{key.value}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-lg">{key.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Archive & Status */}
        <div className="space-y-7">
          {/* Legal Archive */}
          <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700">
              <h3 className="text-xl font-black text-white flex items-center gap-3"><BookOpen className="h-6 w-6" /> Legal Archive</h3>
              <p className="text-blue-100 text-xs font-bold mt-1 uppercase tracking-widest">Digital Reference Library</p>
            </div>

            {/* Search & Filter */}
            <div className="p-5 space-y-3 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input value={archiveSearch} onChange={e => setArchiveSearch(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full bg-black/40 text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/10 focus:outline-none focus:border-blue-500/50 text-sm font-medium placeholder:text-gray-600"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["All", "Constitutional", "Procedural", "Internal"].map(cat => (
                  <button key={cat} onClick={() => setArchiveCategory(cat)}
                    className={cn("text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all",
                      archiveCategory === cat ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                    )}>{cat}</button>
                ))}
              </div>
            </div>

            <div className="p-5 space-y-3 max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
              {filteredDocs.map(doc => (
                <button key={doc.id} onClick={() => setSelectedDoc(doc)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/20 group transition-all text-left">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                      <doc.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white leading-tight">{doc.title}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">{doc.code}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors shrink-0" />
                </button>
              ))}
              {filteredDocs.length === 0 && (
                <div className="py-10 text-center text-gray-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">No documents found</p>
                </div>
              )}
            </div>
          </div>

          {/* Node Status */}
          <div className="bg-[#0A0D14]/80 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center gap-2 mb-5"><Info className="h-5 w-5 text-indigo-400" /> Node Status</h3>
            <div className="space-y-4">
              {[
                { label: 'Version', value: 'v1.2.4-stable', color: '' },
                { label: 'AI Engine', value: 'Llama 3.3 70B', dot: 'bg-emerald-500' },
                { label: 'Database', value: 'Supabase PostgreSQL', dot: 'bg-emerald-500' },
                { label: 'Region', value: 'India Central', icon: <Globe className="h-3 w-3 text-blue-400" /> },
              ].map((item, i) => (
                <div key={i} className={cn("flex items-center justify-between py-3", i < 3 && "border-b border-white/5")}>
                  <span className="text-xs font-bold text-gray-400">{item.label}</span>
                  <span className="text-xs font-black text-white flex items-center gap-1.5">
                    {item.dot && <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", item.dot)} />}
                    {item.icon}
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex items-center gap-2 mb-2 text-indigo-400">
                <MessageSquareCode className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">System Health</span>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-gray-400">
                Extraction node operating at <span className="text-white font-bold">98.4%</span> accuracy. All systems nominal.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Archive Document Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0A0D14] border border-white/10 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                    <selectedDoc.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{selectedDoc.category}</span>
                    <h3 className="text-xl font-black text-white mt-0.5">{selectedDoc.title}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{selectedDoc.code}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6">{selectedDoc.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedDoc.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-400 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                <span>Last Updated: <span className="text-gray-300 font-semibold">{selectedDoc.lastUpdated}</span></span>
              </div>

              <div className="flex gap-3">
                <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-5 py-3 text-sm font-bold transition-all">
                  <ArrowUpRight className="h-4 w-4" /> Open Document
                </a>
                <button onClick={() => { toast.success(`${selectedDoc.title} saved to archive.`); setSelectedDoc(null) }}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl px-5 py-3 text-sm font-bold transition-all">
                  <Download className="h-4 w-4" /> Save Reference
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
