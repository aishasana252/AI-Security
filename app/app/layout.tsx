'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Activity,
  Shield,
  Eye,
  FolderSearch,
  FileCheck,
  Plug,
  CreditCard,
  Users,
  Settings,
  History,
  Lock,
  ChevronDown,
  Bell,
  Search,
  HelpCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Cpu,
  Scale,
  FileBarChart,
  Gavel,
  Package,
  Radio,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   NAVIGATION STRUCTURE
   Source: UIUX Spec Section 4 (Route Map) + Section 4.5
   Direct Portal: /app/*
   ───────────────────────────────────────────────────────────── */
interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  badge?: string;
}
interface NavGroup {
  groupLabel: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupLabel: 'Operations',
    items: [
      { label: 'Overview',       href: '/app/overview',            icon: LayoutDashboard },
      { label: 'Events',         href: '/app/events',              icon: Activity },
      { label: 'Users',          href: '/app/users',               icon: Users },
    ],
  },
  {
    groupLabel: 'Governance',
    items: [
      { label: 'DLP Policies',         href: '/app/policies',              icon: Shield },
      { label: 'Shadow AI',            href: '/app/shadow-ai',             icon: Eye },
      { label: 'Internal AI Inventory',href: '/app/internal-ai-inventory', icon: Cpu },
    ],
  },
  {
    groupLabel: 'Investigation',
    items: [
      { label: 'Forensic Workspace', href: '/app/forensics',   icon: FolderSearch },
      { label: 'Cases',             href: '/app/cases',        icon: Scale },
      { label: 'Exports',           href: '/app/exports',      icon: Package },
      { label: 'Legal Hold',        href: '/app/legal-hold',   icon: Gavel },
    ],
  },
  {
    groupLabel: 'Compliance',
    items: [
      { label: 'Compliance',  href: '/app/compliance', icon: FileCheck },
      { label: 'Reports',     href: '/app/reports',    icon: FileBarChart },
    ],
  },
  {
    groupLabel: 'Integrations',
    items: [
      { label: 'Integrations', href: '/app/integrations', icon: Plug },
    ],
  },
  {
    groupLabel: 'Commercial',
    items: [
      { label: 'Billing', href: '/app/billing', icon: CreditCard },
      { label: 'Seats',   href: '/app/seats',   icon: Users },
    ],
  },
  {
    groupLabel: 'Administration',
    items: [
      { label: 'Settings',              href: '/app/settings',               icon: Settings },
      { label: 'Audit History',         href: '/app/audit-history',          icon: History },
      { label: 'Support Access History',href: '/app/support-access-history', icon: Radio },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   PORTAL LAYOUT
   Spec Section 6.4 — Mandatory structural regions:
   1. Left navigation rail (dark #0B1320, 272px)
   2. Top global context bar
   3. Page-level status banner area
   4. Primary content region (light #F4F7FB)
   ───────────────────────────────────────────────────────────── */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Tenant context (will be replaced by real auth/RLS data)
  const tenant = {
    name: 'Sovereign-AU-Enterprise',
    id: 't-8c9a2c3f',
    region: 'ap-southeast-2',
    regionLabel: 'Sydney',
    plan: 'Enterprise Evidence',
    lifecycleState: 'active',
    isolationType: 'Isolated Dedicated',
    keyType: 'CMK',
  };

  // JIT Support Access state (Spec Section 6.32 + Section 11)
  const [jitActive, setJitActive] = useState(false);
  const [jitCountdown, setJitCountdown] = useState('');
  const [showJitModal, setShowJitModal] = useState(false);
  const [jitDuration, setJitDuration] = useState('1');
  const [jitReason, setJitReason] = useState('');
  const [jitSubmitting, setJitSubmitting] = useState(false);

  // Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      severity: 'critical' as const,
      title: 'Critical event detected',
      body: 'Blocked raw code upload to external LLM by user pseudo-82a1.',
      time: '5m ago',
    },
    {
      id: 2,
      severity: 'success' as const,
      title: 'Compliance report generated',
      body: 'APRA CPS 234 dossier built successfully.',
      time: '1h ago',
    },
  ]);

  // User menu
  const [showUserMenu, setShowUserMenu] = useState(false);

  // JIT timer
  useEffect(() => {
    if (!jitActive) return;
    let seconds = parseInt(jitDuration) * 3600;
    const interval = setInterval(() => {
      seconds--;
      if (seconds <= 0) { setJitActive(false); clearInterval(interval); return; }
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (seconds % 60).toString().padStart(2, '0');
      setJitCountdown(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [jitActive, jitDuration]);

  const handleJitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jitReason.trim()) return;
    setJitSubmitting(true);
    setTimeout(() => {
      setJitActive(true);
      setJitCountdown(`0${jitDuration}:00:00`);
      setJitSubmitting(false);
      setShowJitModal(false);
    }, 1200);
  };

  const isActive = (href: string) => pathname?.startsWith(href);

  const severityDot: Record<string, string> = {
    critical: '#D64545',
    success: '#1F8A70',
    warning: '#F5B700',
    info: '#1E90FF',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--color-surface-app)' }}>

      {/* ══════════════════════════════════════════════════════
          LEFT NAVIGATION RAIL
          Spec: Section 6.6, 4.3, 5.6
          width: 272px, bg: #0B1320 (--color-chrome-primary)
          ══════════════════════════════════════════════════════ */}
      <aside style={{
        width: 'var(--nav-width-expanded)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-chrome-primary)',
        borderRight: '1px solid var(--color-chrome-divider)',
        overflow: 'hidden',
      }}>

        {/* Brand / Logo */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          borderBottom: '1px solid var(--color-chrome-divider)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: 'var(--color-action-primary-bg)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Shield size={16} style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <div style={{
                font: 'var(--type-heading-h4)',
                color: 'var(--color-text-inverse)',
                letterSpacing: '-0.01em',
              }}>
                APEXLyn Lens
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--status-active-text)', display: 'inline-block' }} />
                <span style={{ font: 'var(--type-caption)', color: 'var(--status-active-text)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                  DLP Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Context Block */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-chrome-divider)',
          flexShrink: 0,
        }}>
          <div style={{
            background: 'var(--color-chrome-secondary)',
            border: '1px solid var(--color-chrome-divider)',
            borderRadius: 8,
            padding: '10px 12px',
          }}>
            <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Current Tenant
            </div>
            <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-inverse)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tenant.name}
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(30,144,255,0.15)', color: 'var(--color-accent-ai-primary)', border: '1px solid rgba(30,144,255,0.25)' }}>
                {tenant.region}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(30,58,138,0.3)', color: '#93C5FD', border: '1px solid rgba(30,58,138,0.4)' }}>
                {tenant.keyType}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>
              {/* Group Label */}
              <div style={{
                padding: '4px 20px 6px',
                font: 'var(--type-caption)',
                fontWeight: 700,
                color: 'var(--color-text-disabled)',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
              }}>
                {group.groupLabel}
              </div>
              {/* Items */}
              {group.items.map((item, ii) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={ii}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 20px',
                      margin: '1px 8px',
                      borderRadius: 6,
                      font: 'var(--type-body-sm)',
                      fontWeight: active ? 600 : 400,
                      color: active ? 'var(--color-text-inverse)' : '#8098B8',
                      background: active ? 'var(--color-chrome-selected)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'background 120ms ease, color 120ms ease',
                      borderLeft: active ? '3px solid var(--color-chrome-selected-accent)' : '3px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--color-chrome-secondary)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-inverse)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#8098B8';
                      }
                    }}
                  >
                    <span style={{ display: 'inline-flex', flexShrink: 0 }}><Icon size={15} className={active ? '' : ''} /></span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 99, background: '#D64545', color: '#fff' }}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {/* Group divider */}
              {gi < NAV_GROUPS.length - 1 && (
                <div style={{ height: 1, background: 'var(--color-chrome-divider)', margin: '8px 20px' }} />
              )}
            </div>
          ))}
        </nav>

        {/* ── JIT Support Access Panel (Spec Section 6.32 + 11) ── */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-chrome-divider)',
          flexShrink: 0,
        }}>
          {jitActive ? (
            // Active JIT session — must be impossible to miss (Spec 6.32)
            <div style={{
              background: 'rgba(245,183,0,0.1)',
              border: '1px solid rgba(245,183,0,0.35)',
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={13} style={{ color: '#F5B700' }} />
                  <span style={{ font: 'var(--type-label-md)', color: '#F5B700' }}>JIT Access Active</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: '#F5B700', background: 'rgba(245,183,0,0.15)', padding: '1px 6px', borderRadius: 4 }}>
                  {jitCountdown}
                </span>
              </div>
              <p style={{ font: 'var(--type-caption)', color: '#D4A017', lineHeight: 1.5, marginBottom: 8 }}>
                Support access active. All actions fully audited and customer-visible.
              </p>
              <button
                onClick={() => setJitActive(false)}
                className="btn btn-sm"
                style={{ width: '100%', background: '#B45309', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', height: 28 }}
              >
                Terminate Session
              </button>
            </div>
          ) : (
            // No active support session
            <div style={{
              background: 'var(--color-chrome-secondary)',
              border: '1px solid var(--color-chrome-divider)',
              borderRadius: 8,
              padding: '10px 12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                <Lock size={12} style={{ color: '#8098B8' }} />
                <span style={{ font: 'var(--type-caption)', fontWeight: 600, color: '#8098B8' }}>Support Isolation Active</span>
              </div>
              <p style={{ font: 'var(--type-caption)', color: '#5C7A9E', lineHeight: 1.5, marginBottom: 8 }}>
                No standing admin credentials. Access is JIT and time-bounded.
              </p>
              <button
                onClick={() => setShowJitModal(true)}
                style={{
                  width: '100%', height: 28,
                  background: 'var(--color-chrome-tertiary)',
                  border: '1px solid var(--color-chrome-divider)',
                  borderRadius: 6,
                  color: '#A0B4CC',
                  fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                Request JIT Access
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════
          MAIN WORKSPACE AREA
          ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── TOP GLOBAL CONTEXT BAR (Spec Section 6.7) ── */}
        <header style={{
          height: 64,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--page-padding)',
          background: 'var(--color-surface-primary)',
          borderBottom: '1px solid var(--color-border-default)',
          boxShadow: 'var(--elevation-1)',
          gap: 16,
        }}>

          {/* Portal Identity + Breadcrumb context */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px',
              background: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              font: 'var(--type-body-sm)',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}>
              <span>Direct Customer Portal</span>
              <ChevronDown size={13} style={{ color: 'var(--color-text-tertiary)' }} />
            </div>
          </div>

          {/* Universal Search (Spec 4.12) */}
          <div style={{ flex: 1, maxWidth: 480, position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-disabled)',
            }} />
            <input
              type="text"
              placeholder="Search events, cases, policies, users..."
              style={{
                width: '100%',
                height: 36,
                paddingLeft: 34,
                paddingRight: 12,
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-secondary)',
                font: 'var(--type-body-sm)',
                color: 'var(--color-text-primary)',
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-border-focus)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,144,255,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border-default)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Right — Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Help */}
            <button style={{
              width: 36, height: 36,
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-secondary)',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <HelpCircle size={15} />
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  width: 36, height: 36,
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-secondary)',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Bell size={15} />
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 7, height: 7, borderRadius: '50%',
                  background: '#D64545',
                  border: '1.5px solid var(--color-surface-primary)',
                }} />
              </button>

              {showNotifications && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  width: 340,
                  background: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--elevation-3)',
                  zIndex: 100,
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-default)' }}>
                    <span style={{ font: 'var(--type-label-md)', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Notifications
                    </span>
                  </div>
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div key={n.id} style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid var(--color-border-default)',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                          background: severityDot[n.severity] || '#94A3B8',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ font: 'var(--type-label-md)', color: 'var(--color-text-primary)', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>{n.body}</div>
                          <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)', marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 11 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '8px 16px' }}>
                    <button style={{ width: '100%', font: 'var(--type-body-sm)', color: 'var(--color-text-link)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}>
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: 'var(--color-border-default)' }} />

            {/* User Account */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 8px 4px 4px',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-secondary)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 28, height: 28,
                  borderRadius: 6,
                  background: 'var(--color-action-primary-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.02em',
                }}>
                  AR
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ font: 'var(--type-label-md)', color: 'var(--color-text-primary)' }}>Abdul Rehman</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenant Admin</div>
                </div>
                <ChevronDown size={12} style={{ color: 'var(--color-text-disabled)', flexShrink: 0 }} />
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 6,
                  width: 200,
                  background: 'var(--color-surface-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--elevation-3)',
                  zIndex: 100,
                  overflow: 'hidden',
                  padding: 4,
                }}>
                  {[
                    { label: 'Profile & Security', href: '/app/settings' },
                    { label: 'Audit History',       href: '/app/audit-history' },
                  ].map(m => (
                    <Link key={m.label} href={m.href} style={{
                      display: 'block', padding: '8px 12px',
                      borderRadius: 6, font: 'var(--type-body-sm)',
                      color: 'var(--color-text-primary)', textDecoration: 'none',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >{m.label}</Link>
                  ))}
                  <div style={{ height: 1, background: 'var(--color-border-default)', margin: '4px 0' }} />
                  <button style={{
                    width: '100%', padding: '8px 12px', borderRadius: 6,
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    font: 'var(--type-body-sm)', color: 'var(--color-text-critical)', textAlign: 'left',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-state-critical-bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={13} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page-Level Status Banner Area (Spec Section 6.9) ── */}
        {/* Rendered conditionally by each page when needed */}

        {/* ── Primary Content Region ── */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--color-surface-app)',
        }}>
          {children}
        </main>
      </div>

      {/* ══════════════════════════════════════════════════════
          JIT SUPPORT ACCESS REQUEST MODAL
          Spec Section 11 — serious workflow, full audit trail
          ══════════════════════════════════════════════════════ */}
      {showJitModal && (
        <div className="modal-overlay" onClick={() => setShowJitModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'var(--color-state-warning-bg)',
                border: '1px solid var(--color-state-warning-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Lock size={16} style={{ color: 'var(--color-state-warning-text)' }} />
              </div>
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Request JIT Support Access</h3>
                <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                  Time-bounded, fully audited, customer-visible.
                </p>
              </div>
            </div>

            <hr className="divider" style={{ margin: '16px 0' }} />

            <form onSubmit={handleJitSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Session Duration</label>
                <select
                  value={jitDuration}
                  onChange={e => setJitDuration(e.target.value)}
                  className="input"
                  style={{ height: 40 }}
                >
                  <option value="1">1 hour — Standard debugging</option>
                  <option value="2">2 hours — Extended setup</option>
                  <option value="4">4 hours — Complex configuration</option>
                  <option value="8">8 hours — Break-glass override</option>
                </select>
              </div>

              <div>
                <label className="section-label" style={{ display: 'block', marginBottom: 6 }}>Access Justification <span style={{ color: 'var(--color-text-critical)' }}>*</span></label>
                <textarea
                  required
                  rows={3}
                  value={jitReason}
                  onChange={e => setJitReason(e.target.value)}
                  placeholder="Reference ticket number or describe the specific issue requiring elevated access..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-secondary)',
                    font: 'var(--type-body-sm)',
                    color: 'var(--color-text-primary)',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'var(--font-primary)',
                  }}
                />
              </div>

              {/* Consequence warning — Spec requires serious action to feel serious */}
              <div style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: 12,
                background: 'var(--color-state-warning-bg)',
                border: '1px solid var(--color-state-warning-border)',
                borderRadius: 'var(--radius-md)',
              }}>
                <AlertTriangle size={15} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0, marginTop: 1 }} />
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-warning-text)', lineHeight: 1.6 }}>
                  By submitting, you confirm authorisation for this access. An entry will be posted to the customer-visible <strong>Support Access History</strong> ledger immediately.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowJitModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={jitSubmitting || !jitReason.trim()}
                  className="btn btn-primary"
                  style={{ minWidth: 140 }}
                >
                  {jitSubmitting ? (
                    <><Clock size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                  ) : (
                    <><CheckCircle size={14} /> Approve &amp; Authorise</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
}
