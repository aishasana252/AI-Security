'use client';

/**
 * APEXLyn Lens — User Detail Page
 * Screen ID: OPS-USER-DETAIL-001
 * Route: /app/users/[id]
 * Source: UIUX Specification Section 14.34 – 14.38
 *
 * Required Sections (Spec 14.36):
 * - Identity summary, Seat state, Latest activity
 * - Risk score trend, Anomaly flags, Recent events list
 * - Policy overrides, Device posture summary, Linked cases
 * - Export availability, User Timeline (chronological — mandatory)
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Monitor,
  Scale,
  Download,
  Calendar,
  Lock,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import Link from 'next/link';

// Mock DB for user detail lookup
const MOCK_USERS_DB: Record<string, any> = {
  'usr-82a1': {
    id: 'usr-82a1',
    name: 'pseudo-82a1',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    riskScore: 88,
    anomalyState: 'high-activity',
    seatState: 'billable',
    latestActivity: '2026-06-04T22:31:07Z',
    protectedStatus: 'protected',
    managed: true,
    policyOverrides: 'None allowed',
    devicePosture: {
      os: 'macOS Sequoia 15.1',
      extensionVersion: 'v2.4.1 (Active)',
      agentStatus: 'active',
      gatewayConnection: 'Connected via AP-SE-2',
    },
    linkedCases: [
      { id: 'case-au-001', title: 'Source code exfiltration — Engineering division' }
    ],
    timeline: [
      { date: '2026-06-04 22:31:07', action: 'Blocked', tool: 'ChatGPT', details: 'Egress filter blocked C++ repository code upload.' },
      { date: '2026-06-04 18:14:00', action: 'Audited', tool: 'Claude AI', details: 'Sent general structural query related to code design.' },
      { date: '2026-06-03 11:20:00', action: 'Allowed', tool: 'GitHub Copilot', details: 'Normal IDE code autocompletion (managed).' },
      { date: '2026-06-02 09:00:00', action: 'Warned', tool: 'Gemini', details: 'Attempted prompt with internal DB schematic (Warned & Proceeded).' },
    ],
  },
  'usr-3f7c': {
    id: 'usr-3f7c',
    name: 'pseudo-3f7c',
    department: 'Finance',
    role: 'Financial Analyst',
    riskScore: 74,
    anomalyState: 'data-staging',
    seatState: 'billable',
    latestActivity: '2026-06-04T22:15:44Z',
    protectedStatus: 'protected',
    managed: true,
    policyOverrides: 'Temporary exception allowed for internal spreadsheet parsing',
    devicePosture: {
      os: 'Windows 11 Enterprise',
      extensionVersion: 'v2.4.1 (Active)',
      agentStatus: 'active',
      gatewayConnection: 'Connected via Sydney GW',
    },
    linkedCases: [
      { id: 'case-au-001', title: 'Source code exfiltration — Engineering division' }
    ],
    timeline: [
      { date: '2026-06-04 22:15:44', action: 'Blocked', tool: 'Gemini', details: 'Egress filter blocked Australian Tax File Number uploads (3 occurrences).' },
      { date: '2026-06-04 15:30:00', action: 'Allowed', tool: 'Notion AI', details: 'Workspace document editing session logged.' },
      { date: '2026-06-03 14:10:00', action: 'Audited', tool: 'ChatGPT', details: 'Financial model code verification check.' },
    ],
  },
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const user = MOCK_USERS_DB[id] || {
    id: id || 'usr-unknown',
    name: `pseudo-${id?.substring(4) || 'unknown'}`,
    department: 'Operations',
    role: 'Analyst',
    riskScore: 45,
    anomalyState: 'none',
    seatState: 'billable',
    latestActivity: new Date().toISOString(),
    protectedStatus: 'protected',
    managed: true,
    policyOverrides: 'None',
    devicePosture: {
      os: 'Windows 11 Enterprise',
      extensionVersion: 'v2.4.1 (Active)',
      agentStatus: 'active',
      gatewayConnection: 'Connected',
    },
    linkedCases: [],
    timeline: [
      { date: new Date().toISOString().replace('T', ' ').substring(0, 19), action: 'Audited', tool: 'Claude AI', details: 'Standard dashboard workspace lookup.' }
    ],
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'var(--color-text-critical)';
    if (score >= 60) return 'var(--color-text-warning)';
    return 'var(--color-text-success)';
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── BACK NAV & HEADER ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '12px var(--page-padding)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)',
          }}
        >
          <ArrowLeft size={16} /> Back to Users Directory
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--color-border-default)' }} />
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
          User Explorer · <span style={{ fontFamily: 'var(--font-mono)' }}>{user.id}</span>
        </span>
      </div>

      <div style={{ padding: 'var(--page-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Identity & Seat row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ font: 'var(--type-heading-h1)', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{user.name}</span>
              <span style={{ textTransform: 'capitalize' }} className={`chip chip-${user.seatState === 'billable' ? 'active' : 'low'}`}>
                Seat: {user.seatState}
              </span>
            </h1>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
              {user.role} &nbsp;·&nbsp; {user.department} Department
            </p>
          </div>
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => alert('User telemetry dump completed.')}>
              <Download size={13} /> Export Telemetry Bundle
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            TWO COLUMN LAYOUT
            ══════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>

          {/* LEFT COLUMN: Risk Score, Timeline, Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Risk Score Summary Panel */}
            <div className="card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid var(--color-border-default)', paddingRight: 24 }}>
                <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Risk Score</div>
                <div style={{
                  font: 'var(--type-display-lg)',
                  color: getRiskColor(user.riskScore),
                  margin: '8px 0',
                  fontSize: 48,
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)'
                }}>{user.riskScore}</div>
                <div className={`chip chip-${user.riskScore >= 80 ? 'critical' : user.riskScore >= 60 ? 'high' : 'low'}`} style={{ textTransform: 'capitalize' }}>
                  {user.riskScore >= 80 ? 'Critical Risk' : user.riskScore >= 60 ? 'High Risk' : 'Low/Medium Risk'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 4 }}>Risk Context &amp; Anomaly Status</h4>
                {user.anomalyState !== 'none' ? (
                  <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'var(--color-state-critical-bg)', border: '1px solid var(--color-state-critical-border)', borderRadius: 'var(--radius-md)', margin: '8px 0' }}>
                    <AlertTriangle size={15} style={{ color: 'var(--color-state-critical-icon)', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-critical-text)', fontWeight: 600 }}>
                      Active Anomaly: {user.anomalyState === 'high-activity' ? 'High rate of exfiltration blocks' : 'Suspected data staging detected'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'var(--color-state-success-bg)', border: '1px solid var(--color-state-success-border)', borderRadius: 'var(--radius-md)', margin: '8px 0' }}>
                    <CheckCircle size={15} style={{ color: 'var(--color-state-success-icon)', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-success-text)' }}>
                      No active security anomaly flags logged.
                    </span>
                  </div>
                )}
                <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', lineHeight: 1.5, marginTop: 8 }}>
                  Risk score is dynamic and recalculates every hour based on blocked data class count, prompt injection occurrences, and shadow AI usage.
                </p>
              </div>
            </div>

            {/* MANDATORY: User Chronological Timeline (Spec 14.36) */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                User Chronological Timeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {user.timeline.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: 16, paddingBottom: 16, position: 'relative' }}>
                    
                    {/* timeline node line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: item.action === 'Blocked' ? 'var(--color-state-critical-icon)' : item.action === 'Warned' ? 'var(--color-state-warning-icon)' : 'var(--color-state-info-icon)',
                        border: '2px solid var(--color-surface-primary)',
                        marginTop: 4, zIndex: 1
                      }} />
                      {idx < user.timeline.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: 'var(--color-border-default)', marginTop: 4, minHeight: 32 }} />
                      )}
                    </div>

                    {/* timeline node context */}
                    <div style={{ flex: 1, paddingBottom: 8, borderBottom: idx < user.timeline.length - 1 ? '1px solid var(--color-border-default)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{item.date}</span>
                        <span className={`chip chip-${item.action.toLowerCase() === 'blocked' ? 'critical' : item.action.toLowerCase() === 'warned' ? 'medium' : 'info'}`}>
                          {item.action}
                        </span>
                        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>({item.tool})</span>
                      </div>
                      <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-primary)' }}>{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Device Posture, Policy Overrides, Cases */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Device Posture */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Monitor size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                Device Posture Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Operating System', value: user.devicePosture.os },
                  { label: 'DLP Extension', value: user.devicePosture.extensionVersion },
                  { label: 'Endpoint Agent', value: user.devicePosture.agentStatus, isStatus: true },
                  { label: 'Gateway Scope', value: user.devicePosture.gatewayConnection },
                ].map(r => (
                  <div key={r.label} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{r.label}</div>
                    {r.isStatus ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-active-text)', display: 'inline-block' }} />
                        <span style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--status-active-text)', textTransform: 'capitalize' }}>{r.value}</span>
                      </div>
                    ) : (
                      <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: 2 }}>{r.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Policy Overrides */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                Active Policy Overrides
              </h3>
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {user.policyOverrides}
              </p>
              {user.policyOverrides !== 'None' && user.policyOverrides !== 'None allowed' && (
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 8 }} onClick={() => alert('Revoked override.')}>
                  Revoke Override Exception
                </button>
              )}
            </div>

            {/* Linked Cases */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={15} style={{ color: 'var(--color-text-tertiary)' }} />
                Linked Investigations
              </h3>
              {user.linkedCases.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {user.linkedCases.map((c: any) => (
                    <Link
                      href={`/app/forensics`}
                      key={c.id}
                      style={{
                        display: 'block', padding: 10,
                        border: '1px solid var(--color-border-default)', borderRadius: 6,
                        background: 'var(--color-surface-secondary)', textDecoration: 'none'
                      }}
                    >
                      <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{c.title}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{c.id}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)' }}>No active investigation cases.</span>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
