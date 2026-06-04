'use client';

/**
 * APEXLyn Lens — Overview Page
 * Screen ID: OPS-OVERVIEW-001
 * Route: /app/overview
 * Source: UIUX Specification Section 14.5 – 14.11
 *
 * Required sections (per spec 14.8):
 * A. Protection Status Banner
 * B. Real-Time Event Summary Row
 * C. Risk Heatmap
 * D. Recent Critical Events Panel
 * E. Deployment & Control-Surface Health
 * F. Billing & Lifecycle Warnings
 * G. Offline / Degraded Warnings
 * H. Quick Actions Panel (contextual only)
 */

import React, { useState } from 'react';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Monitor,
  Server,
  Globe,
  Plug,
  Cpu,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Clock,
  User,
  Eye,
  FileText,
  CreditCard,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from 'lucide-react';

/* ── Mock platform truth (will come from API/DB in production) ── */
const PLATFORM_STATE = {
  protectionState: 'active' as 'active' | 'degraded' | 'blocked',
  deploymentMode: 'Browser Extension + Gateway + Agent',
  subscriptionState: 'active',
  lifecycleState: 'active' as 'active' | 'grace' | 'past_due' | 'suspended' | 'cancel_pending' | 'read_only_exit' | 'export_window' | 'retained_only',
  onboardingComplete: true,
  degradedServices: [] as string[],
};

const EVENT_SUMMARY = {
  critical: { count: 3,  trend: 'up'   as const, change: '+2 vs yesterday' },
  high:     { count: 14, trend: 'down' as const, change: '-5 vs yesterday' },
  medium:   { count: 47, trend: 'same' as const, change: 'same as yesterday' },
  low:      { count: 123,trend: 'up'   as const, change: '+18 vs yesterday' },
};

const RECENT_CRITICAL = [
  { id: 'evt-001', timestamp: '2026-06-04 22:31:07', user: 'pseudo-82a1', action: 'Blocked', severity: 'critical', dataClass: 'Source Code', tool: 'ChatGPT', sourceLayer: 'Browser Extension' },
  { id: 'evt-002', timestamp: '2026-06-04 21:15:44', user: 'pseudo-3f7c', action: 'Blocked', severity: 'critical', dataClass: 'PII — Tax File Number', tool: 'Gemini', sourceLayer: 'Browser Extension' },
  { id: 'evt-003', timestamp: '2026-06-04 19:48:22', user: 'pseudo-b92e', action: 'Warned',  severity: 'high',     dataClass: 'Internal Financial Data', tool: 'Claude', sourceLayer: 'Agent' },
];

