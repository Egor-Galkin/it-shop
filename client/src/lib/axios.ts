import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// Автоматически добавляем JWT токен к каждому запросу (кроме auth-эндпоинтов)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('access_token');
      
      // ✅ НЕ добавляй токен к запросам входа/регистрации
      const isAuthRequest = 
        config.url?.includes('/auth/login') || 
        config.url?.includes('/auth/register');
      
      if (token && !isAuthRequest) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Лог для отладки
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url} | Token: ${token && !isAuthRequest ? '✓' : '✗'}`);
    } catch (e) {
      console.warn('[Axios interceptor] localStorage error:', e);
    }
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

    // Если токен истёк/невалиден И это не форма логина — делаем logout
    if (err.response?.status === 401 && typeof window !== 'undefined' && !isAuthRequest) {
      console.log('[Axios interceptor] 401 detected, clearing auth data');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);