import { server } from "../store";
import axios from "axios";
import { userReducer } from "../reducers/userReducer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; // Make sure to import Toast

// export const USER_AVATAR_SUCCESS = "USER_AVATAR_SUCCESS";
// export const USER_AVATAR_FAIL = "USER_AVATAR_FAIL";

export const register = (registrationData) => async (dispatch) => {
    try {
        dispatch({ type: "registerRequest" });

        const { data } = await axios.post(`${server}/register`, registrationData, {
            headers: { "Content-Type": "application/json" }, 
            withCredentials: true,
        });

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

export const registerUserMember = (userData) => async (dispatch) => {
    try {
        dispatch({ type: "registerUserMemberRequest" });

        const { data } = await axios.post(`${server}/register-member`, userData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        dispatch({ type: "registerUserMemberSuccess", payload: data.message });
        return 'success';
    } catch (error) {
        dispatch({
            type: "registerUserMemberFail",
            payload: error.response ? error.response.data.message : 'Network error',
        });
        return 'fail';
    }
};

export const userLogin = (email, password, playerId) => async (dispatch) => {
    try {
        dispatch({ type: "loginRequest" });

        const { data } = await axios.post(
            `${server}/login`,
            { 
                email, 
                password, 
                deviceToken: playerId 
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        // Store token and userId in AsyncStorage
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        
        // console.log('Token:', data.token);
        // console.log('User ID:', data.user._id);
        // console.log('Device Token:', playerId);

        dispatch({
            type: "loginSuccess",
            payload: data.user,
        });

        return 'success';
    } catch (error) {
        console.log(error)
        dispatch({
            type: "loginFail", 
            payload: error.response?.data.message || 'Network error',
        });

        return 'fail';
    }
};

export const loadUser = () => async (dispatch) => {
    
    try {
        dispatch({ type: "loadUserRequest" });
        const token = await AsyncStorage.getItem('token');

        const { data } = await axios.get(`${server}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`, 
            },
            withCredentials: true,
        });

        // console.log('User data:', data);

        if (data.success) {
            dispatch({ type: "loadUserSuccess", payload: data.user });
            // console.log("data user: ", data.user);
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

        const { data } = await axios.get(`${server}/logout`, {
            withCredentials: true,
        });

        await AsyncStorage.removeItem('token'); 
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('userId'); // Remove userId from AsyncStorage

        dispatch({ type: "logoutSuccess", payload: data.message });
    } catch (error) {
        dispatch({
            type: "logoutFail",
            payload: error.response?.data?.message || 'Logout failed', // Handle error message gracefully
        });
    }
};

export const updateAvatar = (imageUrl) => async (dispatch, getState) => {

    try {
        const { user } = getState().user;
        if (!user || !user._id) {
            throw new Error('User ID is missing');
        }

        const response = await axios.put(`${server}/avatar-update/${user._id}`, 
            { avatar: imageUrl },
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        dispatch({
            type: 'USER_AVATAR_SUCCESS', 
            payload: response.data, 
        });

    } catch (error) {
        console.error('Error updating avatar:', error.response ? error.response.data : error.message);

        if (error.response) {
            dispatch({
                type: 'USER_AVATAR_FAIL', 
                payload: error.response.data.message || 'Failed to update avatar',
            });
        } else {
            dispatch({
                type: 'USER_AVATAR_FAIL', 
                payload: error.message || 'Network error',
            });
        }
    }
};

export const updatePassword = (userId, oldPassword, newPassword) => async () => {
    try {

        const response = await axios.put(
            `${server}/password/update/mobile`,
            { userId, oldPassword, newPassword }, 
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data?.message || error.message); 
    }
};

export const updateProfile = (userData) => async (dispatch, getState) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const jsonData = JSON.stringify(userData);

        const { data } = await axios.put(`${server}/me/update/mobile`, jsonData, config);

    } catch (error) {
        console.error('Error updating profile:', error);
    }
};

export const getUserDetails = (id) => async (dispatch) => {
    console.log('getUserDetails touched');
    try {
        dispatch({ type: "getUserDetailsRequest" });

        const token = await AsyncStorage.getItem('token');
        const { data } = await axios.get(`${server}/get-user/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`, 
            },
            withCredentials: true,
        });

        if (data.success) {
            dispatch({
                type: 'getUserDetailsSuccess',
                payload: data.user, 
            });
            console.log("data user: ", data.user);
        } else {
            dispatch({
                type: 'getUserDetailsFail',
                payload: data.message,
            });
        }
    } catch (error) {
        dispatch({
            type: 'getUserDetailsFail',
            payload: error.message,
        });
    }
};

export const updateAddress = (userData) => async (dispatch, getState) => {
    try {
        console.log('update address touched');
        await dispatch(loadUser());
        const { user } = getState().user;

        if (!user || !user._id) {
            throw new Error('User ID is missing');
        }

        const { deliveryAddress } = userData;
        const token = await AsyncStorage.getItem('token');
        console.log('Token:', token);

        dispatch({ type: 'UPDATE_ADDRESS_REQUEST' });

        const config = {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`, 
            },
        };

        const jsonData = {
            userId: user._id, 
            deliveryAddress: [deliveryAddress],
        };
        console.log('Request Body:', jsonData);

        const requestUrl = `${server}me/update/address`;
        console.log('Request URL:', requestUrl);

        const { data } = await axios.put(requestUrl, jsonData, config);

        dispatch({
            type: 'UPDATE_ADDRESS_SUCCESS',
            payload: data.user,
        });

        Toast.show({
            type: 'success',
            text1: 'Address updated successfully!',
        });
    } catch (error) {
        console.log('Error during updateAddress:', error);
        dispatch({
            type: 'UPDATE_ADDRESS_FAIL',
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });

        Toast.show({
            type: 'error',
            text1: 'Failed to update address',
            text2: error.response?.data.message || error.message,
        });
    }
};

export const forgotPassword = (email) => async (dispatch) => {
    try {
        dispatch({ type: 'FORGOT_PASSWORD_REQUEST' });

        // Make the API request to send the reset password email
        const { data } = await axios.post(`${server}/password/forgot`, { email });

        dispatch({
            type: 'FORGOT_PASSWORD_SUCCESS',
            payload: data.message,  // The success message returned by the API
        });

        Toast.show({
            type: 'success',
            text1: 'Password reset email sent!',
            text2: data.message,
        });
    } catch (error) {
        dispatch({
            type: 'FORGOT_PASSWORD_FAIL',
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });

        Toast.show({
            type: 'error',
            text1: 'Failed to send reset password email',
            text2: error.response?.data.message || error.message,
        });
    }
};