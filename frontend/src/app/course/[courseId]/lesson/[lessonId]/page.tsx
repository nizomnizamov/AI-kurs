'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { lessonsApi, progressApi } from '@/lib/api';
import { Loader2, ArrowLeft, CheckCircle, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<any>(null);
  const [videoData, setVideoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [watchPercent, setWatchPercent] = useState(0);

  // Dars va videoni yuklash
  useEffect(() => {
    async function loadData() {
      if (!token) return;
      try {
        const [lessonRes, videoRes] = await Promise.all([
          lessonsApi.get(lessonId as string, token),
          lessonsApi.getVideo(lessonId as string, token),
        ]);
        setLesson(lessonRes);
        setVideoData(videoRes);
        setWatchPercent(lessonRes.watchPercent || 0);
      } catch (err: any) {
        console.error(err);
        router.push(`/course/${courseId}`); // Xatolik bo'lsa kursga qaytarish
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, lessonId, courseId, router]);

  // Pseudoprogress kuzatish (har 15 sekunda progress yuboriladi)
  useEffect(() => {
    if (!token || !lesson || lesson.status === 'COMPLETED' || watchPercent >= 100) return;

    const interval = setInterval(async () => {
      setWatchPercent(prev => {
        const next = Math.min(prev + 5, 100); // har 15s da 5% ooshadi (Demo maqsadida)
        
        // Backendga ham yuboramiz
        progressApi.updateWatch(lessonId as string, next, token).catch(() => {});
        
        if (next >= 90 && lesson.status !== 'COMPLETED') {
          // 90% dan oshsa avtomatik complete
          handleComplete(true);
        }
        
        return next;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [token, lesson, lessonId, watchPercent]);

  const handleComplete = async (auto = false) => {
    if (!token || completing) return;
    setCompleting(true);
    try {
      await progressApi.completeLesson(lessonId as string, token);
      const nextRes = await lessonsApi.getNext(lessonId as string, token);
      
      if (nextRes.courseCompleted) {
        router.push('/dashboard?completed=true');
      } else if (!auto) {
        // Avto emas manual bossa, keyingi darsga ochiladi
        router.push(`/course/${courseId}/lesson/${nextRes.lessonId}`);
      } else {
        // Avto complete bo'lsa faqat status yangilanadi
        setLesson({ ...lesson, status: 'COMPLETED' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (auto) setCompleting(false); // agar auto bo'lsa spinner to'xtaydi, manual bo'lsa router.push ishlaydi
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Header ───────────────────────────── */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'sticky', top: 0, zIndex: 30
      }}>
        <Link href={`/course/${courseId}`} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-secondary)', textDecoration: 'none',
          fontSize: 14, fontWeight: 500, padding: '8px 12px',
          borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)'
        }}>
          <ArrowLeft className="w-4 h-4" /> Darslarga qaytish
        </Link>
        
        <div style={{ paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lesson.moduleTitle}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>{lesson.title}</div>
        </div>
      </header>

      {/* ─── Player Setup ──────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', background: '#000', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1280, aspectRatio: '16/9', position: 'relative' }}>
            {videoData?.embedUrl ? (
              <iframe
                src={videoData.embedUrl}
                title="Course Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <PlayCircle className="w-16 h-16 opacity-50" />
                <span style={{ marginLeft: 16 }}>Video yuklanmadi</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Lesson Info & Complete Action ──────── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', padding: '32px 24px', display: 'flex', gap: 40, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              {lesson.title}
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {lesson.description || 'Ushbu darsda siz ko\'rsatilgan mavzuni amalda qanday qo\'llashni o\'rganasiz. Barcha resurslarni dars yakunida yuklab olishingiz mumkin.'}
            </p>
          </div>

          <div className="glass-card" style={{ width: 340, padding: 24, position: 'sticky', top: 100 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dars progressi</span>
                <span style={{ color: lesson.status === 'COMPLETED' ? 'var(--success)' : 'var(--accent-light)' }}>
                  {lesson.status === 'COMPLETED' ? '100%' : `${watchPercent}%`}
                </span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  background: lesson.status === 'COMPLETED' ? 'var(--success)' : 'linear-gradient(90deg, #6c5ce7, #a29bfe)',
                  width: lesson.status === 'COMPLETED' ? '100%' : `${watchPercent}%`,
                  transition: 'width 1s linear'
                }} />
              </div>
            </div>

            <button
              onClick={() => handleComplete(false)}
              disabled={completing}
              className="btn-primary"
              style={{
                width: '100%',
                background: lesson.status === 'COMPLETED' ? 'rgba(0, 214, 143, 0.1)' : undefined,
                color: lesson.status === 'COMPLETED' ? 'var(--success)' : undefined,
                border: lesson.status === 'COMPLETED' ? '1px solid rgba(0, 214, 143, 0.3)' : undefined,
              }}
            >
              {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               lesson.status === 'COMPLETED' ? (
                <>Dars yakunlangan <CheckCircle className="w-5 h-5" /></>
              ) : (
                <>Yakunlash va Davom etish <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
