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
        truck: truckReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: false, // Disables immutability checks
            serializableCheck: false, // Disables serializability checks
        }),
});


//Bahay na Von
// export const server = "http://192.168.1.11:4002/api/"
// export const server = "http://192.168.43.21:4002/api/"

//Bahay ni Jis
// export const server = "http://192.168.1.17:4002/api/"
// export const server = "http://192.168.81.177:4002/api/"
export const server = "http://192.168.1.15:4002/api/"

//Bahay ni Cleto
// export const server = "http://192.168.100.3:4002/api/"

//Deployed Server
// export const server = "https://knm-t7bh.onrender.com/api/"