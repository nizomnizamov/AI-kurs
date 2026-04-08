'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { Shield, Smartphone, Laptop, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSessions() {
      if (!token) return;
      try {
        const data = await authApi.sessions(token);
        setSessions(data);
      } catch (err) {
        console.error('Sessiyalarni yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [token]);

  const handleRevoke = async (deviceId: string) => {
    if (!token) return;
    try {
      // Endpoint is DELETE /auth/sessions/:deviceId
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/sessions/${deviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSessions(s => s.filter(session => session.deviceId !== deviceId));
    } catch (err) {
      console.error(err);
      alert('Chiqishda xatolik yuz berdi');
    }
  };

  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('lms_device_id') : null;

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Sozlamalar va xavfsizlik
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Shaxsiy ma'lumotlar va faol sessiyalaringizni boshqaring.
        </p>
      </div>

      <div className="glass-card" style={{ padding: 32, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          Shaxsiy Profil
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <label className="form-label">Ism</label>
            <input className="form-input" disabled value={user?.firstName || ''} />
          </div>
          <div>
            <label className="form-label">Familiya</label>
            <input className="form-input" disabled value={user?.lastName || ''} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Elektron pochta</label>
            <input className="form-input" disabled value={user?.email || ''} />
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
          <Shield className="w-5 h-5 text-accent" style={{ color: 'var(--accent-light)' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>
            Faol Sessiyalar — Anti-Fraud
          </h2>
        </div>

        <div style={{
          background: 'rgba(255, 170, 0, 0.1)', border: '1px solid rgba(255, 170, 0, 0.2)', padding: '12px 16px',
          borderRadius: 12, marginBottom: 24, display: 'flex', gap: 12, color: 'var(--warning)', fontSize: 14
        }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Sizning hisobingizga ruxsat etilgan maksimal qurilmalar soni: <b>2 ta</b>. Agar normadan oshsa eski sessiyalar avtomatik tarzda o'chiriladi.</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', padding: 40, justifyContent: 'center' }}><Loader2 className="animate-spin text-accent w-6 h-6" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {sessions.map((session) => {
              const isCurrent = session.deviceId === currentDeviceId;
              return (
                <div key={session.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: 'rgba(108, 92, 231, 0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-light)'
                    }}>
                      {session.deviceName?.toLowerCase().includes('mobile') ? <Smartphone /> : <Laptop />}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {session.deviceName || 'Noma\'lum qurilma'}
                        {isCurrent && <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--accent)', color: '#fff', borderRadius: 100 }}>Bu qurilma</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                        So'nggi faollik: {new Date(session.lastActive).toLocaleString()} 
                        {session.ipAddress && ` • IP: ${session.ipAddress}`}
                      </div>
                    </div>
                  </div>
                  
                  {!isCurrent && (
                    <button
                      onClick={() => handleRevoke(session.deviceId)}
                      style={{
                        padding: '8px 12px', background: 'rgba(255, 71, 87, 0.1)', color: 'var(--danger)',
                        border: '1px solid rgba(255, 71, 87, 0.2)', borderRadius: 8, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 71, 87, 0.1)'}
                    >
                      <Trash2 className="w-4 h-4" /> Sessiyani uzish
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
