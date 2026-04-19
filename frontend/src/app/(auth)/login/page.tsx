'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === 'true';
  const sessionExpired = searchParams.get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: '#111827',
    }}>
      <div className="animate-fade-in-scale" style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: 480,
        padding: '48px 40px',
        borderRadius: 16,
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, background: '#000', borderRadius: 14,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Zap className="w-6 h-6" style={{ color: '#fff' }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#000000', marginBottom: 8, lineHeight: 1.3 }}>
            Tizimga kirish
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Elektron pochta va parolingizni kiriting
          </p>
        </div>

        {/* Success message after registration */}
        {justRegistered && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle2 className="w-5 h-5" style={{ flexShrink: 0 }} />
            <span>Muvaffaqiyatli ro'yxatdan o'tdingiz! Admin tasdiqlashini kuting, so'ng tizimga kiring.</span>
          </div>
        )}

        {/* Session expired warning */}
        {sessionExpired && (
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            <AlertCircle className="w-5 h-5" style={{ flexShrink: 0 }} />
            <span>Sessiya muddati tugadi. Iltimos, qaytadan kiring.</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <AlertCircle className="w-5 h-5" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="form-input"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Parol</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="form-input"
              placeholder="Parolingizni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary"
            style={{ marginTop: 8, padding: '16px' }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "TIZIMGA KIRISH"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
          Hali hisobingiz yo'qmi?{' '}
          <Link href="/register" className="blue-link">Ro'yxatdan o'ting</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
