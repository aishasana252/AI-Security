'use client';

/**
 * APEXLyn Lens — Forensic Cases Registry
 * Screen ID: INV-CASES-001
 * Route: /app/cases
 * Source: UIUX Specification Section 15.6 (Cases module)
 *
 * Implements a card-based and table-based registry of investigation cases.
 * Links directly to /app/forensics for active workspace operations.
 */

import React, { useState } from 'react';
import {
  Scale, Plus, Search, Filter, ChevronDown, RefreshCw,
  FolderSearch, Clock, Lock, ArrowUpRight, CheckCircle,
  AlertTriangle, Users, BookOpen,
} from 'lucide-react';
import Link from 'next/link';

const MOCK_CASES = [
  {
    id: 'case-au-001',
    title: 'Source code exfiltration — Engineering division',
    status: 'open',
    severity: 'critical',
    investigator: 'pseudo-inv-ar',
    eventsLinked: 7,
    holdState: 'active',
    created: '2026-06-02T09:00:00Z',
    lastUpdated: '2026-06-04T21:15:00Z',
    notes: 3,
    description: 'Suspiciously large prompt payloads containing corporate cryptography module signatures uploaded to OpenAI endpoints.'
  },
  {
    id: 'case-au-002',
    title: 'PII disclosure risk — Finance team AI use',
    status: 'under-review',
    severity: 'high',
    investigator: 'pseudo-inv-mb',
    eventsLinked: 4,
    holdState: 'none',
    created: '2026-05-30T14:30:00Z',
    lastUpdated: '2026-06-03T10:22:00Z',
    notes: 1,
    description: 'Repeated warnings triggered by users copy-pasting Australian Tax File Numbers into Gemini and Notion AI.'
  },
  {
    id: 'case-au-003',
    title: 'Injection prompt pattern review — Legal AI',
    status: 'open',
    severity: 'medium',
    investigator: 'pseudo-inv-ar',
    eventsLinked: 2,
    holdState: 'none',
    created: '2026-06-01T16:00:00Z',
    lastUpdated: '2026-06-02T09:30:00Z',
    notes: 0,
    description: 'External prompt injection patterns detected during outbound research session in Perplexity AI.'
  },
  {
    id: 'case-au-004',
    title: 'Suspected data staging — Copilot M365',
    status: 'closed',
    severity: 'low',
    investigator: 'pseudo-inv-mb',
    eventsLinked: 3,
    holdState: 'released',
    created: '2026-05-20T11:00:00Z',
    lastUpdated: '2026-05-28T16:00:00Z',
    notes: 5,
    description: 'Verification of high-volume local documents staging prior to Copilot indexing. Cleared of malicious intent.'
  },
];

function CaseStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    'open':         { cls: 'chip-critical', label: 'Open' },
    'under-review': { cls: 'chip-medium',   label: 'Under Review' },
    'closed':       { cls: 'chip-low',      label: 'Closed' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  const filtered = MOCK_CASES.filter(c => {
    if (severityFilter !== 'All' && c.severity !== severityFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.investigator.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Cases Register</h1>
          <p className="page-subtitle">Central case registry for ongoing data exfiltration audits, legal hold, and evidentiary chains.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/app/forensics" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <FolderSearch size={13} />
            Forensic workspace
          </Link>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => alert('New forensic case instantiation requested.')}>
            <Plus size={14} /> New case
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
              placeholder="Search case title, ID, or owner..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: severityFilter !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 140
              }}
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
            {filtered.length} active investigations
          </span>
        </div>
      </div>

      {/* ── CASES GRID ── */}
      <div style={{ flex: 1, padding: 'var(--page-padding)', overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <CaseStatusBadge status={c.status} />
                  <span className={`chip chip-${c.severity}`} style={{ textTransform: 'capitalize' }}>{c.severity}</span>
                </div>
                <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{c.title}</h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>{c.id}</div>
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{c.description}</p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-default)', paddingTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
                    Investigator: <strong style={{ color: 'var(--color-text-secondary)' }}>{c.investigator}</strong>
                  </span>
                  <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
                    Linked Events: <strong style={{ color: 'var(--color-text-secondary)' }}>{c.eventsLinked}</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {c.holdState === 'active' && (
                      <span className="chip" style={{ background: 'var(--status-held-bg)', borderColor: '#DDD6FE', color: 'var(--status-held-text)', fontSize: 11 }}>
                        <Lock size={10} /> Hold
                      </span>
                    )}
                    <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                      <BookOpen size={11} /> {c.notes} Notes
                    </span>
                  </div>
                  <Link
                    href={`/app/forensics`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-link)',
                      textDecoration: 'none'
                    }}
                  >
                    Investigate <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
