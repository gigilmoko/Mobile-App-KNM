import axios from 'axios';
import { server } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get all categories
export const getAllCategories = () => async (dispatch) => {
    try {
        dispatch({ type: "ALL_CATEGORIES_REQUEST" });

        const { data } = await axios.get(`${server}/category/all`);
        console.log("data of category:", data)
        dispatch({
            type: "ALL_CATEGORIES_SUCCESS",
            payload: data.categories,
        });
    } catch (error) {
        dispatch({
            type: "ALL_CATEGORIES_FAIL",
            payload: error.response.data.message,
        });
    }
};

// Create a new category
export const createCategory = (categoryData) => async (dispatch, getState) => {
    try {
        dispatch({ type: "NEW_CATEGORY_REQUEST" });

        // Retrieve token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        console.log('Retrieved token:', token);

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

        console.log("User data response:", userData);

        if (userData.success) {
            const userId = userData.user._id; // Extract user ID
            console.log("User ID:", userId);

            // Include the user ID in the category data
            const categoryDataWithUser = { ...categoryData, user: userId };

            // Send the category data to the server
            const { data } = await axios.post(`${server}/category/new`, categoryDataWithUser, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                withCredentials: true,
            });

            console.log("Category created successfully:", data);

            dispatch({
                type: "NEW_CATEGORY_SUCCESS",
                payload: data.category,
            });
        } else {
            dispatch({
                type: "NEW_CATEGORY_FAIL",
                payload: "Failed to load user data",
            });
        }
    } catch (error) {
        console.error("Error creating category:", error.response || error);
        dispatch({
            type: "NEW_CATEGORY_FAIL",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

// Get a single category by ID
export const getSingleCategory = (id) => async (dispatch) => {
    try {
        dispatch({ type: "GET_CATEGORY_REQUEST" });

        const { data } = await axios.get(`${server}/category/${id}`);
        dispatch({
            type: "GET_CATEGORY_SUCCESS",
            payload: data.category,
        });
    } catch (error) {
        dispatch({
            type: "GET_CATEGORY_FAIL",
            payload: error.response.data.message,
        });
    }
};

// Update a category
export const updateCategory = (categoryData) => async (dispatch) => {
    try {
        dispatch({ type: "UPDATE_CATEGORY_REQUEST" });

        // Fetch user by token
        const token = await AsyncStorage.getItem('token');
        console.log('Retrieved token:', token);

        if (!token) {
            throw new Error("User is not authenticated");
        }

        const { data: userData } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        console.log("User data response:", userData);

        if (!userData.success) {
            throw new Error("Failed to load user data");
        }

        const userId = userData.user._id; // Accessing the user ID
        console.log("userId: ", userId);

        // Add the userId to the categoryData (if required for the update)
        const categoryDataWithUser = { ...categoryData, user: userId };

        // Log the data being sent to the server
        console.log("Category data being sent to server:", categoryDataWithUser);

        // Ensure the categoryId is passed in the URL and not in the body
        const { data } = await axios.put(`${server}/category/update/${categoryDataWithUser._id}`, categoryDataWithUser, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            withCredentials: true,
        });

        console.log("Update response data:", data);

        dispatch({
            type: "UPDATE_CATEGORY_SUCCESS",
            payload: data.category,
        });
    } catch (error) {
        // Log the error response
        console.error("Error updating category:", error);
        console.error("Error response data:", error.response?.data);

        dispatch({
            type: "UPDATE_CATEGORY_FAIL",
            payload: error.response ? error.response.data.message : error.message,
        });
    }
};

// Delete a category
export const deleteCategory = (id) => async (dispatch) => {
    try {
        dispatch({ type: "DELETE_CATEGORY_REQUEST" });

        const { data } = await axios.delete(`${server}/category/delete/${id}`);
        dispatch({
            type: "DELETE_CATEGORY_SUCCESS",
            payload: id,
        });
    } catch (error) {
        dispatch({
            type: "DELETE_CATEGORY_FAIL",
            payload: error.response.data.message,
        });
    }
};
