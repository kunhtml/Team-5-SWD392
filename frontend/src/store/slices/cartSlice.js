import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity, price, name, shopId }, { getState }) => {
    const state = getState();
    const existingItem = state.cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      return { productId, quantity: existingItem.quantity + quantity };
    }
    return { productId, quantity, price, name, shopId };
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    total: 0,
    isLoading: false,
  },
  reducers: {
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
      state.total = state.items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;
        state.total = state.items.reduce(
          (sum, item) =>
            sum + Number(item.price || 0) * Number(item.quantity || 0),
          0
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addToCart.fulfilled, (state, action) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Store product details for accurate cart summary
        state.items.push({
          productId,
          quantity,
          price: action.payload.price,
          name: action.payload.name,
          shopId: action.payload.shopId,
        });
      }

      state.total = state.items.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 0),
        0
      );
    });
  },
});

export const { removeFromCart, clearCart, updateQuantity } = cartSlice.actions;
export default cartSlice.reducer;
