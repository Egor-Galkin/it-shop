'use client';
import { Provider } from 'react-redux';
import { store } from '@/store';
// import { useEffect } from 'react';
// import { initializeAuth } from '@/store/slices/auth.slice';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  //useEffect(() => { store.dispatch(initializeAuth()); }, []);
  return <Provider store={store}>{children}</Provider>;
}