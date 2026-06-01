'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Fingerprint, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Globe,
  Database
} from 'lucide-react';

export default function OverviewPage() {
  const stats = [
    { name: 'Total Active Seats', value: '412 / 500', change: '+12 this week', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Inspected Interactions', value: '1,842,912', change: '99.98% uptime', icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { name: 'Active DLP Policies', value: '14 Active Rules', change: 'v2.4 active', icon: ShieldCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'Average User Risk', value: '14.2 / 100', change: '-2.4% reduction', icon: Fingerprint, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
  ];

  const connectors = [
    { name: 'Microsoft 365 Outlook & Teams', type: 'SaaS API', status: 'connected', delay: '< 2s', sync: '5m ago' },
    { name: 'Google Workspace Drive & Chat', type: 'SaaS API', status: 'connected', delay: '< 3s', sync: '12m ago' },
    { name: 'APEXLyn Hosted Network Gateway', type: 'Inline Control', status: 'connected', delay: '< 1ms', sync: 'Live' },
    { name: 'Browser Extension Agent', type: 'Endpoint API', status: 'degraded', delay: '6s', sync: '1h ago', warning: '14 endpoints offline' }
  ];

  const recentIncidents = [
    { time: '15:42:11', user: 'user-pseudo-92c1', action: 'blocked', severity: 'critical', details: 'Attempted export of AWS KMS decryption keys via ChatGPT' },
    { time: '15:20:04', user: 'user-pseudo-14a9', action: 'redacted', severity: 'medium', details: 'PII redacted from prompt context to Claude API' },
    { time: '14:55:50', user: 'user-pseudo-81b0', action: 'allowed_audit', severity: 'low', details: 'Interaction containing sensitive financial projections to Internal LLM' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Dashboard Top Heading bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">AI DLP Security Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Live relational monitoring of active user actions, policy distributions, and data classification metrics.</p>
        </div>
        <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ============================================================================
         STATISTICS GRID
         ============================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel glass-panel-hover p-6 rounded-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold font-mono uppercase text-slate-500 tracking-wider">{stat.name}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-display text-slate-100">{stat.value}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                <span>{stat.change}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* ============================================================================
         MIDDLE GRIDS (CONNECTORS & FORENSIC FEED)
         ============================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Application Connectors health (Clause 4.7.4) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center space-x-2">
              <Globe className="h-4.5 w-4.5 text-blue-400" />
              <span>Active Connectors & Gateways</span>
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">All Monitored</span>
          </div>
          
          <div className="flex-1 mt-4 divide-y divide-slate-800/60">
            {connectors.map((c, idx) => (
              <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-slate-200">{c.name}</div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
                    <span>{c.type}</span>
                    <span>•</span>
                    <span>Sync: {c.sync}</span>
                  </div>
                </div>
                
                <div className="text-right flex items-center space-x-4">
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500 mr-1">Delay:</span>{c.delay}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {c.status === 'connected' ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <div title={c.warning}>
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live DLP Evidence Stream (Clause 4.7.7C) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-xl flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400 flex items-center space-x-2">
              <Database className="h-4.5 w-4.5 text-indigo-400" />
              <span>DLP Evidence Ledger Preview</span>
            </h3>
            <Link href="/portal/events" className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1">
              <span>View Stream</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 mt-4 space-y-4">
            {recentIncidents.map((incident, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 flex flex-col space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-slate-500">{incident.time}</span>
                    <span className="font-mono text-slate-300 font-semibold">{incident.user}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    incident.action === 'blocked' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                      : incident.action === 'redacted' 
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/25'
                  }`}>
                    {incident.action}
                  </span>
                </div>
                <p className="text-slate-300 leading-normal font-sans">{incident.details}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ============================================================================
         FOOTER STATE INDICATOR
         ============================================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-sans">
        <div className="flex items-center space-x-2.5">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
          <span>**Relational Protection Boundary enforced**: RLS status enabled, cryptographically signing block 8,291.</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono font-semibold">PostgreSQL OK</span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="font-mono font-semibold">Redis Cache OK</span>
          </span>
        </div>
      </div>

    </div>
  );
}
