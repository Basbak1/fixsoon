import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/fixsoon';

interface AuthPageProps {
  onNavigate: (path: string) => void;
  redirectAfter?: string;
}

const DEMO_ACCOUNTS = [
  { label: 'Customer (Alex Chen)', email: 'alex.customer@fixsoon.demo', role: 'Customer' },
  { label: 'Provider (Marcus Miller Auto)', email: 'marcus.auto@fixsoon.demo', role: 'Provider' },
  { label: 'Provider (Sarah Jenkins Multi-Trade)', email: 'sarah.tech@fixsoon.demo', role: 'Provider' },
  { label: 'Admin (FixSoon Operations)', email: 'admin@fixsoon.demo', role: 'Admin' },
];

export function AuthPage({ onNavigate, redirectAfter }: AuthPageProps) {
  const { login, loginWithGoogle, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Toronto');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const routeForRole = (r: UserRole) => {
    if (redirectAfter) return redirectAfter;
    if (r === 'admin') return '/admin';
    if (r === 'provider') return '/provider-dashboard';
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
      const u = await login(demoEmail, 'FixSoon2026!');
      onNavigate(routeForRole(u.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'login'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                  : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'register'
                  ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                  : 'text-[#475569] dark:text-[#94A3B8]'
              }`}
            >
              Create Account
            </button>
          </div>

          <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
            {mode === 'login' ? 'Welcome back to FixSoon' : 'Create your FixSoon account'}
          </h1>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] mb-6">
            {mode === 'login'
              ? 'Access your requests, quotes, or service provider workspace.'
              : 'Request help as a customer or register as an independent service professional.'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    Account type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border ${
                        role === 'customer'
                          ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/10 text-[#0F172A] dark:text-[#F8FAFC]'
                          : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]'
                      }`}
                    >
                      I need a service
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('provider')}
                      className={`py-2.5 px-3 rounded-lg text-sm font-medium border ${
                        role === 'provider'
                          ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/10 text-[#0F172A] dark:text-[#F8FAFC]'
                          : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]'
                      }`}
                    >
                      I am a professional
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jordan Taylor"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="416-555-0190"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                      Primary GTA city
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Toronto"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              disabled={submitting}
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors disabled:opacity-50"
            >
              Continue with Google (Firebase Auth)
            </button>
          </div>
        </div>

        {/* Demo Environment Quick Access */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4 h-fit">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Demo Environment Accounts
            </h2>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
              Test the complete two-sided marketplace workflow immediately using any seeded demo role below.
            </p>
          </div>

          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                disabled={submitting}
                onClick={() => handleDemoLogin(acc.email)}
                className="w-full text-left p-3 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors"
              >
                <div className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {acc.label}
                </div>
                <div className="text-xs font-mono text-[#475569] dark:text-[#94A3B8] mt-0.5">
                  {acc.email}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
