const initialState = {
    categories: [], // For all categories
    category: {},   // For a single category's details
    loading: false,
    error: null,
    success: false, // To handle success of new or updated category
};

export const categoryReducer = (state = initialState, action) => {
    switch (action.type) {
        // Handling All Categories
        case "ALL_CATEGORIES_REQUEST":
            return {
                ...state,
                loading: true,
            };
        case "ALL_CATEGORIES_SUCCESS":
            return {
                ...state,
                loading: false,
                categories: action.payload,
            };
        case "ALL_CATEGORIES_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Handling Single Category
        case "GET_CATEGORY_REQUEST":
            return {
                ...state,
                loading: true,
            };
        case "GET_CATEGORY_SUCCESS":
            return {
                ...state,
                loading: false,
                category: action.payload, // Storing single category details
            };
        case "GET_CATEGORY_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Handling Update Category
        case "UPDATE_CATEGORY_REQUEST":
            return {
                ...state,
                loading: true,
                success: false,
            };
        case "UPDATE_CATEGORY_SUCCESS":
            return {
                ...state,
                loading: false,
                category: action.payload, // Updated category data
                success: true,
            };
        case "UPDATE_CATEGORY_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false,
            };

        // Handling New Category
        case "NEW_CATEGORY_REQUEST":
            return {
                ...state,
                loading: true,
                success: false,
            };
        case "NEW_CATEGORY_SUCCESS":
            return {
                ...state,
                loading: false,
                categories: [...state.categories, action.payload], // Adding the new category to the list
                success: true,
            };
        case "NEW_CATEGORY_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
                success: false,
            };

        // Handling Delete Category
        case "DELETE_CATEGORY_REQUEST":
            return {
                ...state,
                loading: true,
            };
        case "DELETE_CATEGORY_SUCCESS":
            return {
                ...state,
                loading: false,
                categories: state.categories.filter(
                    (category) => category._id !== action.payload
                ),
            };
        case "DELETE_CATEGORY_FAIL":
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
