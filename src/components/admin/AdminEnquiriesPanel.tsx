import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { EnquiryOrder, EnquiryStatus } from '../../types';

interface AdminEnquiriesPanelProps {
  enquiries: EnquiryOrder[];
  onUpdateEnquiry: (
    id: string,
    payload: { status?: EnquiryStatus; internalNote?: string }
  ) => Promise<void>;
  onDeleteEnquiry: (id: string) => Promise<void>;
}

const STATUS_META: Record<
  EnquiryStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  new: {
    label: 'New Enquiry',
    bg: 'bg-[#E5F5FA]',
    text: 'text-[#005A87]',
    border: 'border-[#72AEE6]',
  },
  reviewed: {
    label: 'Reviewed',
    bg: 'bg-[#FCF9E8]',
    text: 'text-[#8C5E00]',
    border: 'border-[#DBA617]',
  },
  consultation: {
    label: 'In Consultation',
    bg: 'bg-[#F3EFFE]',
    text: 'text-[#5A3293]',
    border: 'border-[#B297DB]',
  },
  completed: {
    label: 'Completed',
    bg: 'bg-[#EDFAEF]',
    text: 'text-[#1E6B2F]',
    border: 'border-[#68DE7C]',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-[#F0F0F1]',
    text: 'text-[#50575E]',
    border: 'border-[#C3C4C7]',
  },
};

