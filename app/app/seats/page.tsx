'use client';

/**
 * APEXLyn Lens — Seat Allocation & Scope Page
 * Screen ID: COM-SEATS-001
 * Route: /app/seats
 * Source: UIUX Specification Section 12 + Section 20
 *
 * Implements granular reporting on purchased seats, active monitored accounts,
 * excluded directories, and overage alert threshold thresholds.
 */

import React, { useState } from 'react';
import {
  Users, Search, Filter, ChevronDown, RefreshCw,
  UserCheck, UserMinus, AlertTriangle, ShieldCheck, CreditCard,
} from 'lucide-react';

const MOCK_SEAT_METRICS = {
  purchased: 900,
  active: 847,
  excluded: 12,
  available: 53,
  warningThreshold: 810, // 90%
};

const INITIAL_SEAT_REGISTER = [
  { id: 'usr-82a1', name: 'pseudo-82a1', department: 'Engineering', role: 'Senior Software Engineer', status: 'billable', lastChecked: '2026-06-04T22:31:07Z' },
  { id: 'usr-3f7c', name: 'pseudo-3f7c', department: 'Finance', role: 'Financial Analyst', status: 'billable', lastChecked: '2026-06-04T22:15:44Z' },
  { id: 'usr-b92e', name: 'pseudo-b92e', department: 'Engineering', role: 'DevOps Specialist', status: 'billable', lastChecked: '2026-06-04T21:48:22Z' },
  { id: 'usr-c41a', name: 'pseudo-c41a', department: 'Legal', role: 'Legal Counsel', status: 'billable', lastChecked: '2026-06-04T21:02:19Z' },
  { id: 'usr-f88d', name: 'pseudo-f88d', department: 'HR', role: 'HR Manager', status: 'billable', lastChecked: '2026-06-04T20:55:03Z' },
  { id: 'usr-a34c', name: 'pseudo-a34c', department: 'Marketing', role: 'Content Strategist', status: 'excluded', lastChecked: '2026-06-04T20:33:47Z' },
  { id: 'usr-e12f', name: 'pseudo-e12f', department: 'Operations', role: 'Operations Analyst', status: 'billable', lastChecked: '2026-06-04T20:11:28Z' },
  { id: 'usr-d77e', name: 'pseudo-d77e', department: 'Sales', role: 'Account Executive', status: 'excluded', lastChecked: '2026-06-04T19:58:51Z' },
];

export default function SeatsPage() {
  const [register, setRegister] = useState(INITIAL_SEAT_REGISTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('All');

  const seatUsagePct = Math.round((MOCK_SEAT_METRICS.active / MOCK_SEAT_METRICS.purchased) * 100);
  const isNearCapacity = seatUsagePct >= 90;

  const handleToggleScope = (id: string) => {
    setRegister(prev => prev.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'billable' ? 'excluded' : 'billable';
        return {
          ...u,
          status: nextStatus,
        };
      }
      return u;
    }));
    alert(`User monitor boundary updated. Dynamic seat allocation re-evaluated.`);
  };

  const filtered = register.filter(u => {
    if (scopeFilter !== 'All' && u.status !== scopeFilter.toLowerCase()) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q);
    }
    return true;
  });

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-AU', { day: '2-digit', month: 'short' });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Seats &amp; Monitored Scope</h1>
          <p className="page-subtitle">License seat allocation — check billable thresholds, exclude domains, and toggle active directories scopes.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => alert('Synchronized seat matrix with Active Directory.')}>
            <RefreshCw size={13} />
            Sync directory
          </button>
        </div>
      </div>

      <div style={{ padding: 'var(--page-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Seat Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Purchased Seats', val: MOCK_SEAT_METRICS.purchased, icon: CreditCard, color: 'var(--color-text-primary)' },
            { label: 'Active Monitored Users', val: MOCK_SEAT_METRICS.active, icon: UserCheck, color: isNearCapacity ? 'var(--color-text-warning)' : 'var(--color-text-success)' },
            { label: 'Available License Seats', val: MOCK_SEAT_METRICS.available, icon: Users, color: 'var(--color-text-primary)' },
            { label: 'Excluded Directory Profiles', val: MOCK_SEAT_METRICS.excluded, icon: UserMinus, color: 'var(--color-text-tertiary)' },
          ].map((item, idx) => (
            <div key={idx} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                <item.icon size={15} style={{ color: 'var(--color-text-tertiary)' }} />
              </div>
              <div style={{ font: 'var(--type-display-lg)', color: item.color, fontSize: 32, fontFamily: 'var(--font-mono)' }}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* Seat Alert Banner */}
        {isNearCapacity && (
          <div style={{
            display: 'flex', gap: 10, padding: 14,
            background: 'var(--color-state-warning-bg)', border: '1px solid var(--color-state-warning-border)',
            borderRadius: 'var(--radius-lg)', alignItems: 'center'
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0 }} />
            <div>
              <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-state-warning-text)' }}>License seat limit approaching ({seatUsagePct}%)</div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--color-state-warning-text)', opacity: 0.8, marginTop: 2 }}>
                To avoid service degradation or audit blockages, consider excluding unmonitored subnets or contacting sales to elevate your subscription seat quota.
              </div>
            </div>
          </div>
        )}

        {/* Seat Directory Registry */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 20px', borderBottom: '1px solid var(--color-border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
          }}>
            <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Monitor Scopes Directory</h3>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search profile..." className="input" style={{ paddingLeft: 30, height: 32 }} />
              </div>
              <select
                value={scopeFilter}
                onChange={e => setScopeFilter(e.target.value)}
                style={{
                  height: 32, padding: '0 24px 0 8px', border: '1px solid var(--color-border-default)',
                  borderRadius: 6, font: 'var(--type-caption)', background: 'var(--color-surface-secondary)',
                  color: 'var(--color-text-primary)', outline: 'none'
                }}
              >
                <option>All</option>
                <option>Billable</option>
                <option>Excluded</option>
              </select>
            </div>
          </div>

          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Profile ID</th>
                <th>Identity Name</th>
                <th>Department</th>
                <th>Enterprise Role</th>
                <th>Monitoring Status</th>
                <th>Sync Check</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{user.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.department}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{user.role}</td>
                  <td>
                    <span className={`chip ${user.status === 'billable' ? 'chip-active' : 'chip-low'}`} style={{ textTransform: 'capitalize' }}>
                      {user.status === 'billable' ? 'Billable / Monitored' : 'Scope Excluded'}
                    </span>
                  </td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{formatDate(user.lastChecked)}</span></td>
                  <td>
                    <button
                      onClick={() => handleToggleScope(user.id)}
                      className={`btn btn-secondary btn-sm`}
                      style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                    >
                      {user.status === 'billable' ? 'Exclude' : 'Monitor'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
