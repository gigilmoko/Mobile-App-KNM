import axios from 'axios';
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const fetchEvent = (eventId) => async (dispatch) => {
    dispatch({ type: 'FETCH_EVENT_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${server}/calendar/event/${eventId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'FETCH_EVENT_SUCCESS',
            payload: response.data.data,
        });
    } catch (error) {
        dispatch({
            type: 'FETCH_EVENT_FAILURE',
            payload: 'Failed to fetch event',
        });
    }
};

export const fetchEventsBeforeCurrentDay = () => async (dispatch) => {
    dispatch({ type: 'FETCH_EVENTS_BEFORE_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${server}/calendar/events/before`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'FETCH_EVENTS_BEFORE_SUCCESS',
            payload: response.data.data,
        });
    } catch (error) {
        dispatch({
            type: 'FETCH_EVENTS_BEFORE_FAILURE',
            payload: 'Failed to fetch events before current day',
        });
    }
};

export const fetchEventsAfterCurrentDay = () => async (dispatch) => {
    dispatch({ type: 'FETCH_EVENTS_AFTER_REQUEST' });

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(`${server}/calendar/events/after`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'FETCH_EVENTS_AFTER_SUCCESS',
            payload: response.data.data,
        });
    } catch (error) {
        dispatch({
            type: 'FETCH_EVENTS_AFTER_FAILURE',
            payload: 'Failed to fetch events after current day',
        });
    }
};

export const getAllEvents = () => async (dispatch) => {
    try {
        dispatch({ type: "ALL_EVENTS_REQUEST" });

        const { data } = await axios.get(`${server}/calendar/events`);

        dispatch({
            type: "ALL_EVENTS_SUCCESS",
            payload: data.data,
        });
    } catch (error) {
        dispatch({
            type: "ALL_EVENTS_FAIL",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

export const newEvent = (eventData) => async (dispatch) => {
    try {
        dispatch({ type: "NEW_EVENT_REQUEST" });

        const token = await AsyncStorage.getItem('token');

        if (!token) {
            throw new Error("User is not authenticated");
        }

        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        if (userData.success) {
            const userId = userData.user._id;

            const eventDataWithUser = { ...eventData, user: userId };

            const { data } = await axios.post(`${server}/calendar/event`, eventDataWithUser, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                withCredentials: true,
            });

            dispatch({
                type: "NEW_EVENT_SUCCESS",
                payload: data.event,
            });
        } else {
            dispatch({
                type: "NEW_EVENT_FAIL",
                payload: "Failed to load user data",
            });
        }
    } catch (error) {
        dispatch({
            type: "NEW_EVENT_FAIL",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const updateEvent = (eventData) => async (dispatch) => {
    try {
        dispatch({ type: "UPDATE_EVENT_REQUEST" });
    
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.put(`${server}/calendar/event/${eventData.id}`, eventData, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });
    
        dispatch({
            type: "UPDATE_EVENT_SUCCESS",
            payload: data.event,
        });
    } catch (error) {
        dispatch({
            type: "UPDATE_EVENT_FAIL",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const getEventDetails = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "FETCH_EVENT_REQUEST",
        });

        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${server}/calendar/event/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: "FETCH_EVENT_SUCCESS",
            payload: data.event,
        });
    } catch (error) {
        dispatch({
            type: "FETCH_EVENT_FAILURE",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const deleteEvent = (eventId) => async (dispatch) => {
    try {
        dispatch({ type: 'DELETE_EVENT_REQUEST' });

        const token = await AsyncStorage.getItem('token');
        const response = await axios.delete(`${server}/calendar/event/${eventId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        dispatch({
            type: 'DELETE_EVENT_SUCCESS',
            payload: eventId,
        });
    } catch (error) {
        dispatch({
            type: 'DELETE_EVENT_FAILURE',
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};