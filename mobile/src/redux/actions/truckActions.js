import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { server } from "../store";

// Helper function to get token from AsyncStorage
const getToken = async () => await AsyncStorage.getItem('token');

// Get all trucks
export const getTrucks = () => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.get(`${server}/trucks`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'GET_TRUCKS_SUCCESS',
            payload: data.trucks,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'GET_TRUCKS_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Get single truck
export const getSingleTruck = (id) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.get(`${server}/trucks/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'GET_SINGLE_TRUCK_SUCCESS',
            payload: data.truck,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'GET_SINGLE_TRUCK_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Create new truck
export const newTruck = (truckData) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.post(`${server}/trucks`, truckData, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'NEW_TRUCK_SUCCESS',
            payload: data.truck,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'NEW_TRUCK_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Update truck
export const updateTruck = (id, truckData) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.put(`${server}/trucks/${id}`, truckData, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'UPDATE_TRUCK_SUCCESS',
            payload: data.truck,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'UPDATE_TRUCK_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Delete truck
export const deleteTruck = (id) => async (dispatch) => {
    try {
        const token = await getToken();
        await axios.delete(`${server}/trucks/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'DELETE_TRUCK_SUCCESS',
            payload: id,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'DELETE_TRUCK_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Assign rider to truck
export const assignRider = (id, riderId) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.put(`${server}/trucks/${id}/assign`, { riderId }, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'ASSIGN_RIDER_SUCCESS',
            payload: data.truck,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'ASSIGN_RIDER_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Unassign rider from truck
export const unassignRider = (id) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.put(`${server}/trucks/${id}/unassign`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'UNASSIGN_RIDER_SUCCESS',
            payload: data.truck,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'UNASSIGN_RIDER_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Get truck orders
export const getTruckOrders = (id) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.get(`${server}/trucks/${id}/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'GET_TRUCK_ORDERS_SUCCESS',
            payload: data.orders,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'GET_TRUCK_ORDERS_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Add order to truck
export const addTruckOrder = (id, orderId) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.put(`${server}/trucks/${id}/orders/${orderId}`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'ADD_TRUCK_ORDER_SUCCESS',
            payload: data.order,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'ADD_TRUCK_ORDER_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Remove single order from truck
export const removeSingleTruckOrder = (id, orderId) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.delete(`${server}/trucks/${id}/orders/${orderId}`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'REMOVE_SINGLE_TRUCK_ORDER_SUCCESS',
            payload: data.message,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'REMOVE_SINGLE_TRUCK_ORDER_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Remove all orders from truck
export const removeAllTruckOrders = (id) => async (dispatch) => {
    try {
        const token = await getToken();
        const { data } = await axios.delete(`${server}/trucks/${id}/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });
        dispatch({
            type: 'REMOVE_ALL_TRUCK_ORDERS_SUCCESS',
            payload: data.message,
        });
    } catch (error) {
        console.error(error);
        dispatch({
            type: 'REMOVE_ALL_TRUCK_ORDERS_FAIL',
            payload: error.response.data.message,
        });
    }
};

// Accept work
export const acceptWork = (id) => async (dispatch) => {
    console.log("acceptWork touched");

    try {
        console.log("try");
        dispatch({
            type: "ACCEPT_WORK_REQUEST",  // Dispatch request action
        });
        console.log("dispatched");

        // Fetch token from AsyncStorage
        const token = await AsyncStorage.getItem('riderToken');
        if (!token) {
            console.error("No token found");
            return;
        }

        const { data } = await axios.put(`${server}truck/${id}/order/accept`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });

        console.log("Action Fetched Accepted Work: ", JSON.stringify(data, null, 2));

        dispatch({
            type: "ACCEPT_WORK_SUCCESS",
            payload: data.truck,  // This is the truck data returned after acceptance
        });
    } catch (error) {
        console.error("Action Error:", error);  // Enhanced error logging
        if (error.response) {
            // The server responded with a status other than 2xx
            console.error("Error Response:", error.response);
            dispatch({
                type: "ACCEPT_WORK_FAIL",
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

// Decline Work
export const declineWork = (id) => async (dispatch) => {
    console.log("declineWork touched");

    try {
        console.log("try");
        dispatch({
            type: "DECLINE_WORK_REQUEST",  // Dispatch request action
        });
        console.log("dispatched");

        // Fetch token from AsyncStorage
        const token = await AsyncStorage.getItem('riderToken');
        if (!token) {
            console.error("No token found");
            return;
        }

        const { data } = await axios.put(`${server}truck/${id}/order/decline`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });

        console.log("Action Fetched Declined Work: ", JSON.stringify(data, null, 2));

        dispatch({
            type: "DECLINE_WORK_SUCCESS",
            payload: data.truck,  // This is the truck data returned after declining the work
        });
    } catch (error) {
        console.error("Action Error:", error);  // Enhanced error logging
        if (error.response) {
            // The server responded with a status other than 2xx
            console.error("Error Response:", error.response);
            dispatch({
                type: "DECLINE_WORK_FAIL",
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