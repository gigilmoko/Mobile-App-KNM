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
  try {
      dispatch({ type: "loginRequest" });

      const { data } = await axios.post(
          `${server}/rider/login`,
          { email, password, playerId },
          {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
          }
      );

      // Correctly access the rider ID from the response
      const riderId = data.user._id;
      console.log('Rider data:', data);
      console.log('Rider ID:', riderId);
      console.log('Rider playerId:', playerId);

      // Store rider ID and token
      await AsyncStorage.setItem('riderId', riderId);
      await AsyncStorage.setItem('riderToken', data.token);

      dispatch({
          type: "riderLoginSuccess",
          payload: data.user,
      });

      console.log('Rider login successful:', data.user);
  } catch (error) {
      dispatch({
          type: "riderLoginFail",
          payload: error.response?.data.message || 'Network error',
      });
      console.error('Login error:', error);
  }
};

export const riderLogout = () => async (dispatch) => {
  try {
      const token = await AsyncStorage.getItem('riderToken');
      await axios.post(`${server}/rider/logout`, {}, {
          headers: {
              "Authorization": `Bearer ${token}`, // Send token in the headers
          },
          withCredentials: true,
      });

      // Remove rider ID and token from AsyncStorage
      await AsyncStorage.removeItem('riderId');
      await AsyncStorage.removeItem('riderToken');

      dispatch({ type: "riderLogoutSuccess" });
  } catch (error) {
      dispatch({
          type: "riderLogoutFail",
          payload: error.response?.data.message || 'Logout failed',
      });
      console.error('Logout error:', error);
  }
};

export const getRiderProfile = () => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.get(`${server}riders/profile`, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    dispatch({ type: "RIDER_PROFILE", payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const updatePassword = (id, passwordData) => async (dispatch) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const { data } = await axios.put(`${server}riders/${id}/update-password`, passwordData, {
      headers: {
        "Authorization": `Bearer ${token}`, // Send token in the headers
      },
      withCredentials: true,
    });
    dispatch({ type: "UPDATE_PASSWORD", payload: data });
  } catch (error) {
    console.error(error);
  }
};

export const getPendingTruck = (riderId) => async (dispatch) => {
  try {
    dispatch({ type: "GET_PENDING_TRUCK_REQUEST" });

    const token = await AsyncStorage.getItem('riderToken');
    console.log('Token:', token); // Log the token to confirm
    console.log(riderId); // Log the rider ID to confirm

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
