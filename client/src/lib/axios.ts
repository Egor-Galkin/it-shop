import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Автоматически добавляем JWT токен
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    // лог для отладки
    console.log('[Ax interceptor] Token:', token ? '✓ Present' : '✗ Missing');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка 401 (истёкший/невалидный токен)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Проверяем, что это НЕ запрос входа или регистрации
    const isAuthRequest = 
      err.config?.url?.includes('/auth/login') || 
      err.config?.url?.includes('/auth/register');

    // Перенаправляем на вход ТОЛЬКО если токен истёк/невалиден и это не форма логина
    if (err.response?.status === 401 && typeof window !== 'undefined' && !isAuthRequest) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);