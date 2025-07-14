import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { server } from "../store";

// Get pending sessions by rider
export const getPendingSessionsByRider = (riderId) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const { data } = await axios.get(`${server}/delivery-session/pending/${riderId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });
        dispatch({ type: 'GET_PENDING_SESSIONS', pendingSessions: data.sessions });
        console.log('Pending Sessions:', JSON.stringify(data.sessions, null, 2)); // Updated
    } catch (error) {
        console.error('Error fetching pending sessions:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error });
    }
};

export const getSessionsByRider = (riderId) => async (dispatch) => {
    console.log("getSessionsByRider called with riderId:", riderId);
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const { data } = await axios.get(`${server}/delivery-session/on-going/${riderId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'GET_SESSIONS_BY_RIDER',
         
            ongoingSessions: data.ongoingSessions,
          
        });

        console.log('Fetched Sessions:', JSON.stringify(data, null, 2)); // Updated
    } catch (error) {
        console.error('Error fetching sessions:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error: error.response?.data?.message || error.message });
    }
};

// Accept work
export const acceptWork = (sessionId) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const { data } = await axios.put(`${server}/delivery-session/${sessionId}/accept`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });
        dispatch({ type: 'ACCEPT_WORK', acceptedSession: data.session });
    } catch (error) {
        console.error('Error accepting delivery session:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error });
    }
};

// Decline work
export const declineWork = (id, riderId, truckId) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const { data } = await axios.put(`${server}/delivery-sessions/${id}/decline`, { riderId, truckId }, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });
        dispatch({ type: 'DECLINE_WORK', declinedSession: data.session });
    } catch (error) {
        console.error('Error declining delivery session:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error });
    }
};

// Start delivery session

export const startDeliverySession = (id) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const route = `${server}/delivery-session/${id}/started-work`; // Route to be sent
        console.log(`Starting delivery session with ID: ${id}`);
        console.log(`Route: ${route}`);

        const { data } = await axios.put(route, {}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });
        
        dispatch({ type: 'START_DELIVERY_SESSION', startedSession: data.session });
    } catch (error) {
        console.error('Error starting delivery session:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error });
    }
};

// Complete delivery session
export const completeDeliverySession = (id) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const route = `${server}/delivery-session/${id}/completed-work`; // Route to be sent
        console.log(`Completing delivery session with ID: ${id}`);
        console.log(`Route: ${route}`);

        const { data } = await axios.put(route, {}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });
        
        dispatch({ type: 'COMPLETE_DELIVERY_SESSION', completedSession: data.session });
    } catch (error) {
        console.error('Error completing delivery session:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error });
    }
};

export const getHistoryByRider = (riderId) => async (dispatch) => {
    try {
        dispatch({ type: 'GET_HISTORY_BY_RIDER_REQUEST' });
        
        const token = await AsyncStorage.getItem('riderToken');
        const url = `${server}/delivery-session/rider/${riderId}`;
        
        console.log("Requesting URL:", url); 

        const { data } = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        console.log("History API Response:", JSON.stringify(data, null, 2));

        // Dispatch with the structure that your reducer expects
        dispatch({
            type: 'GET_HISTORY_BY_RIDER',
            sessions: data.sessions || [], // Use 'sessions' to match your reducer
        });

    } catch (error) {
        console.error('Error fetching history sessions:', error);
        dispatch({ 
            type: 'GET_HISTORY_BY_RIDER_FAILURE',
            payload: error.response?.data?.message || error.message 
        });
    }
};

export const submitProofDeliverySession = (id, orderId, proofOfDelivery) => async (dispatch) => {
    console.log("submitProofDeliverySession mobile");
    console.log("Proof of Delivery:", proofOfDelivery);
    console.log("Order ID:", orderId);

    try {
        const token = await AsyncStorage.getItem('riderToken');
        const route = `${server}delivery-session/${id}/proof`;

        console.log(`API Route: ${route}`);
        console.log("Payload being sent to the server:", { orderId, proofOfDelivery });

        const { data } = await axios.put(route, 
            { orderId, proofOfDelivery }, 
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        dispatch({
            type: 'SUBMIT_PROOF_DELIVERY',
            order: data.order, 
        });

        console.log('Proof of delivery submitted:', data);
    } catch (error) {
        // console.error('Error submitting proof of delivery:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error: error.response?.data?.message || error.message });

        if (error.response) {
            console.error('Error Response Data:', error.response.data);
        }
    }
};

export const getSessionByOrderId = (orderId) => async (dispatch) => {
    console.log("getSessionByOrderId it")
    try {
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${server}/delivery-session/order/${orderId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'GET_SESSION_BY_ORDER_ID',
            session: data.session,
        });

        // console.log('Fetched session by order ID:', data);
    } catch (error) {
        // console.error('Error fetching session by order ID:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error: error.response?.data?.message || error.message });
    }
};

export const cancelOrder = (sessionId, orderId) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem('riderToken');
        const { data } = await axios.put(`${server}/delivery-session/${sessionId}/cancel-order/${orderId}`, {}, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'CANCEL_ORDER',
            order: data.order,
        });

        console.log('Order cancelled:', data);
    } catch (error) {
        console.error('Error cancelling order:', error);
        dispatch({ type: 'DELIVERY_SESSION_ERROR', error: error.response?.data?.message || error.message });
    }
};


