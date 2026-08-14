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
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>(user?.role === 'ADMIN' ? 'management' : 'cart');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => setIsReady(true), []);
  
  useEffect(() => {
    if (!isReady) return;
    
    // ✅ ПРЯМАЯ ПРОВЕРКА localStorage + Redux
    // Если нет пользователя в Redux НО есть токен в localStorage — ждём синхронизации
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    
    // Редиректим ТОЛЬКО если нет ни в Redux, ни в localStorage
    if (!user && !token) {
      router.push('/auth');
    }
  }, [user, router, isReady]);

  useEffect(() => {
    if (user?.role === 'CLIENT' && activeTab === 'cart') {
      dispatch(fetchCart());
    }
  }, [user, activeTab, dispatch]);

  // ✅ Ждём готовности И (пользователя в Redux ИЛИ токена в localStorage)
  if (!isReady || (!user && typeof window !== 'undefined' && !localStorage.getItem('access_token'))) {
    return null;
  }

  // ✅ Если пользователя в Redux ещё нет, но токен есть — показываем заглушку до синхронизации
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
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