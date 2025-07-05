import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { verifyAdminLogin, resendVerificationCode } from "../../redux/actions/userActions";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Verification = ({ navigation }) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const getEmail = async () => {
      const storedEmail = await AsyncStorage.getItem('pendingVerificationEmail');
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        // If no pending verification, redirect to login
        navigation.navigate('login');
      }
    };
    
    getEmail();
  }, [navigation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Toast.show({
        type: "error",
        text1: "Verification Code Required",
        text2: "Please enter the verification code",
      });
      return;
    }

    if (verificationCode.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Invalid Code",
        text2: "Verification code must be 6 digits",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await dispatch(verifyAdminLogin(verificationCode));
      
      if (response === 'success') {
        Toast.show({
          type: "success",
          text1: "Verification Successful",
          text2: "Welcome back, Admin!",
        });
        navigation.navigate("myaccount");
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: "Invalid or expired verification code",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error?.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) {
      Toast.show({
        type: "info",
        text1: "Please Wait",
        text2: `You can resend code in ${formatTime(timer)}`,
      });
      return;
    }

    setIsResending(true);
    try {
      await dispatch(resendVerificationCode());
      Toast.show({
        type: "success",
        text1: "Code Sent",
        text2: "New verification code sent to your email",
      });
      setTimer(600); // Reset timer to 10 minutes
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed to Resend",
        text2: error?.message || "Please try again",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
      <View className="flex-1">
        {/* Header */}
        <View className="pt-2 flex-row items-center mb-8">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full bg-gray-100 mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#e01d47]">Admin Verification</Text>
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center px-4">
          {/* Icon */}
          <View className="bg-[#fce8ec] p-6 rounded-full mb-6">
            <Ionicons name="shield-checkmark" size={60} color="#e01d47" />
          </View>

          {/* Title and Description */}
          <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
            Enter Verification Code
          </Text>
          <Text className="text-gray-600 text-center mb-6 leading-6">
            We've sent a 6-digit verification code to{'\n'}
            <Text className="font-semibold">{email}</Text>
          </Text>

          {/* Code Input */}
          <View className="w-full max-w-sm mb-6">
            <TextInput
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Enter 6-digit code"
              keyboardType="numeric"
              maxLength={6}
              className="bg-gray-100 rounded-lg px-4 py-4 text-center text-xl font-bold tracking-widest"
              autoFocus
            />
          </View>

          {/* Timer */}
          {timer > 0 && (
            <Text className="text-gray-500 mb-4">
              Code expires in {formatTime(timer)}
            </Text>
          )}

          {/* Verify Button */}
          <TouchableOpacity
            onPress={handleVerify}
            disabled={isLoading || !verificationCode}
            className={`w-full max-w-sm bg-[#e01d47] py-4 rounded-lg items-center mb-4 ${
              (isLoading || !verificationCode) ? "opacity-50" : ""
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={isResending || timer > 0}
            className="mb-4"
          >
            {isResending ? (
              <ActivityIndicator size="small" color="#e01d47" />
            ) : (
              <Text className={`text-center ${timer > 0 ? "text-gray-400" : "text-[#e01d47] font-semibold"}`}>
                {timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend Code"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity
            onPress={() => navigation.navigate("login")}
            className="mt-4"
          >
            <Text className="text-gray-600 text-center">
              Wrong email? <Text className="text-[#e01d47] font-semibold">Back to Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Verification;