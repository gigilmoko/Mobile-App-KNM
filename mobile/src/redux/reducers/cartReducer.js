import { createReducer } from "@reduxjs/toolkit";

export const cartReducer = createReducer(
    {
        cartItems: [],
        loading: false,
        error: null,
        user: {},
    },
    (builder) => {
        builder
            .addCase("addToCart", (state, action) => {
                const item = action.payload;
                const isExist = state.cartItems.find((i) => i.product === item.product);
                if (isExist) {
                    state.cartItems = state.cartItems.filter((i) =>
                        i.product === isExist.product ? item : i
                    );

                    for (let i = 0; i < state.cartItems.length; i++) {
                        if (state.cartItems[i].product === isExist.product)
                            state.cartItems[i] = item;
                    }
                } else state.cartItems.push(item);
            })
            .addCase("updateCartQuantity", (state, action) => {
                const { product, quantity } = action.payload;
                const item = state.cartItems.find((i) => i.product === product);
                if (item) {
                    item.quantity += quantity;
                }
            })
            .addCase("removeFromCart", (state, action) => {
                const id = action.payload;
                state.cartItems = state.cartItems.filter((i) => i.product !== id);
            })
            .addCase("clearCart", (state) => {
                state.cartItems = [];
            })
            .addCase('placeOrderSuccess', (state, action) => {
                state.cartItems = []; // Clear the cart items after order success
              })
    }
);