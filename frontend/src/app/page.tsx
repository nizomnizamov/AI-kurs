'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', color: '#111827' }}>
      {/* ─── Navbar ────────────────────────── */}
      <nav style={{
        padding: '24px 0',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#000000' }}>AI kursi</span>
          </Link>

          <div style={{ display: 'flex', gap: 12 }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" style={{ padding: '10px 24px', fontSize: 14, background: 'transparent' }}>
                  Kirish
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────── */}
      <section style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '120px 24px 80px',
        textAlign: 'center',
      }}>
        <div className="animate-fade-in">
          
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-1px'
          }}>
            AI kursi orqali <br/>
            platformalar ishlab chiqish
          </h1>

          <p style={{
            fontSize: 18,
            color: '#4b5563',
            maxWidth: 600,
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            AI yordamida tezkor MVP, saytlar hamda murakkab platformalarni dasturlashni professional darajada noldan o'rganing.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href={user ? "/dashboard" : "/register"} className="btn-primary" style={{ padding: '18px 40px', fontSize: 16 }}>
              KURSGA A'ZO BO'LISH
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────── */}
      <footer style={{
        padding: '40px 24px',
        textAlign: 'center',
        marginTop: 60
      }}>
        <p style={{ fontSize: 14, color: '#9ca3af' }}>
          © 2026 AI kursi. Barcha huquqlar himoyalangan.
        </p>
      </footer>
    </div>
  );
}
