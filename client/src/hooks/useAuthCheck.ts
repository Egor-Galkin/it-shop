'use client';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeAuth } from '@/store/slices/auth.slice';

/**
 * Хук для безопасной проверки авторизации на клиенте.
 * Предотвращает ошибки гидратации, откладывая рендеринг авторизованного UI
 * до полной инициализации localStorage.
 */
export function useAuthCheck() {
  const [isInitialized, setIsInitialized] = useState(false);
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    // Инициализируем auth из localStorage только на клиенте
    dispatch(initializeAuth());
    setIsInitialized(true);
  }, [dispatch]);

  return { isInitialized, token, user };
}