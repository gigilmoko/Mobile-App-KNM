const initialState = {
    event: null,                  // State for a single event
    events: [],                   // State for all events
    beforeCurrentDayEvents: [],   // Events before the current day
    afterCurrentDayEvents: [],    // Events after the current day
    loading: false,               // Loading state
    error: null,                  // Error state
};

const calendarReducer = (state = initialState, action) => {
    switch (action.type) {
        // Fetching a single event
        case "FETCH_EVENT_REQUEST":
            return { ...state, loading: true, error: null };
        case "FETCH_EVENT_SUCCESS":
            return { ...state, event: action.payload, loading: false, error: null };
        case "FETCH_EVENT_FAILURE":
            return { ...state, event: null, loading: false, error: action.payload };

        // Creating a new event
        case "NEW_EVENT_REQUEST":
            return { ...state, loading: true, success: false, error: null };
        case "NEW_EVENT_SUCCESS":
            return { ...state, loading: false, events: [...state.events, action.payload], success: true };
        case "NEW_EVENT_FAIL":
            return { ...state, loading: false, error: action.payload, success: false };

        // Updating an event
        case "UPDATE_EVENT_REQUEST":
            return { ...state, loading: true, success: false };
        case "UPDATE_EVENT_SUCCESS":
            return { ...state, loading: false, event: action.payload, success: true };
        case "UPDATE_EVENT_FAIL":
            return { ...state, loading: false, error: action.payload, success: false };

        // Fetching all events
        case "ALL_EVENTS_REQUEST":
            return { ...state, loading: true, error: null };
        case "ALL_EVENTS_SUCCESS":
            return { ...state, events: action.payload, loading: false, error: null };
        case "ALL_EVENTS_FAIL":
            return { ...state, events: [], loading: false, error: action.payload };

        // Fetching events before and after the current day
        case "FETCH_EVENTS_BEFORE_REQUEST":
        case "FETCH_EVENTS_AFTER_REQUEST":
            return { ...state, loading: true, error: null };
        case "FETCH_EVENTS_BEFORE_SUCCESS":
            return { ...state, beforeCurrentDayEvents: action.payload, loading: false, error: null };
        case "FETCH_EVENTS_AFTER_SUCCESS":
            return { ...state, afterCurrentDayEvents: action.payload, loading: false, error: null };
        case "FETCH_EVENTS_BEFORE_FAILURE":
        case "FETCH_EVENTS_AFTER_FAILURE":
            return { ...state, loading: false, error: action.payload };

        // Deleting an event
        case "DELETE_EVENT_REQUEST":
            return { ...state, loading: true, error: null };

        case "DELETE_EVENT_SUCCESS":
            return {
                ...state,
                loading: false,
                events: state.events.filter((event) => event._id !== action.payload),
            };

        case "DELETE_EVENT_FAILURE":
            return { ...state, loading: false, error: action.payload };

        default:
            return state;
    }
};

export default calendarReducer;
