import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartId: null,
  items: [],
  total: 0,
  loading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cartId = action.payload.cartId;
      state.items = action.payload.items || [];
      state.total = action.payload.total || 0;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
      state.total += action.payload.price * action.payload.quantity;
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.total = state.total - (state.items[index].price * state.items[index].quantity) + (action.payload.price * action.payload.quantity);
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action) => {
      const item = state.items.find(item => item.id === action.payload);
      state.total -= item ? item.price * item.quantity : 0;
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    clearCart: () => initialState,
  },
});

export const { setCart, addItem, updateItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;