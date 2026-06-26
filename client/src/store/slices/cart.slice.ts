import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/axios';
import type { RootState } from '@/store';

export interface CartDevice {
  id: number;
  name: string;
  price: number;
  img: string | null;
  type: { name: string } | null;
  brand: { name: string } | null;
}

export interface CartItem {
  id: number;
  quantity: number;
  device: CartDevice;
  lockedPrice: number;
}

// ✅ Добавили deliveryOptionId в состояние корзины
export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  lastAction: 'added' | 'updated' | 'removed' | 'checked-out' | null;
  deliveryOptionId: number | null; // ✅ ID выбранного способа получения
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  lastAction: null,
  deliveryOptionId: null, // ✅ По умолчанию не выбрано
};

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/basket/me');
    
    // Маппим items с calculatedPrice
    const items = (data.devices || []).map((item: any) => ({
      ...item,
      lockedPrice: item.calculatedPrice !== undefined ? item.calculatedPrice : item.device.price
    }));
    
    // ✅ Возвращаем и items, и deliveryOptionId
    return {
      items,
      deliveryOptionId: data.deliveryOptionId ?? null
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Ошибка загрузки корзины');
  }
});

export const addToCart = createAsyncThunk(
  'cart/add',
  async ({ deviceId, quantity, price }: { deviceId: number; quantity: number; price: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/basket/me/items', { deviceId, quantity });
      return { ...data, lockedPrice: price };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка добавления');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/update',
  async ({ itemId, quantity }: { itemId: number; quantity: number }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/basket/me/items/${itemId}`, { quantity });
      return { ...data, lockedPrice: data.device.price };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка обновления');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/remove',
  async (itemId: number, { rejectWithValue }) => {
    try {
      await api.delete(`/basket/me/items/${itemId}`);
      return itemId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Ошибка удаления');
    }
  }
);

export const checkoutCart = createAsyncThunk('cart/checkout', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/basket/me/checkout');
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Ошибка оформления');
  }
});

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => { 
      state.items = []; 
      state.lastAction = null;
      // ✅ Не сбрасываем deliveryOptionId — он может пригодиться для нового заказа
    },
    clearError: (state) => { state.error = null; },
    // ✅ Экшен для обновления способа доставки
    setDeliveryOptionId: (state, action: PayloadAction<number | null>) => {
      state.deliveryOptionId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        // ✅ Сохраняем deliveryOptionId из ответа API
        state.deliveryOptionId = action.payload.deliveryOptionId;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const existing = state.items.find(i => i.device.id === action.payload.device.id);
        if (existing) {
          existing.quantity = action.payload.quantity;
        } else {
          state.items.push({
            ...action.payload,
            lockedPrice: action.payload.lockedPrice,
          });
        }
        state.lastAction = 'added';
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.id === action.payload.id);
        if (idx !== -1) {
          if (action.payload.quantity <= 0) {
            state.items.splice(idx, 1);
          } else {
            const existingLockedPrice = state.items[idx].lockedPrice;
            state.items[idx] = { 
              ...action.payload, 
              lockedPrice: existingLockedPrice
            };
          }
        }
        state.lastAction = 'updated';
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.id !== action.payload);
        state.lastAction = 'removed';
      })
      .addCase(checkoutCart.fulfilled, (state) => {
        state.items = [];
        state.lastAction = 'checked-out';
      });
  },
});

export const { clearCart, clearError, setDeliveryOptionId } = cartSlice.actions;

// ✅ Селектор для итоговой суммы товаров (без доставки)
export const selectCartTotal = (state: RootState) => 
  state.cart.items.reduce((sum: number, item: CartItem) => sum + item.lockedPrice * item.quantity, 0);

// ✅ Селектор для ID выбранного способа доставки
export const selectCartDeliveryOptionId = (state: RootState) => 
  state.cart.deliveryOptionId;

export default cartSlice.reducer;