'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/auth.slice';
import { api } from '@/lib/axios';

// Простой интерфейс пользователя
interface User {
  id: number;
  email: string;
  role: 'CLIENT' | 'ADMIN';
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const dispatch = useAppDispatch();

  // Проверяем авторизацию только на клиенте
  useEffect(() => {
    setIsClient(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const userRaw = localStorage.getItem('user');
      
      if (token && userRaw && userRaw !== 'undefined') {
        const user = JSON.parse(userRaw);
        setAuthToken(token);
        setAuthUser(user);
        // Синхронизируем с Redux
        dispatch(setCredentials({ access_token: token, user }));
      }
    } catch (e) {
      console.warn('Auth check error:', e);
      // Если ошибка парсинга — делаем logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      dispatch(logout());
    }
  }, [dispatch]);

  // Пока не клиент — рендерим минимальную заглушку (совпадает с сервером)
  if (!isClient) {
    return <div className="min-h-screen" />;
  }

  // ✅ После проверки — показываем правильный контент
  return (
    <main className="min-h-screen">
      {authToken && authUser ? (
        // Авторизованный контент
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Добро пожаловать, {authUser.email}!</h1>
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                dispatch(logout());
                setAuthToken(null);
                setAuthUser(null);
                window.location.href = '/';
              }}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Role:</strong> {authUser.role}</p>
            <p><strong>ID:</strong> {authUser.id}</p>
          </div>
          {/* Здесь будет твой каталог товаров */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Каталог товаров</h2>
            <p className="text-gray-600">Загрузка товаров...</p>
            {/* <ProductList /> */}
          </div>
        </div>
      ) : (
        // Публичный контент
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Добро пожаловать в IT-Shop!</h1>
          <p className="mb-6">Просмотрите наш каталог товаров.</p>
          <div className="flex gap-4">
            <a href="/auth" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Войти
            </a>
            <a href="/catalog" className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
              Каталог
            </a>
          </div>
        </div>
      )}
    </main>
  );
}