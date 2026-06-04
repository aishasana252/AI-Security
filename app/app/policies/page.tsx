'use client';

/**
 * APEXLyn Lens — DLP Policies Page
 * Screen ID: GOV-POLICIES-001
 * Route: /app/policies
 * Source: UIUX Specification Section 16.5 – 16.11
 *
 * Required (per spec 16.8): Table columns:
 * policy set ID, policy set name, active/inactive state,
 * current version, source, industry pack/template source,
 * approval state, last updated by, last updated at,
 * rollback availability, preview/test availability, distribution state
 *
 * Spec 16.11: Must visibly distinguish:
 * active / draft / pending approval / approved-not-active /
 * rollback candidate / template-sourced / customer-created
 */

import React, { useState } from 'react';
import {
  Shield, Plus, Filter, Search, ChevronDown, RefreshCw,
  ChevronRight, Eye, GitBranch, RotateCcw, CheckCircle,
  Clock, AlertTriangle, Lock, FileText, Layers,
  ArrowUpRight, Cpu, X,
} from 'lucide-react';
import Link from 'next/link';

/* ── Mock Policy Sets ── */
const MOCK_POLICIES = [
  {
    id: 'ps-corp-dlp-001',
    name: 'Corporate Data Governance Policy',
    state: 'active',
    version: '14',
    source: 'client-authored',
    templateSource: null,
    approvalState: 'approved',
    lastUpdatedBy: 'pseudo-admin-ar',
    lastUpdatedAt: '2026-05-28T14:22:00Z',
    rollbackAvailable: true,
    previewAvailable: true,
    distributionState: 'complete',
    ruleCount: 34,
    enforcementMode: 'Block + Warn',
  },
  {
    id: 'ps-apra-cps234',
    name: 'APRA CPS 234 Compliance Policy',
    state: 'active',
    version: '7',
    source: 'industry-pack',
    templateSource: 'APRA CPS 234 Pack v2.3',
    approvalState: 'approved',
    lastUpdatedBy: 'pseudo-admin-ar',
    lastUpdatedAt: '2026-05-15T09:14:00Z',
    rollbackAvailable: true,
    previewAvailable: true,
    distributionState: 'complete',
    ruleCount: 19,
    enforcementMode: 'Block + Audit',
  },
  {
    id: 'ps-ai-iac-draft',
    name: 'AI Injection & Adversarial Content Policy (Draft)',
    state: 'draft',
    version: '3-draft',
    source: 'client-authored',
    templateSource: null,
    approvalState: 'pending',
    lastUpdatedBy: 'pseudo-analyst-mb',
    lastUpdatedAt: '2026-06-03T17:45:00Z',
    rollbackAvailable: false,
    previewAvailable: true,
    distributionState: 'not-distributed',
    ruleCount: 11,
    enforcementMode: 'Audit only (draft)',
  },
  {
    id: 'ps-privacy-act',
    name: 'Australian Privacy Act Controls',
    state: 'approved-inactive',
    version: '5',
    source: 'platform-template',
    templateSource: 'APA 1988 Template Pack v1.1',
    approvalState: 'approved',
    lastUpdatedBy: 'system-template-engine',
    lastUpdatedAt: '2026-04-12T11:00:00Z',
    rollbackAvailable: false,
    previewAvailable: true,
    distributionState: 'not-distributed',
    ruleCount: 22,
    enforcementMode: 'Block',
  },
  {
    id: 'ps-shadow-ai-gov',
    name: 'Shadow AI Tool Governance Policy',
    state: 'active',
    version: '2',
    source: 'cloned',
    templateSource: 'Cloned from ps-corp-dlp-001 v12',
    approvalState: 'approved',
    lastUpdatedBy: 'pseudo-admin-ar',
    lastUpdatedAt: '2026-05-01T08:30:00Z',
    rollbackAvailable: true,
    previewAvailable: true,
    distributionState: 'in-progress',
    ruleCount: 8,
    enforcementMode: 'Warn + Audit',
  },
];

