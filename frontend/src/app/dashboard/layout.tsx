'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, LogOut, Shield, User, Loader2, Menu, X, Zap } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#000' }} />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 8,
      textDecoration: 'none' as const,
      background: isActive ? 'var(--border-light)' : 'transparent',
      color: isActive ? '#000000' : 'var(--text-secondary)',
      fontWeight: isActive ? 600 : 500,
      fontSize: 14,
      transition: 'all 0.15s ease',
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex' }}>
      {/* ─── Mobile Overlay ──────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 45,
            display: 'none',
          }}
          className="hide-desktop"
        />
      )}

      {/* ─── Sidebar ─────────────────────────── */}
      <aside style={{
        width: 260,
        background: '#ffffff',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ width: 32, height: 32, background: '#000', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap className="w-4 h-4" style={{ color: '#fff' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#000000' }}>AI kursi</span>
        </div>

        {/* Navigation */}
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Link href="/dashboard" style={navLinkStyle('/dashboard')}>
            <BookOpen className="w-5 h-5" /> Mening kurslarim
          </Link>
          
          <Link href="/dashboard/settings" style={navLinkStyle('/dashboard/settings')}>
            <User className="w-5 h-5" /> Sozlamalar
          </Link>

          {user.role === 'ADMIN' && (
            <Link href="/admin" style={{
              ...navLinkStyle('/admin'),
              color: pathname === '/admin' ? '#f59e0b' : 'var(--text-muted)',
              marginTop: 'auto',
            }}>
              <Shield className="w-5 h-5" /> Admin Panel
            </Link>
          )}

          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 8, background: 'transparent', border: 'none',
            color: 'var(--danger)', fontWeight: 500, cursor: 'pointer',
            textAlign: 'left', fontSize: 14,
            marginTop: user.role !== 'ADMIN' ? 'auto' : 8,
          }}>
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────── */}
      <main style={{
        flex: 1,
        marginLeft: 260,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Topbar */}
        <header style={{
          height: 64, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', background: '#ffffff',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hide-desktop"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 8, color: 'var(--text-primary)',
            }}
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {user.firstName} {user.lastName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {user.role === 'ADMIN' ? 'Administrator' : "O'quvchi"}
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}>
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '28px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
