import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "./reducers/userReducer";
import { productReducer } from "./reducers/productReducer";
import { cartReducer } from "./reducers/cartReducer";
import { wishlistReducer } from "./reducers/wishlistReducer";
import { orderReducer } from "./reducers/orderReducer";
import { notificationReducer } from "./reducers/notificationReducer";
import calendarReducer from "./reducers/calendarReducers";
import feedbackReducer from "./reducers/feedbackReducers";
import userInterestReducers from "./reducers/userInterestReducers"
import { categoryReducer } from "./reducers/categoryReducers";
import { productFeedbackReducer } from "./reducers/productFeedbackReducer";
import { eventFeedbackReducer } from "./reducers/eventFeedbackReducers"; 
import { riderReducer } from "./reducers/riderReducer";
import { truckReducer } from "./reducers/truckReducers";
import { deliveryReducer } from "./reducers/deliverySessionReducers";
import { dashboardReducer } from "./reducers/dashboardReducers";
export const store = configureStore({
    reducer: {
        user: userReducer,
        product: productReducer,
        cart: cartReducer,
        wishlist: wishlistReducer,
        order: orderReducer,
        notifications: notificationReducer,
        calendar: calendarReducer,
        feedback: feedbackReducer,
        userInterested: userInterestReducers, 
        category: categoryReducer,
        feedbacks: productFeedbackReducer,
        eventFeedback: eventFeedbackReducer,
        rider: riderReducer,
        truck: truckReducer,
        deliverySession: deliveryReducer,
        dashboard: dashboardReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false, // Disables immutability checks
            serializableCheck: false, // Disables serializability checks
        }),
});


//Bahay ni Von
// export const server = "https://knm-jiwx.onrender.com/api/"
// export const server = "http://192.168.254.157:4002/api/"
;[]
//Bahay ni Jis
export const server = "http://192.168.1.11:4002/api/"

//Bahay ni Cleto
// export const server = "http://192.168.100.3:4002/api/"

//Deployed Server
// export const server = "https://knm-backend.onrender.com/api/"

// https://knm-t7bh.onrender.com/api/
// https://knm-jiwx.onrender.com