/* ── State Chip ── */
function PolicyStateChip({ state }: { state: string }) {
  const cfg: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    'active':           { cls: 'chip-active',   label: 'Active',           icon: <CheckCircle size={10} /> },
    'draft':            { cls: 'chip-pending',  label: 'Draft',            icon: <FileText size={10} /> },
    'pending':          { cls: 'chip-medium',   label: 'Pending Approval', icon: <Clock size={10} /> },
    'approved-inactive':{ cls: 'chip-info',     label: 'Approved — Inactive', icon: <CheckCircle size={10} /> },
    'rollback-candidate':{ cls: 'chip-medium',  label: 'Rollback Candidate', icon: <RotateCcw size={10} /> },
    'blocked':          { cls: 'chip-critical', label: 'Blocked',          icon: <AlertTriangle size={10} /> },
  };
  const c = cfg[state] || { cls: 'chip-info', label: state, icon: null };
  return <span className={`chip ${c.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{c.icon}{c.label}</span>;
}

function ApprovalChip({ state }: { state: string }) {
  const cfg: Record<string, { color: string; label: string }> = {
    approved: { color: 'var(--color-text-success)', label: 'Approved' },
    pending:  { color: 'var(--color-text-warning)',  label: 'Pending Review' },
    rejected: { color: 'var(--color-text-critical)', label: 'Rejected' },
    none:     { color: 'var(--color-text-disabled)', label: '—' },
  };
  const c = cfg[state] || cfg.none;
  return <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: c.color }}>{c.label}</span>;
}

function SourceBadge({ source, templateSource }: { source: string; templateSource: string | null }) {
  const cfg: Record<string, { color: string; label: string }> = {
    'client-authored':   { color: 'var(--color-text-info)', label: 'Client-authored' },
    'platform-template': { color: 'var(--color-accent-ai-text)', label: 'Platform template' },
    'industry-pack':     { color: '#6B21A8', label: 'Industry pack' },
    'cloned':            { color: 'var(--color-text-tertiary)', label: 'Cloned' },
  };
  const c = cfg[source] || { color: 'var(--color-text-tertiary)', label: source };
  return (
    <div>
      <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: c.color }}>{c.label}</span>
      {templateSource && (
        <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 1, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={templateSource}>
          {templateSource}
        </div>
      )}
    </div>
  );
}

function DistributionBadge({ state }: { state: string }) {
  const cfg: Record<string, { color: string; bg: string; label: string }> = {
    'complete':         { color: 'var(--color-text-success)', bg: 'var(--color-state-success-bg)', label: 'Distributed' },
    'in-progress':      { color: 'var(--color-text-warning)', bg: 'var(--color-state-warning-bg)', label: 'Propagating...' },
    'not-distributed':  { color: 'var(--color-text-disabled)', bg: 'var(--color-surface-tertiary)', label: 'Not distributed' },
    'failed':           { color: 'var(--color-text-critical)', bg: 'var(--color-state-critical-bg)', label: 'Failed' },
  };
  const c = cfg[state] || cfg['not-distributed'];
  return (
    <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: c.color, background: c.bg, padding: '1px 7px', borderRadius: 99, display: 'inline-block' }}>
      {c.label}
    </span>
  );
}

const FILTER_STATES = ['All', 'Active', 'Draft', 'Pending Approval', 'Approved — Inactive'];
const FILTER_SOURCES = ['All', 'Client-authored', 'Platform template', 'Industry pack', 'Cloned'];

export default function PoliciesPage() {
  const [filterState, setFilterState] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRollbackOnly, setShowRollbackOnly] = useState(false);
  const [showAdvFilters, setShowAdvFilters] = useState(false);

  // Policy state summary for strip
  const stateCount = {
    active: MOCK_POLICIES.filter(p => p.state === 'active').length,
    draft: MOCK_POLICIES.filter(p => p.state === 'draft').length,
    pending: MOCK_POLICIES.filter(p => p.approvalState === 'pending').length,
    rollback: MOCK_POLICIES.filter(p => p.rollbackAvailable).length,
  };

  const filtered = MOCK_POLICIES.filter(p => {
    if (filterState !== 'All') {
      const stateMap: Record<string, string> = { 'Active': 'active', 'Draft': 'draft', 'Pending Approval': 'draft', 'Approved — Inactive': 'approved-inactive' };
      if (p.state !== stateMap[filterState]) return false;
    }
    if (filterSource !== 'All') {
      const srcMap: Record<string, string> = { 'Client-authored': 'client-authored', 'Platform template': 'platform-template', 'Industry pack': 'industry-pack', 'Cloned': 'cloned' };
      if (p.source !== srcMap[filterSource]) return false;
    }
    if (showRollbackOnly && !p.rollbackAvailable) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">DLP Policies</h1>
          <p className="page-subtitle">Governance entry surface — active policies, drafts, approvals, version history, and rollback.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={13} />
            Approvals queue
            {stateCount.pending > 0 && (
              <span style={{ background: 'var(--severity-high-text)', color: '#fff', borderRadius: 99, width: 16, height: 16, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stateCount.pending}
              </span>
            )}
          </button>
          <Link href="/app/policies/builder" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <Plus size={14} />
            New policy
          </Link>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          POLICY STATE SUMMARY STRIP (Spec 16.7)
          Shows active/draft/pending overview at a glance
          ══════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '10px var(--page-padding)',
        display: 'flex', gap: 0,
      }}>
        {[
          { label: 'Active', count: stateCount.active, color: 'var(--color-state-success-icon)', bg: 'var(--color-state-success-bg)', border: 'var(--color-state-success-border)' },
          { label: 'Draft',  count: stateCount.draft,  color: 'var(--color-text-tertiary)',       bg: 'var(--color-surface-tertiary)', border: 'var(--color-border-default)' },
          { label: 'Pending Approval', count: stateCount.pending, color: 'var(--color-state-warning-icon)', bg: 'var(--color-state-warning-bg)', border: 'var(--color-state-warning-border)' },
          { label: 'Rollback Available', count: stateCount.rollback, color: 'var(--color-text-secondary)', bg: 'var(--color-surface-secondary)', border: 'var(--color-border-default)' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '6px 16px',
            borderRight: i < 3 ? '1px solid var(--color-border-default)' : 'none',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: s.bg, border: `1px solid ${s.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: s.color,
            }}>
              {s.count}
            </div>
            <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── FILTER STRIP ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '10px var(--page-padding)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '0 0 250px' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or ID..." className="input" style={{ paddingLeft: 30, height: 34 }} />
          </div>
          {[
            { label: 'State', options: FILTER_STATES, value: filterState, setter: setFilterState },
            { label: 'Source', options: FILTER_SOURCES, value: filterSource, setter: setFilterSource },
          ].map(f => (
            <div key={f.label} style={{ position: 'relative' }}>
              <select value={f.value} onChange={e => f.setter(e.target.value)} style={{ height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)', background: f.value !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)', cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 140 }}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
            </div>
          ))}
          <button onClick={() => setShowRollbackOnly(!showRollbackOnly)} style={{ height: 34, display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', border: `1px solid ${showRollbackOnly ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`, borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: showRollbackOnly ? 'var(--color-action-primary-bg)' : 'var(--color-text-secondary)', background: showRollbackOnly ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)', cursor: 'pointer' }}>
            <RotateCcw size={12} /> Rollback available
          </button>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>{filtered.length} policies</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          POLICIES TABLE (Spec 16.7 + 16.8)
          All required columns: ID, name, state, version,
          source, approval, last-updated, rollback,
          preview, distribution
          ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1100 }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 1fr 130px 80px 180px 120px 100px 90px 90px 100px 36px',
            padding: '0 16px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['Policy ID', 'Policy Name', 'State', 'Version', 'Source', 'Approval', 'Last Updated', 'Rollback', 'Preview', 'Distribution', ''].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((policy, i) => (
            <div
              key={policy.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 130px 80px 180px 120px 100px 90px 90px 100px 36px',
                padding: '0 16px', minHeight: 52, gap: 8,
                background: 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
            >
              {/* Policy ID */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={policy.id}>{policy.id}</div>
              {/* Name + rule count */}
              <div>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 1 }}>{policy.name}</div>
                <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{policy.ruleCount} rules · {policy.enforcementMode}</div>
              </div>
              {/* State */}
              <PolicyStateChip state={policy.state} />
              {/* Version */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)' }}>v{policy.version}</div>
              {/* Source */}
              <SourceBadge source={policy.source} templateSource={policy.templateSource} />
              {/* Approval */}
              <ApprovalChip state={policy.approvalState} />
              {/* Last Updated */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(policy.lastUpdatedAt)}</div>
                <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 1 }}>{policy.lastUpdatedBy}</div>
              </div>
              {/* Rollback */}
              {policy.rollbackAvailable
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, font: 'var(--type-caption)', fontWeight: 600, color: 'var(--color-text-secondary)' }}><RotateCcw size={10} />Available</span>
                : <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)' }}>—</span>
              }
              {/* Preview */}
              {policy.previewAvailable
                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, font: 'var(--type-caption)', fontWeight: 600, color: 'var(--color-state-info-text)' }}><Eye size={10} />Available</span>
                : <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)' }}>—</span>
              }
              {/* Distribution */}
              <DistributionBadge state={policy.distributionState} />
              {/* Jump to detail */}
              <Link href={`/app/policies/${policy.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)', padding: 4 }}>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── GOVERNANCE CONTEXT FOOTER ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderTop: '1px solid var(--color-border-default)',
        padding: '8px var(--page-padding)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
          {filtered.length} policy sets · Most-restrictive-wins enforcement model active
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/app/policies/approvals" style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            Approval workflow <ChevronRight size={11} />
          </Link>
          <Link href="/app/policies/risk-acceptance" style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
            Risk acceptance register <ChevronRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
