'use client';

/**
 * APEXLyn Lens — DLP Policy Builder Page
 * Screen ID: GOV-POLICIES-BUILDER-001
 * Route: /app/policies/builder
 * Source: UIUX Specification Section 16.8 (Policy Builder)
 *
 * Implements a step-by-step guided workflow:
 * 1. Policy Identity (Name, ID, Description)
 * 2. Data Class Selector (Select patterns/dictionaries)
 * 3. Destination Tool Scope (Scope specific AI endpoints)
 * 4. Enforcement Action (Block, Warn, Redact, Audit)
 * 5. Target Scope (Users, groups, departments)
 * 6. Review & Preview Mode
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield, Plus, ArrowLeft, ArrowRight, Eye, CheckCircle,
  FileText, Cpu, Users, AlertTriangle, Play, HelpCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function PolicyBuilderPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [policyName, setPolicyName] = useState('');
  const [policyDesc, setPolicyDesc] = useState('');
  const [selectedDataClasses, setSelectedDataClasses] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [action, setAction] = useState('Block');
  const [targetScope, setTargetScope] = useState('All Users');
  const [excludeDepts, setExcludeDepts] = useState<string[]>([]);

  const DATA_CLASSES = [
    { id: 'dc-src', label: 'Source Code (C++, Python, JS, Java)', desc: 'Proprietary developer patterns and repository files' },
    { id: 'dc-tfn', label: 'PII — Australian Tax File Number (TFN)', desc: '9-digit statutory identification format' },
    { id: 'dc-cc', label: 'Payment Card Details (PCI-DSS)', desc: 'Credit card numbers and validation codes' },
    { id: 'dc-med', label: 'Health Information (HIPAA)', desc: 'Patient records and diagnostic terms' },
    { id: 'dc-fin', label: 'Internal Financial Estimates', desc: 'Earnings projections and budget spreadsheets' },
  ];

  const AI_TOOLS = [
    { id: 'tool-chatgpt', label: 'ChatGPT (OpenAI)', desc: 'Includes chat.openai.com and API egress' },
    { id: 'tool-gemini', label: 'Gemini Advanced (Google)', desc: 'Includes Gemini Workspace & developer app' },
    { id: 'tool-claude', label: 'Claude (Anthropic)', desc: 'Includes claude.ai endpoints' },
    { id: 'tool-notion', label: 'Notion AI', desc: 'Includes inline document assistance' },
    { id: 'tool-perplexity', label: 'Perplexity AI', desc: 'Includes search research assistant' },
  ];

  const handleDataClassToggle = (id: string) => {
    setSelectedDataClasses(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleToolToggle = (id: string) => {
    setSelectedTools(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission of policy draft
    setTimeout(() => {
      setLoading(false);
      alert('Policy draft created and submitted for peer review. Draft Reference ID: ps-draft-881a.');
      router.push('/app/policies');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── BACK NAV & HEADER ── */}
      <div style={{
        background: 'var(--color-surface-primary)',
        borderBottom: '1px solid var(--color-border-default)',
        padding: '12px var(--page-padding)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <Link
          href="/app/policies"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-secondary)',
            textDecoration: 'none'
          }}
        >
          <ArrowLeft size={16} /> Back to Policies
        </Link>
        <div style={{ width: 1, height: 16, background: 'var(--color-border-default)' }} />
        <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
          Policy Creation Guide
        </span>
      </div>

      <div style={{ padding: 'var(--page-padding)', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Step Indicator strip */}
        <div style={{
          display: 'flex',
          background: 'var(--color-surface-primary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 16px',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}>
          {[
            { num: 1, label: 'Metadata' },
            { num: 2, label: 'Data Classes' },
            { num: 3, label: 'Destinations' },
            { num: 4, label: 'Enforcement' },
            { num: 5, label: 'Target Scope' },
            { num: 6, label: 'Review & Activate' },
          ].map(s => {
            const isCurrent = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: isCurrent ? 'var(--color-action-primary-bg)' : isCompleted ? 'var(--color-state-success-icon)' : 'var(--color-surface-tertiary)',
                  color: isCurrent || isCompleted ? '#fff' : 'var(--color-text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700
                }}>
                  {isCompleted ? '✓' : s.num}
                </span>
                <span style={{
                  font: 'var(--type-body-sm)',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)'
                }}>{s.label}</span>
                {s.num < 6 && <span style={{ color: 'var(--color-text-disabled)', fontSize: 14 }}>→</span>}
              </div>
            );
          })}
        </div>

        {/* Builder Panel */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
          <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div style={{ flex: 1, paddingBottom: 24 }}>
              
              {/* STEP 1: Metadata */}
              {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
                  <div>
                    <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Policy Details</h3>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Define identity settings for the new policy set.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', font: 'var(--type-label-md)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Policy Name</label>
                    <input
                      type="text"
                      required
                      value={policyName}
                      onChange={e => setPolicyName(e.target.value)}
                      placeholder="e.g. Critical Source Code Leak Prevention"
                      className="input"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', font: 'var(--type-label-md)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Policy Description</label>
                    <textarea
                      rows={4}
                      value={policyDesc}
                      onChange={e => setPolicyDesc(e.target.value)}
                      placeholder="Describe the intention and scope of this security control..."
                      style={{
                        width: '100%', padding: '10px 12px', border: '1px solid var(--color-border-default)',
                        borderRadius: 'var(--radius-md)', background: 'var(--color-surface-secondary)',
                        font: 'var(--type-body-sm)', outline: 'none', resize: 'vertical'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Data Class Selector */}
              {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Select Data Classes</h3>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Specify the payload signatures this policy will classify.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DATA_CLASSES.map(dc => (
                      <div
                        key={dc.id}
                        onClick={() => handleDataClassToggle(dc.id)}
                        className="card"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer',
                          borderColor: selectedDataClasses.includes(dc.id) ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)',
                          background: selectedDataClasses.includes(dc.id) ? 'var(--color-surface-selected)' : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDataClasses.includes(dc.id)}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--color-action-primary-bg)' }}
                        />
                        <div>
                          <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{dc.label}</div>
                          <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{dc.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Destination Tool Scope */}
              {step === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Select Destination AI Tools</h3>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Specify which AI platforms/APIs are scoped by this policy.</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {AI_TOOLS.map(t => (
                      <div
                        key={t.id}
                        onClick={() => handleToolToggle(t.id)}
                        className="card"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer',
                          borderColor: selectedTools.includes(t.id) ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)',
                          background: selectedTools.includes(t.id) ? 'var(--color-surface-selected)' : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTools.includes(t.id)}
                          onChange={() => {}}
                          style={{ accentColor: 'var(--color-action-primary-bg)' }}
                        />
                        <div>
                          <div style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{t.label}</div>
                          <div style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Enforcement Action */}
              {step === 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
                  <div>
                    <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Select Enforcement Action</h3>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Define what the gateway and agents do on a classification hit.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {[
                      { val: 'Block', label: 'Block upload', desc: 'Denies egress transmission immediately. Displays block screen to client.' },
                      { val: 'Warn', label: 'Warn user', desc: 'Raises a threshold warn dialog but allows user overrides with a logged justification.' },
                      { val: 'Redact', label: 'Redact parameters', desc: 'Scrubs matched sequences and replaces them with [REDACTED] tokens before sending.' },
                      { val: 'Audit', label: 'Audit entry only', desc: 'Allows full transmission but logs a high-severity entry in the events stream.' },
                    ].map(act => (
                      <div
                        key={act.val}
                        onClick={() => setAction(act.val)}
                        className="card"
                        style={{
                          padding: 16, cursor: 'pointer',
                          borderColor: action === act.val ? 'var(--color-action-primary-bg)' : 'var(--color-border-default)',
                          background: action === act.val ? 'var(--color-surface-selected)' : 'transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ font: 'var(--type-body-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{act.label}</span>
                          <input type="radio" checked={action === act.val} onChange={() => {}} style={{ accentColor: 'var(--color-action-primary-bg)' }} />
                        </div>
                        <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', lineHeight: 1.4 }}>{act.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Target Scope */}
              {step === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
                  <div>
                    <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Assign User Scope</h3>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Define which business units or active roles are subject to this policy.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', font: 'var(--type-label-md)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>Target scope</label>
                    <select
                      value={targetScope}
                      onChange={e => setTargetScope(e.target.value)}
                      className="input"
                    >
                      <option value="All Users">All directory users in scope</option>
                      <option value="Contractors">Temporary Contractors only</option>
                      <option value="Specific Departments">Scope by department exclusion...</option>
                    </select>
                  </div>

                  {targetScope === 'Specific Departments' && (
                    <div>
                      <label style={{ display: 'block', font: 'var(--type-label-md)', color: 'var(--color-text-secondary)', marginBottom: 8 }}>Exempt Departments</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['Legal', 'Executive', 'IT Security'].map(dept => {
                          const isExcluded = excludeDepts.includes(dept);
                          return (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => setExcludeDepts(prev => isExcluded ? prev.filter(x => x !== dept) : [...prev, dept])}
                              style={{
                                height: 32, padding: '0 12px', border: '1px solid var(--color-border-default)', borderRadius: 99,
                                font: 'var(--type-caption)', fontWeight: 600,
                                background: isExcluded ? 'var(--color-state-critical-bg)' : 'transparent',
                                color: isExcluded ? 'var(--color-state-critical-text)' : 'var(--color-text-tertiary)',
                                cursor: 'pointer'
                              }}
                            >
                              {isExcluded ? `✕ Exempt: ${dept}` : `+ Exempt ${dept}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 6: Review & Preview */}
              {step === 6 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>Review &amp; Test Preview</h3>
                    <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 2 }}>Review policy draft metrics before committing to the validation pipeline.</p>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {[
                        { label: 'Policy Name', value: policyName || 'Untitled Policy' },
                        { label: 'Description', value: policyDesc || 'No description provided.' },
                        { label: 'Matched Data Classes', value: selectedDataClasses.length > 0 ? selectedDataClasses.map(x => DATA_CLASSES.find(dc => dc.id === x)?.label).join(', ') : 'None selected' },
                        { label: 'AI Tool Scope', value: selectedTools.length > 0 ? selectedTools.map(x => AI_TOOLS.find(t => t.id === x)?.label).join(', ') : 'None selected' },
                        { label: 'Enforcement Action', value: action, highlight: true },
                        { label: 'Target Scope Group', value: targetScope === 'Specific Departments' ? `All except ${excludeDepts.join(', ')}` : targetScope },
                      ].map(r => (
                        <div key={r.label} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--color-border-default)' }}>
                          <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', minWidth: 160 }}>{r.label}</span>
                          <span style={{ font: 'var(--type-body-sm)', fontWeight: 600, color: r.highlight ? 'var(--color-text-critical)' : 'var(--color-text-primary)' }}>{r.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="card" style={{ background: 'var(--color-surface-secondary)' }}>
                      <h4 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Play size={14} style={{ color: 'var(--color-accent-ai-primary)' }} /> Testing Preview
                      </h4>
                      <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)', lineHeight: 1.5 }}>
                        Verify rule logic against historical telemetry models before saving.
                      </p>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={() => alert('Simulated dry-run validation: 2 classification hits detected in last 24h logs.')}>
                        Run Rule Dry Run
                      </button>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', gap: 10, padding: 12,
                    background: 'var(--color-state-warning-bg)', border: '1px solid var(--color-state-warning-border)',
                    borderRadius: 'var(--radius-md)', marginTop: 12
                  }}>
                    <AlertTriangle size={15} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0, marginTop: 1 }} />
                    <span style={{ font: 'var(--type-caption)', color: 'var(--color-state-warning-text)', lineHeight: 1.5 }}>
                      Draft policies require approval from at least one other Tenant Administrator before activation.
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Actions Bar */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              paddingTop: 16, borderTop: '1px solid var(--color-border-default)'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={step === 1}
                onClick={() => setStep(prev => prev - 1)}
              >
                Back
              </button>

              {step < 6 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={step === 1 && !policyName.trim()}
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Create Policy Draft
                </button>
              )}
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
