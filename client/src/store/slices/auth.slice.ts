import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User { 
  id: number; 
  email: string; 
  role: 'CLIENT' | 'ADMIN'; 
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = { 
  user: null, 
  token: null, 
  isLoading: false, 
  error: null 
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; access_token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => { 
      state.isLoading = action.payload; 
    },
    setError: (state, action: PayloadAction<string | null>) => { 
      state.error = action.payload; 
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;