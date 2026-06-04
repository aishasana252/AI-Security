'use client';

/**
 * APEXLyn Lens — Event Detail Page
 * Screen ID: OPS-EVENT-DETAIL-001
 * Route: /app/events/[id]
 * Source: UIUX Specification Section 14.21 – 14.26
 *
 * Required Panels (Spec 14.24):
 * A. Event Identity Panel (ID, timestamp, layer, tenant, user, destination, tool)
 * B. Decision Panel (action, severity, policy ID, policy version, enforcement, confidence)
 * C. Data Classification Panel (classes, injection result, output-flag, degraded-marker)
 * D. Linkage Panel (input/output linkage, related, case membership, verification status)
 * E. Integrity Panel (evidence hash, chain ref, verification status, hold state, retention profile)
 * F. Export & Workflow Panel (export action, add to case, apply hold, event audit logs)
 */

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  Activity,
  User,
  Cpu,
  Layers,
  Globe,
  Lock,
  Download,
  Scale,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Hash,
  Link2,
  Clock,
  Eye,
  FileText,
  Share2,
} from 'lucide-react';
import Link from 'next/link';

// Mock DB matching the events list from events page
const MOCK_EVENTS_DB: Record<string, any> = {
  'evt-8a3c1f': {
    id: 'evt-8a3c1f',
    timestamp: '2026-06-04T22:31:07Z',
    user: 'pseudo-82a1',
    userRole: 'Senior Software Engineer',
    userDept: 'Engineering',
    action: 'Blocked',
    severity: 'critical',
    dataClass: 'Source Code',
    dataDetails: 'Detected proprietary C++ repository signature (98% match).',
    destinationTool: 'ChatGPT',
    destinationUrl: 'chat.openai.com/backend/chat',
    sourceLayer: 'Browser Extension',
    isOutput: true,
    isInjection: false,
    policyId: 'ps-corp-dlp-001',
    policyName: 'Corporate Data Governance Policy',
    policyVersion: '14',
    enforcementMode: 'Block + Warn',
    confidence: '99.4%',
    inputEventId: 'evt-8a3c1a',
    outputEventId: 'evt-8a3c1f',
    caseLinked: false,
    caseId: null,
    holdState: false,
    degradedMode: false,
    evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    chainRef: 'chain-001-a',
    retentionProfile: '7 Years Governance Standard',
    auditLogs: [
      { time: '2026-06-04T22:31:07Z', msg: 'Payload captured at Browser Extension layer.' },
      { time: '2026-06-04T22:31:07Z', msg: 'Signature search matched rule: ENG-SRC-02.' },
      { time: '2026-06-04T22:31:07Z', msg: 'Action [Blocked] enforced. Block screen displayed to user.' },
      { time: '2026-06-04T22:31:08Z', msg: 'Evidence hash signed and committed to integrity ledger.' },
    ],
  },
  'evt-3b7d2e': {
    id: 'evt-3b7d2e',
    timestamp: '2026-06-04T22:15:44Z',
    user: 'pseudo-3f7c',
    userRole: 'Financial Analyst',
    userDept: 'Finance',
    action: 'Blocked',
    severity: 'critical',
    dataClass: 'PII — Tax File Number',
    dataDetails: 'Identified 3 occurrences of Australian TFN pattern in payload.',
    destinationTool: 'Gemini',
    destinationUrl: 'gemini.google.com/app',
    sourceLayer: 'Browser Extension',
    isOutput: true,
    isInjection: false,
    policyId: 'ps-apra-cps234',
    policyName: 'APRA CPS 234 Compliance Policy',
    policyVersion: '7',
    enforcementMode: 'Block + Audit',
    confidence: '100%',
    inputEventId: 'evt-3b7d29',
    outputEventId: 'evt-3b7d2e',
    caseLinked: true,
    caseId: 'case-au-001',
    caseTitle: 'Source code exfiltration — Engineering division',
    holdState: true,
    degradedMode: false,
    evidenceHash: 'c7c827d096a67f1b77a760b938ca156bd4d1b827ae1d491fca1b7829ac1b98a0',
    chainRef: 'chain-001-b',
    retentionProfile: '10 Years APRA Statutory Hold',
    auditLogs: [
      { time: '2026-06-04T22:15:44Z', msg: 'Payload captured at Browser Extension layer.' },
      { time: '2026-06-04T22:15:44Z', msg: 'Pattern match triggered: REG-TFN-AU.' },
      { time: '2026-06-04T22:15:44Z', msg: 'Enforcement applied: Block + Audit log created.' },
      { time: '2026-06-04T22:15:45Z', msg: 'Evidence linked to Case: case-au-001.' },
    ],
  },
};

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');
  const [caseSelection, setCaseSelection] = useState('case-au-001');

  // Lookup the event in our mock database. If not found, use a fallback dynamic object.
  const event = MOCK_EVENTS_DB[id] || {
    id: id || 'evt-unknown',
    timestamp: new Date().toISOString(),
    user: 'pseudo-unknown',
    userRole: 'Analyst',
    userDept: 'Operations',
    action: 'Audited',
    severity: 'medium',
    dataClass: 'General Business Intelligence',
    dataDetails: 'Payload logs mapped to standard operational audit thresholds.',
    destinationTool: 'Claude AI',
    destinationUrl: 'claude.ai',
    sourceLayer: 'Gateway',
    isOutput: false,
    isInjection: false,
    policyId: 'ps-shadow-ai-gov',
    policyName: 'Shadow AI Tool Governance Policy',
    policyVersion: '2',
    enforcementMode: 'Warn + Audit',
    confidence: '85%',
    inputEventId: 'evt-none-in',
    outputEventId: 'evt-none-out',
    caseLinked: false,
    caseId: null,
    holdState: false,
    degradedMode: true,
    evidenceHash: 'c7c827d096a67f1b77a760b938ca156bd4d1b827ae1d491fca1b7829ac1b98a0',
    chainRef: 'chain-dynamic-001',
    retentionProfile: '3 Years Operational Default',
    auditLogs: [
      { time: new Date().toISOString(), msg: 'Payload captured at Gateway layer.' },
      { time: new Date().toISOString(), msg: 'Logged in degraded mode due to regional proxy delay.' },
    ],
  };

  const [holdApplied, setHoldApplied] = useState(event.holdState);
  const [caseLinked, setCaseLinked] = useState(event.caseLinked);

  const handleApplyHold = (e: React.FormEvent) => {
    e.preventDefault();
    setHoldApplied(true);
    setShowHoldModal(false);
  };

  const handleLinkCase = (e: React.FormEvent) => {
    e.preventDefault();
    setCaseLinked(true);
    setShowCaseModal(false);
  };

  const severityDot: Record<string, string> = {
    critical: '#D64545',
    high: '#C2410C',
    medium: '#FFF6D8',
    low: '#EEF5FB',
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
          <ArrowLeft size={16} /> Back to Events
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--color-border-default)' }} />
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
          Operational Signal Explorer · <span style={{ fontFamily: 'var(--font-mono)' }}>{event.id}</span>
        </span>
      </div>

      <div style={{ padding: 'var(--page-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Top summary row: ID & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ font: 'var(--type-heading-h1)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              Event File Verification
              <span className={`chip chip-${event.severity}`} style={{ textTransform: 'capitalize' }}>
                {event.severity} Severity
              </span>
            </h1>
            <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
              Immutable telemetry record generated by {event.sourceLayer} integration layer.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className={`chip chip-${event.action.toLowerCase() === 'blocked' ? 'critical' : 'medium'}`} style={{ fontSize: 13, padding: '4px 12px' }}>
              Enforced: {event.action}
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            GRID: PANELS A, B, C, D, E, F (Spec 14.24)
            ══════════════════════════════════════════════════ */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          
          {/* LEFT COLUMN: Panels A, C, E, Audit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* PANEL A: Event Identity Panel */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                Event Identity Panel
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Event ID', value: event.id, mono: true },
                  { label: 'Timestamp (UTC)', value: event.timestamp, mono: true },
                  { label: 'Source Integration Layer', value: event.sourceLayer, mono: false },
                  { label: 'User Pseudonym Reference', value: event.user, mono: true },
                  { label: 'User Department & Role', value: `${event.userDept} · ${event.userRole}`, mono: false },
                  { label: 'Destination Tool Name', value: event.destinationTool, mono: false },
                  { label: 'Destination Host / URL', value: event.destinationUrl, mono: true },
                ].map(r => (
                  <div key={r.label} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginBottom: 2 }}>{r.label}</div>
                    <div style={{
                      font: r.mono ? 'var(--type-caption)' : 'var(--type-body-sm)',
                      fontFamily: r.mono ? 'var(--font-mono)' : 'inherit',
                      fontWeight: 600,
                      color: 'var(--color-text-primary)'
                    }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL C: Data Classification Panel */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                Data Classification Panel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200, padding: 12, background: 'var(--color-surface-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Detected Data Class</div>
                    <div style={{ font: 'var(--type-body-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 4 }}>{event.dataClass}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 200, padding: 12, background: 'var(--color-surface-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Classification Mode</div>
                    <div style={{ font: 'var(--type-body-lg)', fontWeight: 700, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      {event.isOutput ? 'Model Output Analysis' : 'User Input Submission'}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Signature Match Context</div>
                  <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', background: 'var(--color-surface-canvas)', padding: 10, borderRadius: 6, border: '1px solid var(--color-border-default)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                    {event.dataDetails}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span className={`chip ${event.isInjection ? 'chip-critical' : 'chip-active'}`}>
                    Prompt Injection: {event.isInjection ? 'Detected' : 'Negative'}
                  </span>
                  <span className="chip chip-info">
                    Directional Flow: {event.isOutput ? 'Outgoing egress' : 'Incoming prompt'}
                  </span>
                  {event.degradedMode && (
                    <span className="chip chip-degraded">
                      Captured in Degraded Mode
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL E: Integrity Panel */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Hash size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                Integrity Panel (SHA-256 Ledger Signing)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Immutable SHA-256 Evidence Hash</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--color-accent-ai-text)',
                    background: 'var(--color-accent-ai-soft-bg)',
                    border: '1px solid var(--color-accent-ai-soft-border)',
                    padding: '8px 12px',
                    borderRadius: 6,
                    wordBreak: 'break-all'
                  }}>
                    {event.evidenceHash}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 4 }}>
                  <div>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Verification status</div>
                    <div style={{ font: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--color-text-success)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle size={13} /> Verified Authentic
                    </div>
                  </div>
                  <div>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Ledger Chain Ref</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 2 }}>
                      {event.chainRef}
                    </div>
                  </div>
                  <div>
                    <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>Retention Profile</div>
                    <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {event.retentionProfile}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Audit logs (Part of Panel F workflow) */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: 'var(--color-text-tertiary)' }} />
                Audit Logs Trail
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {event.auditLogs.map((log: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', padding: '6px 0', borderBottom: idx < event.auditLogs.length - 1 ? '1px solid var(--color-surface-hover)' : 'none' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)', flexShrink: 0 }}>
                      {new Date(log.time).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Panels B, D, F */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* PANEL B: Decision Panel */}
            <div className="card" style={{ borderLeft: '4px solid var(--color-action-primary-bg)' }}>
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 16 }}>
                Decision Panel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Action Enforced', value: event.action, isCrit: event.action === 'Blocked' },
                  { label: 'Severity Classification', value: event.severity, uppercase: true },
                  { label: 'DLP Governance Policy ID', value: event.policyId, link: `/app/policies` },
                  { label: 'Active Policy Version', value: `v${event.policyVersion}`, mono: true },
                  { label: 'Enforcement Mode', value: event.enforcementMode },
                  { label: 'Classifier Confidence', value: event.confidence, mono: true },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                    <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)' }}>{r.label}</span>
                    {r.link ? (
                      <Link href={r.link} style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-link)', textDecoration: 'none' }}>
                        {r.value}
                      </Link>
                    ) : (
                      <span style={{
                        font: 'var(--type-body-sm)',
                        fontFamily: r.mono ? 'var(--font-mono)' : 'inherit',
                        fontWeight: 700,
                        color: r.isCrit ? 'var(--color-text-critical)' : 'var(--color-text-primary)',
                        textTransform: r.uppercase ? 'uppercase' : 'none'
                      }}>
                        {r.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PANEL D: Linkage Panel */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 14 }}>
                Linkage Panel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Link2 size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>Related Inputs &amp; Outputs:</span>
                </div>
                <div style={{ paddingLeft: 22, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Link href={`/app/events/${event.inputEventId}`} style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none', display: 'block' }}>
                    ← Input Context: {event.inputEventId}
                  </Link>
                  <Link href={`/app/events/${event.outputEventId}`} style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none', display: 'block' }}>
                    → Output Block: {event.outputEventId}
                  </Link>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-default)', margin: '8px 0' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Scale size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>Case Membership:</span>
                </div>
                <div style={{ paddingLeft: 22 }}>
                  {caseLinked ? (
                    <div>
                      <Link href={`/app/forensics`} style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none', display: 'block' }}>
                        Linked to: {event.caseTitle || 'Active Forensics Case'}
                      </Link>
                      <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>{event.caseId || 'case-au-001'}</span>
                    </div>
                  ) : (
                    <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)' }}>Not linked to any investigation case.</span>
                  )}
                </div>
              </div>
            </div>

            {/* PANEL F: Export & Workflow Panel */}
            <div className="card">
              <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 14 }}>
                Actions &amp; Workflows
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                  onClick={() => alert('Evidence archive generated successfully. Manifest signature: ECDSA-256.')}
                >
                  <Download size={14} /> Export Evidence Bundle
                </button>
                
                {!caseLinked && (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                    onClick={() => setShowCaseModal(true)}
                  >
                    <Link2 size={14} /> Link to Case
                  </button>
                )}

                {holdApplied ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', background: 'var(--status-held-bg)',
                    border: '1px solid #DDD6FE', borderRadius: 'var(--radius-md)',
                    color: 'var(--status-held-text)', font: 'var(--type-body-sm)', fontWeight: 600
                  }}>
                    <Lock size={14} /> Legal Hold Active
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                    onClick={() => setShowHoldModal(true)}
                  >
                    <Lock size={14} /> Apply Legal Hold
                  </button>
                )}

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', gap: 8 }}
                  onClick={() => alert('Chain verification re-audit triggered.')}
                >
                  <CheckCircle size={14} /> Re-verify Ledger Integrity
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── LEGAL HOLD MODAL ── */}
      {showHoldModal && (
        <div className="modal-overlay" onClick={() => setShowHoldModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Lock size={18} style={{ color: 'var(--color-text-secondary)' }} />
              <h3 style={{ font: 'var(--type-heading-h3)' }}>Apply Legal Hold</h3>
            </div>
            <form onSubmit={handleApplyHold} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>
                Applying a legal hold blocks evidence record deletion.
              </p>
              <div>
                <label style={{ display: 'block', font: 'var(--type-label-md)', marginBottom: 6 }}>Hold Reason Justification</label>
                <textarea
                  required
                  rows={3}
                  value={holdReason}
                  onChange={e => setHoldReason(e.target.value)}
                  placeholder="e.g. Mandatory APRA regulatory review case-021..."
                  style={{
                    width: '100%', padding: 8, border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                    font: 'var(--type-body-sm)', outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowHoldModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Confirm Hold</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CASE LINKING MODAL ── */}
      {showCaseModal && (
        <div className="modal-overlay" onClick={() => setShowCaseModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Scale size={18} style={{ color: 'var(--color-text-secondary)' }} />
              <h3 style={{ font: 'var(--type-heading-h3)' }}>Link to Investigation Case</h3>
            </div>
            <form onSubmit={handleLinkCase} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', font: 'var(--type-label-md)', marginBottom: 6 }}>Select Active Forensic Case</label>
                <select
                  value={caseSelection}
                  onChange={e => setCaseSelection(e.target.value)}
                  style={{
                    width: '100%', height: 36, border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                    font: 'var(--type-body-sm)', outline: 'none', padding: '0 8px'
                  }}
                >
                  <option value="case-au-001">case-au-001 · Source code exfiltration — Engineering division</option>
                  <option value="case-au-002">case-au-002 · PII disclosure risk — Finance team AI use</option>
                  <option value="case-au-003">case-au-003 · Injection prompt pattern review — Legal AI</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCaseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Link Evidence</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(11, 19, 32, 0.56);
          display: flex; alignItems: center; justifyContent: center; z-index: 1000;
        }
        .modal {
          background: var(--color-surface-primary);
          border: 1px solid var(--color-border-default);
          border-radius: var(--radius-lg);
          padding: 24px; width: 100%; maxWidth: 460px;
          box-shadow: var(--elevation-3);
        }
      `}</style>
    </div>
  );
}
