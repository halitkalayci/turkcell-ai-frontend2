import type { RootState } from "../../index";

export const selectProducts = (state: RootState) => state.product.items;
export const selectProductsLoading = (state: RootState) => state.product.isLoading;
export const selectProductsError = (state: RootState) => state.product.error;
