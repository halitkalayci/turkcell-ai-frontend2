import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Product } from "../../../types/product";
import mockProducts from "../../../mocks/products";

interface ProductState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[]>(
  "product/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      // Mock veriden yükleme simülasyonu
      return mockProducts;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) ?? "Beklenmeyen bir hata oluştu.";
      });
  },
});

export default productSlice.reducer;
