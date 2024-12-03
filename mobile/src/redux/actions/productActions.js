import axios from 'axios';
import { server } from '../store';

export const getAllProducts = (keyword = "", category = "") => async (dispatch) => {
    try {
        dispatch({ type: "ALL_PRODUCTS_REQUEST" });

        const { data } = await axios.get(`${server}/product/all?keyword=${keyword}&category=${category}`);
        console.log("product data:", data)
        dispatch({
            type: "ALL_PRODUCTS_SUCCESS",
            payload: data.products,
        });
    } catch (error) {
        console.log("product data failed")
        dispatch({
            type: "ALL_PRODUCTS_FAIL",
            payload: error.response.data.message,
        });
    }
};

export const getProductsByCategory = (categoryId) => async (dispatch) => {
    try {
        dispatch({ type: "ALL_PRODUCTS_REQUEST" });

        const { data } = await axios.get(`${server}/product/category/${categoryId}`);

        dispatch({
            type: "ALL_PRODUCTS_SUCCESS",
            payload: data.products,
        });
    } catch (error) {
        dispatch({
            type: "ALL_PRODUCTS_FAIL",
            payload: error.response.data.message,
        });
    }
};

export const getProductDetails = (id) => async (dispatch) => {
    try {
        console.log("Fetching product details for ID:", id);  // Log the product ID
        
        dispatch({
            type: "getProductDetailsRequest",
        });

        // Fetch product details from the server
        const { data } = await axios.get(`${server}/product/details/${id}`, {
            withCredentials: true,
        });

        console.log("Product details fetched:", data);  // Log the fetched data

        dispatch({
            type: "getProductDetailsSuccess",
            payload: data.product,
        });
    } catch (error) {
        // Log error to inspect what went wrong
        console.error("Error fetching product details:", error);

        // Dispatch failure action with error message
        dispatch({
            type: "getProductDetailsFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const searchProducts = (keyword) => async (dispatch) => {
    try {
        dispatch({ type: "searchProductsRequest" });

        const { data } = await axios.get(`${server}/product/search?keyword=${keyword}`, {
            withCredentials: true,
        });

        console.log("Fetched products data:", data); // Log fetched data

        dispatch({
            type: "searchProductsSuccess",
            payload: data.products,
        });
    } catch (error) {
        dispatch({
            type: "searchProductsFail",
            payload: error.response?.data?.message || error.message,
        });
    }
};

export const updateProduct = (productData) => async (dispatch) => {
    console.log("update touched");
    try {
      dispatch({ type: "UPDATE_PRODUCT_REQUEST" });
  
      const { data } = await axios.put(`${server}/product/update/${productData.id}`, productData);
      console.log("update product: ", data);
  
      dispatch({
        type: "UPDATE_PRODUCT_SUCCESS",
        payload: data.product,
      });
    } catch (error) {
      dispatch({
        type: "UPDATE_PRODUCT_FAIL",
        payload: error.response?.data?.message || error.message,
      });
    }
  };
  
  
  // New Product
  export const newProduct = (productData) => async (dispatch) => {
    console.log("Data sent to newProduct action:", productData);
    try {
      dispatch({ type: "NEW_PRODUCT_REQUEST" });
  
      const { data } = await axios.post(`${server}/product/new`, productData);
      console.log("API response data:", data); // Log API response
  
      if (data && data.product) {
        dispatch({
          type: "NEW_PRODUCT_SUCCESS",
          payload: data.product, // Ensure this is the correct structure
        });
      } else {
        console.error("API response does not contain product data:", data);
      }
    } catch (error) {
      console.error("Error in API call:", error); // Log error details
      dispatch({
        type: "NEW_PRODUCT_FAIL",
        payload: error.response?.data?.message || error.message,
      });
    }
  };
  


