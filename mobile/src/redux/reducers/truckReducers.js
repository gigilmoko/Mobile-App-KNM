const initialState = {
    trucks: [],
    truck: null,
    orders: [],
    loading: false,
    error: null,
};

export const truckReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_TRUCKS_SUCCESS':
            return {
                ...state,
                trucks: action.payload,
                loading: false,
            };
        case 'GET_TRUCKS_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'GET_SINGLE_TRUCK_SUCCESS':
            return {
                ...state,
                truck: action.payload,
                loading: false,
            };
        case 'GET_SINGLE_TRUCK_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'NEW_TRUCK_SUCCESS':
            return {
                ...state,
                trucks: [...state.trucks, action.payload],
                loading: false,
            };
        case 'NEW_TRUCK_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'UPDATE_TRUCK_SUCCESS':
            return {
                ...state,
                trucks: state.trucks.map(truck =>
                    truck._id === action.payload._id ? action.payload : truck
                ),
                loading: false,
            };
        case 'UPDATE_TRUCK_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'DELETE_TRUCK_SUCCESS':
            return {
                ...state,
                trucks: state.trucks.filter(truck => truck._id !== action.payload),
                loading: false,
            };
        case 'DELETE_TRUCK_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'ASSIGN_RIDER_SUCCESS':
            return {
                ...state,
                truck: action.payload,
                loading: false,
            };
        case 'ASSIGN_RIDER_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'UNASSIGN_RIDER_SUCCESS':
            return {
                ...state,
                truck: action.payload,
                loading: false,
            };
        case 'UNASSIGN_RIDER_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'GET_TRUCK_ORDERS_SUCCESS':
            return {
                ...state,
                orders: action.payload,
                loading: false,
            };
        case 'GET_TRUCK_ORDERS_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'ADD_TRUCK_ORDER_SUCCESS':
            return {
                ...state,
                orders: [...state.orders, action.payload],
                loading: false,
            };
        case 'ADD_TRUCK_ORDER_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'REMOVE_SINGLE_TRUCK_ORDER_SUCCESS':
            return {
                ...state,
                orders: state.orders.filter(order => order._id !== action.payload),
                loading: false,
            };
        case 'REMOVE_SINGLE_TRUCK_ORDER_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'REMOVE_ALL_TRUCK_ORDERS_SUCCESS':
            return {
                ...state,
                orders: [],
                loading: false,
            };
        case 'REMOVE_ALL_TRUCK_ORDERS_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'ACCEPT_WORK_SUCCESS':
            return {
                ...state,
                truck: action.payload,
                loading: false,
            };
        case 'ACCEPT_WORK_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case 'DECLINE_WORK_SUCCESS':
            return {
                ...state,
                truck: action.payload,
                loading: false,
            };
        case 'DECLINE_WORK_FAIL':
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        default:
            return state;
    }
};