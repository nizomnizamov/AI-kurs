'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { coursesApi } from '@/lib/api';
import { BookOpen, PlayCircle, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#000000', marginBottom: 8 }}>
          Salom, {user?.firstName}! 👋
        </h1>
        <p style={{ color: '#4b5563', fontSize: 15 }}>
          O'quv jarayonini davom ettiramiz.
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', color: '#111827'
          }}>
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: '#111827' }}>
            Hozircha kurslar yo'q
          </h2>
          <p style={{ color: '#6b7280', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Siz hali hech qanday kursga yozilmagansiz. Kurslar ro'yxati bilan tanishing va o'qishni boshlang!
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Kurslarni ko'rish
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24
        }}>
          {courses.map((course: any) => (
            <div key={course.id} style={{ 
              background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, 
              overflow: 'hidden', display: 'flex', flexDirection: 'column' 
            }}>
              <div style={{
                height: 160,
                background: '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative'
              }}>
                <BookOpen className="w-12 h-12 text-gray-300" />
              </div>
              
              <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8, lineHeight: 1.4 }}>
                  {course.title}
                </h3>
                
                <div style={{ marginBottom: 24, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
                    <span style={{ color: '#6b7280' }}>Umumiy progress</span>
                    <span style={{ color: '#111827', fontWeight: 600 }}>{course.progress?.percent || 0}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: '#000000',
                      width: `${course.progress?.percent || 0}%`,
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/course/${course.id}`)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: 14 }}
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
