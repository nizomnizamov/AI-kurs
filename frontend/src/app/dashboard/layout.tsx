'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, LogOut, Shield, User, Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

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
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderRadius: 8, textDecoration: 'none',
      background: isActive ? '#f3f4f6' : 'transparent',
      color: isActive ? '#000000' : '#4b5563',
      fontWeight: isActive ? 600 : 500,
    };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex' }}>
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside style={{
        width: 280,
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 40
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#000000' }}>AI kursi</span>
        </div>

        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <Link href="/dashboard" style={navLinkStyle('/dashboard')}>
            <BookOpen className="w-5 h-5" /> Mening kurslarim
          </Link>
          
          <Link href="/dashboard/settings" style={navLinkStyle('/dashboard/settings')}>
            <User className="w-5 h-5" /> Sozlamalar
          </Link>

          {user.role === 'ADMIN' && (
            <Link href="/admin" style={{ ...navLinkStyle('/admin'), color: '#f59e0b', marginTop: 'auto' }}>
              <Shield className="w-5 h-5" /> Admin Panel
            </Link>
          )}

          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: 8, background: 'transparent', border: 'none',
            color: '#ef4444', fontWeight: 500, cursor: 'pointer',
            textAlign: 'left',
            marginTop: user.role !== 'ADMIN' ? 'auto' : 8
          }}>
            <LogOut className="w-5 h-5" /> Chiqish
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────── */}
      <main style={{
        flex: 1,
        marginLeft: 280,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Topbar */}
        <header style={{
          height: 70, borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          padding: '0 32px', background: '#ffffff',
          position: 'sticky', top: 0, zIndex: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {user.firstName} {user.lastName}
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: 18, background: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#4b5563'
            }}>
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '32px', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
