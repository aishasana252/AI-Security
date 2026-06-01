'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Activity, 
  Layers, 
  Eye, 
  Search, 
  FolderLock, 
  FileCheck2, 
  Users2, 
  CreditCard, 
  Settings2, 
  Lock, 
  ChevronDown, 
  Bell, 
  Clock, 
  CheckCircle,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface SidebarGroup {
  groupName: string;
  items: SidebarItem[];
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTenant, setCurrentTenant] = useState({
    id: 't-8c9a2c3f',
    name: 'Sovereign-AU-Enterprise',
    type: 'direct_enterprise',
    region: 'ap-southeast-2 (Sydney)',
    isolation: 'isolated_dedicated',
    keys: 'customer_cmk'
  });
  
  // Just-In-Time (JIT) Support Access State
  const [jitActive, setJitActive] = useState(false);
  const [jitTimeLeft, setJitTimeLeft] = useState('00:00:00');
  const [showJitModal, setShowJitModal] = useState(false);
  const [jitDuration, setJitDuration] = useState('1');
  const [jitReason, setJitReason] = useState('');
  const [jitSubmitting, setJitSubmitting] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Sovereign LLM Boundary Exceeded', body: 'Blocked unauthorized raw code upload to ChatGPT by User pseudo-82a1.', type: 'danger', time: '5m ago' },
    { id: 2, title: 'Compliance Report Built', body: 'APRA CPS 234 Audit dossier successfully generated (PDF + JSON).', type: 'success', time: '1h ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const sidebarGroups: SidebarGroup[] = [
    {
      groupName: 'Dashboards',
      items: [
        { name: 'Overview', href: '/portal/overview', icon: Layers },
        { name: 'Events Stream', href: '/portal/events', icon: Activity },
      ]
    },
    {
      groupName: 'Control Center',
      items: [
        { name: 'DLP Policies', href: '/portal/policies', icon: Shield },
        { name: 'Shadow AI', href: '/portal/shadow-ai', icon: Eye },
      ]
    },
    {
      groupName: 'Investigate',
      items: [
        { name: 'Forensic Workspace', href: '/portal/forensic-workspace', icon: FolderLock },
        { name: 'Compliance Dossier', href: '/portal/compliance', icon: FileCheck2 },
      ]
    },
    {
      groupName: 'Administration',
      items: [
        { name: 'User Directory', href: '/portal/users', icon: Users2 },
        { name: 'Billing & Seats', href: '/portal/billing', icon: CreditCard },
        { name: 'Tenant Settings', href: '/portal/settings', icon: Settings2 },
      ]
    }
  ];

  // Simple Timer logic for JIT session
  useEffect(() => {
    if (!jitActive) return;
    let seconds = parseInt(jitDuration) * 3600;
    const interval = setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        setJitActive(false);
        clearInterval(interval);
      } else {
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        setJitTimeLeft(`${hrs}:${mins}:${secs}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [jitActive, jitDuration]);

  const handleRequestJit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jitReason.trim()) return;
    
    setJitSubmitting(true);
    // Simulate API call to Support Access Service
    setTimeout(() => {
      setJitActive(true);
      setJitTimeLeft(`${jitDuration.padStart(2, '0')}:00:00`);
      setJitSubmitting(false);
      setShowJitModal(false);
      
      // Add audit log style notification
      setNotifications(prev => [
        {
          id: Date.now(),
          title: 'JIT Support Access Approved',
          body: `Elevated access granted to Support Agent for ${jitDuration} hour(s). Session fully audited.`,
          type: 'info',
          time: 'Just now'
        },
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#07080e] text-slate-100 font-sans">
      
      {/* ============================================================================
         SIDEBAR NAVIGATION
         ============================================================================ */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-[#0b0c14] border-r border-slate-800">
        
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-[#0d0f19]">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-semibold text-[17px] tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">APEXLyn Lens</span>
              <div className="flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase font-semibold">Active DLP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenant Details Info Box */}
        <div className="p-4 border-b border-slate-800 bg-[#0d0f19]/40">
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono uppercase font-semibold tracking-wider">
              <span>Current Tenant</span>
              <span className="text-cyan-400">{currentTenant.region.split(' ')[0]}</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold truncate font-display text-slate-200 flex items-center space-x-1.5">
              <span>{currentTenant.name}</span>
            </div>
            <div className="mt-2.5 flex items-center space-x-1.5">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">CMK Active</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Dedicated</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
          {sidebarGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                {group.groupName}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <li key={iIdx}>
                      <Link 
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-500/15 to-indigo-500/5 text-blue-400 border-l-[3px] border-blue-500 shadow-sm shadow-blue-500/5 pl-[9px]' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                        }`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Just-In-Time (JIT) Support Panel */}
        <div className="p-4 border-t border-slate-800 bg-[#0d0f19]/60">
          {jitActive ? (
            <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 animate-spin text-amber-500" />
                  <span>JIT Access Active</span>
                </div>
                <span className="text-[11px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded">{jitTimeLeft}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-amber-400/80 leading-relaxed font-mono">
                Support worker active. Complete audit logging enabled.
              </p>
              <button 
                onClick={() => setJitActive(false)}
                className="mt-3 w-full py-1.5 px-3 rounded bg-amber-500 text-[#07080e] hover:bg-amber-400 text-xs font-semibold transition-colors"
              >
                Terminate Session
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400">
              <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-300">
                <Lock className="h-3.5 w-3.5 text-slate-500" />
                <span>Support Isolation Active</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 leading-normal">
                No standing administrative credentials enabled.
              </p>
              <button 
                onClick={() => setShowJitModal(true)}
                className="mt-2.5 w-full py-1.5 px-3 rounded bg-slate-800 text-slate-300 hover:bg-slate-700/80 text-xs font-semibold border border-slate-700/60 transition-all flex items-center justify-center space-x-1"
              >
                <span>Request JIT Access</span>
              </button>
            </div>
          )}
        </div>

      </aside>

      {/* ============================================================================
         MAIN WORKSPACE CONTENT CONTAINER
         ============================================================================ */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#07080e]">
        
        {/* Top Workspace Header */}
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-800 bg-[#0b0c14]/40 backdrop-blur-md">
          
          {/* Universal Search Bar */}
          <div className="w-96 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search events, cases, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f111a] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
          </div>

          {/* Right Header Navigation Controls */}
          <div className="flex items-center space-x-5">
            
            {/* Quick Portal Switcher (For MSP Entitlements) */}
            <div className="relative">
              <button className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                <span>Direct Customer Portal</span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>

            {/* Notification System Popover */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg bg-[#0f111a] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl bg-[#0f111a] border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider pb-2.5 border-b border-slate-800">Notifications</h4>
                  <ul className="mt-3 space-y-3">
                    {notifications.map((n) => (
                      <li key={n.id} className="p-2.5 rounded bg-slate-900/50 border border-slate-800/40 text-xs flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${n.type === 'danger' ? 'text-rose-400' : n.type === 'success' ? 'text-emerald-400' : 'text-blue-400'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                        </div>
                        <p className="text-slate-400 leading-normal">{n.body}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Support Help Button */}
            <button className="p-2 rounded-lg bg-[#0f111a] border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            {/* User Account Dropdown */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow shadow-indigo-500/20">
                AR
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-200 font-display">Abdul Rehman</div>
                <div className="text-[10px] text-slate-500 font-mono uppercase font-semibold">Developer</div>
              </div>
            </div>

          </div>

        </header>

        {/* Dynamic Nested Route Content viewport */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>

      </div>

      {/* ============================================================================
         JIT SUPPORT ACCESS REQUEST MODAL
         ============================================================================ */}
      {showJitModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-[#0f111a] border border-slate-800 shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold font-display text-slate-200 flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-400" />
              <span>Request JIT Support Access</span>
            </h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Enable temporary administrative access. Support access is **Just-In-Time (JIT)**, **time-boxed**, and **comprehensively audited**. All actions are logged and displayed in the audit trail.
            </p>

            <form onSubmit={handleRequestJit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Duration</label>
                <select 
                  value={jitDuration} 
                  onChange={(e) => setJitDuration(e.target.value)}
                  className="mt-1.5 w-full bg-[#161926] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1">1 Hour (Standard debugging)</option>
                  <option value="2">2 Hours (Extended setup)</option>
                  <option value="4">4 Hours (Complex configuration)</option>
                  <option value="8">8 Hours (Break-Glass override)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Access Justification</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="Enter standard ticket reference or specific debug issue justification..."
                  value={jitReason} 
                  onChange={(e) => setJitReason(e.target.value)}
                  className="mt-1.5 w-full bg-[#161926] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans"
                />
              </div>

              <div className="flex items-center space-x-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px]">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <span className="leading-relaxed">
                  **SOW Requirement Check**: By submitting, you confirm authorization. An entry will be posted directly to the customer-visible **Support Access History** ledger.
                </span>
              </div>

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowJitModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={jitSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow shadow-blue-600/25 flex items-center space-x-2"
                >
                  {jitSubmitting ? (
                    <>
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span>Elevating Access...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Approve & Authorize</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
