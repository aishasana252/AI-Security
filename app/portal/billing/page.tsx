'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Users, 
  Receipt, 
  FileText, 
  TrendingUp, 
  HelpCircle, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Minus,
  Sparkles,
  Info
} from 'lucide-react';

export default function BillingPage() {
  const [allocatedSeats, setAllocatedSeats] = useState(412);
  const totalSeatsMax = 500;
  const seatOveragePrice = 12.50; // AUD per seat

  // Invoices List separating AU GST lines (Clause 4.2.11)
  const invoices = [
    { id: 'INV-2026-004', date: '01 Jun 2026', period: '01 Jun - 30 Jun', base: 4500.00, gst: 450.00, total: 4950.00, status: 'paid' },
    { id: 'INV-2026-003', date: '01 May 2026', period: '01 May - 31 May', base: 4500.00, gst: 450.00, total: 4950.00, status: 'paid' },
    { id: 'INV-2026-002', date: '01 Apr 2026', period: '01 Apr - 30 Apr', base: 4200.00, gst: 420.00, total: 4620.00, status: 'paid' },
    { id: 'INV-2026-001', date: '01 Mar 2026', period: '01 Mar - 31 Mar', base: 4200.00, gst: 420.00, total: 4620.00, status: 'paid' }
  ];

  // Seat Ledger with explicit grace period indicators (Clause 4.3.5 & 4.3.6)
  const seatLedger = [
    { id: 'seat-u01', name: 'user-pseudo-92c1', email: 'u92c1@corporate.com', type: 'named_user', status: 'active', activeSince: '01 Mar 2026' },
    { id: 'seat-u02', name: 'user-pseudo-14a9', email: 'u14a9@corporate.com', type: 'named_user', status: 'active', activeSince: '14 Mar 2026' },
    { id: 'seat-u03', name: 'user-pseudo-81b0', email: 'u81b0@corporate.com', type: 'named_user', status: 'pending_removal', activeSince: '12 Apr 2026', graceLeft: '48h remaining (Grace)' },
    { id: 'seat-u04', name: 'shared-inbox-customer', email: 'support-info@corporate.com', type: 'exempt_mailbox', status: 'exempt', activeSince: '01 Mar 2026' },
    { id: 'seat-u05', name: 'break-glass-admin', email: 'admin-bg@corporate.com', type: 'exempt_admin', status: 'exempt', activeSince: '01 Mar 2026' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Top Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Billing, Seats & Commercial Contracts</h1>
          <p className="text-xs text-slate-400 mt-1">Manage active seats, check subscription details, review invoice lines, and adjust seat ledgers.</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Subscription Active</span>
        </span>
      </div>

      {/* ============================================================================
         SUBSCRIPTION & SEATS OVERVIEW
         ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Subscription details Card */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl"></div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold font-mono uppercase text-slate-500 tracking-wider">Plan & Entitlements</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">Enterprise</span>
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-slate-100 font-display flex items-center space-x-2">
              <span>APEXLyn Enterprise Platform</span>
              <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            </h2>
            
            {/* Price list details with SOW rules (Clause 4.2.11 annual 15% discount) */}
            <div className="mt-4 grid grid-cols-3 gap-4 py-4 border-y border-slate-800/60 text-xs">
              <div>
                <span className="text-slate-500 font-mono">Contract Type</span>
                <p className="font-semibold text-slate-200 mt-0.5">Enterprise Custom</p>
              </div>
              <div>
                <span className="text-slate-500 font-mono">Base Price</span>
                <p className="font-semibold text-slate-200 mt-0.5">A$ 4,500.00 / mo</p>
              </div>
              <div>
                <span className="text-slate-500 font-mono">Billing Cycle</span>
                <p className="font-semibold text-slate-200 mt-0.5 flex items-center space-x-1">
                  <span>Annual Prepay</span>
                  <span className="text-[10px] text-emerald-400 font-bold">-15% Applied</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wide">Seat Utilization</span>
              <div className="text-sm font-semibold text-slate-200 flex items-center space-x-1.5">
                <span>{allocatedSeats} Mapped Named Users</span>
                <span className="text-slate-500 text-xs">({totalSeatsMax} limit)</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setAllocatedSeats(prev => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setAllocatedSeats(prev => Math.min(totalSeatsMax, prev + 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contract Overlay details (SOW Clause 4.2.11 & 4.3.4) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center space-x-1.5">
              <Receipt className="h-4 w-4 text-cyan-400" />
              <span>Contract Configuration</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Ref: CTR-2026-X8</span>
          </div>

          <div className="mt-4 flex-1 space-y-3.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">ACV Floor Threshold</span>
              <span className="font-semibold text-slate-300">A$ 50,000.00 / yr</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Included Seat Floor</span>
              <span className="font-semibold text-slate-300">400 included</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Overage Seat Rate</span>
              <span className="font-semibold text-slate-300">A$ {seatOveragePrice.toFixed(2)} / seat / mo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Implementation Surcharge</span>
              <span className="font-semibold text-emerald-400">Paid & Settled</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tax Registration</span>
              <span className="font-mono text-slate-400">AU10-GST Registered</span>
            </div>
          </div>

          <div className="mt-5 p-2.5 rounded bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-500 flex items-start space-x-1.5 leading-normal">
            <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <span>
              Direct conversion and contract overrides are founder-locked. All changes require double-signing.
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================================
         SEAT LEDGER & INVOICES ROW
         ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Seat Ledger (SOW Clause 4.3.5 & 4.3.6 72h grace) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center space-x-2">
              <Users className="h-4.5 w-4.5 text-blue-400" />
              <span>Seat Ledger & Grace Accounts</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">72-Hour Grace Enforced</span>
          </div>

          <div className="flex-1 mt-4 space-y-3.5">
            {seatLedger.map((seat) => (
              <div key={seat.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-semibold text-slate-200">{seat.name}</span>
                    <span className="text-slate-500 font-normal">({seat.email})</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <span>Type: {seat.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>Assigned: {seat.activeSince}</span>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-4">
                  {seat.status === 'pending_removal' ? (
                    <div className="text-right">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase animate-pulse">Pending Removal</span>
                      <div className="text-[9px] text-amber-500 font-mono mt-0.5 font-semibold">{seat.graceLeft}</div>
                    </div>
                  ) : seat.status === 'exempt' ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700/50 uppercase">Exempt</span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Active Seat</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice history itemized with GST (SOW Clause 4.2.11 & 4.12.28) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center space-x-2">
              <Receipt className="h-4.5 w-4.5 text-indigo-400" />
              <span>Invoice History & GST Tax Lines</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">AUD Currency</span>
          </div>

          <div className="flex-1 mt-4 space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80 flex flex-col space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-300">{inv.id}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{inv.date}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Paid</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1.5 border-t border-slate-800/50">
                  <div>
                    <span className="text-slate-500 font-mono">Period</span>
                    <p className="font-semibold text-slate-300 mt-0.5 truncate">{inv.period}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono">Base (ex GST)</span>
                    <p className="font-semibold text-slate-300 mt-0.5">A$ {inv.base.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono">10% AU GST</span>
                    <p className="font-semibold text-slate-400 mt-0.5">A$ {inv.gst.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-850 text-xs font-semibold text-slate-200">
                  <span>Total Charges</span>
                  <span className="text-cyan-400 font-mono">A$ {inv.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
