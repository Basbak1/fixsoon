import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { signInWithGoogleFirebase, signOutFirebase } from '../lib/firebase';
import type { ProviderProfile, PublicUser, UserRole } from '../types/fixsoon';

interface AuthContextValue {
  user: PublicUser | null;
  providerProfile: ProviderProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  loginWithGoogle: () => Promise<PublicUser>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    city: string;
  }) => Promise<PublicUser>;
  logout: () => void;
  refreshMe: () => Promise<void>;
  setProviderProfile: (p: ProviderProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    const token = localStorage.getItem('fixsoon_token');
    if (!token) {
      setUser(null);
      setProviderProfile(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiFetch<{ user: PublicUser; providerProfile: ProviderProfile | null }>('/api/auth/me');
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    } catch {
      localStorage.removeItem('fixsoon_token');
      setUser(null);
      setProviderProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: PublicUser; providerProfile: ProviderProfile | null }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );
    localStorage.setItem('fixsoon_token', res.token);
    setUser(res.user);
    setProviderProfile(res.providerProfile);
    return res.user;
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    city: string;
  }) => {
    const res = await apiFetch<{ token: string; user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    localStorage.setItem('fixsoon_token', res.token);
    setUser(res.user);
    setProviderProfile(null);
    return res.user;
  };

  const loginWithGoogle = async () => {
    const fbUser = await signInWithGoogleFirebase();
    const res = await apiFetch<{ token: string; user: PublicUser; providerProfile: ProviderProfile | null }>(
      '/api/auth/firebase',
      {
        method: 'POST',
        body: JSON.stringify({
          uid: fbUser.uid,
          name: fbUser.displayName || 'FixSoon User',
          email: fbUser.email,
        }),
      }
    );
    localStorage.setItem('fixsoon_token', res.token);
    setUser(res.user);
    setProviderProfile(res.providerProfile);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('fixsoon_token');
    signOutFirebase().catch(() => {});
    setUser(null);
    setProviderProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, providerProfile, loading, login, loginWithGoogle, register, logout, refreshMe, setProviderProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
