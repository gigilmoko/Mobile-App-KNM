// Redux state structure
import { createReducer } from "@reduxjs/toolkit";

export const orderReducer = createReducer(
    {
        orders: [],
        order: {}, // Stores single order info after success
        loading: false,
        error: null,
        message: null, // Stores success messages
        adminOrders: [], // List of orders for admin
    },
    (builder) => {
        builder
            .addCase("placeOrderRequest", (state) => {
                state.loading = true;
            })
            .addCase("placeOrderSuccess", (state, action) => {
                state.loading = false;
                state.order = action.payload; // Store the order data here
                state.message = "Order placed successfully!";
            })
            .addCase("placeOrderFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("processOrderRequest", (state) => {
                state.loading = true;
            })
            .addCase("processOrderSuccess", (state, action) => {
                state.loading = false;
                state.message = action.payload; // Use the payload for success message
            })
            .addCase("processOrderFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("getOrderDetailsRequest", (state) => {
                state.loading = true;
            })
            .addCase("getOrderDetailsSuccess", (state, action) => {
                state.loading = false;
                state.order = action.payload; // Store order details
            })
            .addCase("getOrderDetailsFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("getAdminOrdersRequest", (state) => {
                state.loading = true;
            })
            .addCase("getAdminOrdersSuccess", (state, action) => {
                state.loading = false;
                state.adminOrders = action.payload; // Store the list of orders
            })
            .addCase("getAdminOrdersFail", (state, action) => {
                state.loading = false;
                state.error = action.payload; // Store the error message
            })
            .addCase("clearError", (state) => {
                state.error = null;
            })
            .addCase("clearMessage", (state) => {
                state.message = null;
            });
    }
);
