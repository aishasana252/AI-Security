'use client';

/**
 * APEXLyn Lens — Events Page
 * Screen ID: OPS-EVENTS-001
 * Route: /app/events
 * Source: UIUX Specification Section 14.12 – 14.20
 *
 * Required (per spec 14.15): Table with ALL these columns:
 * timestamp, user, action, severity, data class, destination tool,
 * source layer, output event indicator, injection indicator,
 * policy result, case link state, hold interaction state
 *
 * Required (per spec 14.16): Filters:
 * time range, user, severity, action, data class, tool/destination,
 * source layer, output-only, injection, held, case-linked, degraded-mode
 */

import React, { useState } from 'react';
import {
  Search, Filter, ChevronDown, RefreshCw, Download,
  ArrowUpRight, FolderPlus, FileCheck, Lock, Shield,
  Clock, ChevronRight, ChevronLeft, Eye, X, AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

/* ── Mock events (spec-compliant columns) ── */
const MOCK_EVENTS = [
  {
    id: 'evt-8a3c1f',
    timestamp: '2026-06-04T22:31:07Z',
    user: 'pseudo-82a1',
    action: 'Blocked',
    severity: 'critical',
    dataClass: 'Source Code',
    destinationTool: 'ChatGPT',
    sourceLayer: 'Browser Ext',
    isOutput: true,
    isInjection: false,
    policyResult: 'Blocked',
    caseLinked: false,
    holdState: false,
    degradedMode: false,
  },
  {
    id: 'evt-3b7d2e',
    timestamp: '2026-06-04T22:15:44Z',
    user: 'pseudo-3f7c',
    action: 'Blocked',
    severity: 'critical',
    dataClass: 'PII — Tax File Number',
    destinationTool: 'Gemini',
    sourceLayer: 'Browser Ext',
    isOutput: true,
    isInjection: false,
    policyResult: 'Blocked',
    caseLinked: true,
    holdState: true,
    degradedMode: false,
  },
  {
    id: 'evt-9c4e5a',
    timestamp: '2026-06-04T21:48:22Z',
    user: 'pseudo-b92e',
    action: 'Warned',
    severity: 'high',
    dataClass: 'Internal Financial Data',
    destinationTool: 'Claude',
    sourceLayer: 'Agent',
    isOutput: false,
    isInjection: true,
    policyResult: 'Warned',
    caseLinked: false,
    holdState: false,
    degradedMode: false,
  },
  {
    id: 'evt-1d8f3b',
    timestamp: '2026-06-04T21:02:19Z',
    user: 'pseudo-c41a',
    action: 'Audited',
    severity: 'medium',
    dataClass: 'Customer PII',
    destinationTool: 'Copilot M365',
    sourceLayer: 'Gateway',
    isOutput: false,
    isInjection: false,
    policyResult: 'Audit',
    caseLinked: false,
    holdState: false,
    degradedMode: true,
  },
  {
    id: 'evt-5e2a7c',
    timestamp: '2026-06-04T20:55:03Z',
    user: 'pseudo-f88d',
    action: 'Allowed',
    severity: 'low',
    dataClass: 'Internal Memo',
    destinationTool: 'Notion AI',
    sourceLayer: 'Browser Ext',
    isOutput: false,
    isInjection: false,
    policyResult: 'Allowed',
    caseLinked: false,
    holdState: false,
    degradedMode: false,
  },
  {
    id: 'evt-7f6b9d',
    timestamp: '2026-06-04T20:33:47Z',
    user: 'pseudo-a34c',
    action: 'Blocked',
    severity: 'high',
    dataClass: 'Legal — Contract',
    destinationTool: 'Perplexity',
    sourceLayer: 'Browser Ext',
    isOutput: true,
    isInjection: false,
    policyResult: 'Blocked',
    caseLinked: true,
    holdState: false,
    degradedMode: false,
  },
  {
    id: 'evt-2c5d1e',
    timestamp: '2026-06-04T20:11:28Z',
    user: 'pseudo-e12f',
    action: 'Redacted',
    severity: 'medium',
    dataClass: 'Health Information',
    destinationTool: 'ChatGPT',
    sourceLayer: 'ICAP',
    isOutput: false,
    isInjection: false,
    policyResult: 'Redacted',
    caseLinked: false,
    holdState: false,
    degradedMode: false,
  },
  {
    id: 'evt-4a9c8b',
    timestamp: '2026-06-04T19:58:51Z',
    user: 'pseudo-d77e',
    action: 'Audited',
    severity: 'low',
    dataClass: 'General Business',
    destinationTool: 'Gemini',
    sourceLayer: 'Agent',
    isOutput: false,
    isInjection: false,
    policyResult: 'Audit',
    caseLinked: false,
    holdState: false,
    degradedMode: false,
  },
];

const SEVERITY_LEVELS = ['All', 'Critical', 'High', 'Medium', 'Low', 'Info'];
const TIME_RANGES = ['Last 1 hour', 'Last 6 hours', 'Last 24 hours', 'Last 7 days', 'Last 30 days', 'Custom'];
const LAYERS = ['All', 'Browser Ext', 'Agent', 'Gateway', 'ICAP'];
const POLICY_RESULTS = ['All', 'Blocked', 'Warned', 'Redacted', 'Allowed', 'Audit'];

function SeverityChip({ severity }: { severity: string }) {
  const s = severity.toLowerCase();
  const classes: Record<string, string> = { critical: 'chip-critical', high: 'chip-high', medium: 'chip-medium', low: 'chip-low', info: 'chip-info' };
  return <span className={`chip ${classes[s] || 'chip-info'}`} style={{ textTransform: 'capitalize' }}>{severity}</span>;
}

function PolicyResultChip({ result }: { result: string }) {
  const r = result.toLowerCase();
  const cfg: Record<string, { cls: string; label: string }> = {
    blocked:  { cls: 'chip-critical', label: 'Blocked' },
    warned:   { cls: 'chip-medium',   label: 'Warned' },
    redacted: { cls: 'chip-high',     label: 'Redacted' },
    allowed:  { cls: 'chip-low',      label: 'Allowed' },
    audit:    { cls: 'chip-info',     label: 'Audited' },
  };
  const c = cfg[r] || { cls: 'chip-info', label: result };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

function BoolIndicator({ value, trueLabel, falseLabel = '—' }: { value: boolean; trueLabel: string; falseLabel?: string }) {
  if (!value) return <span style={{ color: 'var(--color-text-disabled)', font: 'var(--type-table-cell)' }}>{falseLabel}</span>;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, font: 'var(--type-caption)', fontWeight: 600, color: 'var(--color-state-info-text)' }}>
    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-state-info-icon)', display: 'inline-block' }} />
    {trueLabel}
  </span>;
}

