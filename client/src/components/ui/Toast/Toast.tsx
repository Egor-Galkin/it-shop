'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast } from '@/store/slices/toast.slice';
import styles from './Toast.module.scss';

export function Toast() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((state) => state.toast.toasts);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration);
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return '•';
    }
  };

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{getIcon(t.type)}</span>
          <span className={styles.message}>{t.message}</span>
          <button 
            onClick={() => dispatch(removeToast(t.id))}
            className={styles.closeBtn}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}