'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ChevronRight, Zap, Shield, BookOpen, Users, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    { icon: <Zap className="w-6 h-6" />, title: 'AI bilan tezkor dasturlash', desc: "Zamonaviy AI modellar yordamida loyihalarni tezkor yaratishni o'rganing" },
    { icon: <BookOpen className="w-6 h-6" />, title: '20+ amaliy darslar', desc: "Nazariya va amaliyot birlashtirilgan professional o'quv dasturi" },
    { icon: <Shield className="w-6 h-6" />, title: 'Anti-fraud himoya', desc: "Kontent xavfsizligi va qurilma boshqaruvi bilan himoyalangan" },
    { icon: <Users className="w-6 h-6" />, title: 'Hamjamiyat', desc: "O'zaro yordam va networking uchun yopiq guruh" },
  ];

  const curriculum = [
    '01 — Kirish va AI modellar tahlili',
    '02 — Git, Github va Vercel boshqaruvi',
    '03 — Loyiha dizayni va texnik topshiriq',
    '04 — Full-Stack amaliy loyiha',
    '05 — No-Code dasturlash',
    '06 — Daromadga chiqish va portfolio',
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* ─── Navbar ────────────────────────── */}
      <nav style={{
        padding: '20px 0',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: '#000', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap className="w-5 h-5" style={{ color: '#fff' }} />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#000000' }}>AI kursi</span>
          </Link>

          <div style={{ display: 'flex', gap: 12 }}>
            {user ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  Kirish
                </Link>
                <Link href="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                  Ro'yxatdan o'tish
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '100px 24px 80px',
        textAlign: 'center',
      }}>
        <div className="animate-fade-in">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#000',
            color: '#fff',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 32,
            letterSpacing: '0.5px',
          }}>
            <Zap className="w-4 h-4" /> 2026 — Yangi avlod kurs platformasi
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 68px)',
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: 24,
            letterSpacing: '-1.5px',
          }}>
            AI yordamida <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #000 0%, #374151 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              platformalar yarating
            </span>
          </h1>

          <p style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            maxWidth: 560,
            margin: '0 auto 44px',
            lineHeight: 1.7,
          }}>
            Murakkab platformalar, saytlar, botlar ishlab chiqish va biznesni avtomatlashtirish — barchasini AI bilan noldan o'rganing.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={user ? "/dashboard" : "/register"} className="btn-primary" style={{ padding: '18px 40px', fontSize: 16 }}>
              KURSGA A'ZO BO'LISH <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Features Grid ──────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 100px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <div key={i} className="glass-card animate-fade-in-up" style={{
              padding: 28,
              animationDelay: `${i * 0.1}s`,
              animationFillMode: 'both',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--border-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, color: 'var(--text-primary)',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Curriculum ─────────────────────── */}
      <section style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 100px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', marginBottom: 48, letterSpacing: '-0.5px' }}>
          O'quv dasturi
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {curriculum.map((item, i) => (
            <div key={i} className="animate-fade-in" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 0',
              borderBottom: '1px solid var(--border-light)',
              animationDelay: `${i * 0.08}s`,
              animationFillMode: 'both',
            }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)', flexShrink: 0 }} />
              <span style={{ fontSize: 16, fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ────────────────────────────── */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '64px 40px',
        textAlign: 'center',
        background: '#000',
        color: '#fff',
        borderRadius: 20,
        marginBottom: 80,
        marginLeft: 24,
        marginRight: 24,
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
          Hoziroq boshlang
        </h2>
        <p style={{ fontSize: 16, opacity: 0.7, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          AI bilan dasturlashni birinchilardan bo'lib o'rganing va daromad olishni boshlang.
        </p>
        <Link href={user ? "/dashboard" : "/register"} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '16px 36px', background: '#fff', color: '#000',
          fontWeight: 700, fontSize: 15, borderRadius: 8,
          textDecoration: 'none', textTransform: 'uppercase',
          letterSpacing: '0.5px', transition: 'all 0.2s',
        }}>
          BOSHLASH <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ─── Footer ────────────────────────── */}
      <footer style={{
        padding: '40px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border-light)',
      }}>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          © 2026 AI kursi. Barcha huquqlar himoyalangan.
        </p>
      </footer>
    </div>
  );
}
