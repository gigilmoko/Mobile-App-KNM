const initialState = {
    totalPrice: 0,
    monthlyOrderTotal: [],
    totalCustomers: 0,
    totalProducts: 0,
    loading: false,
    error: null,
    nextThreeEvents: [],
    latestOrders: [],
};

export const dashboardReducer = (state = initialState, action) => {
    switch (action.type) {
        case "calculateTotalPriceRequest":
        case "getMonthlyOrderTotalRequest":
        case "getTotalCustomerRequest":
        case "getTotalProductsRequest":
        case "getNextThreeEventsRequest":
        case "getLatestOrdersRequest":
            return {
                ...state,
                loading: true,
            };
        case "calculateTotalPriceSuccess":
            return {
                ...state,
                loading: false,
                totalPrice: action.payload,
            };
        case "getMonthlyOrderTotalSuccess":
            return {
                ...state,
                loading: false,
                monthlyOrderTotal: action.payload,
            };
        case "getTotalCustomerSuccess":
            return {
                ...state,
                loading: false,
                totalCustomers: action.payload,
            };
        case "getTotalProductsSuccess":
            return {
                ...state,
                loading: false,
                totalProducts: action.payload,
            };
        case "getNextThreeEventsSuccess":
            return {
                ...state,
                loading: false,
                nextThreeEvents: action.payload,
            };
        case "getLatestOrdersSuccess":
            return {
                ...state,
                loading: false,
                latestOrders: action.payload,
            };
        case "calculateTotalPriceFail":
        case "getMonthlyOrderTotalFail":
        case "getTotalCustomerFail":
        case "getTotalProductsFail":
        case "getNextThreeEventsFail":
        case "getLatestOrdersFail":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};
