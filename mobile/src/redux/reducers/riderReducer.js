const initialState = {
  riders: [],
  rider: null,
  token: null,
  pendingTruck: null, // Add a new state field for the pending truck
  loading: false, // Track the loading state
  error: null, // Track errors
};

export const riderReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_RIDERS":
      return { ...state, riders: action.payload.riders };
    case "NEW_RIDER":
      return { ...state, riders: [...state.riders, action.payload.rider] };
    case "GET_SINGLE_RIDER":
      return { ...state, rider: action.payload.rider };
    case "UPDATE_RIDER":
      return {
        ...state,
        riders: state.riders.map((r) =>
          r._id === action.payload.rider._id ? action.payload.rider : r
        ),
      };
    case "DELETE_RIDER":
      return {
        ...state,
        riders: state.riders.filter((r) => r._id !== action.payload),
      };
    case "RIDER_LOGIN":
      return { ...state, token: action.payload.token, rider: action.payload.rider };
    case "RIDER_LOGOUT":
      return { ...state, token: null, rider: null };
    case "RIDER_PROFILE":
      return { ...state, rider: action.payload.rider };
    case "UPDATE_PASSWORD":
      return { ...state, rider: { ...state.rider, ...action.payload } };
    case "GET_PENDING_TRUCK_REQUEST":
      return { ...state, loading: true, error: null };
    case "GET_PENDING_TRUCK_SUCCESS":
      return { ...state, loading: false, pendingTruck: action.payload };
    case "GET_PENDING_TRUCK_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