export const AdminEnquiriesPanel: React.FC<AdminEnquiriesPanelProps> = ({
  enquiries,
  onUpdateEnquiry,
  onDeleteEnquiry,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selected = enquiries.find((e) => e.id === selectedId) || null;

  const filtered = enquiries.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.orderNumber.toLowerCase().includes(q) ||
        item.projectType.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenInspector = (order: EnquiryOrder) => {
    setSelectedId(order.id);
    setNoteDraft(order.internalNote || '');
  };

  const handleStatusChange = async (id: string, status: EnquiryStatus) => {
    setSavingId(id);
    try {
      await onUpdateEnquiry(id, { status });
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSavingId(selected.id);
    try {
      await onUpdateEnquiry(selected.id, { internalNote: noteDraft });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-normal text-[#1D2327]">
            Project Enquiries <span className="text-xs text-[#646970] font-mono">({enquiries.length})</span>
          </h1>
          <p className="text-xs text-[#646970] mt-0.5">
            Leads submitted through &ldquo;Start a Project&rdquo; and the studio Contact page appear here like WooCommerce orders.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(['all', 'new', 'reviewed', 'consultation', 'completed', 'archived'] as const).map(
            (statusKey) => {
              const count =
                statusKey === 'all'
                  ? enquiries.length
                  : enquiries.filter((e) => e.status === statusKey).length;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-2.5 py-1 border cursor-pointer transition-colors ${
                    statusFilter === statusKey
                      ? 'bg-[#7F54B3] text-white border-[#7F54B3] font-medium'
                      : 'bg-white text-[#50575E] border-[#C3C4C7] hover:border-[#7F54B3]'
                  }`}
                >
                  {statusKey === 'all' ? 'All' : STATUS_META[statusKey].label}{' '}
                  <span className="font-mono tabular-nums opacity-85">({count})</span>
                </button>
              );
            }
          )}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#646970] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search client, phone, or #SM..."
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none w-60"
          />
        </div>
      </div>

      {/* WooCommerce-Style Orders Table + Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className={selected ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <div className="bg-white border border-[#C3C4C7] overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="py-14 px-6 text-center space-y-2">
                <MessageSquare className="w-7 h-7 text-[#8C8F94] mx-auto" />
                <p className="text-sm font-medium text-[#1D2327]">No project enquiries yet</p>
                <p className="text-xs text-[#646970] max-w-md mx-auto">
                  When visitors submit the &ldquo;Start a Project&rdquo; popup or Contact form, their project briefs and contact details will be logged here automatically.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F6F7F7] border-b border-[#C3C4C7] text-[#1D2327] font-semibold">
                    <th className="py-2.5 px-3">Enquiry</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Scope / Service</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F0F1]">
                  {filtered.map((item) => {
                    const meta = STATUS_META[item.status] || STATUS_META.new;
                    const isSelected = selectedId === item.id;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#F6F7F7] transition-colors ${
                          isSelected ? 'bg-[#F0F6FC]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleOpenInspector(item)}
                            className="font-semibold text-[#2271B1] hover:underline text-left cursor-pointer"
                          >
                            <span className="font-mono tabular-nums">{item.orderNumber}</span>{' '}
                            {item.name}
                          </button>
                          <div className="text-[11px] text-[#646970] font-mono tabular-nums">
                            {item.phone}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#50575E] font-mono tabular-nums whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 border text-[11px] font-medium ${meta.bg} ${meta.text} ${meta.border}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#1D2327] max-w-[180px] truncate">
                          {item.projectType}
                        </td>
                        <td className="py-2.5 px-3 text-[#50575E]">
                          {item.location || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenInspector(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 border border-[#C3C4C7] bg-white hover:border-[#2271B1] text-[#2271B1] cursor-pointer mr-1"
                            title="Inspect Enquiry"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          {confirmDeleteId === item.id ? (
                            <button
                              type="button"
                              onClick={async () => {
                                await onDeleteEnquiry(item.id);
                                setConfirmDeleteId(null);
                                if (selectedId === item.id) setSelectedId(null);
                              }}
                              className="px-2 py-1 bg-[#D63638] text-white text-[11px] cursor-pointer"
                            >
                              Confirm
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1 text-[#B32D2E] hover:bg-[#FCF0F1] cursor-pointer"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* WooCommerce Order Details Inspector */}
        {selected && (
          <div className="lg:col-span-5 bg-white border border-[#C3C4C7]">
            <div className="px-4 py-3 border-b border-[#C3C4C7] bg-[#F6F7F7] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#1D2327]">
                  Enquiry <span className="font-mono">{selected.orderNumber}</span> details
                </h2>
                <p className="text-[11px] text-[#646970] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(selected.createdAt).toLocaleString()}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="p-1 text-[#646970] hover:text-[#1D2327] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1D2327] mb-1">
                  Enquiry Status
                </label>
                <select
                  value={selected.status}
                  disabled={savingId === selected.id}
                  onChange={(e) =>
                    handleStatusChange(selected.id, e.target.value as EnquiryStatus)
                  }
                  className="w-full px-2.5 py-1.5 border border-[#8C8F94] bg-white focus:border-[#2271B1] focus:outline-none"
                >
                  <option value="new">New Enquiry</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="consultation">In Consultation</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#F6F7F7] border border-[#DCDCDE]">
                <div>
                  <span className="text-[11px] text-[#646970] block">Client Name</span>
                  <span className="font-semibold text-[#1D2327]">{selected.name}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#646970] block">Phone / WhatsApp</span>
                  <span className="font-mono text-[#1D2327] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#2271B1]" /> {selected.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#646970] block">Email</span>
                  <span className="text-[#1D2327] flex items-center gap-1 break-all">
                    <Mail className="w-3 h-3 text-[#2271B1] shrink-0" />{' '}
                    {selected.email || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#646970] block">Location</span>
                  <span className="text-[#1D2327]">{selected.location || '—'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#646970] block">Scope</span>
                  <span className="font-medium text-[#7F54B3]">{selected.projectType}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#646970] block">Area / Budget / Timeline</span>
                  <span className="text-[#1D2327]">
                    {[selected.approxArea, selected.budget, selected.timeline]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-[#1D2327] block mb-1">Client Brief</span>
                <div className="p-3 bg-[#FAF9F7] border border-[#DCDCDE] text-[#1D2327] whitespace-pre-wrap leading-relaxed">
                  {selected.brief || 'No extra notes provided.'}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#DCDCDE]">
                <label className="block font-semibold text-[#1D2327]">
                  Private Studio Notes (Internal)
                </label>
                <textarea
                  rows={3}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Record site visit dates, quotation sent, Vastu observations..."
                  className="w-full px-2.5 py-2 border border-[#8C8F94] focus:border-[#2271B1] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={savingId === selected.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white font-medium cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{savingId === selected.id ? 'Saving...' : 'Save Studio Note'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
