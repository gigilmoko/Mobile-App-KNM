import { store } from "../src/redux/store"; // Import the Redux store
import Toast from "react-native-toast-message"; // Import Toast for notifications

export const notifyEvent = (event) => {
    // console.log("Displaying toast for event:", event); // Log event to verify
    const { title, description } = event; // Ensure data is correct and show the toast
    Toast.show({
        type: "info",
        text1: `Upcoming Event: ${title}`, // Corrected to use backticks for string interpolation
        text2: description || "Check it out now!", // Fallback if no description
    });
};

let previousNotifications = []; // To keep track of the last state

export const monitorNotifications = () => {
    store.subscribe(() => {
        const state = store.getState();
        const currentNotifications = state.notifications.notifications;

        // Ensure notifications are sorted by creation date (newest first)
        const sortedNotifications = currentNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const newestUnread = sortedNotifications.find(notification => !notification.read);

        // Find new notifications (those not in previousNotifications)
        const newNotifications = sortedNotifications.filter((notification) => {
            // Check if the notification is not in previousNotifications based on ID or timestamp
            return !previousNotifications.some(
                (prev) => prev._id === notification._id || prev.createdAt === notification.createdAt
            );
        });

        // If there are new notifications, trigger a toast for each one
        if (newNotifications.length > 0) {
            newNotifications.forEach((notification) => {
                notifyEvent(notification); // Display the toast for the new notification
                // console.log("New notification:", notification); // Debug log
            });
        }

        // Update previousNotifications to the current state after processing
        previousNotifications = [...sortedNotifications]; // Update to latest state
    });
};
