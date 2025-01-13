import axios from 'axios';
import { server } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAllProducts = (keyword = "", category = "") => async (dispatch) => {
    try {
        dispatch({ type: "ALL_PRODUCTS_REQUEST" });


        const { data } = await axios.get(`${server}/product/all?keyword=${keyword}&category=${category}`);
        // console.log("product data:", data)
        dispatch({
            type: "ALL_PRODUCTS_SUCCESS",
            payload: data.products,
        });
    } catch (error) {
        // console.log("product data failed")
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
    // console.log("getProducts touched")
    try {
        // console.log("Fetching product details for ID:", id);  // Log the product ID
       
        dispatch({
            type: "getProductDetailsRequest",
        });


        // Fetch product details from the server
        const { data } = await axios.get(`${server}/product/details/${id}`, {
            withCredentials: true,
        });


        // console.log("Product details fetched:", data);  // Log the fetched data


        dispatch({
            type: "getProductDetailsSuccess",
            payload: data.product,
        });
    } catch (error) {
        // Log error to inspect what went wrong
        // console.error("Error fetching product details:", error);


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


        // console.log("Fetched products data:", data); // Log fetched data


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
    // console.log("update touched");
    try {
        dispatch({ type: "UPDATE_PRODUCT_REQUEST" });
        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.put(`${server}/product/update/${productData.id}`, productData);
        // console.log("update product: ", data);
    
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

    dispatch({ type: "NEW_PRODUCT_REQUEST" });

    const { data } = await axios.post(`${server}/product/new`, productData, 
    {
        headers: {  "Authorization": `Bearer ${token}` },       
        withCredentials: true,      
    }
    );
    // console.log("API response data:", data); // Log API response

    if (data && data.product) {
        dispatch({
        type: "NEW_PRODUCT_SUCCESS",
        payload: data.product, // Ensure this is the correct structure
        });
    } else {
        // console.error("API response does not contain product data:", data);
    }
};

export const newProduct = (productData) => async (dispatch) => {
    try {
        dispatch({ type: "NEW_PRODUCT_REQUEST" });

        // Retrieve token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        // console.log('Retrieved token:', token);

        if (!token) {
            throw new Error("User is not authenticated");
        }

        // Verify the user with the token
        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        // console.log("User data response:", userData);

        if (userData.success) {
            const userId = userData.user._id; // Extract user ID
            
            const productDataWithUser = { ...productData, user: userId };

            // Send the product data to the server
            const { data } = await axios.post(`${server}/product/new`, productDataWithUser, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // console.log("Product created successfully:", data);

            dispatch({
                type: "NEW_PRODUCT_SUCCESS",
                payload: data.product,
            });
        } else {
            dispatch({
                type: "NEW_PRODUCT_FAIL",
                payload: "Failed to load user data",
            });
        }
    } catch (error) {
        console.error("Error creating product:", error.response || error);
        dispatch({
            type: "NEW_PRODUCT_FAIL",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

export const deleteProduct = (id) => async (dispatch) => {
    try {
        dispatch({ type: "DELETE_PRODUCT_REQUEST" });

        // Retrieve token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        // console.log('Retrieved token:', token);

        if (!token) {
            throw new Error("User is not authenticated");
        }

        // Make the request to delete the product
        const { data } = await axios.delete(`${server}/product/delete/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        // console.log("Product deleted successfully:", data);

        // Dispatch success action with deleted product ID
        dispatch({
            type: "DELETE_PRODUCT_SUCCESS",
            payload: id,
        });

    } catch (error) {
        console.error("Error deleting product:", error.response || error);

        dispatch({
            type: "DELETE_PRODUCT_FAIL",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};



