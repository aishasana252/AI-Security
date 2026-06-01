'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Activity, 
  Layers, 
  ChevronRight, 
  Server, 
  Users, 
  Database,
  Lock,
  Workflow,
  Sparkles
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07080e] text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Background Cyber Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none pulse-glow"></div>

      {/* Header Navigation */}
      <header className="h-20 flex items-center justify-between px-8 md:px-16 border-b border-slate-800 bg-[#0b0c14]/40 backdrop-blur-md z-10">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-[18px] tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">APEXLyn Lens</span>
            <div className="text-[10px] text-cyan-400 font-mono tracking-widest font-semibold uppercase">AI Security & Evidence Platform</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-500 font-mono hidden md:block">Region: ap-southeast-2</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-mono font-semibold text-emerald-400">Database Live</span>
        </div>
      </header>

      {/* Main Hero & Database Breakdown Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 z-10 max-w-6xl mx-auto w-full space-y-16">
        
        {/* Core Hero Call-to-Action */}
        <div className="text-center space-y-6 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>SOW Milestone 1 Production Baseline Deployed</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-display">
            The Sovereign <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">AI DLP & Forensic Evidence</span> Platform
          </h1>
          
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            A production-grade Relational Control and Defensible Evidence platform. Mapped with Row-Level Security isolation, dynamic proration seat ledgers, and triggers for immutable evidence.
          </p>

          <div className="pt-4 flex items-center justify-center">
            <Link 
              href="/portal/overview"
              className="group inline-flex items-center space-x-2 px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-500/30 hover:scale-[1.02]"
            >
              <span>Access Control Portals</span>
              <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Database Architectural Highlight (Proof of 66-Table Schema) */}
        <div className="w-full space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-widest font-mono text-slate-500">PostgreSQL Data Architecture</h3>
            <h2 className="text-xl md:text-2xl font-bold font-display text-slate-200">66 relational tables deployed to Supabase Cloud</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* RLS Panel */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-200">Row-Level Security (RLS)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Database-enforced isolation. All client queries automatically filter context based on `app.current_tenant_id` session parameters. Zero leakage.
              </p>
            </div>

            {/* Immutability Panel */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Server className="h-5 w-5 text-indigo-400" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-200">Forensic Immutability Triggers</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Triggers block `UPDATE` and `DELETE` on all append-only tables (`dlp_events`, `evidence_chain_blocks`, etc.) ensuring defensible court evidence.
              </p>
            </div>

            {/* Indexes Panel */}
            <div className="glass-panel p-5 rounded-xl space-y-3.5">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-cyan-400" />
              </div>
              <h4 className="text-sm font-bold font-display text-slate-200">Optimized Composite Indexing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clause 11.7 indices (`tenant_id + event_timestamp`, `tenant_id + user_id`, etc.) ensure sub-second rendering for complex forensic query requests.
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer System Status */}
      <footer className="h-16 flex-shrink-0 flex items-center justify-between px-8 md:px-16 border-t border-slate-800 bg-[#0b0c14]/20 z-10 text-[11px] text-slate-500 font-mono">
        <span>© 2026 APEXLyn Pty Ltd. All rights reserved.</span>
        <div className="flex items-center space-x-4">
          <span>AWS Sydney (Primary)</span>
          <span>•</span>
          <span>Supabase Cloud Integration</span>
        </div>
      </footer>

    </div>
  );
}
