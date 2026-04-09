'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { coursesApi, EnrolledCourse } from '@/lib/api';
import { BookOpen, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseCompleted = searchParams.get('completed') === 'true';

  useEffect(() => {
    async function loadCourses() {
      if (!token) return;
      try {
        const data = await coursesApi.getMyCourses(token);
        setCourses(data);
      } catch (err) {
        console.error('Kurslarni yuklashda xatolik:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, [token]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {courseCompleted && (
        <div className="alert alert-success" style={{ marginBottom: 24, fontSize: 15 }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Tabriklaymiz! Siz kursdagi barcha darslarni a'lo darajada yakunladingiz! 🎉</span>
        </div>
      )}

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Salom, {user?.firstName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          O'quv jarayonini davom ettiramiz va natijalarni yaxshilaymiz.
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '60px 24px', textAlign: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'var(--border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', color: 'var(--text-primary)'
          }}>
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'var(--text-primary)' }}>
            Hozircha kurslar yo'q
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 420, margin: '0 auto 32px', fontSize: 15 }}>
            Siz hali hech qanday kursga yozilmagansiz. Platformadagi barcha kurslar bilan tanishing va o'qishni boshlang!
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
            style={{ padding: '14px 32px' }}
          >
            Kurslarni ko'rish
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {courses.map((course) => (
            <div key={course.id} className="glass-card" style={{
              overflow: 'hidden', display: 'flex', flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{
                height: 180,
                background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                position: 'relative',
              }}>
                {/* Agar cover bo'lsa rasmni qo'yamiz. Hozircha gradient fon. */}
                <div style={{ position: 'absolute', bottom: 20, right: 20, width: 48, height: 48, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>
                  {course.title}
                </h3>
                
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
                  Dasturlash / Backend / Frontend
                </p>
                
                <div style={{ marginBottom: 28, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Umumiy progress</span>
                    <span style={{ color: course.progress.percent === 100 ? 'var(--success)' : 'var(--text-primary)', fontWeight: 700 }}>
                      {course.progress.percent}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${course.progress.percent}%`,
                        background: course.progress.percent === 100 ? 'var(--success)' : 'var(--accent)',
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/course/${course.id}`)}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  <PlayCircle className="w-5 h-5" /> Davom etish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
