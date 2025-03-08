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
      .then(() => {
        Toast.show({
          type: "success",
          text2: "Welcome back!",
        });
        navigation.navigate("myaccount");
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
      .then(async () => {
        Toast.show({
          type: "success",
          text2: "Welcome back, Rider!",
        });
        navigation.navigate("loadingrider");
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
  
      <Text className="text-2xl font-bold mt-4 px-3 text-[#e01d47]">Login</Text>
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
        <View className="flex-row items-center my-5">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-500 text-sm">Or</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>
  
        {/* Google Login Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-white border border-gray-300 py-3 px-5 rounded-lg w-full"
        >
          <Image
            source={{ uri: "data:image/png;base64,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" }}
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          <Text className="text-base font-semibold text-gray-600">Continue with Google</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
  );

};



export default Login; 