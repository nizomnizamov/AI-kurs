// ─── API Client ─────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

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

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(data.message || 'Xatolik yuz berdi', res.status, data);
  }

  return data;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// ─── Auth API ───────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    apiRequest('/auth/register', { method: 'POST', body: data }),

  login: (data: { email: string; password: string; deviceId?: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: data }),

  logout: (token: string) =>
    apiRequest('/auth/logout', { method: 'POST', token }),

  me: (token: string) =>
    apiRequest('/auth/me', { token }),

  refresh: (refreshToken: string) =>
    apiRequest('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  sessions: (token: string) =>
    apiRequest('/auth/sessions', { token }),
};

// ─── Courses API ────────────────────────────
export const coursesApi = {
  getAll: () => apiRequest('/courses'),

  getById: (id: string) => apiRequest(`/courses/${id}`),

  getBySlug: (slug: string) => apiRequest(`/courses/slug/${slug}`),

  getMyCourses: (token: string) =>
    apiRequest('/courses/my', { token }),

  enroll: (courseId: string, token: string) =>
    apiRequest(`/courses/${courseId}/enroll`, { method: 'POST', token }),
};

// ─── Lessons API ────────────────────────────
export const lessonsApi = {
  get: (id: string, token: string) =>
    apiRequest(`/lessons/${id}`, { token }),

  getVideo: (id: string, token: string) =>
    apiRequest(`/lessons/${id}/video`, { token }),

  getNext: (id: string, token: string) =>
    apiRequest(`/lessons/${id}/next`, { token }),
};

// ─── Progress API ───────────────────────────
export const progressApi = {
  getCourseProgress: (courseId: string, token: string) =>
    apiRequest(`/progress/course/${courseId}`, { token }),

  completeLesson: (lessonId: string, token: string) =>
    apiRequest(`/progress/lessons/${lessonId}/complete`, { method: 'POST', token }),

  updateWatch: (lessonId: string, watchPercent: number, token: string) =>
    apiRequest(`/progress/lessons/${lessonId}/watch`, {
      method: 'PATCH',
      body: { watchPercent },
      token,
    }),
};
