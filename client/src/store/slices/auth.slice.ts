import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User { id: number; email: string; role: 'CLIENT' | 'ADMIN'; }

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ✅ Безопасная инициализация состояния из localStorage
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isLoading: false, error: null };
  }
  
  try {
    const token = localStorage.getItem('access_token');
    const userRaw = localStorage.getItem('user');
    
    // ✅ Проверяем, что token есть И user не равен строке "undefined"
    if (token && userRaw && userRaw !== 'undefined') {
      return {
        user: JSON.parse(userRaw),
        token,
        isLoading: false,
        error: null,
      };
    }
  } catch (e) {
    console.warn('Failed to initialize auth from localStorage:', e);
  }
  
  return { user: null, token: null, isLoading: false, error: null };
};

const initialState: AuthState = getInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; access_token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', action.payload.access_token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => { 
      state.isLoading = action.payload; 
    },
    setError: (state, action: PayloadAction<string | null>) => { 
      state.error = action.payload; 
    },
    // ✅ initializeAuth больше не нужен — инициализация происходит в getInitialState()
    // Но оставляем как заглушку, если где-то вызывается
    initializeAuth: (state) => {
      // Инициализация уже выполнена в getInitialState(), этот редьюсер можно оставить пустым
    },
  },
});

export const { setCredentials, logout, setLoading, setError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;