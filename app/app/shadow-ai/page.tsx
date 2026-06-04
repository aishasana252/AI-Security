'use client';

/**
 * APEXLyn Lens — Shadow AI Page
 * Screen ID: OPS-SHADOW-AI-001
 * Route: /app/shadow-ai
 * Source: UIUX Specification Section 14.39 – 14.44
 *
 * Per spec 14.42 — THREE mandatory views (not optional):
 * 1. Table View — all discovered tools
 * 2. Heatmap View — usage concentration
 * 3. Discovery Timeline View — when tools appeared
 *
 * Per spec 14.41 — Required columns:
 * discovered AI tools, first-seen, last-seen, user count,
 * risk tier, managed/unmanaged, allowlist/blocklist state, action history
 */

import React, { useState } from 'react';
import {
  Eye, Search, Filter, ChevronDown, Shield, AlertTriangle, CheckCircle,
  Clock, Users, TrendingUp, Calendar, ArrowUpRight, Lock,
  XCircle, RefreshCw, Grid, List, BarChart2, X,
} from 'lucide-react';
import Link from 'next/link';

const MOCK_SHADOW_TOOLS = [
  {
    id: 'sat-001',
    name: 'ChatGPT (OpenAI)',
    domain: 'chat.openai.com',
    firstSeen: '2025-09-14T08:22:00Z',
    lastSeen: '2026-06-04T22:30:00Z',
    userCount: 314,
    riskTier: 'high',
    managed: false,
    allowlistState: 'neither',
    actionHistory: ['Domain logged', 'Risk tier escalated (2026-01-15)'],
    category: 'General LLM',
    eventCount: 1842,
  },
  {
    id: 'sat-002',
    name: 'Gemini Advanced (Google)',
    domain: 'gemini.google.com',
    firstSeen: '2025-11-02T10:00:00Z',
    lastSeen: '2026-06-04T21:45:00Z',
    userCount: 187,
    riskTier: 'high',
    managed: false,
    allowlistState: 'neither',
    actionHistory: ['Domain logged', 'Alert raised (2026-02-20)'],
    category: 'General LLM',
    eventCount: 923,
  },
  {
    id: 'sat-003',
    name: 'Claude (Anthropic)',
    domain: 'claude.ai',
    firstSeen: '2025-12-10T14:15:00Z',
    lastSeen: '2026-06-04T19:33:00Z',
    userCount: 98,
    riskTier: 'medium',
    managed: false,
    allowlistState: 'neither',
    actionHistory: ['Domain logged'],
    category: 'General LLM',
    eventCount: 412,
  },
  {
    id: 'sat-004',
    name: 'Perplexity AI',
    domain: 'perplexity.ai',
    firstSeen: '2026-01-20T09:30:00Z',
    lastSeen: '2026-06-04T20:11:00Z',
    userCount: 45,
    riskTier: 'medium',
    managed: false,
    allowlistState: 'neither',
    actionHistory: ['Domain logged'],
    category: 'Search AI',
    eventCount: 198,
  },
  {
    id: 'sat-005',
    name: 'GitHub Copilot',
    domain: 'github.com/copilot',
    firstSeen: '2025-08-01T07:00:00Z',
    lastSeen: '2026-06-04T22:00:00Z',
    userCount: 234,
    riskTier: 'managed',
    managed: true,
    allowlistState: 'allowlisted',
    actionHistory: ['Moved to managed (2025-10-01)', 'Allowlisted (2025-10-01)', 'Policy applied: eng-ai-policy'],
    category: 'Code Assistant',
    eventCount: 3102,
  },
  {
    id: 'sat-006',
    name: 'Notion AI',
    domain: 'notion.so/ai',
    firstSeen: '2026-02-14T11:00:00Z',
    lastSeen: '2026-06-04T17:45:00Z',
    userCount: 67,
    riskTier: 'low',
    managed: false,
    allowlistState: 'neither',
    actionHistory: ['Domain logged'],
    category: 'Productivity AI',
    eventCount: 289,
  },
  {
    id: 'sat-007',
    name: 'Midjourney',
    domain: 'midjourney.com',
    firstSeen: '2026-03-05T16:00:00Z',
    lastSeen: '2026-06-02T14:20:00Z',
    userCount: 12,
    riskTier: 'low',
    managed: false,
    allowlistState: 'blocklisted',
    actionHistory: ['Domain logged', 'Blocklisted (2026-04-01) — design data concerns'],
    category: 'Image Generation',
    eventCount: 34,
  },
];

