import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User { id: number; email: string; role: 'CLIENT' | 'ADMIN'; }

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = { user: null, token: null, isLoading: false, error: null };

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
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
    initializeAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        if (token && user) {
          state.token = token;
          state.user = JSON.parse(user);
        }
      }
    },
  },
});

export const { setCredentials, logout, setLoading, setError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;