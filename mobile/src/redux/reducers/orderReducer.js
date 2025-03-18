// Redux state structure
import { createReducer } from "@reduxjs/toolkit";

export const orderReducer = createReducer(
    {
        orders: [],
        order: {}, 
        loading: false,
        error: null,
        message: null,
        adminOrders: [], 
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
            .addCase("processOrderAnyRequest", (state) => {
                state.loading = true;
            })
            .addCase("processOrderAnySuccess", (state, action) => {
                state.loading = false;
                state.message = action.payload; // Use the payload for success message
            })
            .addCase("processOrderAnyFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("getOrderDetailsRequest", (state) => {
                state.loading = true;
            })
            .addCase("getOrderDetailsSuccess", (state, action) => {
                state.loading = false;
                state.order = action.payload; // Store order details
                console.log("Order Details Fetched Redux:", action.payload);
                console.log("Order Details Fetched Redux Order:", state.order);
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
                state.adminOrders = action.payload; 
            })
            .addCase("getAdminOrdersFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("getUserOrdersRequest", (state) => {
                state.loading = true;
            })
            .addCase("getUserOrdersSuccess", (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase("getUserOrdersFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("getUserOrdersMobileRequest", (state) => {
                state.loading = true;
            })
            .addCase("getUserOrdersMobileSuccess", (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase("getUserOrdersMobileFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("confirmProofOfDeliveryRequest", (state) => {
                state.loading = true;
            })
            .addCase("confirmProofOfDeliverySuccess", (state, action) => {
                state.loading = false;
                state.order = action.payload;
                state.message = "Proof of Delivery confirmed. Order marked as Delivered.";
            })
            .addCase("confirmProofOfDeliveryFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("notConfirmProofOfDeliveryRequest", (state) => {
                state.loading = true;
            })
            .addCase("notConfirmProofOfDeliverySuccess", (state, action) => {
                state.loading = false;
                state.order = action.payload;
                state.message = "Proof of Delivery not confirmed. Order marked as Cancelled.";
            })
            .addCase("notConfirmProofOfDeliveryFail", (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase("clearError", (state) => {
                state.error = null;
            })
            .addCase("clearMessage", (state) => {
                state.message = null;
            });
    }
);