type ViewMode = 'table' | 'heatmap' | 'timeline';

function RiskTierChip({ tier }: { tier: string }) {
  const cfg: Record<string, string> = { high: 'chip-critical', medium: 'chip-medium', low: 'chip-low', managed: 'chip-active' };
  const labels: Record<string, string> = { high: 'High Risk', medium: 'Medium Risk', low: 'Low Risk', managed: 'Managed' };
  return <span className={`chip ${cfg[tier] || 'chip-info'}`}>{labels[tier] || tier}</span>;
}

function AllowlistChip({ state }: { state: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    allowlisted: { cls: 'chip-active',   label: 'Allowlisted' },
    blocklisted:  { cls: 'chip-critical', label: 'Blocklisted' },
    neither:      { cls: 'chip-pending',  label: 'Unclassified' },
  };
  const c = cfg[state] || cfg.neither;
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

const DEPT_HEATMAP = [
  { dept: 'Engineering',  chatgpt: 8, gemini: 3, claude: 5, other: 2 },
  { dept: 'Finance',      chatgpt: 4, gemini: 7, claude: 1, other: 1 },
  { dept: 'Legal',        chatgpt: 2, gemini: 1, claude: 0, other: 0 },
  { dept: 'HR',           chatgpt: 3, gemini: 2, claude: 2, other: 3 },
  { dept: 'Product',      chatgpt: 6, gemini: 4, claude: 3, other: 1 },
];

const TIMELINE_EVENTS = [
  { date: '2025-08-01', tool: 'GitHub Copilot', event: 'First discovered', type: 'discovery' },
  { date: '2025-09-14', tool: 'ChatGPT (OpenAI)', event: 'First discovered', type: 'discovery' },
  { date: '2025-10-01', tool: 'GitHub Copilot', event: 'Moved to managed, allowlisted', type: 'governance' },
  { date: '2025-11-02', tool: 'Gemini Advanced', event: 'First discovered', type: 'discovery' },
  { date: '2025-12-10', tool: 'Claude (Anthropic)', event: 'First discovered', type: 'discovery' },
  { date: '2026-01-15', tool: 'ChatGPT (OpenAI)', event: 'Risk tier escalated to High', type: 'risk-change' },
  { date: '2026-01-20', tool: 'Perplexity AI', event: 'First discovered', type: 'discovery' },
  { date: '2026-02-14', tool: 'Notion AI', event: 'First discovered', type: 'discovery' },
  { date: '2026-02-20', tool: 'Gemini Advanced', event: 'Alert raised — data volume increase', type: 'risk-change' },
  { date: '2026-03-05', tool: 'Midjourney', event: 'First discovered', type: 'discovery' },
  { date: '2026-04-01', tool: 'Midjourney', event: 'Blocklisted — design data concerns', type: 'governance' },
];

export default function ShadowAIPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterManaged, setFilterManaged] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_SHADOW_TOOLS.filter(t => {
    if (filterRisk !== 'All' && t.riskTier !== filterRisk.toLowerCase()) return false;
    if (filterManaged === 'Managed' && !t.managed) return false;
    if (filterManaged === 'Unmanaged' && t.managed) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  const timelineTypeConfig: Record<string, { color: string; bg: string }> = {
    discovery:    { color: 'var(--color-state-info-text)', bg: 'var(--color-state-info-bg)' },
    governance:   { color: 'var(--color-state-success-text)', bg: 'var(--color-state-success-bg)' },
    'risk-change':{ color: 'var(--color-state-warning-text)', bg: 'var(--color-state-warning-bg)' },
  };

  const maxHeatmapVal = Math.max(...DEPT_HEATMAP.flatMap(d => [d.chatgpt, d.gemini, d.claude, d.other]));

  function HeatCell({ val }: { val: number }) {
    const intensity = val / maxHeatmapVal;
    return (
      <td style={{
        width: 80, height: 40, textAlign: 'center', verticalAlign: 'middle',
        background: `rgba(30, 58, 138, ${0.05 + intensity * 0.7})`,
        color: intensity > 0.5 ? '#fff' : 'var(--color-text-primary)',
        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
        border: '1px solid var(--color-border-default)',
        borderRadius: 4,
      }}>
        {val}
      </td>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Shadow AI</h1>
          <p className="page-subtitle">
            Discovered and unmanaged AI tool use. Govern posture, risk tier, and allowlist/blocklist state.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          VIEW MODE SWITCHER (Spec 14.42 — 3 mandatory views)
          Table | Heatmap | Discovery Timeline
          ══════════════════════════════════════════════════ */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '10px var(--page-padding)',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        {/* View toggles */}
        <div style={{ display: 'flex', background: 'var(--color-surface-tertiary)', borderRadius: 8, padding: 3, gap: 2 }}>
          {[
            { mode: 'table'    as ViewMode, icon: List,     label: 'Table' },
            { mode: 'heatmap'  as ViewMode, icon: Grid,     label: 'Heatmap' },
            { mode: 'timeline' as ViewMode, icon: Calendar, label: 'Timeline' },
          ].map(v => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: viewMode === v.mode ? 'var(--color-surface-primary)' : 'transparent',
                boxShadow: viewMode === v.mode ? 'var(--elevation-1)' : 'none',
                font: 'var(--type-body-sm)', fontWeight: viewMode === v.mode ? 600 : 400,
                color: viewMode === v.mode ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <v.icon size={13} />
              {v.label}
            </button>
          ))}
        </div>

        {/* Filters (only relevant for table view) */}
        {viewMode === 'table' && (
          <>
            <div style={{ position: 'relative', flex: '0 0 220px' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search tool or domain..." className="input" style={{ paddingLeft: 30, height: 34 }} />
            </div>
            {[
              { label: 'Risk', options: ['All', 'High', 'Medium', 'Low', 'Managed'], value: filterRisk, setter: setFilterRisk },
              { label: 'Status', options: ['All', 'Managed', 'Unmanaged'], value: filterManaged, setter: setFilterManaged },
            ].map(f => (
              <div key={f.label} style={{ position: 'relative' }}>
                <select value={f.value} onChange={e => f.setter(e.target.value)} style={{ height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)', background: f.value !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)', cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 120 }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
              </div>
            ))}
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', alignSelf: 'center' }}>
            {MOCK_SHADOW_TOOLS.filter(t => !t.managed).length} unmanaged · {MOCK_SHADOW_TOOLS.filter(t => t.managed).length} managed
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          VIEW: TABLE (Spec 14.41 — all required columns)
          ══════════════════════════════════════════════════ */}
      {viewMode === 'table' && (
        <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
          <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 180px 130px 130px 80px 120px 130px 1fr 36px', padding: '0 16px', height: 40, gap: 8, background: 'var(--table-header-bg)', borderBottom: '1px solid var(--table-border)', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
              {['Tool Name', 'Domain', 'First Seen', 'Last Seen', 'Users', 'Risk Tier', 'Posture', 'Category / Actions', ''].map(h => (
                <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
              ))}
            </div>
            {filtered.map((tool, i) => (
              <div key={tool.id} style={{ display: 'grid', gridTemplateColumns: '200px 180px 130px 130px 80px 120px 130px 1fr 36px', padding: '0 16px', minHeight: 52, gap: 8, background: 'var(--table-row-bg)', borderBottom: '1px solid var(--table-border)', alignItems: 'center', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
              >
                <div>
                  <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{tool.name}</div>
                  {!tool.managed && <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-warning)', fontWeight: 600 }}>Unmanaged</span>}
                  {tool.managed && <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-success)', fontWeight: 600 }}>Managed</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.domain}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(tool.firstSeen)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(tool.lastSeen)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{tool.userCount}</span>
                </div>
                <RiskTierChip tier={tool.riskTier} />
                <AllowlistChip state={tool.allowlistState} />
                <div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{tool.category}</div>
                  {tool.actionHistory.length > 0 && (
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)', marginTop: 1 }}>
                      {tool.actionHistory[tool.actionHistory.length - 1]}
                    </div>
                  )}
                </div>
                <Link href={`/app/shadow-ai/${tool.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)', padding: 4 }}>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: HEATMAP (Spec 14.42 — usage concentration by dept)
          ══════════════════════════════════════════════════ */}
      {viewMode === 'heatmap' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--page-padding)' }}>
          <div className="card">
            <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)', marginBottom: 6 }}>
              Shadow AI Usage Heatmap — by Department
            </h3>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginBottom: 20 }}>
              Event volume concentration. Darker cells = higher AI tool usage in that department. This is not governance state — it is discovery signal.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
                <thead>
                  <tr>
                    <th style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 12px', textAlign: 'left', width: 140 }}>Department</th>
                    {['ChatGPT', 'Gemini', 'Claude', 'Other'].map(h => (
                      <th key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 4px', textAlign: 'center', width: 80 }}>{h}</th>
                    ))}
                    <th style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 12px', textAlign: 'right', width: 80 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {DEPT_HEATMAP.map(row => (
                    <tr key={row.dept}>
                      <td style={{ padding: '4px 12px 4px 0', font: 'var(--type-body-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{row.dept}</td>
                      <HeatCell val={row.chatgpt} />
                      <HeatCell val={row.gemini} />
                      <HeatCell val={row.claude} />
                      <HeatCell val={row.other} />
                      <td style={{ padding: '4px 0 4px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        {row.chatgpt + row.gemini + row.claude + row.other}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--color-state-info-bg)', border: '1px solid var(--color-state-info-border)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-info-text)' }}>
                Discovery does not imply governance. A discovered tool is unmanaged until policy is applied and it is moved to managed state.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: DISCOVERY TIMELINE (Spec 14.42)
          ══════════════════════════════════════════════════ */}
      {viewMode === 'timeline' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 'var(--page-padding)' }}>
          <div className="card">
            <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)', marginBottom: 6 }}>
              Discovery &amp; Governance Timeline
            </h3>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginBottom: 20 }}>
              Chronological record of when tools were first discovered and what governance actions followed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {TIMELINE_EVENTS.map((evt, i) => {
                const cfg = timelineTypeConfig[evt.type] || timelineTypeConfig.discovery;
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 16, position: 'relative' }}>
                    {/* Timeline line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, border: '2px solid var(--color-border-default)', marginTop: 4 }} />
                      {i < TIMELINE_EVENTS.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--color-border-default)', marginTop: 4, minHeight: 24 }} />}
                    </div>
                    {/* Event content */}
                    <div style={{ flex: 1, paddingBottom: 8, borderBottom: i < TIMELINE_EVENTS.length - 1 ? '1px solid var(--color-border-default)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>{evt.date}</span>
                        <span style={{ font: 'var(--type-caption)', fontWeight: 700, color: cfg.color, background: cfg.bg, padding: '1px 7px', borderRadius: 99 }}>
                          {evt.type === 'discovery' ? 'Discovery' : evt.type === 'governance' ? 'Governance action' : 'Risk change'}
                        </span>
                      </div>
                      <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{evt.tool}</div>
                      <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{evt.event}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
