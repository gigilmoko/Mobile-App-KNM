const initialState = {
    loading: false,
    success: false,
    error: null,
    interestData: null,
  };
  
  export const userInterestReducers = (state = initialState, action) => {
    switch (action.type) {
        case 'INTEREST_REQUEST':
            return { ...state, loading: true };
        case 'INTEREST_SUCCESS':
            return { ...state, loading: false, success: true, interestData: action.payload };
        case 'INTEREST_FAIL':
            return { ...state, loading: false, success: false, error: action.payload };
  
        case 'GET_INTEREST_REQUEST':
            return { ...state, loading: true };
        case 'GET_INTEREST_SUCCESS':
            return { ...state, loading: false, success: true, interestData: action.payload };
        case 'GET_INTEREST_FAIL':
            return { ...state, loading: false, success: false, error: action.payload };
  
        default:
            return state;
    }
  };
  
  export default userInterestReducers;
  