'use client';

/**
 * APEXLyn Lens — Integration Connectors Page
 * Screen ID: ADM-INTEGRATIONS-001
 * Route: /app/integrations
 * Source: UIUX Specification Section 19
 *
 * Implements status monitoring blocks and actions (re-auth, configure)
 * for tenant connectors (SSO, Active Directory, Evidence Buckets, SIEM forwarding).
 */

import React, { useState } from 'react';
import {
  Plug, Plus, Search, Filter, ChevronDown, RefreshCw,
  CheckCircle, AlertTriangle, XCircle, Clock, ArrowUpRight,
  Eye, Settings, HelpCircle,
} from 'lucide-react';

const INITIAL_CONNECTORS = [
  { id: 'con-001', name: 'Microsoft 365 / Entra ID', type: 'Identity & Email Sync', status: 'connected', lastValidated: '2026-06-04T08:00:00Z', description: 'Synchronizes user pseudonym matrices and monitors Copilot chat context endpoints.' },
  { id: 'con-002', name: 'Google Workspace',          type: 'Identity & Drive Sync', status: 'connected', lastValidated: '2026-06-04T08:00:00Z', description: 'Synchronizes shared corporate drive assets and monitors Gemini Workspace telemetry.' },
  { id: 'con-003', name: 'Okta SAML / OIDC',         type: 'Single Sign-On (SSO)', status: 'connected', lastValidated: '2026-06-03T14:00:00Z', description: 'Enforces tenant-scoped Single Sign-On, MFA verification, and admin session expiry.' },
  { id: 'con-004', name: 'AWS S3 Evidence Bucket',    type: 'Evidence Storage',status: 'auth-failed',lastValidated: '2026-06-01T10:30:00Z', description: 'VPC-isolated secure storage for encrypted forensic payloads and exported PDF dossiers.' },
  { id: 'con-005', name: 'Splunk SIEM (forwarding)',  type: 'SIEM Integration', status: 'disconnected',lastValidated: '2026-05-28T16:00:00Z', description: 'Forwards real-time DLP alert logs and prompt injection warnings to corporate SIEM.' },
];

function ConnectionBadge({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    connected:   { cls: 'chip-active',   label: 'Connected' },
    'auth-failed':{ cls: 'chip-critical', label: 'Auth Failed' },
    disconnected:{ cls: 'chip-medium',   label: 'Inactive' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{c.label}</span>;
}

export default function IntegrationsPage() {
  const [connectors, setConnectors] = useState(INITIAL_CONNECTORS);
  const [filterStatus, setFilterStatus] = useState('All');

  const handleReauth = (id: string) => {
    setConnectors(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'connected',
          lastValidated: new Date().toISOString(),
        };
      }
      return c;
    }));
    alert(`Re-authentication succeeded. Connection verified with status: CONNECTED.`);
  };

  const filtered = connectors.filter(c => {
    if (filterStatus !== 'All' && c.status !== filterStatus.toLowerCase()) return false;
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleString('en-AU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">Integration connectors — authenticate and configure access points for identity providers, logs forwarding, and evidence vaults.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => alert('New integration connector library loaded.')}>
            <Plus size={14} /> Add integration
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
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Filter by connection:</span>
          <button onClick={() => setFilterStatus('All')} style={{ height: 28, padding: '0 10px', border: `1px solid ${filterStatus === 'All' ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`, borderRadius: 99, font: 'var(--type-caption)', fontWeight: filterStatus === 'All' ? 600 : 400, color: filterStatus === 'All' ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', background: filterStatus === 'All' ? 'var(--color-state-info-bg)' : 'transparent', cursor: 'pointer' }}>All</button>
          <button onClick={() => setFilterStatus('Connected')} style={{ height: 28, padding: '0 10px', border: `1px solid ${filterStatus === 'Connected' ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`, borderRadius: 99, font: 'var(--type-caption)', fontWeight: filterStatus === 'Connected' ? 600 : 400, color: filterStatus === 'Connected' ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', background: filterStatus === 'Connected' ? 'var(--color-state-info-bg)' : 'transparent', cursor: 'pointer' }}>Connected</button>
          <button onClick={() => setFilterStatus('Auth-Failed')} style={{ height: 28, padding: '0 10px', border: `1px solid ${filterStatus === 'Auth-Failed' ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`, borderRadius: 99, font: 'var(--type-caption)', fontWeight: filterStatus === 'Auth-Failed' ? 600 : 400, color: filterStatus === 'Auth-Failed' ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', background: filterStatus === 'Auth-Failed' ? 'var(--color-state-info-bg)' : 'transparent', cursor: 'pointer' }}>Auth Failed</button>
        </div>
      </div>

      {/* ── CONNECTORS CARDS LIST ── */}
      <div style={{ flex: 1, padding: 'var(--page-padding)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(con => (
          <div key={con.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--color-surface-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Plug size={20} style={{ color: 'var(--color-text-secondary)' }} />
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>{con.name}</h3>
                <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>({con.type})</span>
              </div>
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.4 }}>{con.description}</p>
              <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 6 }}>
                Last Validated: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{formatDate(con.lastValidated)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              <ConnectionBadge status={con.status} />
              <div style={{ display: 'flex', gap: 6 }}>
                {con.status !== 'connected' && (
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: 12, height: 30 }}
                    onClick={() => handleReauth(con.id)}
                  >
                    Re-authenticate
                  </button>
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, height: 30 }}
                  onClick={() => alert(`Configuring: ${con.name}`)}
                >
                  Configure
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
