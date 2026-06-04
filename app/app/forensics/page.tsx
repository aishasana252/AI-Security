'use client';

/**
 * APEXLyn Lens — Forensic Workspace Page
 * Screen ID: INV-FORENSIC-001
 * Route: /app/forensics
 * Source: UIUX Specification Section 15.3 – 15.7
 *
 * Per spec 15.7 — MANDATORY: Split-pane investigation layout
 * Left: Cases list | Right: Case detail
 *
 * Per spec 15.6 — Required modules:
 * Cases, Case Detail, Linked Event Traversal,
 * Evidence Timeline, Chain Verification, Legal Hold, Export
 */

import React, { useState } from 'react';
import {
  Scale, FolderSearch, Clock, Shield, Lock, FileCheck,
  ChevronRight, AlertTriangle, CheckCircle, XCircle,
  Link as LinkIcon, Hash, Download, Plus, Eye, ArrowUpRight, FileText,
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
    verificationState: 'partial',
    chainStatus: 'verified',
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
    verificationState: 'complete',
    chainStatus: 'verified',
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
    verificationState: 'not-started',
    chainStatus: 'unverified',
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
    verificationState: 'complete',
    chainStatus: 'verified',
  },
];

const CASE_EVENTS = [
  { id: 'evt-8a3c1f', timestamp: '2026-06-04T22:31:07Z', user: 'pseudo-82a1', action: 'Blocked', severity: 'critical', dataClass: 'Source Code', tool: 'ChatGPT', chainRef: 'chain-001-a', holdState: true },
  { id: 'evt-3b7d2e', timestamp: '2026-06-04T22:15:44Z', user: 'pseudo-3f7c', action: 'Blocked', severity: 'critical', dataClass: 'PII — Tax File Number', tool: 'Gemini', chainRef: 'chain-001-b', holdState: true },
  { id: 'evt-9c4e5a', timestamp: '2026-06-03T21:48:22Z', user: 'pseudo-b92e', action: 'Warned', severity: 'high', dataClass: 'Internal Financial Data', tool: 'Claude', chainRef: 'chain-001-c', holdState: false },
];

