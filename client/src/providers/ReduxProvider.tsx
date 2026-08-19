'use client';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useEffect } from 'react';
import { initializeAuth } from '@/store/slices/auth.slice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { 
    console.log('🔍 [ReduxProvider] Initializing auth from localStorage');
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const userRaw = localStorage.getItem('user');
      console.log('🔍 [ReduxProvider] localStorage on init:', { 
        token: token ? '✓' : '✗',
        user: userRaw ? '✓' : '✗'
      });
    }
    
    store.dispatch(initializeAuth()); 
    
    // Лог после инициализации
    setTimeout(() => {
      const state = store.getState().auth;
      console.log('🔍 [ReduxProvider] After initializeAuth:', { 
        token: state.token ? '✓' : '✗',
        user: state.user ? state.user.email : 'null'
      });
    }, 100);
  }, []);
  
  return <Provider store={store}>{children}</Provider>;
}