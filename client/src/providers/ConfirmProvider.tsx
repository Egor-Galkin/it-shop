'use client';
import { createContext, useContext, useState, useCallback } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog/ConfirmDialog';

type ConfirmType = 'default' | 'danger';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  resolve: ((value: boolean) => void) | null;
}

const ConfirmContext = createContext<{
  showConfirm: (options: { title: string; message: string; confirmText?: string; cancelText?: string; type?: ConfirmType }) => Promise<boolean>;
} | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState>({ 
    isOpen: false, title: '', message: '', resolve: null 
  });

  const showConfirm = useCallback((options: { title: string; message: string; confirmText?: string; cancelText?: string; type?: ConfirmType }) => {
    return new Promise<boolean>((resolve) => {
      setState({ isOpen: true, resolve, ...options });
    });
  }, []);

  const handleClose = useCallback((result: boolean) => {
    setState(prev => {
      prev.resolve?.(result);
      return { ...prev, isOpen: false, resolve: null };
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {state.isOpen && (
        <ConfirmDialog
          title={state.title}
          message={state.message}
          confirmText={state.confirmText}
          cancelText={state.cancelText}
          type={state.type}
          onConfirm={() => handleClose(true)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx.showConfirm;
};