import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const placeOrder = (
    orderProducts,
    deliveryAddress,
    paymentInfo,
    itemsPrice,
    shippingCharges,
    totalPrice,
    navigation 
) => async (dispatch) => {
    try {
        console.log("Dispatching placeOrderRequest");
        dispatch({
            type: "placeOrderRequest",
        });

        const token = await AsyncStorage.getItem('token'); // Ensure the correct key is used
        if (!token) {
            throw new Error("No token found");
        }
        console.log("Token retrieved:", token);

        const { data } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        console.log("User data fetched:", data);

        if (data.success) {
            const userId = data.user._id;

            const response = await axios.post(
                `${server}/neworder`,
                {
                    userId,
                    deliveryAddress,
                    orderProducts,
                    paymentInfo,
                    itemsPrice,
                    shippingCharges,
                    totalPrice,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            console.log("Order placed successfully:", response.data);

            dispatch({
                type: "placeOrderSuccess",
                payload: response.data.message,
            });

            dispatch({ type: "clearCart" });
            return response.data; 
        } else {
            throw new Error("Failed to fetch user data.");
        }
    } catch (error) {
        const errorMessage = error.message || error.response?.data?.message || "An error occurred while placing the order.";
        console.error("Error placing order:", errorMessage);

        dispatch({
            type: "placeOrderFail",
            payload: errorMessage,
        });

        throw new Error(errorMessage);
    }
};


export const processOrder = (id, status) => async (dispatch) => {
    console.log("processorder touched")
    try {
        dispatch({
            type: "processOrderRequest",
        });

        const { data } = await axios.put(
            `${server}/orders/update/${id}`,

            {status},
            {
                withCredentials: true,
            }
        );
        // console.log("process order", data)
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

        const { data } = await axios.get(`${server}/orders/single/${id}`,
        {
            withCredentials: true
        })
        // console.log("Action Fetched Order: ", JSON.stringify(data, null, 2));

        dispatch({
            type: "getOrderDetailsSuccess",
            payload: data.order
        })

    } catch (error) {
        // console.log("Action Error");
        dispatch({
            type: "getOrderDetailsFail",
            payload: error.response.data.message
        })
    }

}

export const getAdminOrders = () => async (dispatch) => {
    try {
        // console.log("Dispatching getAdminOrdersRequest...");
        dispatch({
            type: "getAdminOrdersRequest",
        });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }
        const { data } = await axios.get(`${server}/orders/list`, {
            withCredentials: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        dispatch({
            type: "getAdminOrdersSuccess",
            payload: data.orders,
        });
        console.log("Dispatching getAdminOrdersSuccess with payload:", data.orders);
        
    } catch (error) {
        // console.error("Error fetching admin orders:", error);

        dispatch({
            type: "getAdminOrdersFail",
            payload: error.response?.data?.message
        });

        console.error(
            "Dispatching getAdminOrdersFail with payload:",
            error.response?.data?.message
        );
    }
};


export const getUserOrders = () => async (dispatch) => {
    try {
        dispatch({ type: "getUserOrdersRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/my`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "getUserOrdersSuccess",
            payload: data.orders,
        });
    } catch (error) {
        dispatch({
            type: "getUserOrdersFail",
            payload: error.response?.data?.message || error.message,
        });
        Toast.show({
            type: "error",
            text1: error.response?.data?.message || error.message,
        });
    }
};
