import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    user: {},
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
            // state.message = null;
        })
        
        .addCase("loadUserSuccess", (state, action) => {
            state.loading = false;
            state.isAuthenticated = true; // Ensure user is authenticated on load success
            state.user = action.payload;
            // console.log("User loaded successfully, state:", state);r
        })
        .addCase("logoutSuccess", (state) => {
            state.loading = false;
            state.isAuthenticated = false; // Ensure this is false on logout success
            state.user = {}; // Reset user data on logout
            console.log("User logged out successfully, state:", state);
        })
        .addCase("registerSuccess", (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload; 
            state.message = "Registration successful";
        })
        .addCase("verifyTokenSuccess", (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            console.log("Token verified successfully, state:", state);
        })
        .addCase("getAllUsersSuccess", (state, action) => {
            state.loading = false;
            state.users = action.payload; 
        })
        .addCase("deleteUserSuccess", (state) => {
            state.loading = false; 
        })
        
        // Failure cases
        .addCase("loginFail", (state, action) => {
            console.log("Login Fail Action Dispatched", action);
            state.loading = false;
            state.isAuthenticated = false; // Ensure user is not authenticated on login fail
            state.error = action.payload;
        })
        .addCase("loadUserFail", (state, action) => {
            state.loading = false;
            // Consider keeping isAuthenticated as true, if already authenticated
            state.error = action.payload; // Allow retry on loading user data
        })
        .addCase("logoutFail", (state, action) => {
            state.loading = false;
            // Maintain isAuthenticated as true here, since logout failed
            state.error = action.payload;
        })
        .addCase("registerFail", (state, action) => {
            state.loading = false;
            state.isAuthenticated = false; 
            state.error = action.payload;
        })
        .addCase("verifyTokenFail", (state, action) => {
            state.loading = false;
            state.isAuthenticated = false; 
            state.error = action.payload;
        })
        .addCase("getAllUsersFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("deleteUserFail", (state) => {
            state.loading = false; 
        })

        // Clear errors and messages
        .addCase("clearError", (state) => {
            state.error = null;
        })
        .addCase("clearMessage", (state) => {
            state.message = null;
        })
        .addCase("resetUser", (state) => {
            state.user = {}; // Reset user object
        })
        // .addCase(USER_AVATAR_SUCCESS, (state, action) => {
        //     state.loading = false;
        //     state.user.avatar = action.payload.avatar; // Update the user's avatar in state
        //     state.message = "Avatar updated successfully"; // Optional: set a success message
        // })
        // .addCase(USER_AVATAR_FAIL, (state, action) => {
        //     state.loading = false;
        //     state.error = action.payload; // Capture the error message
        // });
        
});
