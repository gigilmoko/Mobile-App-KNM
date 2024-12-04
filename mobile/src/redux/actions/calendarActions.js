import axios from 'axios';
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export const fetchEvent = (eventId) => async (dispatch) => {
    dispatch({ type: 'FETCH_EVENT_REQUEST' });


    try {
        const response = await axios.get(`${server}/calendar/event/${eventId}`);
       
        // Log the fetched data for debugging
        console.log("Fetched event data:", response.data);


        dispatch({
            type: 'FETCH_EVENT_SUCCESS',
            payload: response.data.data,  // Ensure the event data is correctly passed
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        dispatch({
            type: 'FETCH_EVENT_FAILURE',
            payload: 'Failed to fetch event',  // Ensure proper error message is passed
        });
    }
};

// Action to fetch events before the current day
export const fetchEventsBeforeCurrentDay = () => async (dispatch) => {
    dispatch({ type: 'FETCH_EVENTS_BEFORE_REQUEST' });


    try {
        const response = await axios.get(`${server}/calendar/events/before`);


        // Log the fetched data
        // console.log('Fetched events before current day:', response.data.data);


        dispatch({
            type: 'FETCH_EVENTS_BEFORE_SUCCESS',
            payload: response.data.data,  // Ensure payload contains the event data
        });
    } catch (error) {
        console.error('Error fetching events before current day:', error);
        dispatch({
            type: 'FETCH_EVENTS_BEFORE_FAILURE',
            payload: 'Failed to fetch events before current day',  // Error message
        });
    }
};

// Action to fetch events after the current day
export const fetchEventsAfterCurrentDay = () => async (dispatch) => {
    dispatch({ type: 'FETCH_EVENTS_AFTER_REQUEST' });


    try {
        const response = await axios.get(`${server}/calendar/events/after`);

        dispatch({
            type: 'FETCH_EVENTS_AFTER_SUCCESS',
            payload: response.data.data,  // Ensure payload contains the event data
        });
    } catch (error) {
        console.error('Error fetching events after current day:', error);
        dispatch({
            type: 'FETCH_EVENTS_AFTER_FAILURE',
            payload: 'Failed to fetch events after current day',  // Error message
        });
    }
};

export const getAllEvents = () => async (dispatch) => {
    try {
        dispatch({ type: "ALL_EVENTS_REQUEST" });


        const { data } = await axios.get(`${server}/calendar/events`);
        // console.log("events data: ",data)

        dispatch({
            type: "ALL_EVENTS_SUCCESS",
            payload: data.data,
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        dispatch({
            type: "ALL_EVENTS_FAIL",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

export const newEvent = (eventData) => async (dispatch) => {
    console.log("Data sent to newEvent action:", eventData);
    try {
        // Make the API call to create a new event
        const { data } = await axios.post('/calendar/event', eventData);

        // Dispatch the success action with the response data
        dispatch({
            type: "NEW_EVENT_SUCCESS",
            payload: data,
        });
    } catch (error) {
        console.error("Error in API call:", error); // Log error details
        dispatch({
            type: "NEW_EVENT_FAIL",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const updateEvent = (eventData) => async (dispatch) => {
    console.log("update event touched");
    try {
        dispatch({ type: "UPDATE_EVENT_REQUEST" });
    
        const { data } = await axios.put(`${server}/calendar/event/${eventData.id}`, eventData);
        console.log("update event: ", data);
    
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
        console.log("Fetching event details for ID:", id);  // Log the event ID
        
        dispatch({
            type: "FETCH_EVENT_REQUEST",
        });

        // Fetch event details from the server
        const { data } = await axios.get(`${server}/calendar/event/${id}`, {
            withCredentials: true,
        });

        console.log("Event details fetched:", data);  // Log the fetched data

        dispatch({
            type: "FETCH_EVENT_SUCCESS",
            payload: data.event,
        });
    } catch (error) {
        // Log error to inspect what went wrong
        console.error("Error fetching event details:", error);

        // Dispatch failure action with error message
        dispatch({
            type: "FETCH_EVENT_FAILURE",
            payload: error.response?.data?.message || error.message,
        });
    }
};