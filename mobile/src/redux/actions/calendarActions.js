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


        // Log the fetched data
        // console.log('Fetched events after current day:', response.data.data);


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
