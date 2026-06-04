'use client';

/**
 * APEXLyn Lens — Identity & Session Login Page
 * Screen ID: AUTH-LOGIN-001
 * Route: /login
 * Source: UIUX Specification Section 11 (Identity / MFA / Session / Support Access)
 *
 * Implements Section 11.5 (Login entry surface), 11.6 (SSO path), 11.7 (MFA challenge),
 * 11.14 (Authentication failure-state), and 11.16 (Authentication/account lockout).
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  KeyRound,
  Mail,
  AlertTriangle,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  HelpCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Authentication stages: 'credentials' | 'sso-redirect' | 'mfa' | 'success' | 'lockout'
  const [stage, setStage] = useState<'credentials' | 'sso-redirect' | 'mfa' | 'success' | 'lockout'>('credentials');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // MFA Countdown Timer (Spec 11.7)
  const [mfaTimer, setMfaTimer] = useState(30);
  const [mfaExpired, setMfaExpired] = useState(false);

  // Track failed attempts for simulated account lockout (Spec 11.16)
  const [failedAttempts, setFailedAttempts] = useState(0);

  // MFA Countdown logic
  useEffect(() => {
    if (stage !== 'mfa' || mfaTimer <= 0) {
      if (mfaTimer === 0) setMfaExpired(true);
      return;
    }
    const interval = setInterval(() => {
      setMfaTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, mfaTimer]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required fields.');
      return;
    }

    setLoading(true);

    // Simulate authentication check
    setTimeout(() => {
      setLoading(false);
      
      // Simulate lockout condition
      if (email.toLowerCase() === 'lockout@apexlyn.com' || failedAttempts >= 2) {
        setStage('lockout');
        return;
      }

      // Simulate credential match
      // Accept typical entries, but fail if password is too short for demo diversity
      if (password.length < 6) {
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        setErrorMsg(`Invalid credentials. Authentication attempt ${attempts} of 3 failed.`);
        return;
      }

      // Credentials valid, proceed to mandatory MFA challenge (Spec 11.7)
      setStage('mfa');
      setMfaTimer(30);
      setMfaExpired(false);
    }, 1200);
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mfaExpired) {
      setErrorMsg('MFA code expired. Please request a new verification code.');
      return;
    }

    if (mfaCode.length !== 6 || !/^\d+$/.test(mfaCode)) {
      setErrorMsg('Verification code must be exactly 6 digits.');
      return;
    }

    setLoading(true);

    // Simulate MFA verification
    setTimeout(() => {
      setLoading(false);

      if (mfaCode !== '123456' && mfaCode !== '000000') {
        setErrorMsg('Invalid multi-factor verification code. Check your device and try again.');
        return;
      }

      // MFA valid, proceed to success transition
      setStage('success');
      
      // Redirect to main portal workspace dashboard
      setTimeout(() => {
        router.push('/app/overview');
      }, 1000);
    }, 1000);
  };

  const handleSsoStart = () => {
    setErrorMsg(null);
    setLoading(true);
    setStage('sso-redirect');

    // Simulate Okta/Entra ID redirect
    setTimeout(() => {
      setLoading(false);
      setStage('mfa'); // SSO also goes through tenant MFA policy checks
      setMfaTimer(30);
      setMfaExpired(false);
    }, 2000);
  };

  const resendMfa = () => {
    setErrorMsg(null);
    setMfaCode('');
    setMfaTimer(30);
    setMfaExpired(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-surface-app)',
      fontFamily: 'var(--font-primary)',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--elevation-3)',
        overflow: 'hidden'
      }}>
        {/* Banner/Header Info Bar */}
        <div style={{
          background: 'var(--color-chrome-primary)',
          color: 'var(--color-text-inverse)',
          padding: '24px 32px',
          borderBottom: '1px solid var(--color-chrome-divider)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            background: 'var(--color-action-primary-bg)',
            borderRadius: 10,
            marginBottom: 12
          }}>
            <Shield size={22} style={{ color: '#FFFFFF' }} />
          </div>
          <h1 style={{
            font: 'var(--type-heading-h2)',
            color: 'var(--color-text-inverse)',
            letterSpacing: '-0.01em',
            margin: 0
          }}>
            APEXLyn Lens
          </h1>
          <p style={{
            font: 'var(--type-caption)',
            color: 'var(--color-text-disabled)',
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600
          }}>
            Forensic DLP Operational Portal
          </p>
        </div>

        {/* Form Body Area */}
        <div style={{ padding: 32 }}>

          {/* STAGE 1: Standard Email & Password */}
          {stage === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  Sign In
                </h3>
                <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
                  Enter your credentials below to access the Sovereign-AU instance.
                </p>
              </div>

              {errorMsg && (
                <div style={{
                  display: 'flex',
                  gap: 10,
                  padding: 12,
                  background: 'var(--color-state-critical-bg)',
                  border: '1px solid var(--color-state-critical-border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <AlertTriangle size={15} style={{ color: 'var(--color-state-critical-icon)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-critical-text)', lineHeight: 1.5 }}>
                    {errorMsg}
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', font: 'var(--type-label-md)', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@sovereign-au.com"
                    style={{
                      width: '100%',
                      height: 40,
                      paddingLeft: 36,
                      paddingRight: 12,
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-canvas)',
                      font: 'var(--type-body-sm)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ font: 'var(--type-label-md)', color: 'var(--color-text-secondary)' }}>
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password resets must be initiated by your tenant security administrator.'); }} style={{ font: 'var(--type-caption)', color: 'var(--color-text-link)', textDecoration: 'none' }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-disabled)' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      height: 40,
                      paddingLeft: 36,
                      paddingRight: 12,
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-canvas)',
                      font: 'var(--type-body-sm)',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: 40,
                  background: 'var(--color-action-primary-bg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  font: 'var(--type-button-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 120ms ease',
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <>Continue <ArrowRight size={15} /></>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border-default)' }} />
                <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-disabled)', padding: '0 12px' }}>OR</span>
                <div style={{ flex: 1, height: 1, background: 'var(--color-border-default)' }} />
              </div>

              <button
                type="button"
                onClick={handleSsoStart}
                disabled={loading}
                style={{
                  width: '100%',
                  height: 40,
                  background: 'var(--color-action-secondary-bg)',
                  border: '1px solid var(--color-action-secondary-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-action-secondary-text)',
                  font: 'var(--type-button-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'background 120ms ease',
                }}
              >
                Continue with SSO
              </button>
            </form>
          )}

          {/* STAGE 2: SSO Redirecting Simulation */}
          {stage === 'sso-redirect' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0', gap: 16 }}>
              <Loader2 size={32} style={{ color: 'var(--color-action-primary-bg)', animation: 'spin 1s linear infinite' }} />
              <div>
                <h4 style={{ font: 'var(--type-heading-h4)', color: 'var(--color-text-primary)' }}>SSO Redirect</h4>
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-tertiary)', marginTop: 4 }}>
                  Redirecting to your identity provider (Okta Secure AU)...
                </p>
              </div>
            </div>
          )}

          {/* STAGE 3: Multi-Factor Verification TOTP */}
          {stage === 'mfa' && (
            <form onSubmit={handleMfaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)', marginBottom: 4 }}>
                  Multi-Factor Verification
                </h3>
                <p style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
                  A verification challenge is required. Enter the 6-digit code from your authenticator app.
                </p>
              </div>

              {errorMsg && (
                <div style={{
                  display: 'flex',
                  gap: 10,
                  padding: 12,
                  background: 'var(--color-state-critical-bg)',
                  border: '1px solid var(--color-state-critical-border)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <AlertTriangle size={15} style={{ color: 'var(--color-state-critical-icon)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ font: 'var(--type-body-sm)', color: 'var(--color-state-critical-text)', lineHeight: 1.5 }}>
                    {errorMsg}
                  </span>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ font: 'var(--type-label-md)', color: 'var(--color-text-secondary)' }}>
                    Verification Code
                  </label>
                  <span style={{
                    font: 'var(--type-caption)',
                    fontWeight: 600,
                    color: mfaExpired ? 'var(--color-text-critical)' : 'var(--color-text-warning)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <Clock size={11} />
                    {mfaExpired ? 'Code expired' : `${mfaTimer}s remaining`}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  style={{
                    width: '100%',
                    height: 44,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-surface-canvas)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{
                font: 'var(--type-caption)',
                color: 'var(--color-text-tertiary)',
                background: 'var(--color-surface-tertiary)',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center'
              }}>
                Enter <code style={{ fontWeight: 700 }}>123456</code> or <code style={{ fontWeight: 700 }}>000000</code> to verify.
              </div>

              <button
                type="submit"
                disabled={loading || mfaExpired}
                style={{
                  width: '100%',
                  height: 40,
                  background: 'var(--color-action-primary-bg)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: '#FFFFFF',
                  font: 'var(--type-button-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  'Verify & Log In'
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setStage('credentials')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', font: 'var(--type-caption)', cursor: 'pointer' }}
                >
                  ← Back to credentials
                </button>
                <button
                  type="button"
                  onClick={resendMfa}
                  style={{ background: 'none', border: 'none', color: 'var(--color-text-link)', font: 'var(--type-caption)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Resend verification code
                </button>
              </div>
            </form>
          )}

          {/* STAGE 4: Success Transition */}
          {stage === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0', gap: 16 }}>
              <CheckCircle size={44} style={{ color: 'var(--color-state-success-icon)' }} />
              <div>
                <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-success)' }}>
                  Authentication Successful
                </h3>
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  Resolving tenant context and loading operational workspace...
                </p>
              </div>
            </div>
          )}

          {/* STAGE 5: Administrative Account Lockout */}
          {stage === 'lockout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{
                width: 44,
                height: 44,
                background: 'var(--color-state-critical-bg)',
                border: '1px solid var(--color-state-critical-border)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
                <Lock size={20} style={{ color: 'var(--color-state-critical-icon)' }} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ font: 'var(--type-heading-h3)', color: 'var(--color-text-primary)' }}>
                  Sign-In is Temporarily Locked
                </h3>
                <p style={{ font: 'var(--type-body-sm)', color: 'var(--color-text-secondary)', marginTop: 6, lineHeight: 1.5 }}>
                  Access is blocked for this account due to repeated authentication failures or security policy conditions.
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: 10,
                padding: 12,
                background: 'var(--color-surface-tertiary)',
                borderRadius: 'var(--radius-md)',
                font: 'var(--type-caption)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5
              }}>
                <AlertTriangle size={15} style={{ color: 'var(--color-state-warning-icon)', flexShrink: 0, marginTop: 1 }} />
                <span>
                  Please contact your security administrator to verify access privileges or request unlock instructions.
                </span>
              </div>

              <button
                type="button"
                onClick={() => { setFailedAttempts(0); setStage('credentials'); setErrorMsg(null); }}
                style={{
                  width: '100%',
                  height: 40,
                  background: 'var(--color-action-secondary-bg)',
                  border: '1px solid var(--color-action-secondary-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-action-secondary-text)',
                  font: 'var(--type-button-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                Return to Login Screen
              </button>
            </div>
          )}

        </div>

        {/* Footer Support/Contact zone */}
        <div style={{
          padding: '16px 32px',
          borderTop: '1px solid var(--color-border-default)',
          background: 'var(--color-surface-secondary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ font: 'var(--type-caption)', color: 'var(--color-text-tertiary)' }}>
            System ID: <span style={{ fontFamily: 'var(--font-mono)' }}>INV-AUTH-001</span>
          </span>
          <a
            href="#help"
            onClick={(e) => { e.preventDefault(); alert('For technical assistance, email support@apexlyn.com with your tenant reference ID: t-8c9a2c3f.'); }}
            style={{
              font: 'var(--type-caption)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <HelpCircle size={12} /> Contact Support
          </a>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
