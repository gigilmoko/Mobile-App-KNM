import { server } from "../store"
import axios from "axios"

export const getAllProducts = (keyword, category) => async (dispatch) => {
    
    try {
        dispatch({
            type: "getAllProductsRequest",
        });

        // Axios request

        const { data } = await axios
            .get(`${server}/product/all?keyword=${keyword}&category=${category}`,
        
            {
                withCredentials: true
            })

        dispatch({
            type: "getAllProductsSuccess",
            payload: data.products
        })

    } catch (error) {
        
        dispatch({
            type: "getAllProductsFail",
            payload: error.response.data.message
        })
    }

}

export const getProductDetails = (id) => async (dispatch) => {
    try {
        dispatch({
            type: "getProductDetailsRequest",
        });

        const { data } = await axios.get(`${server}/product/details/${id}`, {
            withCredentials: true,
        });

        dispatch({
            type: "getProductDetailsSuccess",
            payload: data.product,
        });
    } catch (error) {
        dispatch({
            type: "getProductDetailsFail",
            payload: error.response?.data?.message || error.message,
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
