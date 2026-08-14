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

// ✅ ОТКЛЮЧАЕМ SSR ДЛЯ ЭТОЙ СТРАНИЦЫ — рендеринг только на клиенте
// Это полностью устраняет ошибку гидратации #418
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default function ProfilePage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<string>(user?.role === 'ADMIN' ? 'management' : 'cart');

  // ✅ Проверка авторизации — только на клиенте
  useEffect(() => {
    if (!token) {
      router.push('/auth');
    }
  }, [token, router]);

  useEffect(() => {
    if (user?.role === 'CLIENT' && activeTab === 'cart') {
      dispatch(fetchCart());
    }
  }, [user, activeTab, dispatch]);

  // ✅ Если нет пользователя — показываем лоадер (только на клиенте)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Загрузка профиля...</div>
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