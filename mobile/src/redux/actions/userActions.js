import { server } from "../store";
import axios from "axios";
import { userReducer } from "../reducers/userReducer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message'; // Make sure to import Toast

// export const USER_AVATAR_SUCCESS = "USER_AVATAR_SUCCESS";
// export const USER_AVATAR_FAIL = "USER_AVATAR_FAIL";
// Update the existing register function
export const register = (registrationData) => async (dispatch) => {
    try {
        dispatch({ type: "registerRequest" });

        await AsyncStorage.removeItem('pendingEmailVerificationUserId');
        await AsyncStorage.removeItem('pendingEmailVerificationEmail');

        const { data } = await axios.post(`${server}/register`, registrationData, {
            headers: { "Content-Type": "application/json" }, 
            withCredentials: true,
        });

        console.log('Registration response:', JSON.stringify(data, null, 2));

        if (data.requiresVerification) {
            await AsyncStorage.setItem('pendingEmailVerificationUserId', data.userId.toString());
            await AsyncStorage.setItem('pendingEmailVerificationEmail', registrationData.email);
            
            dispatch({ 
                type: "registerVerificationRequired",
                payload: data.message 
            });
            return 'verification_required';
        }

        dispatch({ type: "registerSuccess", payload: data.message });
        return 'success';
    } catch (error) {
        console.log('Registration error status:', error.response?.status);
        console.log('Registration error data:', error.response?.data);
        
        dispatch({
            type: "registerFail",
            payload: error.response ? error.response.data.message : 'Network error',
        });
        return 'fail';
    }
};
// Update the existing registerUserMember function
export const registerUserMember = (userData) => async (dispatch) => {
    try {
        dispatch({ type: "registerUserMemberRequest" });

        // Clear any existing verification data first
        await AsyncStorage.removeItem('pendingEmailVerificationUserId');
        await AsyncStorage.removeItem('pendingEmailVerificationEmail');

        const { data } = await axios.post(`${server}/register-member`, userData, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
        });

        console.log('Member registration response:', data); // Debug log

        // FIX: Check for requiresVerification instead of requiresEmailVerification
        if (data.requiresVerification) {
            // Store user ID and email temporarily for verification
            console.log('Storing member userId:', data.userId, 'email:', userData.email); // Debug log
            await AsyncStorage.setItem('pendingEmailVerificationUserId', data.userId.toString());
            await AsyncStorage.setItem('pendingEmailVerificationEmail', userData.email);
            
            // Verify the data was stored
            const storedUserId = await AsyncStorage.getItem('pendingEmailVerificationUserId');
            const storedEmail = await AsyncStorage.getItem('pendingEmailVerificationEmail');
            console.log('Stored member data verification - userId:', storedUserId, 'email:', storedEmail);
            
            dispatch({ 
                type: "registerMemberVerificationRequired",
                payload: data.message 
            });
            return 'verification_required';
        }

        dispatch({ type: "registerUserMemberSuccess", payload: data.message });
        return 'success';
    } catch (error) {
        console.log('Member registration error:', error); // Debug log
        dispatch({
            type: "registerUserMemberFail",
            payload: error.response ? error.response.data.message : 'Network error',
        });
        return 'fail';
    }
};
// Add new email verification action
// Fix the verifyEmailCode function
export const verifyEmailCode = (verificationCode) => async (dispatch) => {
    try {
        dispatch({ type: "verifyEmailRequest" });

        // Get stored user ID and email
        const userId = await AsyncStorage.getItem('pendingEmailVerificationUserId');
        const email = await AsyncStorage.getItem('pendingEmailVerificationEmail');
        
        console.log('Retrieved from storage - userId:', userId, 'email:', email, 'code:', verificationCode);
        
        if (!userId || !email) {
            console.log('Missing verification data - userId:', userId, 'email:', email);
            throw new Error('No pending email verification found. Please register again.');
        }

        const { data } = await axios.post(
            `${server}/verify-email`,
            { 
                userId,
                verificationCode
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        // Clear temporary data only after successful verification
        await AsyncStorage.removeItem('pendingEmailVerificationUserId');
        await AsyncStorage.removeItem('pendingEmailVerificationEmail');

        dispatch({
            type: "verifyEmailSuccess",
            payload: data.message,
        });

        return 'success';
    } catch (error) {
        console.log('Verification error:', error);
        
        // If it's a verification data missing error, clear any stale data
        if (error.message.includes('No pending email verification found')) {
            await AsyncStorage.removeItem('pendingEmailVerificationUserId');
            await AsyncStorage.removeItem('pendingEmailVerificationEmail');
        }
        
        dispatch({
            type: "verifyEmailFail",
            payload: error.response?.data.message || error.message || 'Network error',
        });
        return 'fail';
    }
};

// Add resend email verification code action
export const resendEmailVerificationCode = () => async (dispatch) => {
    try {
        const userId = await AsyncStorage.getItem('pendingEmailVerificationUserId');
        
        if (!userId) {
            throw new Error('No pending email verification found');
        }

        const { data } = await axios.post(
            `${server}/resend-email-verification`,
            { userId },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        return 'success';
    } catch (error) {
        throw error;
    }
};

// Add check email verification status action
export const checkEmailVerificationStatus = (userId) => async (dispatch) => {
    try {
        const { data } = await axios.get(
            `${server}/check-email-verification/${userId}`,
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        return data.isVerified;
    } catch (error) {
        throw error;
    }
};

// export const userLogin = (email, password, playerId) => async (dispatch) => {
//     try {
//         dispatch({ type: "loginRequest" });

//         const { data } = await axios.post(
//             `${server}/login`,
//             { 
//                 email, 
//                 password, 
//                 deviceToken: playerId 
//             },
//             {
//                 headers: { "Content-Type": "application/json" },
//                 withCredentials: true,
//             }
//         );

//         // Store token and userId in AsyncStorage
//         await AsyncStorage.setItem('token', data.token);
//         await AsyncStorage.setItem('userId', data.user._id);
//         await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        
//         // console.log('Token:', data.token);
//         // console.log('User ID:', data.user._id);
//         // console.log('Device Token:', playerId);

//         dispatch({
//             type: "loginSuccess",
//             payload: data.user,
//         });

//         return 'success';
//     } catch (error) {
//         console.log(error)
//         dispatch({
//             type: "loginFail", 
//             payload: error.response?.data.message || 'Network error',
//         });

//         return 'fail';
//     }
// };

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

        // Check if verification is required
        if (data.requiresVerification) {
            if (data.verificationType === 'email') {
                // Email verification required
                await AsyncStorage.setItem('pendingEmailVerificationUserId', data.userId.toString());
                await AsyncStorage.setItem('pendingEmailVerificationEmail', email);
                
                dispatch({ 
                    type: "loginEmailVerificationRequired",
                    payload: data.message 
                });
                return 'email_verification_required';
            } else if (data.verificationType === 'admin') {
                // Admin verification required
                await AsyncStorage.setItem('pendingVerificationEmail', email);
                
                dispatch({ 
                    type: "loginVerificationRequired",
                    payload: data.message 
                });
                return 'admin_verification_required';
            }
        }

        // Normal login flow for verified users
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        dispatch({
            type: "loginSuccess",
            payload: data.user,
        });

        return 'success';
    } catch (error) {
        console.log('Login error:', error);
        
        // Check if it's a 403 error (verification required)
        if (error.response && error.response.status === 403) {
            const data = error.response.data;
            
            if (data.requiresVerification) {
                if (data.verificationType === 'email') {
                    // Email verification required
                    await AsyncStorage.setItem('pendingEmailVerificationUserId', data.userId.toString());
                    await AsyncStorage.setItem('pendingEmailVerificationEmail', email);
                    
                    dispatch({ 
                        type: "loginEmailVerificationRequired",
                        payload: data.message 
                    });
                    return 'email_verification_required';
                } else if (data.verificationType === 'admin') {
                    // Admin verification required
                    await AsyncStorage.setItem('pendingVerificationEmail', email);
                    
                    dispatch({ 
                        type: "loginVerificationRequired",
                        payload: data.message 
                    });
                    return 'admin_verification_required';
                }
            }
        }
        
        dispatch({
            type: "loginFail", 
            payload: error.response?.data.message || 'Network error',
        });

        return 'fail';
    }
};
// Add new verification action
export const verifyAdminLogin = (verificationCode) => async (dispatch) => {
    try {
        dispatch({ type: "verifyLoginRequest" });

        // Get stored email
        const email = await AsyncStorage.getItem('pendingVerificationEmail');
        
        if (!email) {
            throw new Error('No pending verification found');
        }

        const { data } = await axios.post(
            `${server}/verify`,
            { 
                email,
                verificationCode
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        // Store token and user data
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        
        // Clear temporary data
        await AsyncStorage.removeItem('pendingVerificationEmail');

        dispatch({
            type: "verifyLoginSuccess",
            payload: data.user,
        });

        return 'success';
    } catch (error) {
        dispatch({
            type: "verifyLoginFail",
            payload: error.response?.data.message || 'Network error',
        });
        return 'fail';
    }
};

// Add resend code action
export const resendVerificationCode = () => async (dispatch) => {
    try {
        const email = await AsyncStorage.getItem('pendingVerificationEmail');
        
        if (!email) {
            throw new Error('No pending verification found');
        }

        const { data } = await axios.post(
            `${server}/resend-verification`,
            { email },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            }
        );

        return 'success';
    } catch (error) {
        throw error;
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

//create address
// In userActions.js, update the createAddress action creator

// In userActions.js
export const createAddress = (data) => async (dispatch) => {
  try {
    dispatch({ type: 'CREATE_ADDRESS_REQUEST' });
    
    const token = await AsyncStorage.getItem('token');
    
    // Log what we're sending with explicit fields
    console.log("Creating address with data:", JSON.stringify({
      userId: data.userId,
      address: data.address
    }, null, 2));
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    // Send the data exactly as expected by the backend
    const response = await axios.post(
      `${server}/me/create-address`, 
      {
        userId: data.userId,
        address: data.address
      },
      config
    );

    console.log("Create address response:", response.data);
    
    dispatch({
      type: 'CREATE_ADDRESS_SUCCESS',
      payload: response.data.user,
    });
    
    // Also update the user in auth state
    dispatch({
      type: 'LOAD_USER_SUCCESS',
      payload: response.data.user,
    });
    
    return "success";
    
  } catch (error) {
    console.log("Error during createAddress:", error.response ? error.response.data : error.message);
    
    dispatch({
      type: 'CREATE_ADDRESS_FAIL',
      payload: error.response?.data?.message || "Failed to create address",
    });
    
    throw error;
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