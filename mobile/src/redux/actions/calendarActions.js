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
        // Dispatch the request action first
        dispatch({ type: "NEW_EVENT_REQUEST" });

        // Retrieve token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        console.log('Retrieved token:', token);

        if (!token) {
            throw new Error("User is not authenticated");
        }

        // Verify the user with the token
        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        console.log("User data response:", userData);

        if (userData.success) {
            const userId = userData.user._id; // Extract user ID
            console.log("User ID:", userId);

            // Include the user ID in the event data
            const eventDataWithUser = { ...eventData, user: userId };

            // Send the event data to the server
            const { data } = await axios.post(`${server}/calendar/event`, eventDataWithUser, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                withCredentials: true,
            });

            console.log("Event created successfully:", data);

            // Dispatch the success action with the response data
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
        // Detailed error logging
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("API Response Error:", {
                message: error.response.data?.message,
                status: error.response.status,
                headers: error.response.headers,
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from the API:", {
                request: error.request,
            });
        } else {
            // Something happened in setting up the request that triggered an error
            console.error("Request Setup Error:", error.message);
        }

        // Dispatch the failure action with the error message
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

export const deleteEvent = (eventId) => async (dispatch) => {
    console.log("deleteevent touched")
    try {
        dispatch({ type: 'DELETE_EVENT_REQUEST' }); // Indicate that the delete request is in progress

        // Make the API call to delete the event using the server constant
        const response = await axios.delete(`${server}/calendar/event/${eventId}`); // Using the 'server' URL as you requested

        // Dispatch success action and pass eventId to remove from state
        dispatch({
            type: 'DELETE_EVENT_SUCCESS',
            payload: eventId, // Pass the eventId to be removed from state
        });

        console.log("success")
    } catch (error) {
        dispatch({
            type: 'DELETE_EVENT_FAILURE',
            payload: error.response ? error.response.data.message : error.message, // Error handling
        });
    }
};