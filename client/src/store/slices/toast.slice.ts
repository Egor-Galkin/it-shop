import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

const initialState: ToastState = {
  toasts: [],
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = Math.random().toString(36).substr(2, 9);
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const { addToast, removeToast, clearToasts } = toastSlice.actions;
export default toastSlice.reducer;

// Хелперы для удобного вызова
export const toast = {
  success: (message: string, duration = 4000) => 
    ({ type: 'toast/addToast', payload: { type: 'success', message, duration } } as const),
  error: (message: string, duration = 5000) => 
    ({ type: 'toast/addToast', payload: { type: 'error', message, duration } } as const),
  warning: (message: string, duration = 4000) => 
    ({ type: 'toast/addToast', payload: { type: 'warning', message, duration } } as const),
  info: (message: string, duration = 3000) => 
    ({ type: 'toast/addToast', payload: { type: 'info', message, duration } } as const),
};