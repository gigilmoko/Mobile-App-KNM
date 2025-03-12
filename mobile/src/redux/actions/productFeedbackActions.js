import axios from 'axios';
import { server } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const submitProductFeedback = (rating, feedback, orderId, productId) => async (dispatch) => {
    try {
        dispatch({ type: "submitProductFeedbackRequest" });

        const token = await AsyncStorage.getItem('token');
        // console.log("Token retrieved:", token);

        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`, 
            },
            withCredentials: true,
        });

        if (!userData || !userData.user || !userData.user._id) {
            throw new Error('User ID not found');
        }

        const userId = userData.user._id;
        // console.log("User ID retrieved:", userId);

        const feedbackData = { rating, feedback, productId, orderId, userId };
        // console.log("Feedback data being sent:", feedbackData);

        const { data } = await axios.post(
            `${server}/feedback/product/new`,
            feedbackData,
            {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        if (data.success) {
            // console.log("Feedback submission successful:", data.feedback);
            dispatch({
                type: "submitProductFeedbackSuccess",
                payload: data.feedback,
            });
        } else {
            // console.log("Feedback submission failed:", data.message);
            dispatch({
                type: "submitProductFeedbackFail",
                payload: data.message || "Failed to submit feedback",
            });
        }
    } catch (error) {
        // console.log("Error submitting feedback:", error.response?.data.message || error.message);
        dispatch({
            type: "submitProductFeedbackFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};

export const fetchProductFeedbacks = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "fetchProductFeedbacksRequest" });
        const token = await AsyncStorage.getItem('token');

        const { data } = await axios.get(`${server}/feedback/product/${productId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        if (data.success) {
            dispatch({
                type: "fetchProductFeedbacksSuccess",
                payload: data.feedbacks,
            });
        } else {
            dispatch({
                type: "fetchProductFeedbacksFail",
                payload: data.message || "Failed to fetch feedbacks",
            });
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message); 
        dispatch({
            type: "fetchProductFeedbacksFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};

export const fetchProductFeedbacksMobile = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "fetchProductFeedbacksRequest" });
        const token = await AsyncStorage.getItem('token');

        const { data } = await axios.get(`${server}/feedback/product/${productId}/mobile`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        if (data.success) {
            dispatch({
                type: "fetchProductFeedbacksSuccess",
                payload: data.feedbacks,
            });
        } else {
            dispatch({
                type: "fetchProductFeedbacksFail",
                payload: data.message || "Failed to fetch feedbacks",
            });
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message); 
        dispatch({
            type: "fetchProductFeedbacksFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};

export const getAverageProductRating = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "getAverageProductRatingRequest" });

        const { data } = await axios.get(`${server}/feedback/average/product/${productId}`, {
            withCredentials: true,
        });

        dispatch({
            type: "getAverageProductRatingSuccess",
            payload: data.averageRating,
            productId, // Ensure productId is included in the action
        });
    } catch (error) {
        dispatch({
            type: "getAverageProductRatingFail",
            payload: error.response?.data.message || error.message,
        });
    }
};





