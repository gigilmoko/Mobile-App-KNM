const initialState = {
    pendingSessions: [],
    acceptedSession: null,
    declinedSession: null,
    startedSession: null,
    completedSession: null,
    ongoingSessions: [],
    historySessions: [],  // New state property for session history
    sessionByOrderId: {}, // New state property for session by order ID with default value
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
        case 'GET_HISTORY_BY_RIDER':  // New case to handle session history
            return {
                ...state,
                historySessions: action.sessions,
            };
        case 'GET_SESSION_BY_ORDER_ID': // New case to handle session by order ID
            return {
                ...state,
                sessionByOrderId: action.session,
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
      
        case 'SUBMIT_PROOF_DELIVERY':
            return {
                ...state,
                ongoingSessions: state.ongoingSessions.map(session => ({
                    ...session,
                    orders: session.orders.map(order => {
                        // Find the updated order and replace it
                        const updatedOrder = action.orders.find(updated => updated._id === order._id);
                        return updatedOrder ? updatedOrder : order;
                    })
                })),
            };
        
        case 'CANCEL_ORDER':
            return {
                ...state,
                ongoingSessions: state.ongoingSessions.map(session => ({
                    ...session,
                    orders: session.orders.map(order => 
                        order._id === action.order._id ? { ...order, status: 'Cancelled' } : order
                    )
                })),
            };

        default:
        return state;
    }
};
