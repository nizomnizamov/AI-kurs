'use client';
// ─── Auth Context (Production-Ready) ────────
// Auto token refresh, proper typing, event-based sync
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User, ApiError } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ message: string }>;
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

// Device name — brauzer nomi
function getDeviceName(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad/.test(ua)) return 'Mobile Browser';
  if (/Chrome/.test(ua)) return 'Chrome Desktop';
  if (/Firefox/.test(ua)) return 'Firefox Desktop';
  if (/Safari/.test(ua)) return 'Safari Desktop';
  return 'Desktop Browser';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('lms_token');
      const savedUser = localStorage.getItem('lms_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      localStorage.removeItem('lms_refresh_token');
    }
    setIsLoading(false);
  }, []);

  // Listen for token refresh events from API client
  useEffect(() => {
    const handleTokenRefresh = (e: CustomEvent<{ token: string }>) => {
      setToken(e.detail.token);
    };

    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('token-refreshed', handleTokenRefresh as EventListener);
    window.addEventListener('auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('token-refreshed', handleTokenRefresh as EventListener);
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const deviceId = getDeviceId();
    const deviceName = getDeviceName();
    const res = await authApi.login({ email, password, deviceId, deviceName });
    setToken(res.accessToken);
    setUser(res.user);
    localStorage.setItem('lms_token', res.accessToken);
    localStorage.setItem('lms_refresh_token', res.refreshToken);
    localStorage.setItem('lms_user', JSON.stringify(res.user));
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const result = await authApi.register(data);
    return result;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout(token);
    } catch {
      // Server error bo'lsa ham local state tozalanadi
    }
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
