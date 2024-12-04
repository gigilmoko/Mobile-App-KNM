const initialState = {
    loading: false,
    feedbacks: [],
    error: null,
};

export const productFeedbackReducer = (state = initialState, action) => {
    switch (action.type) {
        case "submitProductFeedbackRequest":
            return {
                ...state,
                loading: true,
                error: null,
            };
        case "submitProductFeedbackSuccess":
            return {
                ...state,
                loading: false,
                feedback: action.payload,
                error: null,
            };
        case "submitProductFeedbackFail":
            return {
                ...state,
                loading: false,
                feedback: null,
                error: action.payload,
            };
        case "fetchProductFeedbacksRequest":
            return {
                ...state,
                loading: true,
                error: null,
            };
        case "fetchProductFeedbacksSuccess":
            // console.log("payload feedback:" ,action.payload)
            return {
                ...state,
                loading: false,
                feedbacks: action.payload, // Store the fetched feedbacks
                error: null,
            };
        case "fetchProductFeedbacksFail":
            return {
                ...state,
                loading: false,
                feedbacks: [],
                error: action.payload,
            };
        default:
            return state;
    }
};
