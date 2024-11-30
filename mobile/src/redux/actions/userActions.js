import { server } from "../store"
import axios from "axios"
import { userReducer } from "../reducers/userReducer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; // Make sure to import Toas

// export const USER_AVATAR_SUCCESS = "USER_AVATAR_SUCCESS";
// export const USER_AVATAR_FAIL = "USER_AVATAR_FAIL";

export const register = (registrationData) => async (dispatch) => {
    try {
        dispatch({ type: "registerRequest" });

        // Make the API call to register
        const { data } = await axios.post(`${server}/register`, registrationData, {
            headers: { "Content-Type": "application/json" }, // Set content type to JSON
            withCredentials: true,
        });

        // Log the received data
        console.log('Data received from registration:', data);

        dispatch({ type: "registerSuccess", payload: data.message });
        return 'success';
    } catch (error) {
        dispatch({
            type: "registerFail",
            payload: error.response ? error.response.data.message : 'Network error',
        });
        return 'fail';
    }
};

export const login = (email, password) => async (dispatch) => {
    try {
        dispatch({ type: "loginRequest" });

        const { data } = await axios.post(
            `${server}/login`,
            { email, password },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        // Save the token (assuming the response contains a token)
        // localStorage.setItem('token', data.token);
        await AsyncStorage.setItem('token', data.token);

        dispatch({
            type: "loginSuccess",
            payload: data.user,
        });
    } catch (error) {
        dispatch({
            type: "loginFail",
            payload: error.response?.data.message || 'Network error',
        });
    }
};


export const loadUser = () => async (dispatch) => {
    try {
        dispatch({ type: "loadUserRequest" });

        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem('token');

        const { data } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });

        if (data.success) {
            dispatch({ type: "loadUserSuccess", payload: data.user });
            // dispatch({ type: "loginSuccess", payload: data.user });
        } else {
            dispatch({
                type: "loadUserFail",
                payload: "Failed to load user data",
            });
        }
    } catch (error) {
        dispatch({
            type: "loadUserFail",
            payload: error.response?.data.message || "Network error",
        });
    }
};

export const logout = () => async (dispatch) => {
    try {
        dispatch({ type: "logoutRequest" });

        // Perform the logout request
        const { data } = await axios.get(`${server}/logout`, {
            withCredentials: true,
        });

        // Clear AsyncStorage data
        await AsyncStorage.removeItem('token'); // Remove the token
        // Optionally, remove any other user-related data if necessary
        await AsyncStorage.removeItem('user'); // Example for user data, adjust as needed

        dispatch({ type: "logoutSuccess", payload: data.message });
    } catch (error) {
        dispatch({
            type: "logoutFail",
            payload: error.response?.data?.message || 'Logout failed', // Handle error message gracefully
        });
    }
};

export const updateAvatar = (imageUrl) => async (dispatch, getState) => {
    console.log('updateAvatar action dispatched');
    console.log('Image URL:', imageUrl);

    try {
        const { user } = getState().user;
        if (!user || !user._id) {
            throw new Error('User ID is missing');
        }
        console.log('User ID:', user._id);

        const response = await axios.put(`${server}/avatar-update/${user._id}`, 
            { avatar: imageUrl },
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log('Response from avatar update:', response.data);

        // Dispatch success action
        dispatch({
            type: 'USER_AVATAR_SUCCESS', // Uncomment this line
            payload: response.data, // Assuming response.data contains the updated user info
        });

        // Optionally, display a success toast
        Toast.show({
            type: 'success',
            text1: 'Avatar Updated Successfully',
        });

    } catch (error) {
        console.error('Error updating avatar:', error.response ? error.response.data : error.message);

        // Dispatch fail action only if there's an actual error
        if (error.response) {
            dispatch({
                type: 'USER_AVATAR_FAIL', // Uncomment this line
                payload: error.response.data.message || 'Failed to update avatar',
            });
        } else {
            dispatch({
                type: 'USER_AVATAR_FAIL', // Uncomment this line
                payload: error.message || 'Network error',
            });
        }

        // Display an error toast
        Toast.show({
            type: 'error',
            text1: 'Avatar Update Failed',
            text2: error.message || 'Please try again.',
        });
    }
};


export const updatePassword = (userId, oldPassword, newPassword) => async () => {
    try {
        console.log("Dispatching updatePassword action");

        const response = await axios.put(
            `${server}/password/update/mobile`,
            { userId, oldPassword, newPassword }, // Include userId
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        console.log("Password update response:", response.data);
        return response.data; // Return the response data
    } catch (error) {
        console.error("Error updating password:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || error.message); // Throw an error to be caught in submitHandler
    }
};



export const updateProfile = (userData) => async (dispatch, getState) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        // Stringify the userData object before sending it in the request
        const jsonData = JSON.stringify(userData);

        const { data } = await axios.put(`${server}/me/update/mobile`, jsonData, config);

        console.log("Profile updated successfully:", data.user);
    } catch (error) {
        console.error(
            error.response && error.response.data.message
                ? error.response.data.message
                : error.message
        );
    }
};
















