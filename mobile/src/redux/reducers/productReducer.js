const initialState = {
    products: [], // For all products
    product: {},  // For a single product's details
    loading: false,
    error: null,
    searchedProducts: [], // If you are also storing searched products
};

export const productReducer = (state = initialState, action) => {
    switch (action.type) {
        // Handling All Products
        case "ALL_PRODUCTS_REQUEST":
            return {
                ...state,
                loading: true,
            };
        case "ALL_PRODUCTS_SUCCESS":
            return {
                ...state,
                loading: false,
                products: action.payload,
            };
        case "ALL_PRODUCTS_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Handling Product Details
        case "getProductDetailsRequest":
            return {
                ...state,
                loading: true,
            };
        case "getProductDetailsSuccess":
            return {
                ...state,
                loading: false,
                product: action.payload, // Storing single product details
            };
        case "getProductDetailsFail":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Optional: Handling Searched Products
        case "searchProductsRequest":
            return {
                ...state,
                loading: true,
            };
        case "searchProductsSuccess":
            return {
                ...state,
                loading: false,
                searchedProducts: action.payload,
            };
        case "searchProductsFail":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Optional: Clearing Products
        case "CLEAR_PRODUCTS":
            return {
                ...state,
                products: [],
            };

        default:
            return state;
    }
};