export default function EventsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 24 hours');
  const [selectedLayer, setSelectedLayer] = useState('All');
  const [selectedPolicyResult, setSelectedPolicyResult] = useState('All');
  const [showOutputOnly, setShowOutputOnly] = useState(false);
  const [showInjectionOnly, setShowInjectionOnly] = useState(false);
  const [showHeldOnly, setShowHeldOnly] = useState(false);
  const [showCaseLinkedOnly, setShowCaseLinkedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Filter logic
  const filteredEvents = MOCK_EVENTS.filter(e => {
    if (selectedSeverity !== 'All' && e.severity.toLowerCase() !== selectedSeverity.toLowerCase()) return false;
    if (selectedLayer !== 'All' && !e.sourceLayer.toLowerCase().includes(selectedLayer.toLowerCase())) return false;
    if (selectedPolicyResult !== 'All' && e.policyResult.toLowerCase() !== selectedPolicyResult.toLowerCase()) return false;
    if (showOutputOnly && !e.isOutput) return false;
    if (showInjectionOnly && !e.isInjection) return false;
    if (showHeldOnly && !e.holdState) return false;
    if (showCaseLinkedOnly && !e.caseLinked) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.user.toLowerCase().includes(q) || e.dataClass.toLowerCase().includes(q) || e.destinationTool.toLowerCase().includes(q) || e.id.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleRow = (id: string) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected = filteredEvents.length > 0 && selectedRows.length === filteredEvents.length;

  const activeFilterCount = [
    selectedSeverity !== 'All', selectedLayer !== 'All', selectedPolicyResult !== 'All',
    showOutputOnly, showInjectionOnly, showHeldOnly, showCaseLinkedOnly,
  ].filter(Boolean).length;

  const formatTs = (ts: string) => {
    const d = new Date(ts);
    return {
      date: d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }),
      time: d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER (Spec 6.8) ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Events</h1>
          <p className="page-subtitle">All material AI governance activity. Triage, filter, drill down, and move into investigation.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} />
            Export list
          </button>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          FILTER STRIP (Spec 14.16 — All required filters)
          ══════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '12px var(--page-padding)',
      }}>
        {/* Row 1 — Search + Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

          {/* Universal search */}
          <div style={{ position: 'relative', flex: '0 0 280px' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search user, data class, tool, ID..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>

          {/* Time range */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedTimeRange}
              onChange={e => setSelectedTimeRange(e.target.value)}
              style={{
                height: 34, padding: '0 30px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: 'var(--color-surface-secondary)', cursor: 'pointer', outline: 'none',
                appearance: 'none', minWidth: 150,
              }}
            >
              {TIME_RANGES.map(t => <option key={t}>{t}</option>)}
            </select>
            <Clock size={12} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* Severity filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: selectedSeverity !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 120,
              }}
            >
              {SEVERITY_LEVELS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* Source Layer */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedLayer}
              onChange={e => setSelectedLayer(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: selectedLayer !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 130,
              }}
            >
              {LAYERS.map(l => <option key={l}>{l}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* Policy Result */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedPolicyResult}
              onChange={e => setSelectedPolicyResult(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: selectedPolicyResult !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 120,
              }}
            >
              {POLICY_RESULTS.map(r => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            style={{
              height: 34, display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 12px', border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)',
              color: activeFilterCount > 0 ? 'var(--color-action-primary-bg)' : 'var(--color-text-secondary)',
              background: activeFilterCount > 0 ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
              cursor: 'pointer',
            }}
          >
            <Filter size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--color-action-primary-bg)', color: '#fff',
                width: 16, height: 16, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{activeFilterCount}</span>
            )}
          </button>

          {/* Active filter count label */}
          {filteredEvents.length !== MOCK_EVENTS.length && (
            <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
              {filteredEvents.length} of {MOCK_EVENTS.length} events
            </span>
          )}
        </div>

        {/* Row 2 — Advanced Boolean Filters (Spec 14.16: output-only, injection, held, case-linked, degraded-mode) */}
        {showAdvancedFilters && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--color-border-default)', flexWrap: 'wrap' }}>
            {[
              { label: 'Output events only', value: showOutputOnly, setter: setShowOutputOnly },
              { label: 'Injection events only', value: showInjectionOnly, setter: setShowInjectionOnly },
              { label: 'Held events only', value: showHeldOnly, setter: setShowHeldOnly },
              { label: 'Case-linked only', value: showCaseLinkedOnly, setter: setShowCaseLinkedOnly },
            ].map(f => (
              <button
                key={f.label}
                onClick={() => f.setter(!f.value)}
                style={{
                  height: 28, padding: '0 10px',
                  border: `1px solid ${f.value ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`,
                  borderRadius: 'var(--radius-pill)',
                  background: f.value ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                  font: 'var(--type-caption)',
                  fontWeight: f.value ? 600 : 400,
                  color: f.value ? 'var(--color-action-primary-bg)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {f.value && <span>✓</span>}
                {f.label}
              </button>
            ))}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setSelectedSeverity('All'); setSelectedLayer('All'); setSelectedPolicyResult('All'); setShowOutputOnly(false); setShowInjectionOnly(false); setShowHeldOnly(false); setShowCaseLinkedOnly(false); }}
                style={{ height: 28, padding: '0 10px', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-pill)', font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <X size={11} /> Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Bulk Actions Bar (when rows selected) ── */}
      {selectedRows.length > 0 && (
        <div style={{
          background: 'var(--color-state-info-bg)',
          borderBottom: '1px solid var(--color-state-info-border)',
          padding: '8px var(--page-padding)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-state-info-text)' }}>
            {selectedRows.length} event{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { icon: FolderPlus, label: 'Add to case' },
              { icon: Shield,     label: 'Request verification' },
              { icon: Lock,       label: 'Apply hold' },
              { icon: Download,   label: 'Export selected' },
            ].map(a => (
              <button key={a.label} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <a.icon size={12} /> {a.label}
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedRows([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          EVENTS TABLE (Spec 14.14 + 14.15)
          Table must dominate the page — all 12 columns
          ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1200 }}>

          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '24px 160px 110px 80px 110px 160px 120px 110px 80px 80px 110px 80px 80px 36px',
            padding: '0 16px',
            height: 40,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            gap: 6,
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {/* Checkbox all */}
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelectedRows(allSelected ? [] : filteredEvents.map(e => e.id))}
              style={{ cursor: 'pointer', accentColor: 'var(--color-action-primary-bg)' }}
            />
            {[
              'Timestamp', 'User', 'Action', 'Severity', 'Data Class', 'Tool', 'Source Layer',
              'Output', 'Injection', 'Policy Result', 'Case', 'Hold', '',
            ].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {h}
              </div>
            ))}
          </div>

          {/* Table rows */}
          {filteredEvents.length === 0 ? (
            /* Spec 14.19 — Empty state: distinguish no data from no-results-from-filter */
            <div className="empty-state">
              <Filter size={32} style={{ color: 'var(--color-text-disabled)' }} />
              <div className="empty-state-title">No events match the current filters</div>
              <div className="empty-state-description">Adjust the filters or time range to see events. If no events exist in the selected period, the platform is in a quiet state.</div>
              <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => { setSelectedSeverity('All'); setSelectedLayer('All'); setSelectedPolicyResult('All'); }}>
                Clear filters
              </button>
            </div>
          ) : filteredEvents.map((evt, i) => {
            const ts = formatTs(evt.timestamp);
            const isSelected = selectedRows.includes(evt.id);

            return (
              <div
                key={evt.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 160px 110px 80px 110px 160px 120px 110px 80px 80px 110px 80px 80px 36px',
                  padding: '0 16px',
                  height: 'var(--table-row-height-standard)',
                  background: isSelected ? 'var(--table-row-selected)' : 'var(--table-row-bg)',
                  borderBottom: '1px solid var(--table-border)',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'background 80ms ease',
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--table-row-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--table-row-selected)' : 'var(--table-row-bg)'; }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRow(evt.id)}
                  onClick={e => e.stopPropagation()}
                  style={{ cursor: 'pointer', accentColor: 'var(--color-action-primary-bg)' }}
                />
                {/* Timestamp */}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{ts.time}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', lineHeight: 1.2 }}>{ts.date}</div>
                </div>
                {/* User (pseudonymized per spec) */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.user}</div>
                {/* Action */}
                <div style={{ font: 'var(--type-table-cell)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.action}</div>
                {/* Severity */}
                <SeverityChip severity={evt.severity} />
                {/* Data Class */}
                <div style={{ font: 'var(--type-table-cell)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={evt.dataClass}>{evt.dataClass}</div>
                {/* Tool */}
                <div style={{ font: 'var(--type-table-cell)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.destinationTool}</div>
                {/* Source Layer */}
                <div style={{ font: 'var(--type-table-cell)', color: 'var(--color-text-tertiary)' }}>{evt.sourceLayer}</div>
                {/* Output indicator */}
                <BoolIndicator value={evt.isOutput} trueLabel="Output" />
                {/* Injection indicator */}
                <BoolIndicator value={evt.isInjection} trueLabel="Inject" />
                {/* Policy Result */}
                <PolicyResultChip result={evt.policyResult} />
                {/* Case link */}
                <BoolIndicator value={evt.caseLinked} trueLabel="Linked" />
                {/* Hold state */}
                {evt.holdState
                  ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, font: 'var(--type-caption)', fontWeight: 600, color: 'var(--status-held-text)', background: 'var(--status-held-bg)', padding: '1px 6px', borderRadius: 99, border: '1px solid #DDD6FE' }}><Lock size={9} />Held</span>
                  : <span style={{ color: 'var(--color-text-disabled)', font: 'var(--type-table-cell)' }}>—</span>
                }
                {/* Degraded mode badge if relevant */}
                {evt.degradedMode && <span title="Captured in degraded mode"><AlertTriangle size={13} style={{ color: 'var(--color-state-warning-icon)' }} /></span>}
                {/* Jump to detail */}
                <Link href={`/app/events/${evt.id}`} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)', padding: 4 }}>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PAGINATION (Spec 14.14) ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderTop: '1px solid var(--color-border-default)',
        padding: '10px var(--page-padding)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
          Showing {filteredEvents.length} events · Page 1 of 1
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-secondary btn-sm" disabled style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ChevronLeft size={13} /> Previous</button>
          <button className="btn btn-secondary btn-sm" disabled style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Next <ChevronRight size={13} /></button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Rows per page:</span>
          <select style={{ height: 28, padding: '0 8px', border: '1px solid var(--color-border-default)', borderRadius: 6, font: 'var(--type-caption)', background: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', outline: 'none' }}>
            <option>25</option><option>50</option><option>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
