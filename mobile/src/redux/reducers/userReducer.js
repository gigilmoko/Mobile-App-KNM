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
        
        // Success cases
        .addCase("loginSuccess", (state, action) => {
            console.log("Login Success Action Dispatched", action);
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload; 
            state.message = "Login successful";
            console.log("User logged in successfully, state:", state);
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
        
        // New user details success
        .addCase("USER_DETAILS_SUCCESS", (state, action) => {
            state.loading = false;
            state.userDetails = action.payload; // Store fetched user details
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
        
        // New user details fail
        .addCase("USER_DETAILS_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload; // Store the error if fetching user details fails
        });
});
