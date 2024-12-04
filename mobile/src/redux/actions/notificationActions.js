import axios from "axios";
import { server } from "../store";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { notifyEvent } from '../../../utils/NotificationService';

// Fetch notifications
// export const getNotifications = () => async (dispatch) => {
//     try {
//         dispatch({ type: "getNotificationsRequest" });
//         const token = await AsyncStorage.getItem("token");


//         const { data } = await axios.get(`${server}/notifications`, {
//             headers: { Authorization: `Bearer ${token}` },
//         });


//         // console.log("Fetched notifications:", JSON.stringify(data, null, 2));
//         dispatch({ type: "getNotificationsSuccess", payload: data });
//     } catch (error) {
//         console.log("Error fetching notifications:", error.message);
//         dispatch({
//             type: "getNotificationsFail",
//             payload: error.response?.data?.message || "Failed to fetch notifications",
//         });
//         Toast.show({
//             type: 'error',
//             text1: 'Failed to load notifications',
//             text2: error.message || 'Please check your connection',
//         });
//     }
// };

export const getNotifications = () => async (dispatch) => {
    try {
        dispatch({ type: "getNotificationsRequest" });
        const token = await AsyncStorage.getItem("token");




        const { data } = await axios.get(`${server}/notifications`, {
            headers: { Authorization: `Bearer ${token}` },
        });




        // console.log("Fetched notifications:", JSON.stringify(data, null, 2));
        dispatch({ type: "getNotificationsSuccess", payload: data });


       // Sort notifications by creation date
    const sortedNotifications = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    // console.log("Sorted Notifications:", sortedNotifications);


    // Find the newest unread notification
    const newestUnread = sortedNotifications.find(notification => !notification.read);
    console.log("Newest Unread Notification:", newestUnread);


    // Trigger toast only if it's an event notification
    if (newestUnread && newestUnread.type === 'event') {
      // Ensure we pass the correct fields for the toast
        notifyEvent({
            title: newestUnread.event?.title || 'Upcoming Event',
            description: newestUnread.event?.description || 'Stay tuned for details!',
        });
    }


    } catch (error) {
        console.log("Error fetching notifications:", error.message);
        dispatch({
            type: "getNotificationsFail",
            payload: error.response?.data?.message || "Failed to fetch notifications",
        });
        Toast.show({
            type: 'error',
            text1: 'Failed to load notifications',
            text2: error.message || 'Please check your connection',
        });
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
        console.log("Error toggling notification read status:", error.message);
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
        console.log("Error getting unread notifications count:", error.message);
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
        console.log("Error deleting notification:", error.message);
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
        console.log("Error deleting all notifications:", error.message);
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