const CONTROL_HEALTH = [
  { name: 'Browser Extension', icon: Monitor, status: 'active',   activeCount: 847, totalCount: 851, detail: '4 offline' },
  { name: 'Agent (Endpoint)',   icon: Server,  status: 'degraded', activeCount: 312, totalCount: 330, detail: '18 stale' },
  { name: 'Gateway',           icon: Globe,   status: 'active',   activeCount: 2,   totalCount: 2,   detail: 'All healthy' },
  { name: 'Connectors',        icon: Plug,    status: 'active',   activeCount: 5,   totalCount: 5,   detail: 'Auth valid' },
  { name: 'Internal AI Disc.', icon: Cpu,     status: 'active',   activeCount: 0,   totalCount: 0,   detail: '3 endpoints discovered' },
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────────────────────────────── */

function SeverityCountCard({
  level, count, label, trend, change, chipClass,
}: {
  level: string; count: number; label: string;
  trend: 'up' | 'down' | 'same'; change: string; chipClass: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = level === 'critical' || level === 'high'
    ? (trend === 'up' ? 'var(--color-text-critical)' : trend === 'down' ? 'var(--color-text-success)' : 'var(--color-text-tertiary)')
    : 'var(--color-text-tertiary)';

  return (
    <div className="card" style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className={`chip chip-${level === 'low' ? 'low' : level}`} style={{ textTransform: 'capitalize' }}>{label}</span>
        <TrendIcon size={14} style={{ color: trendColor, flexShrink: 0 }} />
      </div>
      <div style={{ font: 'var(--type-display-lg)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
        {count.toLocaleString()}
      </div>
      <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{change}</div>
    </div>
  );
}

function ControlHealthRow({ item }: { item: typeof CONTROL_HEALTH[0] }) {
  const Icon = item.icon;
  const statusColors: Record<string, { dot: string; text: string }> = {
    active:   { dot: 'var(--status-active-text)',   text: 'var(--status-active-text)' },
    degraded: { dot: 'var(--status-degraded-text)', text: 'var(--status-degraded-text)' },
    failed:   { dot: 'var(--status-failed-text)',   text: 'var(--status-failed-text)' },
  };
  const colors = statusColors[item.status] || statusColors.active;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border-default)',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--color-surface-tertiary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} style={{ color: 'var(--color-text-secondary)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: 'var(--type-body-sm)', fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.name}</div>
        <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 1 }}>{item.detail}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, display: 'inline-block' }} />
          <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: colors.text, textTransform: 'capitalize' }}>
            {item.status}
          </span>
        </div>
        {item.totalCount > 0 && (
          <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 1, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {item.activeCount}/{item.totalCount}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
export default function OverviewPage() {
  const [lastRefreshed] = useState(new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const protectionStatusConfig = {
    active:   { bg: 'var(--color-state-success-bg)',  border: 'var(--color-state-success-border)',  text: 'var(--color-state-success-text)',  icon: CheckCircle, iconColor: 'var(--color-state-success-icon)',  label: 'Protection Active' },
    degraded: { bg: 'var(--color-state-warning-bg)',  border: 'var(--color-state-warning-border)',  text: 'var(--color-state-warning-text)',  icon: AlertTriangle,iconColor: 'var(--color-state-warning-icon)', label: 'Protection Degraded' },
    blocked:  { bg: 'var(--color-state-critical-bg)', border: 'var(--color-state-critical-border)', text: 'var(--color-state-critical-text)', icon: XCircle,     iconColor: 'var(--color-state-critical-icon)', label: 'Protection Blocked' },
  };
  const pStatus = protectionStatusConfig[PLATFORM_STATE.protectionState];
  const PStatusIcon = pStatus.icon;

  return (
    <div style={{ minHeight: '100%' }}>

      {/* ── PAGE HEADER (Spec 6.8) ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Operational platform truth — protection state, risk signals, control health, and commercial status.
          </p>
        </div>
        <div className="page-header-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
            <Clock size={12} />
            <span>Refreshed at {lastRefreshed}</span>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: 'var(--page-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ══════════════════════════════════════════════════
            SECTION A — PROTECTION STATUS BANNER
            Spec 14.8.A: protection state, deployment mode,
            subscription state, lifecycle state, degraded info
            ══════════════════════════════════════════════════ */}
        <div style={{
          background: pStatus.bg,
          border: `1px solid ${pStatus.border}`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <PStatusIcon size={18} style={{ color: pStatus.iconColor }} />
            </div>
            <div>
              <div style={{ font: 'var(--type-heading-h4)', color: pStatus.text }}>{pStatus.label}</div>
              <div style={{ font: 'var(--type-caption)', color: pStatus.text, opacity: 0.8, marginTop: 2 }}>
                Deployment: {PLATFORM_STATE.deploymentMode} &nbsp;·&nbsp; Subscription: {PLATFORM_STATE.subscriptionState} &nbsp;·&nbsp; Lifecycle: {PLATFORM_STATE.lifecycleState}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <a href="/app/events" style={{ display: 'flex', alignItems: 'center', gap: 4, font: 'var(--type-body-sm)', fontWeight: 600, color: pStatus.text, textDecoration: 'none' }}>
              View Events <ChevronRight size={13} />
            </a>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION B — REAL-TIME EVENT SUMMARY ROW
            Spec 14.8.B: critical/high/medium/low counts
            with trend vs previous period
            ══════════════════════════════════════════════════ */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>
              Event Summary
            </h2>
            <a href="/app/events" style={{ display: 'flex', alignItems: 'center', gap: 4, font: 'var(--type-body-sm)', color: 'var(--color-text-link)', textDecoration: 'none' }}>
              View all events <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <SeverityCountCard level="critical" count={EVENT_SUMMARY.critical.count} label="Critical" trend={EVENT_SUMMARY.critical.trend} change={EVENT_SUMMARY.critical.change} chipClass="chip-critical" />
            <SeverityCountCard level="high"     count={EVENT_SUMMARY.high.count}     label="High"     trend={EVENT_SUMMARY.high.trend}     change={EVENT_SUMMARY.high.change}     chipClass="chip-high" />
            <SeverityCountCard level="medium"   count={EVENT_SUMMARY.medium.count}   label="Medium"   trend={EVENT_SUMMARY.medium.trend}   change={EVENT_SUMMARY.medium.change}   chipClass="chip-medium" />
            <SeverityCountCard level="low"      count={EVENT_SUMMARY.low.count}      label="Low/Info" trend={EVENT_SUMMARY.low.trend}      change={EVENT_SUMMARY.low.change}      chipClass="chip-low" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TWO-COLUMN ROW: D (Recent Critical) + E (Control Health)
            ══════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

          {/* SECTION D — RECENT CRITICAL EVENTS PANEL
              Spec 14.8.D: timestamp, user, action, severity,
              data class, tool, jump-to-detail */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--color-border-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>
                Recent Critical &amp; High Events
              </h3>
              <a href="/app/events?severity=critical,high" style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-link)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ChevronRight size={13} />
              </a>
            </div>

            {/* Table header */}
            <div style={{ background: 'var(--table-header-bg)', padding: '0 20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '140px 100px 1fr 120px 120px 36px',
                gap: 8, height: 36,
                alignItems: 'center',
              }}>
                {['Timestamp', 'User', 'Data Class', 'Tool', 'Source', ''].map(h => (
                  <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {RECENT_CRITICAL.map((evt, i) => (
              <div key={evt.id} style={{
                display: 'grid',
                gridTemplateColumns: '140px 100px 1fr 120px 120px 36px',
                gap: 8,
                height: 'var(--table-row-height-standard)',
                alignItems: 'center',
                padding: '0 20px',
                borderBottom: i < RECENT_CRITICAL.length - 1 ? '1px solid var(--color-border-default)' : 'none',
                background: 'var(--color-surface-primary)',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--table-row-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-primary)')}
              >
                {/* Timestamp */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                  {evt.timestamp.split(' ')[1]}
                  <div style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{evt.timestamp.split(' ')[0]}</div>
                </div>
                {/* User */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.user}
                </div>
                {/* Data Class */}
                <div style={{ font: 'var(--type-table-cell)', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.dataClass}
                </div>
                {/* Tool */}
                <div style={{ font: 'var(--type-table-cell)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.tool}
                </div>
                {/* Severity */}
                <span className={`chip chip-${evt.severity}`}>{evt.action}</span>
                {/* Action */}
                <a href={`/app/events/${evt.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)' }}>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            ))}
          </div>

          {/* SECTION E — DEPLOYMENT & CONTROL-SURFACE HEALTH
              Spec 14.8.E: extension, agent, gateway, connector,
              internal AI discovery health */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>
                Control Surface Health
              </h3>
              <a href="/app/deployment-status" style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none' }}>
                Full status
              </a>
            </div>
            <div>
              {CONTROL_HEALTH.map((item, i) => (
                <ControlHealthRow key={i} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION C — RISK HEATMAP (simplified representation)
            Spec 14.8.C: event concentration by department,
            severity concentration, top data classes
            ══════════════════════════════════════════════════ */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Risk Distribution by Department</h3>
            <span className="section-label">Last 7 days</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { dept: 'Engineering',  critical: 2, high: 8,  medium: 21, total: 31 },
              { dept: 'Finance',      critical: 1, high: 3,  medium: 9,  total: 13 },
              { dept: 'Legal',        critical: 0, high: 2,  medium: 6,  total: 8 },
              { dept: 'HR',           critical: 0, high: 1,  medium: 8,  total: 9 },
              { dept: 'Operations',   critical: 0, high: 0,  medium: 3,  total: 3 },
            ].map(d => (
              <div key={d.dept} style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                background: d.critical > 0 ? 'var(--severity-critical-bg)' : d.high > 0 ? 'var(--severity-high-bg)' : 'var(--color-surface-secondary)',
              }}>
                <div style={{ font: 'var(--type-label-md)', color: 'var(--color-text-primary)', marginBottom: 8 }}>{d.dept}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {d.critical > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ font: 'var(--type-caption)', color: 'var(--severity-critical-text)' }}>Critical</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--severity-critical-text)' }}>{d.critical}</span></div>}
                  {d.high > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ font: 'var(--type-caption)', color: 'var(--severity-high-text)' }}>High</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--severity-high-text)' }}>{d.high}</span></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, paddingTop: 4, borderTop: '1px solid var(--color-border-default)' }}>
                    <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Total</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--color-text-primary)' }}>{d.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            BOTTOM ROW: F (Billing/Lifecycle) + G (Offline/Degraded) + H (Quick Actions)
            ══════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

          {/* SECTION F — BILLING & LIFECYCLE WARNINGS
              Spec 14.8.F: grace, past_due, suspended, cancel_pending,
              read_only_exit, export_window, retained_only */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <CreditCard size={15} style={{ color: 'var(--color-text-tertiary)' }} />
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Billing &amp; Lifecycle</h3>
            </div>
            {PLATFORM_STATE.lifecycleState === 'active' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--color-state-success-bg)', border: '1px solid var(--color-state-success-border)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={14} style={{ color: 'var(--color-state-success-icon)', flexShrink: 0 }} />
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-success-text)', fontWeight: 500 }}>
                  Subscription active. No commercial issues.
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--color-state-warning-bg)', border: '1px solid var(--color-state-warning-border)', borderRadius: 'var(--radius-md)' }}>
                <AlertTriangle size={14} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0 }} />
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-warning-text)', fontWeight: 500 }}>
                  Lifecycle state: {PLATFORM_STATE.lifecycleState}. Action may be required.
                </span>
              </div>
            )}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Plan', value: 'Enterprise Evidence' },
                { label: 'Seats used', value: '847 / 900' },
                { label: 'Next renewal', value: '2026-08-01' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)' }}>{r.label}</span>
                  <span style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: r.label.includes('Next') || r.label.includes('Seats') ? 'var(--font-mono)' : 'inherit', fontSize: 13 }}>{r.value}</span>
                </div>
              ))}
            </div>
            <a href="/app/billing" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, font: 'var(--type-body-sm)', color: 'var(--color-text-link)', textDecoration: 'none' }}>
              Billing &amp; Seats <ChevronRight size={13} />
            </a>
          </div>

          {/* SECTION G — OFFLINE / DEGRADED WARNINGS
              Spec 14.8.G: offline device count, stale policy cache,
              disconnected control surfaces, stale connector count */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <WifiOff size={15} style={{ color: 'var(--color-text-tertiary)' }} />
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Offline &amp; Degraded</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Offline devices',        value: '4',   state: 'warning' },
                { label: 'Stale agent endpoints',  value: '18',  state: 'warning' },
                { label: 'Stale policy cache',     value: '0',   state: 'ok' },
                { label: 'Disconnected connectors',value: '0',   state: 'ok' },
              ].map(r => (
                <div key={r.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 10px',
                  borderRadius: 6,
                  background: r.state === 'warning' ? 'var(--color-state-warning-bg)' : 'var(--color-surface-secondary)',
                  border: `1px solid ${r.state === 'warning' ? 'var(--color-state-warning-border)' : 'var(--color-border-default)'}`,
                }}>
                  <span style={{ font: 'var(--type-body-sm)', color: r.state === 'warning' ? 'var(--color-state-warning-text)' : 'var(--color-text-secondary)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: r.state === 'warning' ? 'var(--color-state-warning-text)' : 'var(--color-text-tertiary)' }}>{r.value}</span>
                </div>
              ))}
            </div>
            <a href="/app/deployment-status" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, font: 'var(--type-body-sm)', color: 'var(--color-text-link)', textDecoration: 'none' }}>
              Deployment status <ChevronRight size={13} />
            </a>
          </div>

          {/* SECTION H — QUICK ACTIONS PANEL
              Spec 14.9: only show when condition exists,
              never show dead buttons */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Activity size={15} style={{ color: 'var(--color-text-tertiary)' }} />
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Recommended Actions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Action — degraded agents need attention */}
              <a href="/app/deployment-status" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-state-warning-bg)',
                border: '1px solid var(--color-state-warning-border)',
                textDecoration: 'none',
              }}>
                <AlertTriangle size={14} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0 }} />
                <div>
                  <div style={{ font: 'var(--type-label-md)', color: 'var(--color-state-warning-text)' }}>18 agents stale</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-state-warning-text)', opacity: 0.8 }}>Review deployment status</div>
                </div>
                <ChevronRight size={13} style={{ color: 'var(--color-state-warning-text)', marginLeft: 'auto' }} />
              </a>

              {/* Action — critical events need triage */}
              <a href="/app/events?severity=critical" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--severity-critical-bg)',
                border: '1px solid var(--severity-critical-border)',
                textDecoration: 'none',
              }}>
                <XCircle size={14} style={{ color: 'var(--color-state-critical-icon)', flexShrink: 0 }} />
                <div>
                  <div style={{ font: 'var(--type-label-md)', color: 'var(--color-state-critical-text)' }}>3 critical events</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-state-critical-text)', opacity: 0.8 }}>Review and triage</div>
                </div>
                <ChevronRight size={13} style={{ color: 'var(--color-state-critical-text)', marginLeft: 'auto' }} />
              </a>

              {/* Support access history */}
              <a href="/app/support-access-history" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-state-info-bg)',
                border: '1px solid var(--color-state-info-border)',
                textDecoration: 'none',
              }}>
                <Eye size={14} style={{ color: 'var(--color-state-info-icon)', flexShrink: 0 }} />
                <div>
                  <div style={{ font: 'var(--type-label-md)', color: 'var(--color-state-info-text)' }}>Support access history</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-state-info-text)', opacity: 0.8 }}>Review all access logs</div>
                </div>
                <ChevronRight size={13} style={{ color: 'var(--color-state-info-text)', marginLeft: 'auto' }} />
              </a>
            </div>
          </div>
        </div>

      </div>{/* end padding wrapper */}
    </div>
  );
}
