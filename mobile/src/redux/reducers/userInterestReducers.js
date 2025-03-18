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

        case 'GET_ALL_INTERESTED_USERS_REQUEST':
        case 'CHANGE_ATTENDED_REQUEST':
        case 'GET_USER_INTERESTED_ATTENDED_REQUEST':
            return { ...state, loading: true };

        case 'GET_ALL_INTERESTED_USERS_SUCCESS':
            return { ...state, loading: false, success: true, interestData: action.payload };

        case 'CHANGE_ATTENDED_SUCCESS':
            return { ...state, loading: false, success: true, interestData: state.interestData.map(interest => 
                interest.userId === action.payload.userId ? action.payload : interest
            ) };

        case 'GET_USER_INTERESTED_ATTENDED_SUCCESS':
            return { ...state, loading: false, success: true, interestData: action.payload };

        case 'GET_ALL_INTERESTED_USERS_FAIL':
        case 'CHANGE_ATTENDED_FAIL':
        case 'GET_USER_INTERESTED_ATTENDED_FAIL':
            return { ...state, loading: false, success: false, error: action.payload };

        case 'CLEAR_INTEREST_DATA':
            return { ...state, interestData: [] };

        default:
            return state;
    }
};

export default userInterestReducers;
