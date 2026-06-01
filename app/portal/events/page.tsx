'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  ShieldAlert, 
  ShieldCheck, 
  EyeOff, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function EventsPage() {
  const [filterAction, setFilterAction] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const events = [
    { id: 'evt-9f2a', timestamp: '15:42:11', user: 'user-pseudo-92c1', channel: 'Browser Extension', destination: 'https://chat.openai.com/backend-api/conversation', action: 'block', severity: 'critical', dataClasses: ['source_code', 'aws_credentials'], confidence: '98%', inputHash: 'sha256:7f9a1b...' },
    { id: 'evt-3c9f', timestamp: '15:20:04', user: 'user-pseudo-14a9', channel: 'Network Gateway', destination: 'https://api.anthropic.com/v1/messages', action: 'redact', severity: 'medium', dataClasses: ['pii_ssn', 'healthcare_records'], confidence: '95%', inputHash: 'sha256:3c8d9e...' },
    { id: 'evt-7a1e', timestamp: '14:55:50', user: 'user-pseudo-81b0', channel: 'API Interceptor', destination: 'https://api.cohere.ai/v1/generate', action: 'allow_with_audit', severity: 'low', dataClasses: ['financial_projections'], confidence: '89%', inputHash: 'sha256:1a5c6d...' },
    { id: 'evt-2b8d', timestamp: '13:12:05', user: 'user-pseudo-40c2', channel: 'M365 Outlook Connector', destination: 'external-recipient@competitor.com', action: 'warn', severity: 'high', dataClasses: ['customer_list_pci'], confidence: '92%', inputHash: 'sha256:9f2a8b...' },
    { id: 'evt-5e3a', timestamp: '11:04:32', user: 'user-pseudo-92c1', channel: 'Google Workspace Drive', destination: 'public-link-sharing', action: 'block', severity: 'high', dataClasses: ['source_code_intellectual_property'], confidence: '99%', inputHash: 'sha256:8f2a1b...' }
  ];

  const filteredEvents = events.filter(e => {
    const matchAction = filterAction === 'all' || e.action === filterAction;
    const matchSeverity = filterSeverity === 'all' || e.severity === filterSeverity;
    return matchAction && matchSeverity;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-100">Live DLP Events Stream</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time classification, policy resolution, and cryptographic hash verification logs from all active enforcement layers.</p>
      </div>

      {/* ============================================================================
         FILTERS BAR
         ============================================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs gap-4 flex-wrap">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono">Action:</span>
            <select 
              value={filterAction} 
              onChange={(e) => setFilterAction(e.target.value)}
              className="bg-[#161926] border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="allow_with_audit">Allow & Audit</option>
              <option value="warn">Warn</option>
              <option value="redact">Redact</option>
              <option value="block">Block</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono">Severity:</span>
            <select 
              value={filterSeverity} 
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-[#161926] border border-slate-800 rounded px-2.5 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-mono">{filteredEvents.length} event(s) fetched</span>
      </div>

      {/* ============================================================================
         EVENTS DATAGRID
         ============================================================================ */}
      <div className="glass-panel p-6 rounded-xl flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="text-slate-500 font-mono border-b border-slate-800/80">
                <th className="py-3 px-4 font-semibold">Event ID</th>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Enforcement Layer</th>
                <th className="py-3 px-4 font-semibold">User Pseudonym</th>
                <th className="py-3 px-4 font-semibold">Destination API / Target</th>
                <th className="py-3 px-4 font-semibold">Data Classes Mapped</th>
                <th className="py-3 px-4 font-semibold">Action</th>
                <th className="py-3 px-4 font-semibold">Severity</th>
                <th className="py-3 px-4 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {filteredEvents.map((e, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">{e.id}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{e.timestamp}</td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{e.channel}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">{e.user}</td>
                  <td className="py-3.5 px-4 text-slate-400 truncate max-w-[200px]" title={e.destination}>{e.destination}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {e.dataClasses.map((label, lIdx) => (
                        <span key={lIdx} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700/50 uppercase">
                          {label.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 uppercase font-bold text-[10px]">
                    <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded ${
                      e.action === 'block' 
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                        : e.action === 'redact' 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {e.action === 'block' ? <EyeOff className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                      <span>{e.action.replace('_', ' ')}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      e.severity === 'critical' || e.severity === 'high'
                        ? 'bg-rose-500/10 text-rose-400'
                        : e.severity === 'medium'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {e.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-[10px] text-slate-500 hover:text-cyan-400 cursor-help transition-colors" title={e.inputHash}>
                    Signed Ledger
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
