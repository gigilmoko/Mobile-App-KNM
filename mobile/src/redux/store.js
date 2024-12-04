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
        category: categoryReducer
    },
});


//Bahay na Von
// export const server = "http://192.168.1.12:4002/api/"

//Bahay ni Jis
export const server = "http://192.168.1.24:4002/api/"

//Bahay ni Cleto
// export const server = "http://192.168.100.3:4001/api/"

//Deployed Server
// export const server = "https://knm-t7bh.onrender.com/api/"

