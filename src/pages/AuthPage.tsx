import React, { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { isFirebaseClientConfigured } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type { PlatformConfigResponse, UserRole } from '../types/fixsoon';

interface AuthPageProps {
  onNavigate: (path: string) => void;
  redirectAfter?: string;
}

const DEMO_ACCOUNTS = [
  { label: 'Customer (Alex Chen)', email: 'alex.customer@fixsoon.demo', role: 'Customer' },
  { label: 'Provider (Marcus Miller Auto)', email: 'marcus.auto@fixsoon.demo', role: 'Provider' },
  { label: 'Provider (Sarah Jenkins Multi-Trade)', email: 'sarah.tech@fixsoon.demo', role: 'Provider' },
  { label: 'Admin (WorldLeo Operations)', email: 'admin@fixsoon.demo', role: 'Admin' },
];

export function AuthPage({ onNavigate, redirectAfter }: AuthPageProps) {
  const { login, loginDemo, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Toronto');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localEmulatorEnabled, setLocalEmulatorEnabled] = useState(false);

  useEffect(() => {
    apiFetch<PlatformConfigResponse>('/api/config')
      .then((cfg) => {
        setLocalEmulatorEnabled(Boolean(cfg.featureFlags?.localEmulatorAuthEnabled));
      })
      .catch(() => {
        setLocalEmulatorEnabled(false);
      });
  }, []);

  const routeForRole = (r: UserRole) => {
    if (redirectAfter) return redirectAfter;
    if (r === 'admin' || r === 'coordinator' || r === 'finance') return '/admin';
    if (r === 'provider' || r === 'company_member') return '/provider-dashboard';
    return '/customer-dashboard';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const u = await login(email, password);
        onNavigate(routeForRole(u.role));
      } else {
        const u = await register({ name, email, phone, password, role, city });
        if (role === 'provider') {
          onNavigate('/provider-onboarding');
        } else {
          onNavigate(routeForRole(u.role));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setError('');
    setSubmitting(true);
    try {
      const u = await loginDemo(demoEmail);
      onNavigate(routeForRole(u.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    if (!isFirebaseClientConfigured()) {
      setError('Firebase Authentication is currently unavailable (missing project configuration).');
      return;
    }
    setSubmitting(true);
    try {
      const u = await loginWithGoogle();
      onNavigate(routeForRole(u.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className={`grid grid-cols-1 ${localEmulatorEnabled ? 'lg:grid-cols-12' : ''} gap-8`}>
        <div
          className={`${localEmulatorEnabled ? 'lg:col-span-7' : 'max-w-xl mx-auto w-full'} p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]`}
        >
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F6F2E8] dark:bg-[#071E17] mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#FFFFFF] dark:bg-[#145443] text-[#171B19] dark:text-[#F6F2E8]'
                  : 'text-[#6D756F] dark:text-[#B4C2BC]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                mode === 'register'
                  ? 'bg-[#FFFFFF] dark:bg-[#145443] text-[#171B19] dark:text-[#F6F2E8]'
                  : 'text-[#6D756F] dark:text-[#B4C2BC]'
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8] mb-2">
            {mode === 'login' ? 'Welcome back to WorldLeo' : 'Create your WorldLeo account'}
          </h1>
          <p className="text-sm text-[#6D756F] dark:text-[#B4C2BC] mb-5">
            {mode === 'login'
              ? 'Sign in with your verified Firebase Google account or registered credentials to manage Home and Auto requests.'
              : 'Request help as a customer or register as an independent service professional.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mb-5 pb-5 border-b border-[#D8D4C7] dark:border-[#1E4438] space-y-2">
            <button
              type="button"
              disabled={submitting || !isFirebaseClientConfigured()}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F8F7F2] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              Continue with Google (Firebase Auth)
            </button>
            <p className="text-[11px] text-center text-[#6D756F] dark:text-[#B4C2BC]">
              Verified identity enforced server-side via Firebase Admin SDK.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1.5">
                    Account type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                        role === 'customer'
                          ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/10 dark:bg-[#C6A45B]/15 text-[#171B19] dark:text-[#F6F2E8]'
                          : 'border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#B4C2BC]'
                      }`}
                    >
                      I need a service
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('provider')}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border cursor-pointer transition-colors ${
                        role === 'provider'
                          ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/10 dark:bg-[#C6A45B]/15 text-[#171B19] dark:text-[#F6F2E8]'
                          : 'border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#B4C2BC]'
                      }`}
                    >
                      I am a professional
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Taylor"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="416-555-0190"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                      Primary city
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Toronto"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#071E17] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In with Email' : 'Create Account'}
            </button>
          </form>
        </div>

        {localEmulatorEnabled && (
          <div className="lg:col-span-5 p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4 h-fit">
            <div>
              <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Local Emulator Test Accounts
              </h2>
              <p className="text-xs text-[#6D756F] dark:text-[#B4C2BC] mt-1 leading-relaxed">
                Available strictly in local loopback Firebase Auth Emulator / test environments. Disabled in preview and production.
              </p>
            </div>

            <div className="space-y-2.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoLogin(acc.email)}
                  className="w-full text-left p-3 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#071E17] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors cursor-pointer"
                >
                  <div className="text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                    {acc.label}
                  </div>
                  <div className="text-xs font-mono text-[#6D756F] dark:text-[#B4C2BC] mt-0.5">
                    {acc.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
