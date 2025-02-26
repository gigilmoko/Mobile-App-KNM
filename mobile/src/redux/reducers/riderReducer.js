import { createReducer } from "@reduxjs/toolkit";

const initialState = {
    riders: [],
    rider: {},
    loading: false,
    error: null,
    message: null,
    token: null,
};

export const riderReducer = createReducer(initialState, (builder) => {
    builder
        .addCase("GET_RIDERS", (state, action) => {
            state.riders = action.payload.riders;
        })
        .addCase("NEW_RIDER", (state, action) => {
            state.riders = [...state.riders, action.payload.rider];
        })
        .addCase("GET_SINGLE_RIDER", (state, action) => {
            state.rider = action.payload.rider;
        })
        .addCase("UPDATE_RIDER", (state, action) => {
            state.riders = state.riders.map((r) =>
                r._id === action.payload.rider._id ? action.payload.rider : r
            );
        })
        .addCase("DELETE_RIDER", (state, action) => {
            state.riders = state.riders.filter((r) => r._id !== action.payload);
        })
        .addCase("RIDER_LOGIN", (state, action) => {
            state.token = action.payload.token;
            state.rider = action.payload.rider;
        })
        .addCase("RIDER_LOGOUT", (state) => {
            state.token = null;
            state.rider = null;
        })
        .addCase("RIDER_PROFILE", (state, action) => {
            state.rider = action.payload.rider;
        })
        .addCase("UPDATE_PASSWORD", (state, action) => {
            state.rider = { ...state.rider, ...action.payload };
            state.message = "Password updated successfully";
        })
        .addCase("UPDATE_PASSWORD_FAIL", (state, action) => {
            state.error = action.payload;
            state.message = "Password update failed";
        })
        .addCase("GET_PENDING_TRUCK_REQUEST", (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase("GET_PENDING_TRUCK_SUCCESS", (state, action) => {
            state.loading = false;
            state.pendingTruck = action.payload;
        })
        .addCase("GET_PENDING_TRUCK_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("riderLogoutRequest", (state) => {
            state.loading = true;
        })
        .addCase("riderLogoutSuccess", (state) => {
            state.loading = false;
            state.rider = {};
            state.message = "Logout successful";
        })
        .addCase("riderLogoutFail", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("RIDER_AVATAR_SUCCESS", (state, action) => {
            state.loading = false;
            state.rider.avatar = action.payload.avatar;
            state.message = "Avatar updated successfully";
        })
        .addCase("RIDER_AVATAR_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("GET_RIDER_PROFILE_REQUEST", (state) => {
            state.loading = true;
        })
        .addCase("GET_RIDER_PROFILE_SUCCESS", (state, action) => {
            state.loading = false;
            state.rider = action.payload;
        })
        .addCase("GET_RIDER_PROFILE_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase("UPDATE_RIDER_LOCATION_REQUEST", (state) => {
            state.loading = true;
        })
        .addCase("UPDATE_RIDER_LOCATION_SUCCESS", (state, action) => {
            state.loading = false;
            state.rider = {
                ...state.rider,
                location: action.payload,
            };
            state.message = "Rider location updated successfully";
        })
        .addCase("UPDATE_RIDER_LOCATION_FAIL", (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
});
