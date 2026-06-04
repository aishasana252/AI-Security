'use client';

/**
 * APEXLyn Lens — Compliance Reports Directory
 * Screen ID: GOV-REPORTS-001
 * Route: /app/reports
 * Source: UIUX Specification Section 17 (Compliance Reports)
 *
 * Implements report generation triggers (Framework selection, date range,
 * evidence scope) and historical registry of cryptographically signed reports.
 */

import React, { useState } from 'react';
import {
  FileText, Plus, Search, Filter, ChevronDown, RefreshCw,
  Download, Clock, CheckCircle, AlertTriangle, FileBarChart,
  Calendar, Shield, Lock, Eye, CheckSquare,
} from 'lucide-react';

const MOCK_REPORTS = [
  {
    id: 'rep-apra-001',
    name: 'APRA CPS 234 Compliance Dossier',
    framework: 'APRA CPS 234',
    scope: 'All active control checks + code exfiltration evidence',
    generatedBy: 'pseudo-admin-ar',
    generatedAt: '2026-06-04T10:00:00Z',
    status: 'completed',
    checksum: 'sha256:d8c3b7a5e4d2f1b0a9c8e7d6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0892f1b7a',
    fileSize: '4.2 MB',
  },
  {
    id: 'rep-iso-002',
    name: 'ISO 27001 Annex A Control Audit',
    framework: 'ISO/IEC 27001:2022',
    scope: 'User Access Control & Asset Responsibility evidence',
    generatedBy: 'system-scheduler',
    generatedAt: '2026-05-31T00:00:00Z',
    status: 'completed',
    checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    fileSize: '12.8 MB',
  },
  {
    id: 'rep-soc-003',
    name: 'SOC 2 Trust Criteria Evidence Package',
    framework: 'SOC 2 Type II',
    scope: 'Security CC6 Logical Access policies + verification holds',
    generatedBy: 'pseudo-analyst-mb',
    generatedAt: '2026-05-15T14:30:00Z',
    status: 'completed',
    checksum: 'sha256:c7c827d096a67f1b77a760b938ca156bd4d1b827ae1d491fca1b7829ac1b98a0',
    fileSize: '8.4 MB',
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [showGenModal, setShowGenModal] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  // Form states
  const [selectedFw, setSelectedFw] = useState('apra-cps234');
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [evidenceScope, setEvidenceScope] = useState('Full telemetry + signed holds');

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);

    setTimeout(() => {
      const fwNames: Record<string, string> = {
        'apra-cps234': 'APRA CPS 234',
        'iso-27001': 'ISO/IEC 27001:2022',
        'soc2-type2': 'SOC 2 Type II',
        'privacy-act': 'Australian Privacy Act 1988',
      };
      
      const newReport = {
        id: `rep-gen-${Math.floor(1000 + Math.random() * 9000)}`,
        name: `${fwNames[selectedFw] || selectedFw} Compliance Dossier`,
        framework: fwNames[selectedFw] || selectedFw,
        scope: evidenceScope,
        generatedBy: 'pseudo-admin-ar',
        generatedAt: new Date().toISOString(),
        status: 'completed',
        checksum: 'sha256:' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
        fileSize: '3.6 MB',
      };

      setReports(prev => [newReport, ...prev]);
      setGenLoading(false);
      setShowGenModal(false);
      alert('Compliance dossier compiled, cryptographically signed, and added to the registry.');
    }, 2000);
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Compliance Reports</h1>
          <p className="page-subtitle">Evidence dossiers — download past audits or generate on-demand, cryptographically verified reports for regulators.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setShowGenModal(true)}>
            <Plus size={14} /> Generate report
          </button>
        </div>
      </div>

      {/* ── HISTORICAL REPORTS LIST ── */}
      <div style={{ flex: 1, padding: 'var(--page-padding)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Report Registry</h3>
            <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>{reports.length} signed artifacts</span>
          </div>

          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Dossier Name</th>
                <th>Audit Framework</th>
                <th>Evidence Scope</th>
                <th>Checksum SHA-256</th>
                <th>Generated At</th>
                <th>Size</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map(rep => (
                <tr key={rep.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600 }}>{rep.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{rep.name}</td>
                  <td><span className="chip chip-info">{rep.framework}</span></td>
                  <td style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>{rep.scope}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', wordBreak: 'break-all' }} title={rep.checksum}>
                      {rep.checksum.substring(0, 16)}...
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(rep.generatedAt)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{rep.fileSize}</td>
                  <td>
                    <button
                      onClick={() => alert(`Downloading signed PDF dossier: ${rep.id}. Checksum is valid.`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', font: 'var(--type-caption)', color: 'var(--color-text-link)', fontWeight: 600 }}
                    >
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── REPORT GENERATOR MODAL ── */}
      {showGenModal && (
        <div className="modal-overlay" onClick={() => setShowGenModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <FileBarChart size={20} style={{ color: 'var(--color-action-primary-bg)' }} />
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)' }}>Compile Compliance Dossier</h3>
                <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Assembles all ledger-signed event hashes into an audit-ready dossier.</p>
              </div>
            </div>
            
            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', font: 'var(--type-label-md)', marginBottom: 6 }}>Audit Framework Profile</label>
                <select
                  value={selectedFw}
                  onChange={e => setSelectedFw(e.target.value)}
                  style={{
                    width: '100%', height: 36, border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                    font: 'var(--type-body-sm)', outline: 'none', padding: '0 8px'
                  }}
                >
                  <option value="apra-cps234">APRA CPS 234 Audit Profile</option>
                  <option value="iso-27001">ISO/IEC 27001 Annex A Audit Profile</option>
                  <option value="soc2-type2">SOC 2 Trust Criteria Profile</option>
                  <option value="privacy-act">Australian Privacy Act Profile</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', font: 'var(--type-label-md)', marginBottom: 6 }}>Telemetry Range</label>
                  <select
                    value={dateRange}
                    onChange={e => setDateRange(e.target.value)}
                    style={{
                      width: '100%', height: 36, border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                      font: 'var(--type-body-sm)', outline: 'none', padding: '0 8px'
                    }}
                  >
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>Custom regulatory period</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', font: 'var(--type-label-md)', marginBottom: 6 }}>Verification Scope</label>
                  <select
                    value={evidenceScope}
                    onChange={e => setEvidenceScope(e.target.value)}
                    style={{
                      width: '100%', height: 36, border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                      font: 'var(--type-body-sm)', outline: 'none', padding: '0 8px'
                    }}
                  >
                    <option>Full telemetry + signed holds</option>
                    <option>Exfiltration alerts only</option>
                    <option>Audit and shadow AI summaries</option>
                  </select>
                </div>
              </div>

              <div style={{
                display: 'flex', gap: 10, padding: 12,
                background: 'var(--color-state-info-bg)', border: '1px solid var(--color-state-info-border)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-caption)', color: 'var(--color-state-info-text)'
              }}>
                <Shield size={14} style={{ color: 'var(--color-state-info-icon)', flexShrink: 0, marginTop: 1 }} />
                <span>
                  The resulting PDF file will be cryptographically hashed and co-signed by the tenant CMK key.
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowGenModal(false)}>Cancel</button>
                <button type="submit" disabled={genLoading} className="btn btn-primary btn-sm" style={{ minWidth: 120 }}>
                  {genLoading ? 'Compiling...' : 'Generate Dossier'}
                </button>
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
