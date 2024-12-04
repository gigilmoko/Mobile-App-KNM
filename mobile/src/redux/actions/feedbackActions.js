import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadUser } from './userActions'; // Import the loadUser action
import { server } from "../store"


export const submitFeedback = (rating, feedback) => async (dispatch) => {
    try {
        dispatch({ type: "submitFeedbackRequest" });


        // Load user data to get user ID
        await dispatch(loadUser());


        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        // console.log("Retrieved Token:", token); // Log the token


        const feedbackData = { rating, feedback };
        // console.log("Feedback Data to Submit:", feedbackData); // Log the feedback data


        const { data } = await axios.post(
            `${server}/feedback/new`,
            feedbackData,
            {
                headers: {
                    "Authorization": `Bearer ${token}`, // Send token in the headers
                },
                withCredentials: true,
            }
        );


        // console.log("Response Data:", data); // Log the response data


        if (data.success) {
            dispatch({
                type: "submitFeedbackSuccess",
                payload: data.feedback,
            });
        } else {
            dispatch({
                type: "submitFeedbackFail",
                payload: "Failed to submit feedback",
            });
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message); // Log the error response
        dispatch({
            type: "submitFeedbackFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};


