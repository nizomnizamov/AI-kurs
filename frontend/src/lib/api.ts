// ─── API Client (Production-Ready) ──────────
// Token refresh interceptor va robust error handling bilan

const API_BASE = '/api';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

// ─── Token Refresh Logic ────────────────────
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('lms_refresh_token')
    : null;

  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.accessToken) {
      localStorage.setItem('lms_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('lms_refresh_token', data.refreshToken);
      }
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Core API Request Function ──────────────
export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // ─── 401 → Token Expired → Auto Refresh ──
  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);

        // Dispatch event so AuthContext can update state
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('token-refreshed', { detail: { token: newToken } }));
        }

        // Retry original request with new token
        return apiRequest<T>(endpoint, { ...options, token: newToken });
      } else {
        // Refresh failed — force logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lms_token');
          localStorage.removeItem('lms_refresh_token');
          localStorage.removeItem('lms_user');
          window.dispatchEvent(new CustomEvent('auth-expired'));
          window.location.href = '/login?expired=true';
        }
        throw new ApiError('Sessiya muddati tugadi. Qaytadan kiring.', 401);
      }
    } else {
      // Another request is already refreshing — wait for it
      return new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh(async (newToken: string) => {
          try {
            const result = await apiRequest<T>(endpoint, { ...options, token: newToken });
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

  // ─── Handle Non-JSON Responses ────────────
  const contentType = res.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    if (!res.ok) {
      throw new ApiError('Server xatosi', res.status);
    }
    return {} as T;
  }

  const data = await res.json();

  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Xatolik yuz berdi';
    throw new ApiError(message, res.status, data);
  }

  return data;
}

// ─── API Error Class ────────────────────────
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Auth API ───────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiRequest<{ message: string; user: { id: string; email: string; firstName: string; lastName: string } }>(
      '/auth/register', { method: 'POST', body: data }
    ),

  login: (data: { email: string; password: string; deviceId?: string; deviceName?: string }) =>
    apiRequest<{
      accessToken: string;
      refreshToken: string;
      deviceId: string;
      user: User;
    }>('/auth/login', { method: 'POST', body: data }),

  logout: (token: string) =>
    apiRequest('/auth/logout', { method: 'POST', token }),

  me: (token: string) =>
    apiRequest<User>('/auth/me', { token }),

  refresh: (refreshToken: string) =>
    apiRequest<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh', { method: 'POST', body: { refreshToken } }
    ),

  sessions: (token: string) =>
    apiRequest<Session[]>('/auth/sessions', { token }),

  removeSession: (deviceId: string, token: string) =>
    apiRequest(`/auth/sessions/${deviceId}`, { method: 'DELETE', token }),
};

// ─── Courses API ────────────────────────────
export const coursesApi = {
  getAll: () =>
    apiRequest<Course[]>('/courses'),

  getById: (id: string) =>
    apiRequest<CourseDetail>(`/courses/${id}`),

  getBySlug: (slug: string) =>
    apiRequest<CourseDetail>(`/courses/slug/${slug}`),

  getMyCourses: (token: string) =>
    apiRequest<EnrolledCourse[]>('/courses/my', { token }),

  enroll: (courseId: string, token: string) =>
    apiRequest<{ message: string; alreadyEnrolled: boolean }>(
      `/courses/${courseId}/enroll`, { method: 'POST', token }
    ),
};

// ─── Lessons API ────────────────────────────
export const lessonsApi = {
  get: (id: string, token: string) =>
    apiRequest<LessonDetail>(`/lessons/${id}`, { token }),

  getVideo: (id: string, token: string) =>
    apiRequest<VideoData>(`/lessons/${id}/video`, { token }),

  getNext: (id: string, token: string) =>
    apiRequest<NextLesson>(`/lessons/${id}/next`, { token }),
};

// ─── Progress API ───────────────────────────
export const progressApi = {
  getCourseProgress: (courseId: string, token: string) =>
    apiRequest<CourseProgress>(`/progress/course/${courseId}`, { token }),

  completeLesson: (lessonId: string, token: string) =>
    apiRequest<{ message: string; alreadyCompleted: boolean }>(
      `/progress/lessons/${lessonId}/complete`, { method: 'POST', token }
    ),

  updateWatch: (lessonId: string, watchPercent: number, token: string) =>
    apiRequest<{ watchPercent: number; status: string }>(
      `/progress/lessons/${lessonId}/watch`, {
        method: 'PATCH',
        body: { watchPercent },
        token,
      }
    ),
};

// ─── Admin API ──────────────────────────────
export const adminApi = {
  getStats: (token: string) =>
    apiRequest<DashboardStats>('/admin/stats', { token }),

  getUsers: (token: string) =>
    apiRequest<AdminUser[]>('/admin/users', { token }),

  approveUser: (userId: string, token: string) =>
    apiRequest(`/admin/users/${userId}/approve`, { method: 'PUT', token }),

  toggleUserActive: (userId: string, token: string) =>
    apiRequest(`/admin/users/${userId}/toggle-active`, { method: 'PUT', token }),
};

// ─── Types ──────────────────────────────────
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  avatar?: string;
}

export interface Session {
  id: string;
  deviceId: string;
  deviceName: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  price: number;
  isPublished: boolean;
  modules: CourseModule[];
  _count: { enrollments: number };
}

export interface CourseModule {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  title: string;
  duration?: number;
  orderIndex: number;
  isFree: boolean;
}

export interface CourseDetail extends Course {}

export interface EnrolledCourse extends Course {
  enrolledAt: string;
  progress: {
    total: number;
    completed: number;
    percent: number;
  };
}

export interface LessonDetail {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  orderIndex: number;
  moduleTitle: string;
  courseTitle: string;
  status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED';
  watchPercent: number;
}

export interface VideoData {
  videoId: string | null;
  signature: string;
  expiresAt: number;
  embedUrl: string | null;
}

export interface NextLesson {
  lessonId?: string;
  title?: string;
  status?: string;
  courseCompleted: boolean;
  message?: string;
}

export interface CourseProgress {
  modules: {
    id: string;
    title: string;
    orderIndex: number;
    lessons: {
      id: string;
      title: string;
      duration?: number;
      orderIndex: number;
      isFree: boolean;
      status: 'LOCKED' | 'AVAILABLE' | 'COMPLETED';
      watchPercent: number;
      completedAt: string | null;
    }[];
  }[];
  stats: {
    totalLessons: number;
    completedLessons: number;
    progressPercent: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalLessons: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: string;
  _count: { enrollments: number; sessions: number };
}
