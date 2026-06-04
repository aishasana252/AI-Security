'use client';

/**
 * APEXLyn Lens — Settings Page
 * Screen ID: ADM-SETTINGS-001
 * Route: /app/settings
 * Source: UIUX Specification Section 20
 *
 * Required sections (Spec 20):
 * - Tenant identity (name, ID, region, isolation, encryption)
 * - Integration connectors (status, re-auth)
 * - User/admin management
 * - Support access history link
 * - Audit history link
 * - MFA enforcement status
 */

import React, { useState } from 'react';
import {
  Settings, Globe, Lock, Users, Plug, History, Shield,
  CheckCircle, AlertTriangle, XCircle, ChevronRight,
  Radio, Eye, Copy, RotateCcw, Plus,
} from 'lucide-react';

const TENANT = {
  name: 'Sovereign-AU-Enterprise',
  id: 't-8c9a2c3f-4b1d-4f2a-9e3c-d5f6e7a8b9c0',
  region: 'ap-southeast-2',
  regionLabel: 'Sydney, Australia',
  isolationType: 'Isolated Dedicated',
  encryptionKey: 'CMK (Customer-Managed Key)',
  dataResidency: 'Australia only',
  plan: 'Enterprise Evidence',
};

const CONNECTORS = [
  { id: 'con-001', name: 'Microsoft 365 / Entra ID', type: 'Identity & Email', status: 'connected', lastValidated: '2026-06-04T08:00:00Z' },
  { id: 'con-002', name: 'Google Workspace',          type: 'Identity & Drive', status: 'connected', lastValidated: '2026-06-04T08:00:00Z' },
  { id: 'con-003', name: 'Okta SAML / OIDC',         type: 'SSO',             status: 'connected', lastValidated: '2026-06-03T14:00:00Z' },
  { id: 'con-004', name: 'AWS S3 Evidence Bucket',    type: 'Evidence Storage',status: 'auth-failed',lastValidated: '2026-06-01T10:30:00Z' },
  { id: 'con-005', name: 'Splunk SIEM (forwarding)',  type: 'SIEM',            status: 'disconnected',lastValidated: '2026-05-28T16:00:00Z' },
];

const ADMINS = [
  { id: 'usr-admin-001', name: 'Abdul Rehman', email: 'a.rehman@sovereign-au.com', role: 'Tenant Admin', mfaState: 'enforced', status: 'active' },
  { id: 'usr-admin-002', name: 'Maya Baxter',  email: 'm.baxter@sovereign-au.com', role: 'Security Analyst', mfaState: 'enforced', status: 'active' },
  { id: 'usr-admin-003', name: 'Jin Park',     email: 'j.park@sovereign-au.com', role: 'Compliance Officer', mfaState: 'pending', status: 'active' },
];

