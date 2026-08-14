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
  // ✅ Берём и user, и token из Redux
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>(user?.role === 'ADMIN' ? 'management' : 'cart');

  // ✅ Проверка авторизации ТОЛЬКО после монтирования (на клиенте)
  useEffect(() => {
    // ✅ Редиректим, если НЕТ токена в Redux
    // Токен попадает в Redux через ReduxProvider → initializeAuth → getInitialState
    if (!token) {
      router.push('/auth');
    }
  }, [token, router]);

  useEffect(() => {
    if (user?.role === 'CLIENT' && activeTab === 'cart') {
      dispatch(fetchCart());
    }
  }, [user, activeTab, dispatch]);

  // ✅ Пока нет пользователя — рендерим ПРОСТУЮ заглушку (одинаковую на сервере и клиенте)
  // Это предотвращает ошибку гидратации #418
  if (!user) {
    return <div className="min-h-screen" />;
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