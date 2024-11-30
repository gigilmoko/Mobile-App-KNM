import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// Express interest in an event
export const expressInterest = (eventId) => async (dispatch, getState) => {
    dispatch({ type: 'INTEREST_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        console.log('Retrieved Token:', token);

        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${server}/interested`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ eventId }),
        });

        const data = await response.json();
        console.log('Server Response:', data);

        if (response.ok) {
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
    } catch (error) {
        dispatch({
            type: 'INTEREST_FAIL',
            payload: error.message || 'Server error',
        });
        Toast.show({
            type: 'error',
            text1: 'Error expressing interest',
            text2: error.message || 'Please check your connection',
        });
    }
};

// Get user interest for a specific event
export const getUserInterest = (eventId) => async (dispatch, getState) => {
    dispatch({ type: 'GET_INTEREST_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        console.log('Retrieved Token:', token);

        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch(`${server}/interested/${eventId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log('Server Response for user interest:', data);

        if (response.ok) {
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
