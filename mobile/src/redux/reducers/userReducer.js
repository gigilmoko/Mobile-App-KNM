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
    .addCase("loginEmailVerificationRequired", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("loginRequest", (state) => {
      state.loading = true;
    })
    .addCase("FORGOT_PASSWORD_REQUEST", (state) => {
      state.loading = true;
    })

    // Success case
    .addCase("FORGOT_PASSWORD_SUCCESS", (state, action) => {
      state.loading = false;
      state.message = action.payload; // Store the success message from the API
    })

    // Fail case
    .addCase("FORGOT_PASSWORD_FAIL", (state, action) => {
      state.loading = false;
      state.error = action.payload; // Store the error message from the API
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
    .addCase("getUserDetailsRequest", (state) => {
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
    .addCase("getUserDetailsSuccess", (state, action) => {
      state.loading = false;
      state.userDetails = action.payload;
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
    })
    .addCase("loginVerificationRequired", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("verifyLoginRequest", (state) => {
      state.loading = true;
    })
    .addCase("verifyLoginSuccess", (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.message = "Admin verification successful";
    })
    .addCase("verifyLoginFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("registerVerificationRequired", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("registerMemberVerificationRequired", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("verifyEmailRequest", (state) => {
      state.loading = true;
    })
    .addCase("verifyEmailSuccess", (state, action) => {
      state.loading = false;
      state.message = action.payload;
    })
    .addCase("verifyEmailFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    .addCase("getUserDetailsFail", (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
});
