const initialState = {
    products: [], // For all products
    product: {},  // For a single product's details
    searchedProducts: [], // For searched products
    loading: false,
    error: null,
    success: false, // To handle success of new or updated product
};


export const productReducer = (state = initialState, action) => {
    // console.log("action in reducer: ", action); // Log the action to see what type and payload it contains
 
    switch (action.type) {
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
          product: action.payload,
        };
      case "getProductDetailsFail":
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
 
      // Handling Update Product
      case "UPDATE_PRODUCT_REQUEST":
        return {
          ...state,
          loading: true,
          success: false,
        };
      case "UPDATE_PRODUCT_SUCCESS":
        return {
          ...state,
          loading: false,
          product: action.payload,
          success: true,
        };
      case "UPDATE_PRODUCT_FAIL":
        return {
          ...state,
          loading: false,
          error: action.payload,
          success: false,
        };
 
      // Handling New Product
      case "NEW_PRODUCT_REQUEST":
        return {
          ...state,
          loading: true,
          success: false,
        };
        case "NEW_PRODUCT_SUCCESS":
            console.log("New product payload received in reducer:", action.payload);
            return {
              ...state,
              loading: false,
              products: [...state.products, action.payload],
              success: true,
            };
         
      case "NEW_PRODUCT_FAIL":
        return {
          ...state,
          loading: false,
          error: action.payload,
          success: false,
        };
 
      // Handling Searched Products
      case "SEARCH_PRODUCTS_REQUEST":
        return {
          ...state,
          loading: true,
        };
      case "SEARCH_PRODUCTS_SUCCESS":
        return {
          ...state,
          loading: false,
          searchedProducts: action.payload,
        };
      case "SEARCH_PRODUCTS_FAIL":
        return {
          ...state,
          loading: false,
          error: action.payload,
          searchedProducts: [],
        };
 
      default:
        return state;
    }
  };
