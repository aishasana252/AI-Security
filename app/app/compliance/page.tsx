'use client';

/**
 * APEXLyn Lens — Compliance Dossier Page
 * Screen ID: GOV-COMPLIANCE
 * Route: /app/compliance
 * Source: UIUX Specification Section 17
 *
 * Required sections (Spec 17):
 * - Framework Views: APRA CPS 234, ISO 27001, SOC 2, Privacy Act
 * - Control Register: control ID, name, framework mapping, status, evidence count
 * - Gap Visibility: controls with gaps highlighted
 * - Report Generation entry point
 */

import React, { useState } from 'react';
import {
  FileCheck, Shield, AlertTriangle, CheckCircle, XCircle, Minus,
  FileBarChart, ChevronRight, Download, Eye, ArrowUpRight,
  BarChart2, Clock, Plus,
} from 'lucide-react';
import Link from 'next/link';

const FRAMEWORKS = [
  {
    id: 'apra-cps234',
    name: 'APRA CPS 234',
    description: 'Australian Prudential Regulation Authority — Information Security',
    controls: 28,
    met: 22,
    partial: 4,
    gap: 2,
    lastReviewed: '2026-05-15',
    reportReady: true,
  },
  {
    id: 'iso-27001',
    name: 'ISO/IEC 27001:2022',
    description: 'Information Security Management System',
    controls: 93,
    met: 71,
    partial: 14,
    gap: 8,
    lastReviewed: '2026-04-30',
    reportReady: true,
  },
  {
    id: 'soc2-type2',
    name: 'SOC 2 Type II',
    description: 'Service Organisation Control — Trust Service Criteria',
    controls: 64,
    met: 58,
    partial: 4,
    gap: 2,
    lastReviewed: '2026-05-01',
    reportReady: false,
  },
  {
    id: 'privacy-act',
    name: 'Australian Privacy Act 1988',
    description: 'Australian Privacy Principles (APPs)',
    controls: 13,
    met: 11,
    partial: 2,
    gap: 0,
    lastReviewed: '2026-03-20',
    reportReady: true,
  },
];

const CONTROL_REGISTER = [
  { id: 'CPS234-3.2', name: 'Information Security Capability', framework: 'APRA CPS 234', status: 'met', evidenceCount: 12, owner: 'CISO', lastReview: '2026-05-15' },
  { id: 'CPS234-4.1', name: 'Information Asset Classification', framework: 'APRA CPS 234', status: 'partial', evidenceCount: 7, owner: 'InfoSec Team', lastReview: '2026-05-10' },
  { id: 'CPS234-5.3', name: 'Third-Party Management Controls', framework: 'APRA CPS 234', status: 'gap', evidenceCount: 2, owner: 'Risk Team', lastReview: '2026-04-28' },
  { id: 'ISO-A.8.1', name: 'Responsibility for Assets', framework: 'ISO/IEC 27001:2022', status: 'met', evidenceCount: 9, owner: 'IT Security', lastReview: '2026-04-30' },
  { id: 'ISO-A.9.2', name: 'User Access Management', framework: 'ISO/IEC 27001:2022', status: 'met', evidenceCount: 14, owner: 'IAM Team', lastReview: '2026-04-30' },
  { id: 'ISO-A.12.6', name: 'Vulnerability Management', framework: 'ISO/IEC 27001:2022', status: 'partial', evidenceCount: 5, owner: 'SecOps', lastReview: '2026-04-15' },
  { id: 'SOC2-CC6.1', name: 'Logical Access Controls', framework: 'SOC 2 Type II', status: 'met', evidenceCount: 18, owner: 'IT Security', lastReview: '2026-05-01' },
  { id: 'APA-APP1', name: 'Open and Transparent Management of PI', framework: 'Australian Privacy Act 1988', status: 'met', evidenceCount: 6, owner: 'Privacy Officer', lastReview: '2026-03-20' },
];

