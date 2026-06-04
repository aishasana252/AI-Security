'use client';

/**
 * APEXLyn Lens — Billing & Seats Page
 * Screen ID: COM-BILLING-001
 * Route: /app/billing
 * Source: UIUX Specification Section 12 + Section 20
 *
 * Required sections (Spec 12 + 20):
 * - Plan summary: name, subscription status, billing cycle, lifecycle state
 * - Seat summary: purchased, active, available, excluded, overage
 * - Invoice history table
 * - Lifecycle state: active/grace/past_due/suspended/cancel_pending
 */

import React, { useState } from 'react';
import {
  CreditCard, Users, CheckCircle, AlertTriangle, XCircle, Clock,
  Download, ChevronRight, TrendingUp, Calendar, ArrowUpRight,
} from 'lucide-react';

const BILLING_STATE = {
  planName: 'Enterprise Evidence',
  subscriptionStatus: 'active',
  lifecycleState: 'active' as 'active' | 'grace' | 'past_due' | 'suspended' | 'cancel_pending' | 'read_only_exit' | 'export_window' | 'retained_only',
  billingCycle: 'Annual',
  nextRenewal: '2026-08-01',
  seats: { purchased: 900, active: 847, excluded: 12, available: 53, overage: 0 },
};

const INVOICES = [
  { id: 'inv-2026-08', period: 'Aug 2025 – Aug 2026', amount: '$28,800.00', status: 'paid', date: '2025-08-01' },
  { id: 'inv-2025-08', period: 'Aug 2024 – Aug 2025', amount: '$24,000.00', status: 'paid', date: '2024-08-01' },
  { id: 'inv-2024-08', period: 'Aug 2023 – Aug 2024', amount: '$19,200.00', status: 'paid', date: '2023-08-01' },
];

function LifecycleChip({ state }: { state: string }) {
  const cfg: Record<string, { cls: string; label: string }> = {
    active:        { cls: 'chip-active',   label: 'Active' },
    grace:         { cls: 'chip-medium',   label: 'Grace Period' },
    past_due:      { cls: 'chip-high',     label: 'Past Due' },
    suspended:     { cls: 'chip-critical', label: 'Suspended' },
    cancel_pending:{ cls: 'chip-medium',   label: 'Cancellation Pending' },
    read_only_exit:{ cls: 'chip-critical', label: 'Read-Only (Exit)' },
    export_window: { cls: 'chip-medium',   label: 'Export Window' },
    retained_only: { cls: 'chip-critical', label: 'Retained Only' },
  };
  const c = cfg[state] || { cls: 'chip-info', label: state };
  return <span className={`chip ${c.cls}`}>{c.label}</span>;
}

export default function BillingPage() {
  const seats = BILLING_STATE.seats;
  const seatUsagePct = Math.round((seats.active / seats.purchased) * 100);
  const isNearCapacity = seatUsagePct >= 90;

  return (
    <div style={{ minHeight: '100%' }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Billing &amp; Seats</h1>
          <p className="page-subtitle">Subscription plan, seat consumption, lifecycle state, and invoice history.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ChevronRight size={13} />
            Request plan change
          </button>
        </div>
      </div>

      <div style={{ padding: 'var(--page-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Lifecycle State Banner — if not active */}
        {BILLING_STATE.lifecycleState !== 'active' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--color-state-warning-bg)', border: '1px solid var(--color-state-warning-border)', borderRadius: 'var(--radius-lg)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0 }} />
            <div>
              <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-state-warning-text)' }}>
                Subscription lifecycle: {BILLING_STATE.lifecycleState}
              </div>
              <div style={{ font: 'var(--type-caption)', color: 'var(--color-state-warning-text)', opacity: 0.8 }}>
                Platform behavior may be restricted. Review your account status immediately.
              </div>
            </div>
          </div>
        )}

        {/* Plan + Seat Summary Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Plan Summary (Spec 12) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CreditCard size={16} style={{ color: 'var(--color-text-tertiary)' }} />
              <h2 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Subscription Plan</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Plan', value: BILLING_STATE.planName, mono: false },
                { label: 'Status', value: null, custom: <LifecycleChip state={BILLING_STATE.lifecycleState} /> },
                { label: 'Billing cycle', value: BILLING_STATE.billingCycle, mono: false },
                { label: 'Next renewal', value: BILLING_STATE.nextRenewal, mono: true },
                { label: 'Current invoice', value: INVOICES[0].amount, mono: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)' }}>{r.label}</span>
                  {r.custom || (
                    <span style={{ fontFamily: r.mono ? 'var(--font-mono)' : 'inherit', fontSize: r.mono ? 13 : 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {r.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Seat Summary (Spec 12.15) */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Users size={16} style={{ color: 'var(--color-text-tertiary)' }} />
              <h2 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Seat Consumption</h2>
            </div>

            {/* Seat usage bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)' }}>
                  {seats.active} active of {seats.purchased} purchased
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: isNearCapacity ? 'var(--color-text-warning)' : 'var(--color-text-primary)' }}>
                  {seatUsagePct}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-tertiary)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${seatUsagePct}%`,
                  borderRadius: 4,
                  background: isNearCapacity ? 'var(--color-state-warning-icon)' : 'var(--color-action-primary-bg)',
                  transition: 'width 300ms ease',
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Purchased seats', value: seats.purchased, highlight: false },
                { label: 'Active (billable)', value: seats.active, highlight: false },
                { label: 'Excluded from scope', value: seats.excluded, highlight: false },
                { label: 'Available seats', value: seats.available, highlight: !isNearCapacity },
                { label: 'Overage', value: seats.overage, highlight: seats.overage > 0 },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: r.highlight ? 'var(--color-text-success)' : r.value === 0 && r.label === 'Overage' ? 'var(--color-text-disabled)' : 'var(--color-text-primary)' }}>
                    {r.value}
                  </span>
                </div>
              ))}
            </div>

            {isNearCapacity && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', background: 'var(--color-state-warning-bg)', border: '1px solid var(--color-state-warning-border)', borderRadius: 'var(--radius-md)' }}>
                <AlertTriangle size={13} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0, marginTop: 1 }} />
                <span style={{ font: 'var(--type-caption)', color: 'var(--color-state-warning-text)' }}>
                  Seat consumption is above 90%. Consider requesting additional seats before reaching capacity.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice History Table (Spec 20) */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--color-border-default)' }}>
            <h3 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>Invoice History</h3>
          </div>
          <table className="data-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map(inv => (
                <tr key={inv.id}>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{inv.id}</span></td>
                  <td>{inv.period}</td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{inv.amount}</span></td>
                  <td><span className="chip chip-active"><CheckCircle size={9} /> Paid</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-tertiary)' }}>{inv.date}</span></td>
                  <td>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', font: 'var(--type-caption)', color: 'var(--color-text-link)' }}>
                      <Download size={12} /> PDF
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
