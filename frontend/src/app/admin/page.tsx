'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { adminApi, AdminUser, DashboardStats } from '@/lib/api';
import { Shield, UserCheck, Loader2, Users, BookOpen, GraduationCap, Video } from 'lucide-react';

export default function AdminPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    
    async function loadAdminData() {
      if (!token) return;
      try {
        const [usersData, statsData] = await Promise.all([
          adminApi.getUsers(token),
          adminApi.getStats(token),
        ]);
        setUsers(usersData);
        setStats(statsData);
      } catch (err) {
        console.error('Admin ma\'lumotlarini yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, [user, token, router]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      await adminApi.approveUser(id, token);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isApproved: true } : u));
    } catch (err) {
      console.error(err);
      alert('Tasdiqlashda xatolik yuz berdi');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!token) return;
    if (!confirm(currentStatus ? 'Foydalanuvchini bloklamoqchimisiz?' : 'Foydalanuvchini faollashtirmoqchimisiz?')) return;
    
    try {
      await adminApi.toggleUserActive(id, token);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}><Loader2 className="w-8 h-8 animate-spin text-muted" /></div>;
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ padding: 8, background: '#f59e0b', borderRadius: 8, color: '#fff' }}>
          <Shield className="w-6 h-6" />
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>Admin Panel</h1>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 15 }}>
        Platforma boshqaruvi, statistika va foydalanuvchilar holati
      </p>

      {/* ─── Stats Grid ─── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Foydalanuvchilar', value: stats.totalUsers, icon: <Users className="w-5 h-5 text-blue-500" /> },
            { label: 'Kurslar', value: stats.totalCourses, icon: <BookOpen className="w-5 h-5 text-indigo-500" /> },
            { label: 'Sotuvlar', value: stats.totalEnrollments, icon: <GraduationCap className="w-5 h-5 text-emerald-500" /> },
            { label: 'Darslar', value: stats.totalLessons, icon: <Video className="w-5 h-5 text-orange-500" /> },
          ].map((stat, i) => (
            <div key={i} className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Users Table ─── */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
        Mijozlar ro'yxati
      </h2>
      
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ism & Familiya</th>
                <th>Email</th>
                <th>Sessiyalar</th>
                <th>Rol</th>
                <th>Tasdiq</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Ro'yxatdan o'tdi: {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className="badge badge-neutral">{u._count.sessions} / 2</span>
                  </td>
                  <td>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-warning' : 'badge-neutral'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.isApproved ? (
                      <span className="badge badge-success">Tasdiqlangan</span>
                    ) : (
                      <span className="badge badge-warning">Kutmoqda</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(u.id, u.isActive)}
                      className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}
                      style={{ border: 'none', cursor: 'pointer' }}
                    >
                      {u.isActive ? 'Faol' : 'Bloklangan'}
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {!u.isApproved && u.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleApprove(u.id)}
                        className="btn-primary"
                        style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}
                      >
                        <UserCheck className="w-4 h-4" /> Tasdiqlash
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
