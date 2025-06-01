import React, { useState, useEffect } from "react";
import { OneSignal } from "react-native-onesignal";
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { userLogin } from "../../redux/actions/userActions";
import { riderLogin } from "../../redux/actions/riderActions";
import { useMessageAndErrorUser } from "../../../utils/hooks";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const loading = useMessageAndErrorUser(navigation, dispatch, "myaccount");
  const [playerId, setPlayerId] = useState(null);

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

  const userSubmitHandler = () => {
    dispatch(userLogin(email, password, playerId))
      .then((response) => {
        if (response === 'success') {
          Toast.show({
            type: "success",
            text2: "Welcome back!",
          });
          navigation.navigate("myaccount");
        } else {
          throw new Error("Invalid credentials");
          // console.log(response.error.message);
        }
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: error?.message || "Please try again later.",
        });
      });
  };

  const riderSubmitHandler = () => {
    dispatch(riderLogin(email, password, playerId))
      .then((response) => {
        if (response === 'success') {
          Toast.show({
            type: "success",
            text2: "Welcome back, Rider!",
          });
          navigation.navigate("loadingrider");
        } else {
          throw new Error("Invalid credentials");
        }
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Rider Login Failed",
          text2: error?.message || "Please try again later.",
        });
      });
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
        {/* Adjusted padding */}
        <Text className="text-base font-semibold mb-1 text-[#e01d47]">Email Address</Text>
        <TextInput
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          className="bg-gray-100 rounded-lg px-4 py-3 mb-4 text-base w-full"
        />
  
        <Text className="text-base font-semibold mb-1 text-[#e01d47]">Password</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="Enter password"
          className="bg-gray-100 rounded-lg px-4 py-3 mb-4 text-base w-full"
        />
  
        <TouchableOpacity onPress={() => navigation.navigate("forgetpassword")} className="self-end mb-5">
          <Text className="text-[#e01d47] font-bold text-sm">Forgot Password?</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          className={`bg-[#e01d47] py-3 rounded-lg items-center w-full ${email === "" || password === "" ? "opacity-50" : ""}`}
          disabled={email === "" || password === ""}
          onPress={isRiderLogin ? riderSubmitHandler : userSubmitHandler}
        >
          <Text className="text-white font-bold text-lg">
            {isRiderLogin ? "Login as Rider" : "Login"}
          </Text>
        </TouchableOpacity>
  
        {/* "Don't have an account?" in one line with Sign Up */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-gray-500 text-sm">Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("signup")}>
            <Text className="text-[#e01d47] font-bold text-sm ml-1">Sign Up</Text>
          </TouchableOpacity>
        </View>
  
        {/* Divider with "Or" in the middle */}
       
      </View>
    </View>
  </ScrollView>
  );

};



export default Login;