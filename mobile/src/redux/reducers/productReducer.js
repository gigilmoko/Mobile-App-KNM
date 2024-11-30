import { createReducer } from "@reduxjs/toolkit";

export const productReducer = createReducer({
    products: [],
    product: {},

}, (builder) => {
    builder
        .addCase("getAllProductsRequest", (state) => {
            state.loading = true;
        })
        .addCase("getAllProductsSuccess", (state, action) => {
            state.loading = false;
            state.products = action.payload;
        })
        .addCase("getAllProductsFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase("getProductDetailsRequest", (state) => {
            state.loading = true;
        })
        .addCase("getProductDetailsSuccess", (state, action) => {
            state.loading = false;
            state.product = action.payload;
        })
        .addCase("getProductDetailsFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        .addCase("ALL_PRODUCTS_REQUEST", (state) => {
            state.loading = true;
        })
        .addCase("ALL_PRODUCTS_SUCCESS", (state, action) => {
            state.loading = false;
            state.product = action.payload;
        })
        .addCase("ALL_PRODUCTS_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
    
    builder.addCase("clearError", (state) => {
        state.error = null;
    });
    
    builder.addCase("clearMessage", (state) => {
        state.message = null;
    });
});