'use client';

/**
 * APEXLyn Lens — Portal Audit Ledger
 * Screen ID: ADM-AUDIT-001
 * Route: /app/audit-history
 * Source: UIUX Specification Section 20 (Audit logs)
 *
 * Implements a tabular audit log listing administrative edits:
 * policy mutations, hold releases, integration setups, JIT authorizations.
 */

import React, { useState } from 'react';
import {
  History, Search, Filter, ChevronDown, RefreshCw,
  FileCheck, Shield, Clock, Eye, AlertTriangle, ArrowUpRight,
} from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  { id: 'aud-9912', timestamp: '2026-06-04T22:35:10Z', actor: 'pseudo-admin-ar', action: 'Export evidence', status: 'completed', target: 'exp-1d8f-04', ipAddress: '192.168.1.52', details: 'Evidence bundle assembled and compiled for case-au-001.' },
  { id: 'aud-9911', timestamp: '2026-06-04T21:15:30Z', actor: 'pseudo-inv-ar', action: 'Link event to case', status: 'completed', target: 'evt-3b7d2e', ipAddress: '192.168.1.52', details: 'Telemetry record linked to open forensic case-au-001.' },
  { id: 'aud-9910', timestamp: '2026-06-04T18:15:00Z', actor: 'system-agent', action: 'JIT session start', status: 'completed', target: 'jit-sys-887', ipAddress: '10.22.44.11', details: 'Just-in-time support access token granted for session debugging.' },
  { id: 'aud-9909', timestamp: '2026-06-03T17:45:00Z', actor: 'pseudo-analyst-mb', action: 'Create policy draft', status: 'completed', target: 'ps-ai-iac-draft', ipAddress: '192.168.1.84', details: 'Added draft rules mapping adversarial prompt injection detections.' },
  { id: 'aud-9908', timestamp: '2026-06-02T09:15:00Z', actor: 'pseudo-admin-ar', action: 'Apply legal hold', status: 'completed', target: 'hld-corp-001', ipAddress: '192.168.1.52', details: 'Locked evidence records mapping to case-au-001 exfiltration.' },
  { id: 'aud-9907', timestamp: '2026-06-01T10:30:00Z', actor: 'system-scheduler', action: 'Connector validation', status: 'failed', target: 'con-004', ipAddress: '10.22.44.1', details: 'AWS S3 evidence vault bucket validation failed due to invalid token.' },
];

function ActionStatusChip({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    completed: 'chip-active',
    failed:    'chip-critical',
  };
  return <span className={`chip ${cfg[status] || 'chip-info'}`} style={{ textTransform: 'capitalize' }}>{status}</span>;
}

export default function AuditHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filtered = MOCK_AUDIT_LOGS.filter(log => {
    if (actionFilter !== 'All' && !log.action.toLowerCase().includes(actionFilter.toLowerCase())) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return log.actor.toLowerCase().includes(q) || log.action.toLowerCase().includes(q) || log.details.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Audit Ledger History</h1>
          <p className="page-subtitle">Immutable logs — full trace tracking of policy modifications, user exclusions, and evidence access events.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => alert('Exporting signed audit manifest.')}>
            <History size={13} />
            Export ledger
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
              placeholder="Search actor, action, details..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: actionFilter !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 160
              }}
            >
              <option>All</option>
              <option>Export</option>
              <option>Policy</option>
              <option>Hold</option>
              <option>JIT</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
            {filtered.length} matching operations logged
          </span>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
          
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px 170px 140px 120px 130px 110px 1fr',
            padding: '0 24px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['Log ID', 'Timestamp (UTC)', 'Action Category', 'Actor Identity', 'Target ID', 'Status', 'Operation Details'].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map(log => (
            <div
              key={log.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 170px 140px 120px 130px 110px 1fr',
                padding: '0 24px', minHeight: 48, gap: 8,
                background: 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{log.id}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(log.timestamp)}</div>
              <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{log.action}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{log.actor}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{log.target}</div>
              <div><ActionStatusChip status={log.status} /></div>
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {log.details} <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>[{log.ipAddress}]</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
