import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { server } from "../store";

// Actions
export const getRiders = () => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.get(`${server}riders`, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    dispatch({ type: "GET_RIDERS", payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const newRider = (riderData) => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.post(`${server}riders`, riderData, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    dispatch({ type: "NEW_RIDER", payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const getSingleRider = (id) => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.get(`${server}rider/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`, 
      },
      withCredentials: true,
    });
    dispatch({ type: "GET_SINGLE_RIDER", payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const updateRider = (id, updatedData) => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.put(`${server}riders/${id}`, updatedData, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    dispatch({ type: "UPDATE_RIDER", payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const deleteRider = (id) => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    await axios.delete(`${server}riders/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    dispatch({ type: "DELETE_RIDER", payload: id });
  } catch (error) {
    console.error(error);
  }
};

export const riderLogin = (email, password, playerId) => async (dispatch) => {
  console.log('Rider login action:', email, password, playerId);
  try {
      dispatch({ type: "loginRequest" });

      const route = `${server}rider/login`;
      console.log('API Route:', route);

      const { data } = await axios.post(
          route,
          { email, password, playerId },
          {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
          }
      );

      const riderId = data.user._id;
      console.log('Rider data:', data);
      console.log('Rider ID:', riderId);

      await AsyncStorage.setItem('riderId', riderId);
      await AsyncStorage.setItem('riderToken', data.token);

      dispatch({
          type: "riderLoginSuccess",
          payload: data.user,
      });

      console.log('Rider login successful:', data.user);

      return 'success'; // Return 'success' after successful login
  } catch (error) {
      dispatch({
          type: "riderLoginFail",
          payload: error.response?.data.message || 'Network error',
      });
      console.error('Login error:', error);

      throw error; // Re-throw the error to handle it in the calling function
  }
};

export const riderLogout = () => async (dispatch) => {
    // const riderId = await AsyncStorage.getItem('riderId');
    // console.log('Rider IDsss:', riderId);
    try {
        dispatch({ type: "riderLogoutRequest" });

        const token = await AsyncStorage.getItem('riderToken');
        if (!token) {
            throw new Error("No token found");
        }
        console.log("Token retrieved:", token);

        const { data } = await axios.get(`${server}/rider/logout`, {
            headers: {
                "Authorization": `Bearer ${token}`, // Send token in the headers
            },
            withCredentials: true,
        });

        await AsyncStorage.removeItem('riderToken');
        await AsyncStorage.removeItem('riderId');

        dispatch({ type: "riderLogoutSuccess", payload: data.message });
    } catch (error) {
        dispatch({
            type: "riderLogoutFail",
            payload: error.response?.data?.message || 'Logout failed',
        });
    }
};

export const getRiderProfile = () => async (dispatch) => {
  console.log("getRiderProfile action");
  try {
    dispatch({ type: "GET_RIDER_PROFILE_REQUEST" });

    const token = await AsyncStorage.getItem('riderToken');
    
    if (!token) {
      throw new Error("No token found");
    }
    console.log("Token retrieved:", token);

    const { data } = await axios.get(`${server}rider/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    console.log('Rider profile data:', data.rider);
    dispatch({ type: "GET_RIDER_PROFILE_SUCCESS", payload: data.rider });
  } catch (error) {
    // console.error("Error fetching rider profile:", error.response?.data || error.message);

    // Handle specific error for invalid token
    if (error.response && error.response.status === 401) {
      // Handle token expiration or invalid token (e.g., redirect to login page)
      console.log("Token is invalid or expired. Please log in again.");
      // Redirect to login page or perform logout action
    }

    dispatch({
      type: "GET_RIDER_PROFILE_FAIL",
      payload: error.response?.data.message || 'Network error',
    });
  }
};

export const updatePassword = (id, passwordData) => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('riderToken'); // Make sure to fetch the correct token

    if (!token) {
      throw new Error('No token found');
    }

    console.log('Password update data:', passwordData); // This should log oldPassword and newPassword
    const { data } = await axios.put(
      `${server}/rider/update/password/${id}`,  // Your API endpoint for updating the password
      passwordData,  // This should send oldPassword and newPassword in the request body
      {
        headers: {
          "Authorization": `Bearer ${token}`,  // Attach token to headers
        },
        withCredentials: true,  // Ensure credentials are sent with the request if needed
      }
    );
    
    dispatch({
      type: "UPDATE_PASSWORD_SUCCESS",
      payload: data.message,  // Assuming the response contains a message or success data
    });
  } catch (error) {
    console.error("Error updating password:", error);
    dispatch({
      type: "UPDATE_PASSWORD_FAIL",
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getPendingTruck = (riderId) => async (dispatch) => {
  try {
    dispatch({ type: "GET_PENDING_TRUCK_REQUEST" });

    const token = await AsyncStorage.getItem('riderToken');
    console.log('Token:', token); // Log the token to confirm
    console.log('Rider ID:', riderId); // Log the rider ID to confirm

    // Construct the URL and log it
    const url = `${server}rider/get-work/${riderId}`;
    console.log('Request URL:', url); // Log the constructed URL

    // Use riderId as part of the URL path
    const { data } = await axios.get(url, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });

    // Log the full data with proper formatting
    console.log('Pending Truck Data:', JSON.stringify(data, null, 2));

    dispatch({
      type: "GET_PENDING_TRUCK_SUCCESS",
      payload: data.truck,
    });
  } catch (error) {
    dispatch({
      type: "GET_PENDING_TRUCK_FAIL",
      payload: error.response?.data.message || 'Network error',
    });
    console.error('Error fetching pending truck:', error);
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

export const updateRiderAvatar = (imageUrl) => async (dispatch, getState) => {
    try {
        const { rider } = getState().rider;
        if (!rider || !rider._id) {
            throw new Error('Rider ID is missing');
        }

        const response = await axios.put(`${server}/rider/avatar-update/${rider._id}`, 
            { avatar: imageUrl },
            {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        dispatch({
            type: 'RIDER_AVATAR_SUCCESS', 
            payload: response.data, 
        });

    } catch (error) {
        console.error('Error updating avatar:', error.response ? error.response.data : error.message);

        if (error.response) {
            dispatch({
                type: 'RIDER_AVATAR_FAIL', 
                payload: error.response.data.message || 'Failed to update avatar',
            });
        } else {
            dispatch({
                type: 'RIDER_AVATAR_FAIL', 
                payload: error.message || 'Network error',
            });
        }
    }
};

// export const updateRiderLocation = (riderId, latitude, longitude) => async (dispatch) => {
//   // console.log('Updating rider location:', riderId, latitude, longitude);
//   try {
//       dispatch({ type: "UPDATE_RIDER_LOCATION_REQUEST" });

//       const token = await AsyncStorage.getItem('riderToken');

//       const { data } = await axios.put(
//           `${server}rider/update-location`, 
//           { riderId, latitude, longitude }, 
//           {
//               headers: {
//                   "Authorization": `Bearer ${token}`,
//               },
//               withCredentials: true,
//           }
//       );

//       dispatch({
//           type: "UPDATE_RIDER_LOCATION_SUCCESS",
//           payload: data.location,
//       });
//   } catch (error) {
//       dispatch({
//           type: "UPDATE_RIDER_LOCATION_FAIL",
//           payload: error.response?.data?.message || 'Failed to update location',
//       });
//   }
// };

// ...existing code...

export const updateRiderLocation = (riderId, latitude, longitude) => async (dispatch) => {
  try {
      dispatch({ type: "UPDATE_RIDER_LOCATION_REQUEST" });

      const token = await AsyncStorage.getItem('riderToken');
      if (!token) {
          throw new Error('No rider token found');
      }

      const { data } = await axios.put(
          `${server}rider/update-location`, 
          { riderId, latitude, longitude }, 
          {
              headers: {
                  "Authorization": `Bearer ${token}`,
              },
              withCredentials: true,
          }
      );

      dispatch({
          type: "UPDATE_RIDER_LOCATION_SUCCESS",
          payload: data.location,
      });

      console.log('Rider location updated successfully:', { latitude, longitude });
  } catch (error) {
      console.error('Failed to update rider location:', error);
      dispatch({
          type: "UPDATE_RIDER_LOCATION_FAIL",
          payload: error.response?.data?.message || 'Failed to update location',
      });
  }
};

// Update the existing startLocationPolling function
export const startLocationPolling = (riderId, getCurrentLocation, intervalMs = 30000) => async (dispatch) => {
  // Stop any existing polling first
  dispatch(stopLocationPolling());

  const pollLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location && location.latitude && location.longitude) {
        await dispatch(updateRiderLocation(riderId, location.latitude, location.longitude));
      }
    } catch (error) {
      console.error('Location polling error:', error);
    }
  };

  // Get initial location immediately
  pollLocation();

  // Start interval polling
  const pollingInterval = setInterval(pollLocation, intervalMs);

  // Store interval ID for cleanup
  dispatch({
    type: "START_LOCATION_POLLING",
    payload: { intervalId: pollingInterval, riderId }
  });

  return pollingInterval;
};

export const stopLocationPolling = () => (dispatch, getState) => {
  const { locationPolling } = getState().rider;
  
  if (locationPolling && locationPolling.intervalId) {
    clearInterval(locationPolling.intervalId);
    console.log('Location polling stopped');
  }
  
  dispatch({ type: "STOP_LOCATION_POLLING" });
};