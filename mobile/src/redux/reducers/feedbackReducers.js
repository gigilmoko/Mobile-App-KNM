const initialState = {
    feedbackData: null,
    loading: false,
    error: null,
};


const feedbackReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SUBMIT_FEEDBACK_REQUEST':
            return { ...state, loading: true, error: null };
    
    
        case 'SUBMIT_FEEDBACK_SUCCESS':
            return {
                ...state,
                loading: false,
                feedbackData: action.payload,
                error: null,
            };
    
    
        case 'SUBMIT_FEEDBACK_FAILURE':
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
    
    
        default:
            return state;
    }
};


export default feedbackReducer;
