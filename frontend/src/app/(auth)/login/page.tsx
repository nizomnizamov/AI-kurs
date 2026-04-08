'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Krishda xatolik yuz berdi');
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
      background: '#111827' // Dark background layout
    }}>
      <div className="animate-fade-in" style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: 500,
        padding: '48px 40px',
        borderRadius: 12,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#000000', marginBottom: 12, lineHeight: 1.3 }}>
            👋 Tizimga kirish
          </h1>
          <p style={{ color: '#4b5563', fontSize: 15 }}>
            Elektron pochta va parolingizni kiriting.
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px',
            borderRadius: 8, marginBottom: 24, display: 'flex', alignItems: 'flex-start',
            gap: 8, color: '#b91c1c', fontSize: 14
          }}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <input
            type="email"
            required
            className="form-input"
            placeholder="Elektron pochtangizni kiriting"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            required
            className="form-input"
            placeholder="Parolingizni kiriting"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary"
            style={{ marginTop: 8 }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "TIZIMGA KIRISH"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 15, color: '#000000' }}>
          Hali hisobingiz yo'qmi? Unda <Link href="/register" className="blue-link">bu yerdan ro'yxatdan o'ting!</Link>
        </div>
      </div>
    </div>
  );
}
