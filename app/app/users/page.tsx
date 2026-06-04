'use client';

/**
 * APEXLyn Lens — Users Directory Page
 * Screen ID: OPS-USERS-001
 * Route: /app/users
 * Source: UIUX Specification Section 14.27 – 14.33
 *
 * Columns required (Spec 14.29):
 * User Identity (pseudonymized), Department, Role, Risk Score,
 * Anomaly State, Seat State, Latest Activity, Protected Status, Managed/Unmanaged
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Briefcase,
  X,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

const MOCK_USERS = [
  {
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
    active: true,
  },
  {
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
    active: true,
  },
  {
    id: 'usr-b92e',
    name: 'pseudo-b92e',
    department: 'Engineering',
    role: 'DevOps Specialist',
    riskScore: 61,
    anomalyState: 'none',
    seatState: 'billable',
    latestActivity: '2026-06-04T21:48:22Z',
    protectedStatus: 'protected',
    managed: true,
    active: true,
  },
  {
    id: 'usr-c41a',
    name: 'pseudo-c41a',
    department: 'Legal',
    role: 'Legal Counsel',
    riskScore: 45,
    anomalyState: 'none',
    seatState: 'billable',
    latestActivity: '2026-06-04T21:02:19Z',
    protectedStatus: 'protected',
    managed: true,
    active: true,
  },
  {
    id: 'usr-f88d',
    name: 'pseudo-f88d',
    department: 'HR',
    role: 'HR Manager',
    riskScore: 28,
    anomalyState: 'none',
    seatState: 'billable',
    latestActivity: '2026-06-04T20:55:03Z',
    protectedStatus: 'protected',
    managed: true,
    active: true,
  },
  {
    id: 'usr-a34c',
    name: 'pseudo-a34c',
    department: 'Marketing',
    role: 'Content Strategist',
    riskScore: 59,
    anomalyState: 'none',
    seatState: 'excluded',
    latestActivity: '2026-06-04T20:33:47Z',
    protectedStatus: 'unprotected',
    managed: false,
    active: true,
  },
  {
    id: 'usr-e12f',
    name: 'pseudo-e12f',
    department: 'Operations',
    role: 'Operations Analyst',
    riskScore: 32,
    anomalyState: 'none',
    seatState: 'billable',
    latestActivity: '2026-06-04T20:11:28Z',
    protectedStatus: 'protected',
    managed: true,
    active: true,
  },
  {
    id: 'usr-d77e',
    name: 'pseudo-d77e',
    department: 'Sales',
    role: 'Account Executive',
    riskScore: 15,
    anomalyState: 'none',
    seatState: 'excluded',
    latestActivity: '2026-06-04T19:58:51Z',
    protectedStatus: 'unprotected',
    managed: false,
    active: false,
  },
];

const DEPARTMENTS = ['All', 'Engineering', 'Finance', 'Legal', 'HR', 'Operations', 'Sales', 'Marketing'];
const SEAT_STATES = ['All', 'Billable', 'Excluded'];
const POSTURE_STATES = ['All', 'Managed', 'Unmanaged'];

function RiskBadge({ score }: { score: number }) {
  let cls = 'chip-low';
  let label = 'Low';
  if (score >= 80) {
    cls = 'chip-critical';
    label = 'Critical';
  } else if (score >= 60) {
    cls = 'chip-high';
    label = 'High';
  } else if (score >= 40) {
    cls = 'chip-medium';
    label = 'Medium';
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span className={`chip ${cls}`} style={{ width: 64, justifyContent: 'center' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--color-text-primary)' }}>{score}</span>
    </div>
  );
}

function AnomalyBadge({ state }: { state: string }) {
  if (state === 'none') {
    return <span style={{ color: 'var(--color-text-disabled)', font: 'var(--type-table-cell)' }}>—</span>;
  }
  const labels: Record<string, string> = {
    'high-activity': 'High Exfiltration Rate',
    'data-staging': 'Suspected Data Staging',
    'compromise': 'Credential Anomaly',
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: 'var(--type-caption)', fontWeight: 600, color: 'var(--color-state-critical-text)', background: 'var(--color-state-critical-bg)', padding: '1px 6px', borderRadius: 99, border: '1px solid var(--color-state-critical-border)' }}>
      <AlertTriangle size={10} />
      {labels[state] || state}
    </span>
  );
}

function ProtectedBadge({ status }: { status: string }) {
  if (status === 'protected') {
    return <span className="chip chip-active" style={{ fontSize: 11 }}><UserCheck size={10} /> Protected</span>;
  }
  return <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)' }}>Unprotected</span>;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSeatState, setSelectedSeatState] = useState('All');
  const [selectedPosture, setSelectedPosture] = useState('All');
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [anomalyOnly, setAnomalyOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);

  const filteredUsers = MOCK_USERS.filter(u => {
    if (activeOnly && !u.active) return false;
    if (selectedDept !== 'All' && u.department !== selectedDept) return false;
    if (selectedSeatState !== 'All' && u.seatState !== selectedSeatState.toLowerCase()) return false;
    if (selectedPosture !== 'All' && (selectedPosture === 'Managed' ? !u.managed : u.managed)) return false;
    if (highRiskOnly && u.riskScore < 60) return false;
    if (anomalyOnly && u.anomalyState === 'none') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
  };

  const activeFilterCount = [
    selectedDept !== 'All', selectedSeatState !== 'All', selectedPosture !== 'All',
    highRiskOnly, anomalyOnly, !activeOnly
  ].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Users Directory</h1>
          <p className="page-subtitle">Pseudonymized identity overview — operational risk scores, anomaly state, seat state, and posture monitoring.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} />
            Export CSV
          </button>
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
        padding: '12px var(--page-padding)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '0 0 240px' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search user identity or role..."
              className="input"
              style={{ paddingLeft: 30, height: 34 }}
            />
          </div>

          {/* Department */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: selectedDept !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 130
              }}
            >
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* Seat State */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedSeatState}
              onChange={e => setSelectedSeatState(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: selectedSeatState !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 120
              }}
            >
              {SEAT_STATES.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* Posture */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedPosture}
              onChange={e => setSelectedPosture(e.target.value)}
              style={{
                height: 34, padding: '0 28px 0 10px', border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)', color: 'var(--color-text-primary)',
                background: selectedPosture !== 'All' ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
                cursor: 'pointer', outline: 'none', appearance: 'none', minWidth: 120
              }}
            >
              {POSTURE_STATES.map(p => <option key={p}>{p}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)', pointerEvents: 'none' }} />
          </div>

          {/* High risk boolean filter */}
          <button
            onClick={() => setHighRiskOnly(!highRiskOnly)}
            style={{
              height: 34, display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px',
              border: `1px solid ${highRiskOnly ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`,
              borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)',
              color: highRiskOnly ? 'var(--color-action-primary-bg)' : 'var(--color-text-secondary)',
              background: highRiskOnly ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
              cursor: 'pointer'
            }}
          >
            <TrendingUp size={13} /> High Risk (60+)
          </button>

          {/* Anomaly boolean filter */}
          <button
            onClick={() => setAnomalyOnly(!anomalyOnly)}
            style={{
              height: 34, display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px',
              border: `1px solid ${anomalyOnly ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)'}`,
              borderRadius: 'var(--radius-md)', font: 'var(--type-body-sm)',
              color: anomalyOnly ? 'var(--color-action-primary-bg)' : 'var(--color-text-secondary)',
              background: anomalyOnly ? 'var(--color-state-info-bg)' : 'var(--color-surface-secondary)',
              cursor: 'pointer'
            }}
          >
            <AlertTriangle size={13} /> Anomaly Active
          </button>

          {/* Show Inactive */}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', marginLeft: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!activeOnly}
              onChange={() => setActiveOnly(!activeOnly)}
              style={{ cursor: 'pointer', accentColor: 'var(--color-action-primary-bg)' }}
            />
            Show deactivated users
          </label>

          {activeFilterCount > 0 && (
            <button
              onClick={() => { setSelectedDept('All'); setSelectedSeatState('All'); setSelectedPosture('All'); setHighRiskOnly(false); setAnomalyOnly(false); setActiveOnly(true); }}
              style={{ height: 34, padding: '0 10px', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-pill)', font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <X size={11} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── USERS TABLE ── */}
      <div style={{ flex: 1, overflow: 'auto', background: 'var(--color-surface-app)' }}>
        <div style={{ background: 'var(--color-surface-primary)', minWidth: 1000 }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '150px 140px 180px 140px 180px 110px 160px 100px 36px',
            padding: '0 24px', height: 40, gap: 8,
            background: 'var(--table-header-bg)',
            borderBottom: '1px solid var(--table-border)',
            alignItems: 'center',
            position: 'sticky', top: 0, zIndex: 10,
          }}>
            {['User Identity', 'Department', 'Role', 'Risk Score', 'Anomaly State', 'Seat State', 'Latest Activity', 'Scope Posture', ''].map(h => (
              <div key={h} style={{ font: 'var(--type-table-header)', color: 'var(--table-header-text)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <Users size={32} style={{ color: 'var(--color-text-disabled)' }} />
              <div className="empty-state-title">No users match criteria</div>
              <div className="empty-state-description">Try adjusting your department or risk filters to find user accounts.</div>
            </div>
          ) : filteredUsers.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 140px 180px 140px 180px 110px 160px 100px 36px',
                padding: '0 24px', minHeight: 52, gap: 8,
                background: 'var(--table-row-bg)',
                borderBottom: '1px solid var(--table-border)',
                alignItems: 'center',
                cursor: 'pointer',
                opacity: user.active ? 1 : 0.6
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--table-row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--table-row-bg)'}
            >
              {/* Identity */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-tertiary)' }}>{user.id}</span>
              </div>
              {/* Department */}
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>{user.department}</div>
              {/* Role */}
              <div style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.role}>{user.role}</div>
              {/* Risk Score */}
              <RiskBadge score={user.riskScore} />
              {/* Anomaly */}
              <AnomalyBadge state={user.anomalyState} />
              {/* Seat State */}
              <div>
                <span style={{ textTransform: 'capitalize', font: 'var(--type-body-sm)', fontWeight: 500 }} className={user.seatState === 'billable' ? 'text-success' : 'text-disabled'}>
                  {user.seatState}
                </span>
              </div>
              {/* Latest Activity */}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                {formatDate(user.latestActivity)}
              </div>
              {/* Protected */}
              <ProtectedBadge status={user.protectedStatus} />
              {/* Action */}
              <Link href={`/app/users/${user.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-link)', padding: 4 }}>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderTop: '1px solid var(--color-border-default)',
        padding: '10px var(--page-padding)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
          Showing {filteredUsers.length} of {MOCK_USERS.length} total users in scope · On-demand synchronization active
        </span>
      </div>
    </div>
  );
}
