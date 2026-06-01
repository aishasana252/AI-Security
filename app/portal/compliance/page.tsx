'use client';

import React, { useState } from 'react';
import { 
  FileCheck2, 
  PlusCircle, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  HelpCircle,
  FileSpreadsheet,
  FileJson,
  FileText,
  Workflow
} from 'lucide-react';

export default function CompliancePage() {
  const activeFrameworks = [
    { name: 'Privacy Act 2024 — ADM Transparency', code: 'PRIV-24', status: 'live', evidence: '18 mapped', refresh: '5m ago' },
    { name: 'APRA CPS 234 (Information Security)', code: 'APRA-234', status: 'live', evidence: '42 mapped', refresh: '2m ago' },
    { name: 'APRA CPS 230 (Operational Resilience)', code: 'APRA-230', status: 'live', evidence: '28 mapped', refresh: '12m ago' },
    { name: 'IRAP — PROTECTED Evidence Dossier', code: 'IRAP-PROT', status: 'live', evidence: '54 mapped', refresh: '1h ago' },
    { name: 'ASD Essential Eight — AI Controls', code: 'ASD-E8', status: 'live_with_gaps', evidence: '31 mapped', refresh: '20m ago', gap: 'M365 Audit Log offline' },
    { name: 'ISO 27001 (ISMS)', code: 'ISO-27001', status: 'live', evidence: '82 mapped', refresh: 'Live' },
    { name: 'SOC 2 Type II (Trust Services Criteria)', code: 'SOC2-T2', status: 'live', evidence: '64 mapped', refresh: '10m ago' },
    { name: 'UK / EU GDPR (Data Protection)', code: 'GDPR-EU', status: 'live', evidence: '41 mapped', refresh: '4m ago' },
    { name: 'HIPAA Security Rule', code: 'HIPAA-SEC', status: 'live', evidence: '29 mapped', refresh: '1h ago' },
    { name: 'NIST CSF 2.0 (Cybersecurity Framework)', code: 'NIST-CSF', status: 'live', evidence: '60 mapped', refresh: '15m ago' }
  ];

  const plannedFrameworks = [
    { name: 'EU AI Act — High-Risk AI Mandates', code: 'EU-AI-ACT', status: 'planned', target: 'Q3 2026' },
    { name: 'UK Cyber Essentials Plus', code: 'UK-CEP', status: 'planned', target: 'Q4 2026' }
  ];

  // Report History
  const [reportHistory, setReportHistory] = useState([
    { id: 'rep-8f2a1b', name: 'APRA CPS 234 Compliance Dossier', type: 'Framework Report', format: 'PDF', requestedBy: 'Abdul Rehman', date: '2026-06-01 14:15', status: 'completed', url: '#' },
    { id: 'rep-3c9f8d', name: 'IRAP Protected Evidence Manifest', type: 'Evidence verification', format: 'EDR', requestedBy: 'Abdul Rehman', date: '2026-06-01 10:30', status: 'completed', url: '#' },
    { id: 'rep-7a1e5c', name: 'SOC 2 Type II Gap Audit Log', type: 'Audit Pack', format: 'XLSX', requestedBy: 'System Cron', date: '2026-05-31 23:00', status: 'expired', url: '#' }
  ]);

  // Report Builder State
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('APRA-234');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [includeTechnicalAppendix, setIncludeTechnicalAppendix] = useState(true);
  const [includeEvidenceManifest, setIncludeEvidenceManifest] = useState(true);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildingReport, setBuildingReport] = useState(false);

  const handleBuildReport = (e: React.FormEvent) => {
    e.preventDefault();
    setBuildingReport(true);
    setBuildProgress(10);
    
    // Simulate Asynchronous Build Job (SOW Clause 4.12.12 target < 30s)
    const interval = setInterval(() => {
      setBuildProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBuildingReport(false);
          setShowBuilder(false);
          
          // Add to history
          const frameworkName = [...activeFrameworks, ...plannedFrameworks].find(f => f.code === selectedFramework)?.name || 'Custom Report';
          setReportHistory(old => [
            {
              id: `rep-${Math.random().toString(36).substr(2, 6)}`,
              name: `${frameworkName} Pack`,
              type: 'Framework Report',
              format: selectedFormat,
              requestedBy: 'Abdul Rehman',
              date: 'Just now',
              status: 'completed',
              url: '#'
            },
            ...old
          ]);
          return 0;
        }
        return prev + 15;
      });
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-200">
      
      {/* Top Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-100">Compliance & Regulatory Governance</h1>
          <p className="text-xs text-slate-400 mt-1">Generate signed, evidence-backed dossiers directly from raw platform audit logs and cryptographic evidence chains.</p>
        </div>
        <button 
          onClick={() => setShowBuilder(true)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow shadow-blue-600/20"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* ============================================================================
         FRAMEWORK DASHBOARD GRID (SOW Clause 4.12.19 & 4.12.20)
         ============================================================================ */}
      <div className="glass-panel p-6 rounded-xl space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400">Supported Framework Catalog</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeFrameworks.map((f, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between space-y-3.5">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wide border border-slate-700/50">
                    {f.code}
                  </span>
                  <span className="flex items-center space-x-1.5 text-[9px] font-mono font-semibold uppercase text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    <span>{f.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-slate-200 leading-snug">{f.name}</h4>
              </div>
              
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{f.evidence}</span>
                <span>Sync: {f.refresh}</span>
              </div>
            </div>
          ))}
          
          {/* Planned Frameworks (Must not be shown as live) */}
          {plannedFrameworks.map((f, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[#110c14]/40 border border-purple-950/20 flex flex-col justify-between space-y-3.5">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1f1624] text-purple-400 uppercase tracking-wide border border-purple-900/30">
                    {f.code}
                  </span>
                  <span className="flex items-center space-x-1.5 text-[9px] font-mono font-semibold uppercase text-purple-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span>{f.status}</span>
                  </span>
                </div>
                <h4 className="mt-3 text-sm font-semibold text-slate-400 leading-snug">{f.name}</h4>
              </div>
              
              <div className="pt-3 border-t border-purple-950/40 flex items-center justify-between text-[10px] font-mono text-purple-400/60">
                <span>Relational modeling planned</span>
                <span>Target: {f.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================================
         REPORT HISTORY (SOW Clause 4.12.14)
         ============================================================================ */}
      <div className="glass-panel p-6 rounded-xl flex flex-col">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-400 pb-4 border-b border-slate-800">Generated Report Dossier History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans mt-4">
            <thead>
              <tr className="text-slate-500 font-mono border-b border-slate-800/80">
                <th className="py-3 px-4 font-semibold">Report ID</th>
                <th className="py-3 px-4 font-semibold">Report Title</th>
                <th className="py-3 px-4 font-semibold">Dossier Type</th>
                <th className="py-3 px-4 font-semibold">Format</th>
                <th className="py-3 px-4 font-semibold">Generated By</th>
                <th className="py-3 px-4 font-semibold">Creation Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {reportHistory.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-500">{r.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">{r.name}</td>
                  <td className="py-3.5 px-4 text-slate-400">{r.type}</td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.format === 'PDF' 
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                        : r.format === 'XLSX' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    }`}>
                      {r.format}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-400">{r.requestedBy}</td>
                  <td className="py-3.5 px-4 text-slate-400">{r.date}</td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      r.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {r.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Expired</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status === 'completed' ? (
                      <button className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-600 font-medium">Rebuild required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================
         REPORT BUILDER MODAL (SOW Clause 4.12.9)
         ============================================================================ */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-[#0f111a] border border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-display text-slate-200 flex items-center space-x-2">
              <Workflow className="h-5.5 w-5.5 text-blue-400" />
              <span>Dossier Report Engine</span>
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-normal">
              Extract and compile an asynchronous compliance report packet. The document is signed with the platform keys and includes evidence manifests and full cryptographic hashes.
            </p>

            <form onSubmit={handleBuildReport} className="mt-6 space-y-4">
              
              {/* Select Framework */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Target Framework</label>
                <select 
                  value={selectedFramework}
                  onChange={(e) => setSelectedFramework(e.target.value)}
                  disabled={buildingReport}
                  className="mt-1.5 w-full bg-[#161926] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  {activeFrameworks.map((f) => (
                    <option key={f.code} value={f.code}>{f.name} ({f.code})</option>
                  ))}
                </select>
              </div>

              {/* Time period and format grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Evaluation Timeframe</label>
                  <select 
                    value={selectedTimeframe}
                    onChange={(e) => setSelectedTimeframe(e.target.value)}
                    disabled={buildingReport}
                    className="mt-1.5 w-full bg-[#161926] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="12m">Last 12 Months</option>
                    <option value="override">Custom Contract Override</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Output Format</label>
                  <select 
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    disabled={buildingReport}
                    className="mt-1.5 w-full bg-[#161926] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="PDF">Court-Ready PDF</option>
                    <option value="XLSX">Audit-Grade XLSX Sheets</option>
                    <option value="JSON">Machine-Readable JSON</option>
                    <option value="EDR">eDiscovery Legal EDR Pack</option>
                  </select>
                </div>
              </div>

              {/* Toggle configurations */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Include Technical Appendix</span>
                    <span className="text-[10px] text-slate-500">Append detailed data mappings, trigger rules, and categories.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeTechnicalAppendix}
                    onChange={(e) => setIncludeTechnicalAppendix(e.target.checked)}
                    disabled={buildingReport}
                    className="h-4 w-4 bg-slate-900 rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-300">Include Cryptographic Evidence Manifest</span>
                    <span className="text-[10px] text-slate-500">Include signed block-index hashes and signature seals.</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={includeEvidenceManifest}
                    onChange={(e) => setIncludeEvidenceManifest(e.target.checked)}
                    disabled={buildingReport}
                    className="h-4 w-4 bg-slate-900 rounded border-slate-800 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              </div>

              {buildingReport ? (
                /* Dynamic Progress Loading Bar */
                <div className="pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-semibold text-blue-400">
                    <span>Compiling ledger entries...</span>
                    <span>{buildProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300" style={{ width: `${buildProgress}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowBuilder(false)}
                    className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow shadow-blue-600/20"
                  >
                    Start Compilation Job
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
