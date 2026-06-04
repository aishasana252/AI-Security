'use client';

/**
 * APEXLyn Lens — Internal AI Inventory Page
 * Screen ID: OPS-INT-AI-001
 * Route: /app/internal-ai-inventory
 * Source: UIUX Specification Section 14.45 – 14.49
 *
 * Implements tabular listing of internal model deployments, custom fine-tunes,
 * and VPC-hosted AI instances (e.g., Private Llama 3, internal API endpoints).
 */

import React, { useState } from 'react';
import {
  Cpu, Search, Filter, ChevronDown, RefreshCw,
  Plus, Calendar, Shield, Users, ArrowUpRight, CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

const MOCK_INTERNAL_AI = [
  {
    id: 'iai-001',
    name: 'Sovereign-Llama3-8B',
    vpcHost: 'aws-vpc-syd-prod',
    modelClass: 'Llama 3.1 Instruct (Meta)',
    discoveredAt: '2026-02-10T08:00:00Z',
    status: 'monitored',
    activeUsers: 84,
    riskScore: 24,
    endpoint: 'http://internal.llama3-8b.sovereign.local/v1',
    lastQueried: '2026-06-04T22:30:00Z',
  },
  {
    id: 'iai-002',
    name: 'Finance-FineTune-GPT4',
    vpcHost: 'azure-sub-au-fin',
    modelClass: 'GPT-4o (Azure OpenAI Instance)',
    discoveredAt: '2026-01-15T09:30:00Z',
    status: 'monitored',
    activeUsers: 142,
    riskScore: 38,
    endpoint: 'https://finance-openai-au.azure.com/deploy/gpt4o',
    lastQueried: '2026-06-04T22:15:00Z',
  },
  {
    id: 'iai-003',
    name: 'Legal-Draft-Assistant',
    vpcHost: 'aws-vpc-melb-stg',
    modelClass: 'Mistral-Large-2',
    discoveredAt: '2026-05-01T14:22:00Z',
    status: 'unauthorized',
    activeUsers: 11,
    riskScore: 82,
    endpoint: 'http://10.244.12.89:8080/generate',
    lastQueried: '2026-06-04T19:33:00Z',
  },
  {
    id: 'iai-004',
    name: 'HR-Resume-Classifier',
    vpcHost: 'local-hypervisor-04',
    modelClass: 'RoBERTa Custom Classifier',
    discoveredAt: '2025-11-20T11:00:00Z',
    status: 'monitored',
    activeUsers: 5,
    riskScore: 18,
    endpoint: 'http://hr-resume-screening.corp.local/api',
    lastQueried: '2026-06-04T17:45:00Z',
  },
];

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    monitored:    { cls: 'chip-active',   label: 'Monitored' },
    unauthorized: { cls: 'chip-critical', label: 'Unauthorized Deployment' },
    inactive:     { cls: 'chip-low',      label: 'Inactive' },
  };
  const c = cfg[status] || { cls: 'chip-info', label: status };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

export default function InternalAIInventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = MOCK_INTERNAL_AI.filter(item => {
    if (statusFilter !== 'All' && item.status !== statusFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.modelClass.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Internal AI Inventory</h1>
          <p className="page-subtitle">Monitors internally hosted LLM deployments, fine-tuned endpoints, and VPC instances within corporate boundaries.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} />
            Scan subnet
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Register deployment
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
              placeholder="Search by name, model, or ID..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: statusFilter !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 140
              }}
            >
              <option>All</option>
              <option>Monitored</option>
              <option>Unauthorized</option>
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginLeft: 4 }}>
            {filtered.length} endpoints discovered
          </span>
        </div>
      </div>

      {/* ── TABLE VIEW ── */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 180px 180px 140px 130px 100px 100px 36px',
            padding: '0 24px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['Application / Endpoint', 'Model Class', 'VPC / Host Environment', 'Status', 'Discovered', 'Active Users', 'Risk Score', ''].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '220px 180px 180px 140px 130px 100px 100px 36px',
                padding: '0 24px', minHeight: 52, gap: 8,
                background: item.status === 'unauthorized' ? 'var(--severity-critical-bg)' : 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = item.status === 'unauthorized' ? 'var(--severity-critical-bg)' : 'var(--table-row-bg)'}
            >
              {/* Application Name */}
              <div>
                <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.endpoint}>{item.endpoint}</div>
              </div>
              {/* Model Class */}
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>{item.modelClass}</div>
              {/* VPC Host */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.vpcHost}</div>
              {/* Status */}
              <div>
                <StatusChip status={item.status} />
              </div>
              {/* Discovered */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>{formatDate(item.discoveredAt)}</div>
              {/* Users */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>{item.activeUsers}</span>
              </div>
              {/* Risk */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: item.riskScore >= 60 ? 'var(--color-text-critical)' : 'var(--color-text-secondary)' }}>
                {item.riskScore}
              </div>
              {/* Actions */}
              <button
                onClick={() => alert(`Details for internal deployment: ${item.name}`)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <ArrowUpRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
