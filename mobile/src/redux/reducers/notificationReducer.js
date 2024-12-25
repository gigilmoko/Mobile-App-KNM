const initialState = {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
};


export const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case "getNotificationsRequest":
            return { ...state, loading: true, error: null };
        case "getNotificationsSuccess":
            return { ...state, loading: false, notifications: action.payload };
        case "getNotificationsFail":
            return { ...state, loading: false, error: action.payload };

        case "sendPushNotificationRequest":
            return { ...state, loading: true };
        case "sendPushNotificationSuccess":
            return { ...state, loading: false, message: action.payload };
        case "sendPushNotificationFail":
            return { ...state, loading: false, error: action.payload };


        case "toggleNotificationReadStatusSuccess":
            return {
                ...state,
                notifications: state.notifications.map((notification) =>
                    notification._id === action.payload.id
                        ? { ...notification, read: !notification.read }
                        : notification
                ),
            };
        case "toggleNotificationReadStatusFail":
            return { ...state, error: action.payload };


        case "getUnreadNotificationsCountSuccess":
            return { ...state, unreadCount: action.payload, error: null };
        case "getUnreadNotificationsCountFail":
            return { ...state, error: action.payload };


        case "deleteNotificationSuccess":
            return {
                ...state,
                notifications: state.notifications.filter(
                    (notification) => notification._id !== action.payload
                ),
            };
        case "deleteNotificationFail":
            return { ...state, error: action.payload };


        case "deleteAllNotificationsSuccess":
            return { ...state, notifications: [], unreadCount: 0, error: null };
        case "deleteAllNotificationsFail":
            return { ...state, error: action.payload };


        default:
            return state;
    }
};
