'use client';

/**
 * APEXLyn Lens — Support Access History Ledger
 * Screen ID: ADM-JIT-AUDIT-001
 * Route: /app/support-access-history
 * Source: UIUX Specification Section 20 (Support Access History)
 *
 * Implements a customer-visible ledger of all Just-in-Time support session requests,
 * reasons, active durations, and expiration timestamps.
 */

import React, { useState } from 'react';
import {
  Radio, Search, Filter, ChevronDown, RefreshCw,
  Clock, Lock, CheckCircle, AlertTriangle, ArrowUpRight,
  Eye, Shield, User,
} from 'lucide-react';

const MOCK_JIT_LOGS = [
  { id: 'jit-sys-887', actor: 'apexlyn-staff-mj', role: 'Support Tier-3', reason: 'Troubleshooting AWS S3 connection validation failure (con-004).', startTime: '2026-06-04T18:15:00Z', endTime: '2026-06-04T19:15:00Z', duration: '1 hour', status: 'expired' },
  { id: 'jit-sys-821', actor: 'apexlyn-staff-pk', role: 'Solutions Engineer', reason: 'Assisting with APRA CPS 234 gap visibility compliance mappings.', startTime: '2026-05-15T09:00:00Z', endTime: '2026-05-15T13:00:00Z', duration: '4 hours', status: 'expired' },
];

function SessionStatusChip({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    active: 'chip-critical', // Serious!
    expired: 'chip-low',
  };
  const labels: Record<string, string> = {
    active: 'Session Active',
    expired: 'Expired',
  };
  return <span className={`chip ${cfg[status] || 'chip-info'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock size={9} />{labels[status] || status}</span>;
}

export default function SupportAccessHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_JIT_LOGS.filter(log => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.actor.toLowerCase().includes(q) || log.reason.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Support Access Ledger</h1>
          <p className="page-subtitle">Elevated access logs — customer-visible trace registry of all Just-In-Time support sessions requested by APEXLyn staff.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => alert('Support ledger integrity signature verified: ECDSA-256.')}>
            <Radio size={13} />
            Verify ledger signature
          </button>
        </div>
      </div>

      {/* ── INFO STRIP ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '12px var(--page-padding)',
      }}>
        <div style={{
          display: 'flex', gap: 10, padding: 12,
          background: 'var(--color-state-info-bg)', border: '1px solid var(--color-state-info-border)',
          borderRadius: 'var(--radius-lg)', alignItems: 'center'
        }}>
          <Shield size={18} style={{ color: 'var(--color-state-info-icon)', flexShrink: 0 }} />
          <div>
            <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-state-info-text)' }}>No standing access model enforced</div>
            <div style={{ font: 'var(--type-caption)', color: 'var(--color-state-info-text)', opacity: 0.8, marginTop: 2 }}>
              APEXLyn staff have no standing login access to this tenant database or environment. Access is granted on-demand via customer-visible JIT requests only, which expire automatically.
            </div>
          </div>
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
              placeholder="Search support actor or reason..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
            {filtered.length} total support sessions audited
          </span>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
          
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 140px 140px 100px 140px 140px 1fr',
            padding: '0 24px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['Request Ref', 'Session Status', 'Support Actor', 'Role Scope', 'Grant Start', 'Grant Expiry', 'Approved Access Justification Reason'].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map(log => (
            <div
              key={log.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 140px 140px 100px 140px 140px 1fr',
                padding: '0 24px', minHeight: 64, gap: 8,
                background: 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{log.id}</div>
              <div><SessionStatusChip status={log.status} /></div>
              <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{log.actor}</div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{log.role}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(log.startTime)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(log.endTime)}</div>
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', paddingRight: 8, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }} title={log.reason}>{log.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
