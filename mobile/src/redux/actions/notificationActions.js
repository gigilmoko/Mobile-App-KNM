import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

const getNotificationsRequest = "getNotificationsRequest";
const getNotificationsSuccess = "getNotificationsSuccess";
const getNotificationsFail = "getNotificationsFail";

export const getNotifications = () => async (dispatch) => {
    try {
        // console.log("Dispatching getNotificationsRequest");
        dispatch({ type: getNotificationsRequest });

        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        // console.log("Token retrieved:", token);

        const { data } = await axios.get(`${server}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        // console.log("Notifications fetched:", data);

        const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        dispatch({ type: getNotificationsSuccess, payload: sortedNotifications });
    } catch (error) {
        const errorMessage = error.message || error.response?.data?.message || "Failed to fetch notifications";
        console.error("Error fetching notifications:", errorMessage);

        dispatch({
            type: getNotificationsFail,
            payload: errorMessage,
        });

        Toast.show({
            type: 'error',
            text1: 'Failed to load notifications',
            text2: errorMessage,
        });

        throw new Error(errorMessage);
    }
};

// Toggle notification read status
export const toggleNotificationReadStatus = (notifId) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem("token");
        const { data } = await axios.put(
            `${server}/notifications/${notifId}/toggleReadStatus`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        dispatch({ type: "toggleNotificationReadStatusSuccess", payload: data });
    } catch (error) {
        // console.log("Error toggling notification read status:", error.message);
        dispatch({
            type: "toggleNotificationReadStatusFail",
            payload: error.response?.data?.message || "Failed to toggle read status",
        });
        
    }
};

// Get count of unread notifications
export const getUnreadNotificationsCount = () => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem("token");


        const { data } = await axios.get(`${server}/notifications/unread-count`, {
            headers: { Authorization: `Bearer ${token}` },
        });


        dispatch({ type: "getUnreadNotificationsCountSuccess", payload: data.unreadCount });
    } catch (error) {
        dispatch({
            type: "getUnreadNotificationsCountFail",
            payload: error.response?.data?.message || "Failed to get unread notifications count",
        });
    }
};

// Delete a single notification
export const deleteNotification = (notifId) => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem("token");

        const { data } = await axios.delete(`${server}/notifications/${notifId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        dispatch({ type: "deleteNotificationSuccess", payload: notifId });
        Toast.show({
            type: 'success',
            text1: data.message,
        });
    } catch (error) {
        // console.log("Error deleting notification:", error.message);
        dispatch({
            type: "deleteNotificationFail",
            payload: error.response?.data?.message || "Failed to delete notification",
        });
        Toast.show({
            type: 'error',
            text1: 'Failed to delete notification',
            text2: error.message || 'Please try again',
        });
    }
};

// Delete all notifications for the user
export const deleteAllNotifications = () => async (dispatch) => {
    try {
        const token = await AsyncStorage.getItem("token");


        const { data } = await axios.delete(`${server}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });


        dispatch({ type: "deleteAllNotificationsSuccess" });
        Toast.show({
            type: 'success',
            text1: data.message,
        });
    } catch (error) {
        // console.log("Error deleting all notifications:", error.message);
        dispatch({
            type: "deleteAllNotificationsFail",
            payload: error.response?.data?.message || "Failed to delete all notifications",
        });
        Toast.show({
            type: 'error',
            text1: 'Failed to delete all notifications',
            text2: error.message || 'Please try again',
        });
    }
};

export const sendPushNotification = (pushData) => async (dispatch) => {
    dispatch({ type: "sendPushNotificationRequest" });

    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            throw new Error("No token found");
        }
        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        if (userData.success) {
            const userId = userData.user._id;
            const pushDataWithUser = { ...pushData, user: userId };

            console.log('Sending push notification with data:', pushDataWithUser);
            const { data } = await axios.post(
                `${server}/notifications/create`,
                pushDataWithUser,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            console.log('Push notification response:', data);
            dispatch({ type: "sendPushNotificationSuccess", payload: data });
            return data; // Return the response data
        } else {
            dispatch({
                type: "sendPushNotificationFail",
                payload: "Failed to load user data",
            });
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
        dispatch({
            type: "sendPushNotificationFail",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};
