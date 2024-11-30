import axios from "axios";
import { server } from "../store";
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const placeOrder = (
    orderItems,
    shippingInfo,
    paymentMethod,
    itemsPrice,
    shippingCharges,
    totalAmount,
    navigation // Add navigation parameter
) => async (dispatch) => {
    try {
        dispatch({
            type: "placeOrderRequest",
        });

        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        if (data.success) {
            const userId = data.user._id;

            const response = await axios.post(
                `${server}/neworder`,
                {
                    userId,
                    shippingInfo,
                    orderItems,
                    paymentMethod,
                    itemsPrice,
                    shippingCharges,
                    totalAmount,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            dispatch({
                type: "placeOrderSuccess",
                payload: response.data.message,
            });

            // Clear the cart after placing the order
            dispatch({ type: "clearCart" });

            // Redirect to order confirmation or another page
            navigation.navigate("myaccount"); // Replace with your route

        } else {
            throw new Error("Failed to fetch user data.");
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || "An error occurred while placing the order.";
        console.error("Error placing order:", errorMessage);

        dispatch({
            type: "placeOrderFail",
            payload: errorMessage,
        });

        throw new Error(errorMessage);
    }
};


export const processOrder = (id, status) => async (dispatch) => {
    try {
        dispatch({
            type: "processOrderRequest",
        });

        const { data } = await axios.put(
            `${server}/order/single/${id}`,

            {status},
            {
                withCredentials: true,
            }
        );
        dispatch({
            type: "processOrderSuccess",
            payload: data.message,
        });
    } catch (error) {
        dispatch({
            type: "processOrderFail",
            payload: error.response.data.message,
        });
    }
};

export const getOrderDetails = (id) => async (dispatch) => {
    
    try {
        dispatch({
            type: "getOrderDetailsRequest",
        })

        // Axios request

        const { data } = await axios.get(`${server}/order/single/${id}`,
        
        {
            withCredentials: true
        })

        dispatch({
            type: "getOrderDetailsSuccess",
            payload: data.order
        })

    } catch (error) {
        
        dispatch({
            type: "getOrderDetailsFail",
            payload: error.response.data.message
        })
    }

}