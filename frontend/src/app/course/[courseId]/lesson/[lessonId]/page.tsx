'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { lessonsApi, progressApi, LessonDetail, VideoData } from '@/lib/api';
import { Loader2, ArrowLeft, CheckCircle, ChevronRight, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function LessonPlayerPage() {
  const { courseId, lessonId } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [watchPercent, setWatchPercent] = useState(0);

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
        router.push(`/course/${courseId}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, lessonId, courseId, router]);

  // Pseudoprogress (avtomuzlatgich) update
  useEffect(() => {
    if (!token || !lesson || lesson.status === 'COMPLETED' || watchPercent >= 100) return;

    const interval = setInterval(async () => {
      setWatchPercent(prev => {
        const next = Math.min(prev + 5, 100);
        
        progressApi.updateWatch(lessonId as string, next, token).catch(() => {});
        
        if (next >= 90 && lesson.status !== 'COMPLETED') {
          handleComplete(true);
        }
        
        return next;
      });
    }, 15000);

    return () => clearInterval(interval);
  }, [token, lesson, lessonId, watchPercent]);

  const handleComplete = async (auto = false) => {
    if (!token || completing || !lesson) return;
    setCompleting(true);
    try {
      await progressApi.completeLesson(lessonId as string, token);
      const nextRes = await lessonsApi.getNext(lessonId as string, token);
      
      if (nextRes.courseCompleted) {
        router.push('/dashboard?completed=true');
      } else if (!auto && nextRes.lessonId) {
        router.push(`/course/${courseId}/lesson/${nextRes.lessonId}`);
      } else {
        setLesson({ ...lesson, status: 'COMPLETED' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (auto) setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="animate-fade-in" style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
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
          fontSize: 14, fontWeight: 500, padding: '8px 16px',
          borderRadius: 8, background: 'var(--border-light)',
          transition: 'background 0.2s'
        }} className="hover:bg-gray-200">
          <ArrowLeft className="w-4 h-4" /> Ortga
        </Link>
        
        <div style={{ paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lesson.moduleTitle}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{lesson.title}</div>
        </div>
      </header>

      {/* ─── Player Setup ──────────────────────── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: '100%', background: '#000', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 1000, aspectRatio: '16/9', position: 'relative' }}>
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
        <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '32px 24px', display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>
              {lesson.title}
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              {lesson.description || 'Ushbu darsda siz ko\'rsatilgan mavzuni amalda qanday qo\'llashni o\'rganasiz. Barcha resurslarni dars yakunida yuklab olishingiz mumkin.'}
            </p>
          </div>

          <div className="glass-card" style={{ width: 340, flex: '0 0 auto', padding: 24, position: 'sticky', top: 100 }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Dars progressi</span>
                <span style={{ color: lesson.status === 'COMPLETED' ? 'var(--success)' : 'var(--accent-light)' }}>
                  {lesson.status === 'COMPLETED' ? '100%' : `${watchPercent}%`}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 8 }}>
                <div 
                  className="progress-bar-fill" 
                  style={{
                    width: lesson.status === 'COMPLETED' ? '100%' : `${watchPercent}%`,
                    background: lesson.status === 'COMPLETED' ? 'var(--success)' : 'var(--accent-light)'
                  }} 
                />
              </div>
            </div>

            <button
              onClick={() => handleComplete(false)}
              disabled={completing}
              className="btn-primary"
              style={{
                width: '100%',
                background: lesson.status === 'COMPLETED' ? 'var(--success-bg)' : undefined,
                color: lesson.status === 'COMPLETED' ? 'var(--success)' : undefined,
                border: lesson.status === 'COMPLETED' ? '1px solid rgba(16, 185, 129, 0.3)' : undefined,
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
