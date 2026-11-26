import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, setInMemorySessionToken } from '../lib/api';
import { signInWithGoogleFirebase, signOutFirebase } from '../lib/firebase';
import type { ProviderProfile, PublicUser, UserRole } from '../types/fixsoon';

interface AuthContextValue {
  user: PublicUser | null;
  providerProfile: ProviderProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<PublicUser>;
  loginDemo: (email: string) => Promise<PublicUser>;
  loginWithGoogle: () => Promise<PublicUser>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    city: string;
  }) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setProviderProfile: (p: ProviderProfile | null) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const res = await apiFetch<{ user: PublicUser; providerProfile: ProviderProfile | null }>(
        '/api/auth/me'
      );
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    } catch {
      setInMemorySessionToken(null);
      setUser(null);
      setProviderProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInMemorySessionToken(null);
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<{
      token: string;
      user: PublicUser;
      providerProfile: ProviderProfile | null;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setInMemorySessionToken(res.token);
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
    setInMemorySessionToken(res.token);
    setUser(res.user);
    setProviderProfile(null);
    return res.user;
  };

  const loginWithGoogle = async () => {
    const fbUser = await signInWithGoogleFirebase();
    const idToken = await fbUser.getIdToken();
    const res = await apiFetch<{
      token: string;
      user: PublicUser;
      providerProfile: ProviderProfile | null;
    }>('/api/auth/firebase', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    setInMemorySessionToken(res.token);
    setUser(res.user);
    setProviderProfile(res.providerProfile);
    return res.user;
  };

  const loginDemo = async (email: string) => {
    const res = await apiFetch<{
      token: string;
      user: PublicUser;
      providerProfile: ProviderProfile | null;
    }>('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setInMemorySessionToken(res.token);
    setUser(res.user);
    setProviderProfile(res.providerProfile);
    return res.user;
  };

  const logout = async () => {
    setInMemorySessionToken(null);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network failure during logout
    }
    signOutFirebase().catch(() => {});
    setUser(null);
    setProviderProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        loading,
        login,
        loginDemo,
        loginWithGoogle,
        register,
        logout,
        refreshMe,
        setProviderProfile,
      }}
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
