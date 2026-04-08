'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { progressApi } from '@/lib/api';
import { CheckCircle2, User, Loader2, Type } from 'lucide-react';
import Link from 'next/link';

export default function CoursePage() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', paddingBottom: 80 }}>
      {/* ─── Header Section ────────────────────────── */}
      <header style={{
        maxWidth: 768,
        margin: '0 auto',
        padding: '64px 24px 40px',
        position: 'relative'
      }}>
        {/* Profile Avatar (Top right) */}
        <Link href="/dashboard" style={{
          position: 'absolute',
          top: 24,
          right: 24,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: '#374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <User className="w-5 h-5" />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Circular abstract placeholder image */}
          <div style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#111827',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {/* Simple abstract shapes instead of real image */}
            <div style={{ width: '100%', height: '100%', position: 'relative', background: '#ffffff' }}>
              <div style={{ position: 'absolute', inset: -10, background: '#111827', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', top: 30, left: 30, width: 40, height: 40, background: '#ef4444', transform: 'rotate(15deg)' }}></div>
              <div style={{ position: 'absolute', bottom: 30, right: 30, width: 50, height: 30, background: '#3b82f6', transform: 'rotate(-25deg)' }}></div>
              <div style={{ position: 'absolute', bottom: 20, left: 40, width: 60, height: 40, border: '2px solid #ffffff', transform: 'rotate(10deg)' }}></div>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
              AI kursi
            </h1>
            <p style={{ fontSize: 15, color: '#4b5563', lineHeight: 1.5, maxWidth: 360 }}>
              Murakkab platformalar, saytlar, botlar ishlab chiqish va biznesni avtomatlashtirish hamda MVP startaplarini yo'lga qo'yishni o'rganasiz.
            </p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: 40 }}></div>
      </div>

      {/* ─── Course Curriculum List ────────────────── */}
      <main style={{ maxWidth: 768, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {data.modules.map((module: any) => (
            <div key={module.id} className="animate-fade-in">
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#000000', marginBottom: 16 }}>
                {module.title}
              </h2>

              <ul style={{ listStyle: 'none' }}>
                {module.lessons.map((lesson: any, index: number) => {
                  const isLocked = lesson.status === 'LOCKED';
                  const isCompleted = lesson.status === 'COMPLETED';
                  const isAvailable = lesson.status === 'AVAILABLE';

                  // Determine colors based on status
                  const textColor = isLocked ? '#9ca3af' : '#111827';
                  
                  return (
                    <li key={lesson.id} style={{
                      borderTop: '1px solid #f3f4f6',
                      borderBottom: index === module.lessons.length - 1 ? '1px solid #f3f4f6' : 'none'
                    }}>
                      <div
                        onClick={() => !isLocked && router.push(`/course/${courseId}/lesson/${lesson.id}`)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          padding: '16px 8px',
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          transition: 'background 0.2s',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (!isLocked) e.currentTarget.style.background = '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        {/* Icon */}
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-[20px] h-[20px]" style={{ color: '#10b981', fill: '#10b981', stroke: '#fff' }} />
                          ) : isAvailable ? (
                            <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #000000' }}></div>
                          ) : (
                            // Locked state uses the 'Aa' style text or Type icon shown in screenshot
                            <Type className="w-5 h-5" style={{ color: '#d1d5db' }} />
                          )}
                        </div>

                        {/* Title */}
                        <div style={{ fontSize: 15, color: textColor, fontWeight: 400 }}>
                          {lesson.title}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
