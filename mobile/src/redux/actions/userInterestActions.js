import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from "axios";

// Express interest in an event
export const expressInterest = (eventId) => async (dispatch) => {
    try {
        dispatch({ type: 'INTEREST_REQUEST' });

        // Retrieve token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        // console.log('Retrieved Token:', token);

        // if (!token) {
        //     throw new Error('User is not authenticated');
        // }

        // Verify the user with the token
        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
        });

        // console.log("User data response:", userData);

        if (userData.success) {
            const userId = userData.user._id; // Extract user ID

            // Send the express interest request to the server
            const { data } = await axios.post(
                `${server}/interested`,
                { eventId, userId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            // console.log('Interest response:', data);

            if (data.success) {
                dispatch({
                    type: 'INTEREST_SUCCESS',
                    payload: data,
                });

                Toast.show({
                    type: 'success',
                    text1: 'Interest expressed successfully!',
                });
            } else {
                dispatch({
                    type: 'INTEREST_FAIL',
                    payload: data.message || 'Something went wrong.',
                });

                Toast.show({
                    type: 'error',
                    text1: 'Failed to express interest',
                    text2: data.message || 'Something went wrong.',
                });
            }
        } else {
            dispatch({
                type: 'INTEREST_FAIL',
                payload: 'Failed to load user data',
            });

            Toast.show({
                type: 'error',
                text1: 'Error loading user data',
                text2: 'Please try again later.',
            });
        }
    } catch (error) {
        console.error('Error expressing interest:', error.response || error);

        dispatch({
            type: 'INTEREST_FAIL',
            payload: error.response ? error.response.data.message : error.message,
        });

        Toast.show({
            type: 'error',
            text1: 'Error expressing interest',
            text2: error.response ? error.response.data.message : error.message,
        });
    }
};
// Get user interest for a specific event
export const getUserInterest = (eventId) => async (dispatch) => {
    console.log("get user interest");
    dispatch({ type: 'GET_INTEREST_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId'); // Get userId from AsyncStorage

        if (!token || !userId) {
            throw new Error('Authentication credentials are missing');
        }

        console.log("User ID:", userId);
        console.log("Event ID:", eventId);

        const route = `${server}interested-attended/${userId}/${eventId}`;
        console.log("Calling API route:", route);  // Log the route being called

        const { data } = await axios.get(route, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        console.log("API Response Data:", data);

        if (data) {
            dispatch({
                type: 'GET_INTEREST_SUCCESS',
                payload: data,
            });
        } else {
            dispatch({
                type: 'GET_INTEREST_FAIL',
                payload: data.message || 'Something went wrong.',
            });

            Toast.show({
                type: 'error',
                text1: 'Failed to fetch interest',
                text2: data.message || 'Something went wrong.',
            });
        }
    } catch (error) {
        console.log("Error fetching user interest:", error.message);

        dispatch({
            type: 'GET_INTEREST_FAIL',
            payload: error.message || 'Server error',
        });

        Toast.show({
            type: 'error',
            text1: 'Error fetching user interest',
            text2: error.message || 'Please check your connection',
        });
    }
};