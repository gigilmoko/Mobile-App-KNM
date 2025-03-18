import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const calculateTotalPrice = () => async (dispatch) => {
    try {
        dispatch({ type: "calculateTotalPriceRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/analytics/orders/totalprice`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "calculateTotalPriceSuccess",
            payload: data.totalPrice,
        });
    } catch (error) {
        dispatch({
            type: "calculateTotalPriceFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getMonthlyOrderTotal = () => async (dispatch) => {
    try {
        dispatch({ type: "getMonthlyOrderTotalRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/analytics/orders/months`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "getMonthlyOrderTotalSuccess",
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: "getMonthlyOrderTotalFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getTotalCustomer = () => async (dispatch) => {
    try {
        dispatch({ type: "getTotalCustomerRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/analytics/orders/totalcustomers`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "getTotalCustomerSuccess",
            payload: data.totalCustomers,
        });
    } catch (error) {
        dispatch({
            type: "getTotalCustomerFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getTotalProducts = () => async (dispatch) => {
    try {
        dispatch({ type: "getTotalProductsRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/product/total`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "getTotalProductsSuccess",
            payload: data.totalProducts,
        });
    } catch (error) {
        dispatch({
            type: "getTotalProductsFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getNextThreeEvents = () => async (dispatch) => {
    try {
        dispatch({ type: "getNextThreeEventsRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/calendar/events/featured`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "getNextThreeEventsSuccess",
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: "getNextThreeEventsFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getLatestOrders = () => async (dispatch) => {
    try {
        dispatch({ type: "getLatestOrdersRequest" });

        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error("No token found");
        }

        const { data } = await axios.get(`${server}/analytics/order-latest`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        dispatch({
            type: "getLatestOrdersSuccess",
            payload: data.orders,
        });
    } catch (error) {
        dispatch({
            type: "getLatestOrdersFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};
