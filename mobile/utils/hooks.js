import axios from "axios";
import { useEffect, useState } from "react";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../src/redux/actions/userActions";
import { server } from "../src/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const useMessageAndErrorUser = (navigation, dispatch, navigateTo = "myaccount") => {
    const { loading, message, error, isAuthenticated } = useSelector((state) => state.user || {});

    useEffect(() => {
        if (error) {
            Toast.show({
                type: "error",
                text1: error,
            });
            dispatch({ type: "clearError" });
        }

        if (message && isAuthenticated) {
            Toast.show({
                type: "success",
                text1: message,
            });

            // Delay the navigation by 2 seconds (2000 milliseconds)
            setTimeout(() => {
                // console.log("Navigating to:", navigateTo);
                navigation.navigate(navigateTo); // Ensure this points to "myaccount"

                dispatch({ type: "clearMessage" });
            }, 500);  // 2-second delay for the toast to be shown
        }
    }, [error, message, isAuthenticated, dispatch, navigation, navigateTo]);

    return loading;  // Returning loading to track in your components
};

export const useMessageAndErrorOther = (
    dispatch,
    navigation,
    navigateTo,
    func
) => {
    const { loading, message, error } = useSelector((state) => state.other);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: "error",
                text1: error,
            });
            dispatch({
                type: "clearError",
            });
        }

        if (message) {
            Toast.show({
                type: "success",
                text1: message,
            });
            dispatch({
                type: "clearMessage",
            });

            navigateTo && navigation.navigate(navigateTo);

            func && dispatch(func());
        }
    }, [error, message, dispatch, navigateTo, func]);

    return loading;
};

export const useMessageAndErrorOrder = (
    dispatch,
    navigation,
    navigateTo,
    func
) => {
    const { loading, message, error } = useSelector((state) => state.order);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: "error",
                text1: error,
            });
            dispatch({
                type: "clearError",
            });
        }

        if (message) {
            Toast.show({
                type: "success",
                text1: message,
            });
            dispatch({
                type: "clearMessage", 
            });

            // Navigate to another screen if specified
            if (navigateTo) {
                navigation.navigate(navigateTo);
            }

            if (func) {
                dispatch(func());
            }
        }
    }, [error, message, dispatch, navigateTo, func]); // Adding func to dependencies

    return loading; // Return the loading state
};

export const useSetCategories = (setCategories, isFocused) => {
    useEffect(() => {
        axios
            .get(`${server}/category/all`)
            .then((res) => {
                // console.log("fetched categories", res.data.categories);
                setCategories(res.data.categories);
            })
            .catch((e) => {
                // console.log(e.message)
                Toast.show({
                    type: "error",
                    text1: e.message,
                });
            });
    }, [isFocused]);
};

export const useGetOrders = (isFocused, isAdmin = false) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // Retrieve token from AsyncStorage
                const token = await AsyncStorage.getItem('token');
                // console.log("token",token);
                
                // Send token in the headers
                const res = await axios.get(`${server}/my`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                setOrders(res.data.orders);
            } catch (error) {
                Toast.show({
                    type: "error",
                    text1: error.response?.data.message || "Failed to fetch orders",
                });
            } finally {
                setLoading(false);
            }
        };

        if (isFocused) {
            fetchOrders();
        }
    }, [isFocused]);

    return {
        loading,
        orders,
    };
};