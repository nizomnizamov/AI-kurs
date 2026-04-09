'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle, Zap } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setLoading(true);

    try {
      await register({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || "Ro'yxatdan o'tishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && password.length >= 6;

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
            Ro'yxatdan o'tish
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Kursga a'zo bo'lish uchun ma'lumotlaringizni kiriting
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <AlertCircle className="w-5 h-5" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Ism</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ismingiz"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label">Familiya</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Familiyangiz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
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
              required
              minLength={6}
              className="form-input"
              placeholder="Kamida 6 ta belgi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password.length > 0 && password.length < 6 && (
              <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                Parol kamida 6 ta belgi bo'lishi kerak
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="btn-primary"
            style={{ marginTop: 8, padding: '16px' }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "RO'YXATDAN O'TISH"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
          Allaqachon hisobingiz bormi?{' '}
          <Link href="/login" className="blue-link">Tizimga kiring</Link>
        </div>
      </div>
    </div>
  );
}
