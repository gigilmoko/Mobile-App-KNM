const initialState = {
    event: null,  // State for a single event
    beforeCurrentDayEvents: [],  // Initialize as empty array
    afterCurrentDayEvents: [],   // Initialize as empty array
    loading: false,
    error: null,
};


const calendarReducer = (state = initialState, action) => {
    switch (action.type) {
        // For fetching a single event
        case 'FETCH_EVENT_REQUEST':
            return { ...state, loading: true, error: null };
        
        case 'FETCH_EVENT_SUCCESS':
            return { ...state, event: action.payload, loading: false, error: null };
        
        case 'FETCH_EVENT_FAILURE':
            return { ...state, event: null, loading: false, error: action.payload };


        // For fetching events before and after the current day
        case 'FETCH_EVENTS_BEFORE_REQUEST':
            
        case 'FETCH_EVENTS_AFTER_REQUEST':
            return { ...state, loading: true, error: null };
        
        case 'FETCH_EVENTS_BEFORE_SUCCESS':
            return { ...state, beforeCurrentDayEvents: action.payload, loading: false, error: null };
        
        case 'FETCH_EVENTS_AFTER_SUCCESS':
            return { ...state, afterCurrentDayEvents: action.payload, loading: false, error: null };
        
        case 'FETCH_EVENTS_BEFORE_FAILURE':
        case 'FETCH_EVENTS_AFTER_FAILURE':
            return { ...state, error: action.payload, loading: false };


        default:
            return state;
    }
};


export default calendarReducer;
