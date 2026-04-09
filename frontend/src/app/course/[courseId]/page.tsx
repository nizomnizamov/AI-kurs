'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { progressApi, CourseProgress } from '@/lib/api';
import { CheckCircle2, User, Loader2, ArrowLeft, PlayCircle, Lock } from 'lucide-react';
import Link from 'next/link';

export default function CoursePage() {
  const { courseId } = useParams();
  const { token, user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      if (!token) return;
      try {
        const res = await progressApi.getCourseProgress(courseId as string, token);
        setData(res);
      } catch (err: any) {
        if (err.status === 403) {
          router.push('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [token, courseId, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-muted" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)', paddingBottom: 80 }}>
      {/* ─── Header Section ────────────────────────── */}
      <header style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '60px 24px 40px',
        position: 'relative'
      }}>
        {/* Profile Avatar (Top right) */}
        <Link href="/dashboard" style={{
          position: 'absolute', top: 24, right: 24, width: 44, height: 44,
          borderRadius: 22, background: 'var(--bg-primary)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)',
          transition: 'all 0.2s'
        }}>
          <User className="w-5 h-5" />
        </Link>
        <Link href="/dashboard" style={{
          position: 'absolute', top: 24, left: 24, 
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-secondary)', textDecoration: 'none',
          fontSize: 14, fontWeight: 500, padding: '8px 12px',
          borderRadius: 8, transition: 'background 0.2s'
        }} className="hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4" /> Orqaga
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32, marginTop: 40 }}>
          {/* Abstract Cover */}
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
            overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: 'var(--shadow-md)'
          }}>
            <PlayCircle className="w-12 h-12 text-white opacity-80" />
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <h1 className="animate-fade-in-up" style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              Vibe Coding kursi
            </h1>
            <p className="animate-fade-in-up" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, animationDelay: '0.1s', animationFillMode: 'both' }}>
              Murakkab platformalar, saytlar, botlar ishlab chiqish va biznesni avtomatlashtirish hamda MVP startaplarini yo'lga qo'yishni o'rganasiz.
            </p>
            
            <div className="animate-fade-in-up" style={{ display: 'flex', gap: 16, marginTop: 16, animationDelay: '0.2s', animationFillMode: 'both' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                {data.stats.completedLessons} / {data.stats.totalLessons} darslar
              </div>
              <div style={{ padding: '0 12px', background: 'var(--border-light)', borderRadius: 100, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                Progress: {data.stats.progressPercent}%
              </div>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 40 }}></div>
      </div>

      {/* ─── Course Curriculum List ────────────────── */}
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {data.modules.map((module, mIndex) => (
            <div key={module.id} className="glass-card animate-fade-in-up" style={{ 
              animationDelay: `${(mIndex + 2) * 0.1}s`, 
              animationFillMode: 'both',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '16px 24px', 
                background: 'var(--bg-primary)', 
                borderBottom: '1px solid var(--border)',
                fontWeight: 700, fontSize: 15, color: 'var(--text-primary)'
              }}>
                {module.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {module.lessons.map((lesson, lIndex) => {
                  const isLocked = lesson.status === 'LOCKED';
                  const isCompleted = lesson.status === 'COMPLETED';
                  const isAvailable = lesson.status === 'AVAILABLE';
                  
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => !isLocked && router.push(`/course/${courseId}/lesson/${lesson.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 24px',
                        borderBottom: lIndex < module.lessons.length - 1 ? '1px solid var(--border-light)' : 'none',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        background: 'transparent',
                        transition: 'background 0.2s',
                        opacity: isLocked ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isLocked) e.currentTarget.style.background = 'var(--bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Icon */}
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isCompleted ? (
                          <div style={{ backgroundColor: 'var(--success)', borderRadius: '50%', padding: 2 }}>
                            <CheckCircle2 className="w-[18px] h-[18px]" style={{ color: '#fff' }} />
                          </div>
                        ) : isAvailable ? (
                          <PlayCircle className="w-6 h-6 text-blue-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Title */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, color: isLocked ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: isAvailable ? 600 : 500 }}>
                          {lesson.title}
                        </div>
                        {(isAvailable || isCompleted) && lesson.duration && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            {Math.floor(lesson.duration / 60)} daq {lesson.duration % 60} soniya
                          </div>
                        )}
                      </div>
                      
                      {isCompleted && (
                        <div className="badge badge-success hide-mobile">Tugatilgan</div>
                      )}
                      
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
