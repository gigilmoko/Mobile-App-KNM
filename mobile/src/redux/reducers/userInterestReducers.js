const initialState = {
    loading: false,
    success: false,
    error: null,
    interestData: [],
};

export const userInterestReducers = (state = initialState, action) => {
    switch (action.type) {
        case 'INTEREST_REQUEST':
        case 'GET_INTEREST_REQUEST':
            return { ...state, loading: true };

        case 'INTEREST_SUCCESS':
        case 'GET_INTEREST_SUCCESS':
            console.log("Interest Data:", action.payload);
            return { ...state, loading: false, success: true, interestData: action.payload };

        case 'INTEREST_FAIL':
        case 'GET_INTEREST_FAIL':
            return { ...state, loading: false, success: false, error: action.payload };

        default:
            return state;
    }
};

export default userInterestReducers;
