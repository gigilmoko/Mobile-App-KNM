import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { server } from '../store'; // Make sure to import your server config

// Submit Event Feedback Action
export const submitEventFeedback = (rating, description, eventId) => async (dispatch) => {
    // console.log("Submit Event touched")
  try {
    dispatch({ type: 'submitEventFeedbackRequest' });

    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem('token');
    // console.log("Retrieved Token:", token); // Log the token

    if (!token) {
      throw new Error('No token found');
    }

    // API call to get the user details from the /me endpoint
    const { data: userData } = await axios.get(`${server}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      withCredentials: true,
    });

    // console.log("User Data from /me:", userData); // Log the user data

    if (!userData || !userData.user || !userData.user._id) {
      throw new Error('User ID not found');
    }

    const userId = userData.user._id; // Use the '_id' field to get the user ID

    // Data to be submitted
    const eventFeedbackData = { rating, description, eventId, userId }; // Changed 'feedbackData' to 'eventFeedbackData'
    // console.log("Event Feedback Data to Submit:", eventFeedbackData); // Log the feedback data

    // API call to submit feedback
    const { data } = await axios.post(
      `${server}/event/feedback/new`, // Replace with the correct backend endpoint
      eventFeedbackData,  // Changed 'feedbackData' to 'eventFeedbackData'
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );

    // console.log("Response Data:", data); // Log the response data

    if (data.success) {
      dispatch({
        type: 'submitEventFeedbackSuccess',
        payload: data.data, // Assuming the feedback data is in 'data' field
      });
    } else {
      dispatch({
        type: 'submitEventFeedbackFail',
        payload: data.message || 'Failed to submit event feedback',
      });
    }
  } catch (error) {
    console.error("Error:", error.response?.data || error.message); // Log the error response
    dispatch({
      type: 'submitEventFeedbackFail',
      payload: error.response?.data.message || 'Network error',
    });
  }
};

export const fetchEventFeedback = (eventId) => async (dispatch) => {
    try {
      dispatch({ type: 'fetchEventFeedbackRequest' });
  
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      // console.log("Retrieved Token:", token); // Log the token
  
      if (!token) {
        throw new Error('No token found');
      }
  
      // API call to fetch all feedback for the specific event
      const { data } = await axios.get(`${server}/event/feedback/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        withCredentials: true,
      });
  
      // console.log("Response Data:", data); // Log the response data
  
      if (data.success) {
        dispatch({
          type: 'fetchEventFeedbackSuccess',
          payload: data.data, // Assuming the feedback data is in 'data' field
        });
      } else {
        dispatch({
          type: 'fetchEventFeedbackFail',
          payload: data.message || 'Failed to fetch event feedback',
        });
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message); // Log the error response
      dispatch({
        type: 'fetchEventFeedbackFail',
        payload: error.response?.data.message || 'Network error',
      });
    }
  };