function ConnectorStatus({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    connected:   { cls: 'chip-active',   label: 'Connected' },
    'auth-failed':{ cls: 'chip-critical', label: 'Auth Failed' },
    disconnected:{ cls: 'chip-medium',   label: 'Disconnected' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

const SETTING_TABS = ['Tenant', 'Connectors', 'Administrators', 'Security'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Tenant');
  const [copied, setCopied] = useState(false);

  const copyTenantId = () => {
    navigator.clipboard.writeText(TENANT.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Tenant configuration, connector management, administrator access, and security controls.</p>
        </div>
        <div className="page-header-actions">
          <a href="/app/audit-history" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <History size={13} />
            Audit history
          </a>
          <a href="/app/support-access-history" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <Radio size={13} />
            Support access history
          </a>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-default)', padding: '0 var(--page-padding)' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {SETTING_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 16px',
                border: 'none', background: 'none', cursor: 'pointer',
                font: 'var(--type-body-sm)', fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)',
                borderBottom: activeTab === tab ? '2px solid var(--color-action-primary-bg)' : '2px solid transparent',
                transition: 'color 120ms ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--page-padding)' }}>

        {/* ── TAB: TENANT ── */}
        {activeTab === 'Tenant' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                Tenant Identity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Tenant name', value: TENANT.name, mono: false },
                  { label: 'Tenant ID', value: TENANT.id, mono: true, copy: true },
                  { label: 'Region', value: `${TENANT.region} — ${TENANT.regionLabel}`, mono: false },
                  { label: 'Data residency', value: TENANT.dataResidency, mono: false },
                  { label: 'Isolation type', value: TENANT.isolationType, mono: false },
                  { label: 'Encryption key', value: TENANT.encryptionKey, mono: false },
                  { label: 'Plan', value: TENANT.plan, mono: false },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                    <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', minWidth: 160 }}>{r.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: r.mono ? 'var(--font-mono)' : 'inherit', fontSize: r.mono ? 12 : 14, fontWeight: 500, color: 'var(--color-text-primary)', wordBreak: 'break-all', textAlign: 'right' }}>
                        {r.value}
                      </span>
                      {r.copy && (
                        <button onClick={copyTenantId} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--color-text-success)' : 'var(--color-text-tertiary)', padding: 2 }}>
                          <Copy size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: CONNECTORS ── */}
        {activeTab === 'Connectors' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Integration Connectors</h3>
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                  {CONNECTORS.filter(c => c.status === 'connected').length} connected · {CONNECTORS.filter(c => c.status !== 'connected').length} requiring attention
                </p>
              </div>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Add connector
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {CONNECTORS.map(con => (
                <div key={con.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-surface-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plug size={15} style={{ color: 'var(--color-text-secondary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{con.name}</div>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 1 }}>
                      {con.type} · Last validated: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{formatDate(con.lastValidated)}</span>
                    </div>
                  </div>
                  <ConnectorStatus status={con.status} />
                  {con.status !== 'connected' && (
                    <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RotateCcw size={12} /> Re-authenticate
                    </button>
                  )}
                  <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Eye size={12} /> Configure
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: ADMINISTRATORS ── */}
        {activeTab === 'Administrators' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Administrator Accounts</h3>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Invite admin
              </button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>MFA</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {ADMINS.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{a.email}</td>
                      <td>{a.role}</td>
                      <td>
                        {a.mfaState === 'enforced'
                          ? <span className="chip chip-active"><CheckCircle size={9} /> Enforced</span>
                          : <span className="chip chip-medium"><AlertTriangle size={9} /> Pending</span>
                        }
                      </td>
                      <td><span className="chip chip-active">Active</span></td>
                      <td>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'var(--type-caption)', color: 'var(--color-text-link)' }}>Manage</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: SECURITY ── */}
        {activeTab === 'Security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
            <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Security Controls</h3>
            {[
              { label: 'MFA enforcement', value: 'Enforced for all admin roles', status: 'ok', description: 'All administrator accounts are required to complete MFA at login.' },
              { label: 'Session timeout', value: '8 hours (idle)', status: 'ok', description: 'Sessions expire after 8 hours of inactivity.' },
              { label: 'IP restriction', value: 'Not configured', status: 'warning', description: 'No IP allowlist configured. Consider restricting admin access to corporate IP ranges.' },
              { label: 'JIT support access', value: 'Enabled — all sessions audited', status: 'ok', description: 'No standing APEXLyn credentials. All support access is JIT and customer-visible.' },
              { label: 'SSO enforcement', value: 'SAML 2.0 via Okta', status: 'ok', description: 'SSO is configured and enforced for all portal users.' },
            ].map(s => (
              <div key={s.label} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: s.status === 'ok' ? 'var(--color-state-success-bg)' : 'var(--color-state-warning-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  {s.status === 'ok'
                    ? <CheckCircle size={14} style={{ color: 'var(--color-state-success-icon)' }} />
                    : <AlertTriangle size={14} style={{ color: 'var(--color-state-warning-icon)' }} />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: 'var(--type-label-md)', color: 'var(--color-text-primary)' }}>{s.label}</div>
                  <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: s.status === 'ok' ? 'var(--color-text-success)' : 'var(--color-text-warning)', marginTop: 2 }}>{s.value}</div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 4, lineHeight: 1.5 }}>{s.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
