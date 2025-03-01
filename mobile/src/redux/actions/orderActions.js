import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const placeOrder = (
    orderProducts,
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

        const token = await AsyncStorage.getItem('token'); 
        if (!token) {
            throw new Error("No token found");
        }
        console.log("Token retrieved:", token);

        const response = await axios.post(
            `${server}/neworder`,
            {
                orderProducts,
                paymentInfo:  paymentInfo , 
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
    console.log("getOrderDetails touched");
    try {
        console.log("try");
        dispatch({
            type: "getOrderDetailsRequest",
        });
        console.log("dispatched");
        const { data } = await axios.get(`${server}/orders/single/${id}`, {
            withCredentials: true,
        });
        console.log("Action Fetched Order: ", JSON.stringify(data, null, 2));

        dispatch({
            type: "getOrderDetailsSuccess",
            payload: data.order,
        });
    } catch (error) {
        dispatch({
            type: "getOrderDetailsFail",
            payload: error.response?.data?.message || error.message,
        });
        // Enhanced error logging
        console.error("Action Error:", error); // Log the full error
        if (error.response) {
            // The server responded with a status other than 2xx
            console.error("Error Response:", error.response);
            dispatch({
                type: "getOrderDetailsFail",
                payload: error.response.data.message,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("Error Request:", error.request);
        } else {
            // Something else caused the error
            console.error("Error Message:", error.message);
        }
    }
};

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

export const confirmProofOfDelivery = (orderId) => async (dispatch) => {
    try {
        dispatch({ type: "confirmProofOfDeliveryRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.put(
            `${server}/order/proof/${orderId}/confirmed`,
            {},
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        dispatch({
            type: "confirmProofOfDeliverySuccess",
            payload: data.order,
        });
    } catch (error) {
        dispatch({
            type: "confirmProofOfDeliveryFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const notConfirmProofOfDelivery = (orderId) => async (dispatch) => {
    try {
        dispatch({ type: "notConfirmProofOfDeliveryRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.put(
            `${server}/order/proof/${orderId}/notconfirmed`,
            {},
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        dispatch({
            type: "notConfirmProofOfDeliverySuccess",
            payload: data.order,
        });
    } catch (error) {
        dispatch({
            type: "notConfirmProofOfDeliveryFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};
