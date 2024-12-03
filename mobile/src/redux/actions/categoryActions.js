import axios from 'axios';
import { server } from '../store';

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
export const createCategory = (categoryData) => async (dispatch) => {
    try {
        dispatch({ type: "NEW_CATEGORY_REQUEST" });

        const { data } = await axios.post(`${server}/category/new`, categoryData);
        dispatch({
            type: "NEW_CATEGORY_SUCCESS",
            payload: data.category,
        });
    } catch (error) {
        dispatch({
            type: "NEW_CATEGORY_FAIL",
            payload: error.response.data.message,
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
export const updateCategory = (id, categoryData) => async (dispatch) => {
    try {
        dispatch({ type: "UPDATE_CATEGORY_REQUEST" });

        const { data } = await axios.put(`${server}/category/update/${id}`, categoryData);
        dispatch({
            type: "UPDATE_CATEGORY_SUCCESS",
            payload: data.category,
        });
    } catch (error) {
        dispatch({
            type: "UPDATE_CATEGORY_FAIL",
            payload: error.response.data.message,
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
