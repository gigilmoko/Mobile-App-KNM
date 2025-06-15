import React, { useState, useEffect } from "react";
import { OneSignal } from "react-native-onesignal";
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { userLogin } from "../../redux/actions/userActions";
import { riderLogin } from "../../redux/actions/riderActions";
import { useMessageAndErrorUser } from "../../../utils/hooks";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons"; // Make sure you have expo icons installed

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const loading = useMessageAndErrorUser(navigation, dispatch, "myaccount");
  const [playerId, setPlayerId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    const getPlayerId = async () => {
      try {
        const deviceState = await OneSignal.User.pushSubscription.getPushSubscriptionId();
        if (deviceState) {
          setPlayerId(deviceState);
        }
      } catch (error) {
        console.error('OneSignal Error:', error);
      }
    };

    // Initial fetch
    getPlayerId();

    // Subscription listener
    const subscription = OneSignal.User.pushSubscription.addEventListener('change', getPlayerId);
    return () => subscription?.remove();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email) && !email.startsWith("newrider")) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }
    
    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

const userSubmitHandler = async () => {
  if (!validateForm()) return;
  
  setIsLoading(true);
  try {
    const response = await dispatch(userLogin(email, password, playerId));
    if (response === 'success') {
      // Get user data from store or response
      const userData = await AsyncStorage.getItem('userData');
      let firstName = "User";
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        firstName = parsedData.fname || firstName; // Using fname directly from model
      }
      
      Toast.show({
        type: "success",
        text1: `Welcome back, ${firstName}!`,
        text2: "Login successful",
      });
      navigation.navigate("myaccount");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Login Failed",
      text2: error?.message || "Please try again later.",
    });
  } finally {
    setIsLoading(false);
  }
};

const riderSubmitHandler = async () => {
  if (!validateForm()) return;
  
  setIsLoading(true);
  try {
    const response = await dispatch(riderLogin(email, password, playerId));
    if (response === 'success') {
      // Get rider data from store or response
      const riderData = await AsyncStorage.getItem('riderData');
      let firstName = "Rider";
      
      if (riderData) {
        const parsedData = JSON.parse(riderData);
        firstName = parsedData.fname || firstName; // Using fname directly from model
      }
      
      Toast.show({
        type: "success",
        text1: `Welcome back, ${firstName}!`,
        text2: "Rider login successful",
      });
      navigation.navigate("loadingrider");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Rider Login Failed",
      text2: error?.message || "Please try again later.",
    });
  } finally {
    setIsLoading(false);
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isRiderLogin = email.startsWith("newrider");

   return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
    <View className="flex-1">
      <View className="mt-20">
        <Image 
          source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741112980/image_2025-03-05_022855838-removebg-preview_thwgac.png" }} 
          style={{ width: 120, height: 50, alignSelf: 'flex-start' }}  
          resizeMode="contain"
        />
      </View>
  
      <Text className="text-2xl font-bold mt-6 px-3 text-[#e01d47]">Login</Text>
      <Text className="text-base font-medium mb-8 px-3 text-[#c5c5c5]">Sign in to your account</Text>
  
      <View className="w-full max-w-sm px-3"> 
        <Text className="text-base font-semibold mb-1 text-[#e01d47]">Email Address</Text>
        <TextInput
          keyboardType="email-address"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({...errors, email: ""});
          }}
          placeholder="Enter email address"
          className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base w-full ${errors.email ? "border border-red-500" : ""}`}
        />
        {errors.email ? <Text className="text-red-500 text-xs mb-2">{errors.email}</Text> : <View className="mb-3" />}
  
        <Text className="text-base font-semibold mb-1 text-[#e01d47]">Password</Text>
        <View className="relative flex-row items-center">
          <TextInput
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({...errors, password: ""});
            }}
            placeholder="Enter password"
            className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base w-full ${errors.password ? "border border-red-500" : ""}`}
          />
          <TouchableOpacity 
            onPress={togglePasswordVisibility} 
            className="absolute right-3"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text className="text-red-500 text-xs mb-2">{errors.password}</Text> : <View className="mb-3" />}
  
        <TouchableOpacity onPress={() => navigation.navigate("forgetpassword")} className="self-end mb-5">
          <Text className="text-[#e01d47] font-bold text-sm">Forgot Password?</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          className={`bg-[#e01d47] py-3 rounded-lg items-center w-full ${(isLoading || !email || !password) ? "opacity-50" : ""}`}
          disabled={isLoading || !email || !password}
          onPress={isRiderLogin ? riderSubmitHandler : userSubmitHandler}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {isRiderLogin ? "Login as Rider" : "Login"}
            </Text>
          )}
        </TouchableOpacity>
  
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500 text-sm">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("signup")}>
            <Text className="text-[#e01d47] font-bold text-sm ml-1">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </ScrollView>
  );
};

export default Login;