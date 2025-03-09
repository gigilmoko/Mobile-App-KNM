import axios from 'axios';
import { server } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const submitProductFeedback = (rating, feedback, orderId, productId) => async (dispatch) => {
    try {
        dispatch({ type: "submitProductFeedbackRequest" });

        const token = await AsyncStorage.getItem('token');

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
        const correctOrderId = orderId; 
        const correctProductId = productId; 
        const feedbackData = { rating, feedback, productId: correctProductId, orderId: correctOrderId, userId };

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
            dispatch({
                type: "submitProductFeedbackSuccess",
                payload: data.feedback,
            });
        } else {
            dispatch({
                type: "submitProductFeedbackFail",
                payload: data.message || "Failed to submit feedback",
            });
        }
    } catch (error) {
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





