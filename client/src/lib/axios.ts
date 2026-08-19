import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
});

// ✅ ЛОГИ: Request interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('access_token');
      const isAuthRequest = 
        config.url?.includes('/auth/login') || 
        config.url?.includes('/auth/register');
      
      console.log(`🔍 [Axios] ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`🔍 [Axios] Token in localStorage: ${token ? '✓' : '✗'}`);
      console.log(`🔍 [Axios] Is auth request: ${isAuthRequest ? '✓' : '✗'}`);
      
      if (token && !isAuthRequest) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔍 [Axios] ✅ Added Authorization header`);
      } else if (!token && !isAuthRequest) {
        console.log(`🔍 [Axios] ❌ NO TOKEN — request will be sent without auth`);
      }
    } catch (e) {
      console.warn('🔍 [Axios] localStorage error:', e);
    }
  }
  return config;
});

// ✅ ЛОГИ: Response interceptor
api.interceptors.response.use(
  (res) => {
    console.log(`🔍 [Axios] ${res.config.method?.toUpperCase()} ${res.config.url} → ${res.status}`);
    return res;
  },
  (err) => {
    const isAuthRequest = 
      err.config?.url?.includes('/auth/login') || 
      err.config?.url?.includes('/auth/register');

    console.log(`🔍 [Axios] ${err.config?.method?.toUpperCase()} ${err.config?.url} → ${err.response?.status || 'NETWORK_ERROR'}`);
    
    if (err.response?.status === 401 && typeof window !== 'undefined' && !isAuthRequest) {
      console.log('🔍 [Axios] ❌ 401 detected — clearing auth and redirecting to /auth');
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(err);
  }
);