const initialState = {
    pendingSessions: [],
    acceptedSession: null,
    declinedSession: null,
    startedSession: null,
    completedSession: null,
    ongoingSessions: [],
    error: null,
};

export const deliveryReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_SESSIONS_BY_RIDER':
            return {
                ...state,
                pendingSessions: action.pendingSessions,
                ongoingSessions: action.ongoingSessions,
                rejectedSessions: action.rejectedSessions,
            };
        case 'GET_PENDING_SESSIONS':
            return {
                ...state,
                pendingSessions: action.pendingSessions,
            };
        case 'ACCEPT_WORK':
            return {
                ...state,
                acceptedSession: action.acceptedSession,
            };
        case 'DECLINE_WORK':
            return {
                ...state,
                declinedSession: action.declinedSession,
            };
        case 'START_DELIVERY_SESSION':
            return {
                ...state,
                startedSession: action.startedSession,
            };
        case 'COMPLETE_DELIVERY_SESSION':
            return {
                ...state,
                completedSession: action.completedSession,
            };
        case 'DELIVERY_SESSION_ERROR':
            return {
                ...state,
                error: action.error,
            };
        default:
            return state;
    }
};
