import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import axios from "axios";

// Express interest in an event
// In your expressInterest function, send the userId in the request body explicitly:

// Fix the expressInterest function
export const expressInterest = (eventId) => async (dispatch) => {
    try {
        dispatch({ type: 'INTEREST_REQUEST' });

        // Retrieve token and userId from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        
        if (!token || !userId) {
            throw new Error('User is not authenticated');
        }

        // Fix the URL format by ensuring proper structure
        const url = `${server}/interested`.replace('//', '/').replace('http:/', 'http://');
        console.log('Request URL:', url);
        console.log('Request body:', { eventId, userId });

        // Send the userId explicitly in the request body
        const { data } = await axios.post(
            url,
            { 
                eventId,
                userId // Add userId explicitly here
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Interest response:', data);

        if (data.success) {
            dispatch({
                type: 'INTEREST_SUCCESS',
                payload: data,
            });

            Toast.show({
                type: 'success',
                text1: 'Interest expressed successfully!',
            });
            
            return data;
        } else {
            dispatch({
                type: 'INTEREST_FAIL',
                payload: data.message || 'Something went wrong.',
            });
            
            // Return data even if it's not successful
            return data;
        }
    } catch (error) {
        // console.error('Error expressing interest:', error.response || error);
        
        dispatch({
            type: 'INTEREST_FAIL',
            payload: error.response ? error.response.data.message : error.message,
        });
        
        throw error;
    }
};

// Get user interest for a specific event
// Update the getUserInterest function
export const getUserInterest = (eventId) => async (dispatch) => {
    console.log("get user interest");
    dispatch({ type: 'GET_INTEREST_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
            throw new Error('Authentication credentials are missing');
        }

        console.log("User ID:", userId);
        console.log("Event ID:", eventId);

        // Fix the URL format
        const route = `${server}/interested-attended/${userId}/${eventId}`
            .replace('//', '/')
            .replace('http:/', 'http://');
            
        console.log("Calling API route:", route);

        const { data } = await axios.get(route, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        
        console.log("API Response Data:", data);

        if (data) {
            dispatch({
                type: 'GET_INTEREST_SUCCESS',
                payload: data,
            });
            return data;
        } else {
            dispatch({
                type: 'GET_INTEREST_FAIL',
                payload: data.message || 'Something went wrong.',
            });

            return null;
        }
    } catch (error) {
        console.log("Error fetching user interest:", error.message);

        dispatch({
            type: 'GET_INTEREST_FAIL',
            payload: error.message || 'Server error',
        });

        return null;
    }
};

// Get all interested users for a specific event
export const getAllInterestedUsers = (eventId) => async (dispatch) => {
    dispatch({ type: 'GET_ALL_INTERESTED_USERS_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${server}/interested/${eventId}`.replace('//', '/'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        dispatch({
            type: 'GET_ALL_INTERESTED_USERS_SUCCESS',
            payload: data.interestedUsers,
        });
    } catch (error) {
        dispatch({
            type: 'GET_ALL_INTERESTED_USERS_FAIL',
            payload: error.response ? error.response.data.message : error.message,
        });

        Toast.show({
            type: 'error',
            text1: 'Error fetching interested users',
            text2: error.response ? error.response.data.message : error.message,
        });
    }
};

// Change attendance status for a user in an event
export const changeAttended = (userId, eventId) => async (dispatch) => {
    dispatch({ type: 'CHANGE_ATTENDED_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.put(`${server}/event/change-attendance`.replace('//', '/'), 
            { userId, eventId }, 
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            }
        );

        dispatch({
            type: 'CHANGE_ATTENDED_SUCCESS',
            payload: data.userInterest,
        });

        Toast.show({
            type: 'success',
            text1: 'Attendance status changed successfully',
        });
    } catch (error) {
        dispatch({
            type: 'CHANGE_ATTENDED_FAIL',
            payload: error.response ? error.response.data.message : error.message,
        });

        Toast.show({
            type: 'error',
            text1: 'Error changing attendance status',
            text2: error.response ? error.response.data.message : error.message,
        });
    }
};

// Get user interested and attended status for a specific event
export const getUserInterestedAndAttended = (userId, eventId) => async (dispatch) => {
    dispatch({ type: 'GET_USER_INTERESTED_ATTENDED_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${server}/interested-attended/${userId}/${eventId}`.replace('//', '/'), {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });

        dispatch({
            type: 'GET_USER_INTERESTED_ATTENDED_SUCCESS',
            payload: data,
        });
    } catch (error) {
        dispatch({
            type: 'GET_USER_INTERESTED_ATTENDED_FAIL',
            payload: error.response ? error.response.data.message : error.message,
        });

        Toast.show({
            type: 'error',
            text1: 'Error fetching user interest and attendance status',
            text2: error.response ? error.response.data.message : error.message,
        });
    }
};