function ControlStatusChip({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    met:      { cls: 'chip-active',   label: 'Met' },
    partial:  { cls: 'chip-medium',   label: 'Partial' },
    gap:      { cls: 'chip-critical', label: 'Gap' },
    na:       { cls: 'chip-low',      label: 'N/A' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

export default function CompliancePage() {
  const [activeFramework, setActiveFramework] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'frameworks' | 'register'>('frameworks');

  const filteredControls = activeFramework
    ? CONTROL_REGISTER.filter(c => {
        const fw = FRAMEWORKS.find(f => f.id === activeFramework);
        return fw && c.framework === fw.name;
      })
    : CONTROL_REGISTER;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Compliance Dossier</h1>
          <p className="page-subtitle">Framework views, control register, gap visibility, and evidence-backed report generation.</p>
        </div>
        <div className="page-header-actions">
          <Link href="/app/reports/generate" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            <Plus size={14} />
            Generate report
          </Link>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: 'var(--color-surface-primary)', borderBottom: '1px solid var(--color-border-default)', padding: '0 var(--page-padding)' }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {[{ key: 'frameworks', label: 'Framework Views' }, { key: 'register', label: 'Control Register' }].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)} style={{ padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', font: 'var(--type-body-sm)', fontWeight: activeTab === t.key ? 600 : 400, color: activeTab === t.key ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', borderBottom: activeTab === t.key ? '2px solid var(--color-action-primary-bg)' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--page-padding)' }}>

        {/* ══════════════════════════════════════════════════
            FRAMEWORK VIEWS (Spec 17)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'frameworks' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {FRAMEWORKS.map(fw => {
                const total = fw.met + fw.partial + fw.gap;
                const metPct = Math.round((fw.met / total) * 100);
                const gapPct = Math.round((fw.gap / total) * 100);

                return (
                  <div key={fw.id} className="card" style={{ cursor: 'pointer', borderColor: activeFramework === fw.id ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)', boxShadow: activeFramework === fw.id ? '0 0 0 2px rgba(30,58,138,0.15)' : 'var(--elevation-1)' }}
                    onClick={() => { setActiveFramework(activeFramework === fw.id ? null : fw.id); setActiveTab('register'); }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 3 }}>{fw.name}</div>
                        <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{fw.description}</div>
                      </div>
                      {fw.gap > 0
                        ? <AlertTriangle size={16} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0 }} />
                        : <CheckCircle size={16} style={{ color: 'var(--color-state-success-icon)', flexShrink: 0 }} />
                      }
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-tertiary)', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ height: '100%', width: `${metPct}%`, background: 'var(--color-state-success-icon)' }} />
                        <div style={{ height: '100%', width: `${Math.round((fw.partial / total) * 100)}%`, background: 'var(--color-state-warning-icon)' }} />
                        <div style={{ height: '100%', width: `${gapPct}%`, background: 'var(--color-state-critical-icon)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16 }}>
                      {[
                        { label: 'Met', count: fw.met, color: 'var(--color-text-success)' },
                        { label: 'Partial', count: fw.partial, color: 'var(--color-text-warning)' },
                        { label: 'Gap', count: fw.gap, color: 'var(--color-text-critical)' },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.count}</div>
                          <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
                        Last reviewed: {fw.lastReviewed}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {fw.reportReady && (
                          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                            <Download size={11} /> Report
                          </button>
                        )}
                        <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }} onClick={() => { setActiveFramework(fw.id); setActiveTab('register'); }}>
                          <ArrowUpRight size={11} /> Controls
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            CONTROL REGISTER (Spec 17)
            ══════════════════════════════════════════════════ */}
        {activeTab === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Framework filter pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', fontWeight: 600, marginRight: 4 }}>Filter by framework:</span>
              <button onClick={() => setActiveFramework(null)} style={{ height: 28, padding: '0 10px', border: `1px solid ${!activeFramework ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`, borderRadius: 99, font: 'var(--type-caption)', fontWeight: !activeFramework ? 600 : 400, color: !activeFramework ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', background: !activeFramework ? 'var(--color-state-info-bg)' : 'transparent', cursor: 'pointer' }}>All</button>
              {FRAMEWORKS.map(fw => (
                <button key={fw.id} onClick={() => setActiveFramework(activeFramework === fw.id ? null : fw.id)} style={{ height: 28, padding: '0 10px', border: `1px solid ${activeFramework === fw.id ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`, borderRadius: 99, font: 'var(--type-caption)', fontWeight: activeFramework === fw.id ? 600 : 400, color: activeFramework === fw.id ? 'var(--color-action-primary-bg)' : 'var(--color-text-tertiary)', background: activeFramework === fw.id ? 'var(--color-state-info-bg)' : 'transparent', cursor: 'pointer' }}>
                  {fw.name}
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Control ID</th><th>Control Name</th><th>Framework</th><th>Status</th><th>Evidence</th><th>Owner</th><th>Last Review</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredControls.map(ctrl => (
                    <tr key={ctrl.id} style={{ background: ctrl.status === 'gap' ? 'var(--severity-critical-bg)' : undefined }}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{ctrl.id}</span></td>
                      <td style={{ fontWeight: 500 }}>{ctrl.name}</td>
                      <td style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{ctrl.framework}</td>
                      <td><ControlStatusChip status={ctrl.status} /></td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{ctrl.evidenceCount}</span></td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{ctrl.owner}</td>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{ctrl.lastReview}</span></td>
                      <td><button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-link)', font: 'var(--type-caption)' }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
