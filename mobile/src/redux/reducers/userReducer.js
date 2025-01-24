import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    user: {},
    userDetails: {}, // Store user details here
    loading: false,
    error: null,
    isAuthenticated: false,
    message: null,
};

export const userReducer = createReducer(initialState, (builder) => {
    builder
        // Request cases
        .addCase("loginRequest", (state) => {
            state.loading = true;
        })
        .addCase("loadUserRequest", (state) => {
            state.loading = true;
        })
        .addCase("logoutRequest", (state) => {
            state.loading = true;
        })
        .addCase("registerRequest", (state) => {
            state.loading = true;
        })
        .addCase("verifyTokenRequest", (state) => {
            state.loading = true;
        })
        .addCase("getAllUsersRequest", (state) => {
            state.loading = true;
        })
        .addCase("deleteUserRequest", (state) => {
            state.loading = true;
        })
        .addCase("UPDATE_ADDRESS_REQUEST", (state) => {
            state.loading = true; // Start loading for address update
        })
        .addCase("registerUserMemberRequest", (state) => {
            state.loading = true;
        })
        
        // Success cases
        .addCase("loginSuccess", (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload; 
            state.message = "Login successful";
        })
        .addCase("loadUserSuccess", (state, action) => {
            state.loading = false;
            state.isAuthenticated = true; 
            state.user = action.payload;
        })
        .addCase("getUserProfileSuccess", (state, action) => {
            state.loading = false;
            state.user = action.payload;  
        })
        .addCase("logoutSuccess", (state) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = {}; 
            state.message = "Logout successful";
        })
        .addCase("UPDATE_ADDRESS_SUCCESS", (state, action) => {
            state.loading = false;
            state.user = action.payload; // Update the user data with the new address
            state.message = "Address updated successfully";
        })
        .addCase("registerUserMemberSuccess", (state, action) => {
            state.loading = false;
            state.message = action.payload;
        })

        // Fail cases
        .addCase("loginFail", (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.error = action.payload;
        })
        .addCase("getUserProfileFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("logoutFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("UPDATE_ADDRESS_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload; 
        })
        .addCase("registerUserMemberFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
});
