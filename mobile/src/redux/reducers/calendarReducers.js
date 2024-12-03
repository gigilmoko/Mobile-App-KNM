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


        // Fetching all events
        case "ALL_EVENTS_REQUEST":
            return { ...state, loading: true, error: null };


        case "ALL_EVENTS_SUCCESS":
            console.log("Updating state with events:", action.payload);
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


        default:
            return state;
    }
};


export default calendarReducer;
