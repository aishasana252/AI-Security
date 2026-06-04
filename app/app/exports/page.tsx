'use client';

/**
 * APEXLyn Lens — Evidence Exports Registry
 * Screen ID: INV-EXPORTS-001
 * Route: /app/exports
 * Source: UIUX Specification Section 18
 *
 * Requirements (Spec 18):
 * - Track evidence exports and async packaging status
 * - Display PDF integrity class (Standard / Signed Governance / Court-Ready)
 * - Provide cryptographic verification triggers and status labels
 */

import React, { useState } from 'react';
import {
  Package, Download, Search, Filter, ChevronDown, RefreshCw,
  FileCheck, ShieldAlert, Clock, Hash, ArrowUpRight, CheckCircle,
  AlertTriangle, Lock, FileText,
} from 'lucide-react';

const MOCK_EXPORTS = [
  {
    id: 'exp-8a21-01',
    caseId: 'case-au-001',
    caseTitle: 'Source code exfiltration — Engineering division',
    pdfClass: 'Court-Ready PDF',
    scope: '7 linked events + code payloads',
    requestedBy: 'pseudo-admin-ar',
    requestedAt: '2026-06-04T12:00:00Z',
    status: 'completed',
    evidenceHash: 'c7c827d096a67f1b77a760b938ca156bd4d1b827ae1d491fca1b7829ac1b98a0',
    validUntil: '2026-07-04T12:00:00Z',
  },
  {
    id: 'exp-3b7d-02',
    caseId: 'case-au-002',
    caseTitle: 'PII disclosure risk — Finance team AI use',
    pdfClass: 'Signed Governance PDF',
    scope: '4 events + redacted screenshots',
    requestedBy: 'pseudo-analyst-mb',
    requestedAt: '2026-06-03T15:30:00Z',
    status: 'completed',
    evidenceHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    validUntil: '2026-07-03T15:30:00Z',
  },
  {
    id: 'exp-9c4e-03',
    caseId: 'case-au-003',
    caseTitle: 'Injection prompt pattern review — Legal AI',
    pdfClass: 'Standard PDF',
    scope: '2 events + metadata logs',
    requestedBy: 'pseudo-admin-ar',
    requestedAt: '2026-06-02T10:15:00Z',
    status: 'expired',
    evidenceHash: '8a2c1f9d8c3b7a5e4d2f1b0a9c8e7d6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0',
    validUntil: '2026-06-03T10:15:00Z',
  },
  {
    id: 'exp-1d8f-04',
    caseId: 'case-au-001',
    caseTitle: 'Source code exfiltration — Engineering division',
    pdfClass: 'Court-Ready PDF',
    scope: 'Full raw database dump',
    requestedBy: 'pseudo-admin-ar',
    requestedAt: '2026-06-04T22:35:00Z',
    status: 'processing',
    evidenceHash: 'Generating SHA-256...',
    validUntil: 'Pending generation...',
  },
];

function PDFClassChip({ pdfClass }: { pdfClass: string }) {
  let cls = 'chip-info';
  if (pdfClass === 'Court-Ready PDF') {
    cls = 'chip-critical'; // Serious / forensic standard
  } else if (pdfClass === 'Signed Governance PDF') {
    cls = 'chip-active';
  }
  return <span className={`chip ${cls}`} style={{ fontSize: 11 }}>{pdfClass}</span>;
}

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    completed:  { cls: 'chip-active',   label: 'Available' },
    processing: { cls: 'chip-pending',  label: 'Assembling...' },
    expired:    { cls: 'chip-low',      label: 'Expired' },
    failed:     { cls: 'chip-critical', label: 'Failed' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

export default function ExportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfClassFilter, setPdfClassFilter] = useState('All');

  const filtered = MOCK_EXPORTS.filter(e => {
    if (pdfClassFilter !== 'All' && e.pdfClass !== pdfClassFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.id.toLowerCase().includes(q) || e.caseTitle.toLowerCase().includes(q) || e.requestedBy.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => {
    if (iso.includes('Pending')) return iso;
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Evidence Exports</h1>
          <p className="page-subtitle">Evidence bundle assembly — package tracking, legal signatures, and cryptographic integrity verification.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} />
            Refresh
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
          <div style={{ position: 'relative', flex: '0 0 240px' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by export ID or case..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={pdfClassFilter}
              onChange={e => setPdfClassFilter(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: pdfClassFilter !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 160
              }}
            >
              <option>All</option>
              <option>Court-Ready PDF</option>
              <option>Signed Governance PDF</option>
              <option>Standard PDF</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
            {filtered.length} export jobs logged
          </span>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
          
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '130px 240px 180px 140px 120px 150px 36px',
            padding: '0 24px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['Export Job ID', 'Case Context', 'PDF Class', 'Scope', 'Requested By', 'Expiration Date', ''].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '130px 240px 180px 140px 120px 150px 36px',
                padding: '0 24px', minHeight: 64, gap: 8,
                background: 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
            >
              {/* ID + Status */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }}>{item.id}</div>
                <div style={{ marginTop: 4 }}><StatusChip status={item.status} /></div>
              </div>
              {/* Case */}
              <div>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caseTitle}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', marginTop: 2 }}>{item.caseId}</div>
              </div>
              {/* Class */}
              <div>
                <PDFClassChip pdfClass={item.pdfClass} />
              </div>
              {/* Scope */}
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.scope}</div>
              {/* Requester */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{item.requestedBy}</div>
              {/* Expiry */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: item.status === 'expired' ? 'var(--color-text-critical)' : 'var(--color-text-secondary)' }}>
                {formatDate(item.validUntil)}
              </div>
              {/* Download/Action */}
              <div>
                {item.status === 'completed' ? (
                  <button
                    onClick={() => alert(`Downloading verified bundle ${item.id}. SHA-256 signature verified: TRUE.`)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    <Download size={14} />
                  </button>
                ) : (
                  <button
                    disabled
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-disabled)', background: 'none', border: 'none', padding: 4 }}
                  >
                    <Lock size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
