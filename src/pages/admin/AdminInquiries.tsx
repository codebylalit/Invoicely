import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  MessageSquare,
  RefreshCw,
  Search,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Inbox,
  ChevronDown,
  ChevronUp,
  Filter,
  Tag,
  User,
  Calendar,
  XCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// ─── Types ────────────────────────────────────────────────────────────────────

type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  admin_notes?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<InquiryStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  new: {
    label: 'New',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: <Inbox className="h-3 w-3" />,
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: <Clock className="h-3 w-3" />,
  },
  resolved: {
    label: 'Resolved',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  closed: {
    label: 'Closed',
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    icon: <XCircle className="h-3 w-3" />,
  },
};

// ─── InquiryRow ───────────────────────────────────────────────────────────────

const InquiryRow: React.FC<{
  inquiry: Inquiry;
  onStatusChange: (id: string, status: InquiryStatus, notes: string) => Promise<void>;
}> = ({ inquiry, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState(inquiry.admin_notes || '');
  const [localStatus, setLocalStatus] = useState<InquiryStatus>(inquiry.status);

  const cfg = STATUS_CONFIG[localStatus];

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(inquiry.id, localStatus, notes);
    setSaving(false);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className={`rounded-xl border transition-all overflow-hidden ${
      localStatus === 'new'
        ? 'border-blue-500/30 bg-blue-500/[0.02] dark:bg-blue-500/[0.04]'
        : 'border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-[#0D111D]/80'
    }`}>
      {/* Header row */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {inquiry.name?.slice(0, 2).toUpperCase() || '??'}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-900 dark:text-white">{inquiry.name}</span>
            <span className="text-xs text-slate-400">{inquiry.email}</span>
            {localStatus === 'new' && (
              <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                NEW
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5 truncate">
            {inquiry.subject || 'General Inquiry'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{inquiry.message}</p>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block">{timeAgo(inquiry.created_at)}</span>
          <div className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-4">
          {/* Full message */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Message</p>
            <div className="p-3 rounded-xl bg-white dark:bg-[#0D111D] border border-slate-200/60 dark:border-slate-800/60 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>

          {/* Metadata row */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(inquiry.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {inquiry.subject || 'General Inquiry'}
            </span>
            <a
              href={`mailto:${inquiry.email}?subject=Re: ${encodeURIComponent(inquiry.subject || 'Your Inquiry')}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-amber-500 hover:text-amber-600 font-semibold"
            >
              <Mail className="h-3.5 w-3.5" />
              Reply via Email
            </a>
          </div>

          {/* Status + Notes controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Update Status</p>
              <select
                value={localStatus}
                onChange={(e) => setLocalStatus(e.target.value as InquiryStatus)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Notes</p>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal note (not shown to user)"
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-400 text-white text-xs px-4"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            <span className="ml-1.5">{saving ? 'Saving…' : 'Save Changes'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminInquiries: React.FC = () => {
  const supabase = useSupabaseClient();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('contact_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setInquiries(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleStatusChange = async (id: string, status: InquiryStatus, admin_notes: string) => {
    await (supabase as any)
      .from('contact_inquiries')
      .update({ status, admin_notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    setInquiries((prev) =>
      prev.map((i) => i.id === id ? { ...i, status, admin_notes, updated_at: new Date().toISOString() } : i)
    );
  };

  const filtered = inquiries.filter((i) => {
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      i.name?.toLowerCase().includes(q) ||
      i.email?.toLowerCase().includes(q) ||
      i.subject?.toLowerCase().includes(q) ||
      i.message?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === 'new').length,
    in_progress: inquiries.filter((i) => i.status === 'in_progress').length,
    resolved: inquiries.filter((i) => i.status === 'resolved').length,
    closed: inquiries.filter((i) => i.status === 'closed').length,
  };

  const FILTER_TABS = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'new', label: 'New', count: counts.new },
    { value: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { value: 'resolved', label: 'Resolved', count: counts.resolved },
    { value: 'closed', label: 'Closed', count: counts.closed },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" />
            Inquiries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            All contact form submissions from users and visitors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {counts.new > 0 && (
            <Badge className="bg-blue-500 text-white text-xs px-3 py-1">
              {counts.new} new
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInquiries}
            className="text-xs border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: counts.all, color: 'text-slate-700 dark:text-slate-200', bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700' },
          { label: 'New', count: counts.new, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { label: 'In Progress', count: counts.in_progress, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Resolved', count: counts.resolved, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 flex items-center gap-3 ${s.bg}`}>
            <div>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-4 rounded-2xl bg-white/80 dark:bg-[#0D111D]/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                statusFilter === tab.value
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-sm'
                  : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label} <span className="opacity-60 ml-0.5">({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search name, email, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60"
          />
        </div>
      </div>

      {/* Inquiry list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <MessageSquare className="h-10 w-10 opacity-30" />
          <p className="text-sm font-medium">
            {search || statusFilter !== 'all' ? 'No inquiries match your filter' : 'No inquiries yet'}
          </p>
          {!search && statusFilter === 'all' && (
            <p className="text-xs opacity-60">When users submit the contact form, they'll appear here.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((inquiry) => (
            <InquiryRow
              key={inquiry.id}
              inquiry={inquiry}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
