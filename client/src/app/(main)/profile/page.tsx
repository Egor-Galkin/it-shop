'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchCart } from '@/store/slices/cart.slice';
import { ProfileLayout } from './components/ProfileLayout';
import { ManagementTab } from './components/ManagementTab';
import { StatsTab } from './components/StatsTab';
import { CartTab } from './components/CartTab';
import { HistoryTab } from './components/HistoryTab';
import { PasswordTab } from './components/PasswordTab';

export default function ProfilePage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  // ✅ Состояние: завершена ли проверка авторизации
  const [authChecked, setAuthChecked] = useState(false);
  
  // ✅ Безопасное значение по умолчанию
  const [activeTab, setActiveTab] = useState<string>('cart');

  // ✅ Проверка авторизации — ТОЛЬКО на клиенте
  useEffect(() => {
    // Проверяем токен: сначала Redux, потом localStorage как fallback
    const hasToken = token || (typeof window !== 'undefined' && localStorage.getItem('access_token'));
    
    if (!hasToken) {
      // Нет токена НИ в Redux, НИ в localStorage → редирект
      router.push('/auth');
    } else {
      // Токен есть → разрешаем рендеринг контента
      setAuthChecked(true);
      
      // Синхронизируем вкладку с ролью (если user уже в Redux)
      if (user?.role === 'ADMIN') {
        setActiveTab('management');
      }
    }
  }, [token, user, router]);

  // ✅ Загрузка корзины для CLIENT
  useEffect(() => {
    if (user?.role === 'CLIENT' && activeTab === 'cart') {
      dispatch(fetchCart());
    }
  }, [user, activeTab, dispatch]);

  // ✅ Пока авторизация не проверена — рендерим заглушку
  // Это предотвращает редирект до того, как проверим localStorage
  if (!authChecked) {
    return <div className="min-h-screen" />;
  }

  // ✅ Если после проверки нет пользователя в Redux — показываем лоадер
  // (токен есть, но user ещё не загрузился — ждём синхронизации)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

  const renderTab = () => {
    switch (activeTab) {
      case 'management': return isAdmin ? <ManagementTab /> : null;
      case 'stats': return isAdmin ? <StatsTab /> : null;
      case 'cart': return user.role === 'CLIENT' ? <CartTab /> : null;
      case 'history': return user.role === 'CLIENT' ? <HistoryTab /> : null;
      case 'password': return <PasswordTab />;
      default: return null;
    }
  };

  return (
    <ProfileLayout 
      isAdmin={isAdmin} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      {renderTab()}
    </ProfileLayout>
  );
}