function CaseStatusChip({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    'open':         { cls: 'chip-critical', label: 'Open' },
    'under-review': { cls: 'chip-medium',   label: 'Under Review' },
    'closed':       { cls: 'chip-low',      label: 'Closed' },
    'escalated':    { cls: 'chip-high',     label: 'Escalated' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

function VerificationChip({ state }: { state: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    'complete':    { color: 'var(--color-text-success)', label: 'Verified' },
    'partial':     { color: 'var(--color-text-warning)', label: 'Partial' },
    'not-started': { color: 'var(--color-text-disabled)', label: 'Not started' },
  };
  const c = cfg[state] || cfg['not-started'];
  return <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: c.color }}>{c.label}</span>;
}

export default function ForensicWorkspacePage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(MOCK_CASES[0].id);
  const selectedCase = MOCK_CASES.find(c => c.id === selectedCaseId) || null;

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatShort = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Forensic Workspace</h1>
          <p className="page-subtitle">Investigation platform — cases, evidence, chain verification, legal hold, and export.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} />
            New case
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MANDATORY SPLIT-PANE LAYOUT (Spec 15.7)
          Left: Cases list | Right: Case detail
          ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>

        {/* ── LEFT PANE — Cases List ── */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--color-border-default)',
          background: 'var(--color-surface-primary)',
          overflow: 'hidden',
        }}>
          {/* Cases list header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ font: 'var(--type-label-md)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cases</div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{MOCK_CASES.length} total · {MOCK_CASES.filter(c => c.status === 'open').length} open</div>
            </div>
            <Link href="/app/cases" style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              All cases <ChevronRight size={11} />
            </Link>
          </div>

          {/* Cases scroll list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {MOCK_CASES.map(c => {
              const isSelected = c.id === selectedCaseId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--color-border-default)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--color-surface-selected)' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--color-action-primary-bg)' : '3px solid transparent',
                    transition: 'background 100ms ease',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1, lineHeight: 1.4 }}>{c.title}</div>
                    <CaseStatusChip status={c.status} />
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <span className={`chip chip-${c.severity}`} style={{ textTransform: 'capitalize' }}>{c.severity}</span>
                    <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <LinkIcon size={10} /> {c.eventsLinked} events
                    </span>
                    {c.holdState === 'active' && (
                      <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: 'var(--status-held-text)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Lock size={10} /> Hold active
                      </span>
                    )}
                  </div>
                  <div style={{ marginTop: 6, font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                    {c.id} · Updated {formatShort(c.lastUpdated)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANE — Case Detail ── */}
        {selectedCase ? (
          <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--color-surface-app)' }}>
            {/* Case header */}
            <div style={{ background: 'var(--color-surface-primary)', padding: '16px 20px', borderBottom: '1px solid var(--color-border-default)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <CaseStatusChip status={selectedCase.status} />
                    <span className={`chip chip-${selectedCase.severity}`}>{selectedCase.severity}</span>
                    {selectedCase.holdState === 'active' && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: 'var(--type-caption)', fontWeight: 600, color: 'var(--status-held-text)', background: 'var(--status-held-bg)', padding: '1px 8px', borderRadius: 99, border: '1px solid #DDD6FE' }}>
                        <Lock size={10} /> Hold Active
                      </span>
                    )}
                  </div>
                  <h2 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)', marginBottom: 4 }}>{selectedCase.title}</h2>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{selectedCase.id}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><FileText size={12} /> Add note</button>
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Download size={12} /> Export case</button>
                </div>
              </div>
              {/* Case meta row */}
              <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border-default)', flexWrap: 'wrap' }}>
                {[
                  { label: 'Investigator', value: selectedCase.investigator },
                  { label: 'Events linked', value: String(selectedCase.eventsLinked) },
                  { label: 'Case notes', value: String(selectedCase.notes) },
                  { label: 'Created', value: formatShort(selectedCase.created) },
                  { label: 'Last updated', value: formatShort(selectedCase.lastUpdated) },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case content panels */}
            <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Linked Events (Spec 15.6 — Linked Event Traversal) */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Linked Events ({selectedCase.eventsLinked})</h3>
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={11} /> Link event</button>
                </div>
                {CASE_EVENTS.slice(0, selectedCase.eventsLinked).map((evt, i) => (
                  <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: i < Math.min(CASE_EVENTS.length, selectedCase.eventsLinked) - 1 ? '1px solid var(--color-border-default)' : 'none' }}>
                    <span className={`chip chip-${evt.severity}`} style={{ flexShrink: 0 }}>{evt.action}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ font: 'var(--type-body-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{evt.dataClass} — {evt.tool}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>{evt.id} · {evt.user}</div>
                    </div>
                    {evt.holdState && <Lock size={12} style={{ color: 'var(--status-held-text)', flexShrink: 0 }} />}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', flexShrink: 0 }}>Chain: {evt.chainRef}</div>
                    <Link href={`/app/events/${evt.id}`} style={{ color: 'var(--color-text-link)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Chain Verification + Legal Hold — side by side (Spec 15.6) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                {/* Chain Verification */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Shield size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                    <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Chain Verification</h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: selectedCase.chainStatus === 'verified' ? 'var(--color-state-success-bg)' : 'var(--color-state-warning-bg)', border: `1px solid ${selectedCase.chainStatus === 'verified' ? 'var(--color-state-success-border)' : 'var(--color-state-warning-border)'}`, borderRadius: 'var(--radius-md)' }}>
                    {selectedCase.chainStatus === 'verified'
                      ? <CheckCircle size={14} style={{ color: 'var(--color-state-success-icon)' }} />
                      : <AlertTriangle size={14} style={{ color: 'var(--color-state-warning-icon)' }} />
                    }
                    <span style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: selectedCase.chainStatus === 'verified' ? 'var(--color-state-success-text)' : 'var(--color-state-warning-text)' }}>
                      {selectedCase.chainStatus === 'verified' ? 'Evidence chain verified' : 'Verification incomplete'}
                    </span>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <VerificationChip state={selectedCase.verificationState} />
                  </div>
                  <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={11} /> View chain</button>
                    <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Shield size={11} /> Request verification</button>
                  </div>
                </div>

                {/* Legal Hold (Spec 15.6) */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Lock size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                    <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Legal Hold</h3>
                  </div>
                  {selectedCase.holdState === 'active' ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--status-held-bg)', border: '1px solid #DDD6FE', borderRadius: 'var(--radius-md)' }}>
                        <Lock size={14} style={{ color: 'var(--status-held-text)' }} />
                        <span style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--status-held-text)' }}>Legal hold active</span>
                      </div>
                      <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                        All linked events are under hold. Evidence deletion is blocked.
                      </p>
                      <button className="btn btn-destructive btn-sm" style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <XCircle size={11} /> Release hold
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginBottom: 10 }}>
                        No legal hold applied to this case.
                        {selectedCase.holdState === 'released' && ' (Previously held and released.)'}
                      </div>
                      <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={11} /> Apply hold
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state" style={{ flex: 1 }}>
            <FolderSearch size={40} style={{ color: 'var(--color-text-disabled)' }} />
            <div className="empty-state-title">Select a case</div>
            <div className="empty-state-description">Choose a case from the list to view its evidence, linked events, verification state, and hold status.</div>
          </div>
        )}
      </div>
    </div>
  );
}
