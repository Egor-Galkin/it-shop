import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth.slice';
import cartReducer from './slices/cart.slice';
import toastReducer from './slices/toast.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    toast: toastReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;