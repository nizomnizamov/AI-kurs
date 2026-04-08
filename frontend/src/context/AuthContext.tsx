'use client';
// ─── Auth Context ───────────────────────────
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, ApiError } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Device ID — brauzer uchun unikal identifikator
function getDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('lms_device_id');
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem('lms_device_id', deviceId);
  }
  return deviceId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('lms_token');
    const savedUser = localStorage.getItem('lms_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const deviceId = getDeviceId();
    const res = await authApi.login({ email, password, deviceId });
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('lms_token', res.accessToken);
    localStorage.setItem('lms_refresh_token', res.refreshToken);
    localStorage.setItem('lms_user', JSON.stringify(res.user));
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    await authApi.register(data);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout(token);
    } catch { /* ignore */ }
    setToken(null);
    setUser(null);
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_refresh_token');
    localStorage.removeItem('lms_user');
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
