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
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!user && !token) router.push('/auth');
  }, [user, router, isReady]);

  useEffect(() => {
    if (user?.role === 'CLIENT' && activeTab === 'cart') {
      dispatch(fetchCart());
    }
  }, [user, activeTab, dispatch]);

  if (!isReady || !user) return null;
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