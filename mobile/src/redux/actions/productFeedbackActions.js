import axios from 'axios';
import { server } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const submitProductFeedback = (rating, feedback, orderId, productId) => async (dispatch) => {
    try {
        dispatch({ type: "submitProductFeedbackRequest" });

        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        // console.log("Retrieved Token:", token); // Log the token

        // API call to get the user details from the /me endpoint
        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers to authenticate the request
            },
            withCredentials: true,
        });

        // console.log("User Data from /me:", userData); // Log the user data

        if (!userData || !userData.user || !userData.user._id) {
            throw new Error('User ID not found');
        }

        const userId = userData.user._id; // Use the '_id' field to get the user ID

        // Adjusted logic to get the correct orderId and productId
        // Get the orderId (_id from the order data)
        const correctOrderId = orderId; // This should be the _id from the order, you can fetch it if needed.
        
        // Get the productId from the orderItems array (product field in orderItems)
        const correctProductId = productId; // This should be the `product` field inside the `orderItems` array.

        const feedbackData = { rating, feedback, productId: correctProductId, orderId: correctOrderId, userId };
        // console.log("Feedback Data to Submit:", feedbackData); // Log the feedback data

        // API call to submit feedback
        const { data } = await axios.post(
            `${server}/feedback/product/new`, // Backend endpoint to submit feedback
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
        // console.error("Error:", error.response?.data || error.message); // Log the error response
        dispatch({
            type: "submitProductFeedbackFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};

export const fetchProductFeedbacks = (productId) => async (dispatch) => {
    try {
        dispatch({ type: "fetchProductFeedbacksRequest" });

        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        // console.log("Retrieved Token:", token); // Log the token

        // API call to get the product feedbacks
        const { data } = await axios.get(`${server}/feedback/product/${productId}`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers to authenticate the request
            },
            withCredentials: true,
        });

        // console.log("Product Feedbacks Data:", data); // Log the feedback data

        if (data.success) {
            dispatch({
                type: "fetchProductFeedbacksSuccess",
                payload: data.feedbacks, // Return the feedbacks from the response
            });
        } else {
            dispatch({
                type: "fetchProductFeedbacksFail",
                payload: data.message || "Failed to fetch feedbacks",
            });
        }
    } catch (error) {
        console.error("Error:", error.response?.data || error.message); // Log the error response
        dispatch({
            type: "fetchProductFeedbacksFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};





