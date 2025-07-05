import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { forgotPasswordMobile } from "../../redux/actions/userActions";
import Toast from "react-native-toast-message";

const ForgetPassword = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ email: "" });
    const dispatch = useDispatch();

    const validateForm = () => {
        let isValid = true;
        const newErrors = { email: "" };
        
        if (!email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const submitHandler = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            const response = await dispatch(forgotPasswordMobile(email));
            
            if (response === 'success') {
                Toast.show({
                    type: 'success',
                    text1: 'Verification Code Sent!',
                    text2: 'Please check your email for the verification code.',
                });
                // Navigate to password reset verification screen
                navigation.navigate("passwordresetverification", { email });
            } else {
                throw new Error("Failed to send verification code");
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to send verification code',
                text2: error?.message || 'Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
            <View className="flex-1">
                {/* Header */}
                <View className="pt-10 flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 rounded-full bg-gray-100 mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="#e01d47" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#e01d47]">Forgot Password</Text>
                </View>

                {/* Content */}
                <View className="flex-1 justify-center items-center px-4">
                    {/* Icon */}
                    <View className="bg-[#fce8ec] p-6 rounded-full mb-6">
                        <Ionicons name="lock-closed-outline" size={60} color="#e01d47" />
                    </View>

                    {/* Title and Description */}
                    <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                        Reset Your Password
                    </Text>
                    <Text className="text-gray-600 text-center mb-8 leading-6 px-4">
                        Enter your email address and we'll send you a verification code to reset your password
                    </Text>

                    {/* Email Input */}
                    <View className="w-full max-w-sm mb-6">
                        <Text className="text-base font-semibold mb-1 text-[#e01d47]">Email Address</Text>
                        <TextInput
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) setErrors({...errors, email: ""});
                            }}
                            placeholder="Enter your email address"
                            className={`bg-gray-100 rounded-lg px-4 py-4 text-base w-full ${errors.email ? "border border-red-500" : ""}`}
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                        {errors.email ? (
                            <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>
                        ) : null}
                    </View>

                    {/* Send Code Button */}
                    <TouchableOpacity
                        onPress={submitHandler}
                        disabled={loading || !email}
                        className={`w-full max-w-sm bg-[#e01d47] py-4 rounded-lg items-center mb-6 ${
                            (loading || !email) ? "opacity-50" : ""
                        }`}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Verification Code</Text>
                        )}
                    </TouchableOpacity>

                    {/* Back to Login */}
                    <TouchableOpacity
                        onPress={() => navigation.navigate("login")}
                        className="mt-4"
                    >
                        <Text className="text-gray-600 text-center">
                            Remember your password? <Text className="text-[#e01d47] font-semibold">Back to Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default ForgetPassword;