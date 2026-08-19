'use client';
// ✅ 'use client' — ВСЕГДА первая строка!

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
  if (typeof window !== 'undefined') {
    console.log('🔍 [ProfilePage] >>> FUNCTION CALLED <<<');
  }

  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('cart');

  useEffect(() => {
    console.log('🔍 [ProfilePage] Component mounted');
    console.log('🔍 [ProfilePage] Initial Redux state:', { token: token ? '✓' : '✗', user: user ? user.email : null });
    
    if (typeof window !== 'undefined') {
      const lsToken = localStorage.getItem('access_token');
      const lsUser = localStorage.getItem('user');
      console.log('🔍 [ProfilePage] localStorage:', { 
        token: lsToken ? '✓ (' + lsToken.substring(0, 30) + '...)' : '✗',
        user: lsUser ? '✓' : '✗'
      });
    }
  }, []);

  useEffect(() => {
    console.log('🔍 [ProfilePage] Auth check useEffect running');
    console.log('🔍 [ProfilePage] Redux token:', token ? '✓' : '✗');
    console.log('🔍 [ProfilePage] Redux user:', user ? user.email : 'null');
    
    const hasToken = token || (typeof window !== 'undefined' && localStorage.getItem('access_token'));
    console.log('🔍 [ProfilePage] hasToken (Redux OR localStorage):', hasToken ? '✓' : '✗');
    
    if (!hasToken) {
      console.log('🔍 [ProfilePage] ❌ NO TOKEN — redirecting to /auth');
      // ✅ Полная перезагрузка вместо router.push (обходит Next.js server redirect)
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    } else {
      console.log('🔍 [ProfilePage] ✅ TOKEN FOUND — allowing render');
      setAuthChecked(true);
      if (user?.role === 'ADMIN') {
        console.log('🔍 [ProfilePage] Setting activeTab to "management" (ADMIN)');
        setActiveTab('management');
      }
    }
  }, [token, user, router]);

  useEffect(() => {
    if (user?.role === 'CLIENT' && activeTab === 'cart') {
      console.log('🔍 [ProfilePage] Fetching cart for CLIENT');
      dispatch(fetchCart());
    }
  }, [user, activeTab, dispatch]);

  if (!authChecked) {
    console.log('🔍 [ProfilePage] Rendering: waiting for auth check...');
    return <div className="min-h-screen" />;
  }

  if (!user) {
    console.log('🔍 [ProfilePage] Rendering: token exists but user is null (waiting for sync)...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  console.log('🔍 [ProfilePage] Rendering: authenticated profile content');

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