'use client';

/**
 * APEXLyn Lens — Legal Holds Directory
 * Screen ID: INV-HOLD-001
 * Route: /app/legal-hold
 * Source: UIUX Specification Section 15.6 (Legal Hold module)
 *
 * Implements legal holds tracking. A legal hold marks telemetry records and
 * data egress logs as immutable, preventing retention expiration deletion.
 */

import React, { useState } from 'react';
import {
  Lock, Plus, Search, Filter, ChevronDown, RefreshCw,
  Scale, Clock, AlertTriangle, CheckCircle, Trash2, XCircle,
  Eye, HelpCircle,
} from 'lucide-react';

const MOCK_HOLDS = [
  {
    id: 'hld-corp-001',
    caseId: 'case-au-001',
    caseTitle: 'Source code exfiltration — Engineering division',
    reason: 'Suspicion of proprietary code repository uploads. Retained for forensic audit.',
    scope: '7 event records + raw payloads',
    appliedBy: 'pseudo-admin-ar',
    appliedAt: '2026-06-02T09:15:00Z',
    status: 'active',
  },
  {
    id: 'hld-apra-002',
    caseId: 'case-au-002',
    caseTitle: 'PII disclosure risk — Finance team AI use',
    reason: 'Mandatory APRA CPS 234 disclosure evaluation regarding customer account leaks.',
    scope: '4 event records + user profiles',
    appliedBy: 'pseudo-analyst-mb',
    appliedAt: '2026-05-30T15:00:00Z',
    status: 'active',
  },
  {
    id: 'hld-rel-003',
    caseId: 'case-au-004',
    caseTitle: 'Suspected data staging — Copilot M365',
    reason: 'Verification completed. Audit cleared of malicious data staging intent.',
    scope: '3 event records + gateway logs',
    appliedBy: 'pseudo-admin-ar',
    appliedAt: '2026-05-20T11:00:00Z',
    status: 'released',
  },
];

function HoldStatusChip({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    active:   { cls: 'chip-critical', label: 'Hold Active' },
    released: { cls: 'chip-low',      label: 'Released' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Lock size={9} />{c.label}</span>;
}

export default function LegalHoldPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [holds, setHolds] = useState(MOCK_HOLDS);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedHoldId, setSelectedHoldId] = useState<string | null>(null);
  const [releaseJustification, setReleaseJustification] = useState('');

  const filtered = holds.filter(h => {
    if (statusFilter !== 'All' && h.status !== statusFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return h.id.toLowerCase().includes(q) || h.caseTitle.toLowerCase().includes(q) || h.reason.toLowerCase().includes(q);
    }
    return true;
  });

  const handleReleaseTrigger = (id: string) => {
    setSelectedHoldId(id);
    setReleaseJustification('');
    setShowReleaseModal(true);
  };

  const handleReleaseConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHoldId || !releaseJustification.trim()) return;

    setHolds(prev => prev.map(h => {
      if (h.id === selectedHoldId) {
        return {
          ...h,
          status: 'released',
          reason: h.reason + ` [Released: ${releaseJustification}]`,
        };
      }
      return h;
    }));

    setShowReleaseModal(false);
    setSelectedHoldId(null);
    alert('Legal hold released successfully. Retention cycles will now resume according to default policies.');
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Legal Holds</h1>
          <p className="page-subtitle">Statutory governance directory — apply and monitor time-bounded holds to secure critical evidence streams.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── FILTER STRIP ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '10px var(--page-padding)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', flex: '0 0 240px' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hold ID, case, or reason..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: statusFilter !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 140
              }}
            >
              <option>All</option>
              <option>Active</option>
              <option>Released</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
            {holds.filter(h => h.status === 'active').length} active holds
          </span>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
          
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 240px 140px 1fr 120px 120px 120px',
            padding: '0 24px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['Hold ID', 'Case Title', 'Scope', 'Justification / Reason', 'Applied By', 'Applied Date', 'Actions'].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 240px 140px 1fr 120px 120px 120px',
                padding: '0 24px', minHeight: 64, gap: 8,
                background: 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
            >
              {/* ID + Status */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{item.id}</div>
                <div style={{ marginTop: 4 }}><HoldStatusChip status={item.status} /></div>
              </div>
              {/* Case */}
              <div>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caseTitle}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{item.caseId}</div>
              </div>
              {/* Scope */}
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.scope}</div>
              {/* Reason */}
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={item.reason}>{item.reason}</div>
              {/* Applied By */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.appliedBy}</div>
              {/* Applied Date */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(item.appliedAt)}</div>
              {/* Actions */}
              <div>
                {item.status === 'active' ? (
                  <button
                    onClick={() => handleReleaseTrigger(item.id)}
                    className="btn btn-destructive btn-sm"
                    style={{ fontSize: 11, height: 28, padding: '0 8px' }}
                  >
                    Release Hold
                  </button>
                ) : (
                  <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)' }}>Released</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RELEASE CONFIRMATION MODAL ── */}
      {showReleaseModal && (
        <div className="modal-overlay" onClick={() => setShowReleaseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--color-state-warning-bg)',
                border: '1px solid var(--color-state-warning-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <AlertTriangle size={18} style={{ color: 'var(--color-state-warning-icon)' }} />
              </div>
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)' }}>Confirm Legal Hold Release</h3>
                <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>High consequence action — records will resume default retention schedules.</p>
              </div>
            </div>
            
            <form onSubmit={handleReleaseConfirm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', font: 'var(--type-label-md)', marginBottom: 6 }}>Release Justification Reason <span style={{ color: 'var(--color-text-critical)' }}>*</span></label>
                <textarea
                  required
                  rows={3}
                  value={releaseJustification}
                  onChange={e => setReleaseJustification(e.target.value)}
                  placeholder="Detail the case review findings or statutory clearance authority..."
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                    font: 'var(--type-body-sm)', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowReleaseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-destructive btn-sm">Release Evidence</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(11, 19, 32, 0.56);
          display: flex; alignItems: center; justifyContent: center; z-index: 1000;
        }
        .modal {
          background: var(--color-surface-primary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: 24px; width: 100%; maxWidth: 460px;
          box-shadow: var(--elevation-3);
        }
      `}</style>
    </div>
  );
}
