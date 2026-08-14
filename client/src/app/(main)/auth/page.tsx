'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useAuthCheck } from '@/hooks/useAuthCheck';
// Импортируй свои компоненты для авторизованного/публичного UI
// import { AuthenticatedContent } from '@/components/AuthenticatedContent';
// import { PublicContent } from '@/components/PublicContent';

export default function HomePage() {
  // Используем хук для безопасной проверки авторизации
  const { isInitialized, token, user } = useAuthCheck();
  
  // Локальный стейт для предотвращения гидратации
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Пока не клиент ИЛИ auth не инициализирован — рендерим заглушку
  // Это предотвращает mismatch между серверным и клиентным HTML
  if (!isClient || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Загрузка...</div>
      </div>
    );
  }

  // ✅ После инициализации — рендерим реальный контент
  return (
    <main className="min-h-screen">
      {token && user ? (
        // Авторизованный контент
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Добро пожаловать, {user.email}!</h1>
          {/* Твой авторизованный контент здесь */}
          <p>Role: {user.role}</p>
        </div>
      ) : (
        // Публичный контент
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Добро пожаловать в IT-Shop!</h1>
          {/* Твой публичный контент здесь */}
          <p>Просмотрите наш каталог товаров.</p>
        </div>
      )}
    </main>
  );
}