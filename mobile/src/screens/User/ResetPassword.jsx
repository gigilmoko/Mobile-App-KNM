import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { resetPasswordMobile } from "../../redux/actions/userActions";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";

const ResetPassword = ({ navigation, route }) => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    
    const { userId, verificationCode } = route.params || {};
    const dispatch = useDispatch();

    const validateForm = () => {
        let isValid = true;
        const newErrors = { newPassword: "", confirmPassword: "" };
        
        if (!newPassword) {
            newErrors.newPassword = "Password is required";
            isValid = false;
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
            isValid = false;
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleResetPassword = async () => {
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            const response = await dispatch(resetPasswordMobile(userId, verificationCode, newPassword, confirmPassword));
            
            if (response === 'success') {
                Toast.show({
                    type: "success",
                    text1: "Password Reset Successful",
                    text2: "You can now login with your new password",
                });
                navigation.navigate("login");
            } else {
                throw new Error("Failed to reset password");
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Reset Failed",
                text2: error?.message || "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
            <View className="flex-1">
                {/* Header */}
                <View className="pt-5 flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 rounded-full bg-gray-100 mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="#e01d47" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#e01d47]">Reset Password</Text>
                </View>

                {/* Content */}
                <View className="flex-1 justify-center items-center px-4">
                    {/* Icon */}
                    <View className="bg-[#fce8ec] p-6 rounded-full mb-6">
                        <Ionicons name="shield-checkmark-outline" size={60} color="#e01d47" />
                    </View>

                    {/* Title and Description */}
                    <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                        Create New Password
                    </Text>
                    <Text className="text-gray-600 text-center mb-8 leading-6">
                        Please create a strong password for your account
                    </Text>

                    {/* Form */}
                    <View className="w-full max-w-sm">
                        {/* New Password */}
                        <Text className="text-base font-semibold mb-1 text-[#e01d47]">New Password</Text>
                        <View className="relative flex-row items-center mb-1">
                            <TextInput
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={(text) => {
                                    setNewPassword(text);
                                    if (errors.newPassword) setErrors({...errors, newPassword: ""});
                                }}
                                placeholder="Enter new password"
                                className={`bg-gray-100 rounded-lg px-4 py-4 text-base w-full ${errors.newPassword ? "border border-red-500" : ""}`}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowPassword(!showPassword)} 
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
                        {errors.newPassword ? (
                            <Text className="text-red-500 text-xs mb-2">{errors.newPassword}</Text>
                        ) : (
                            <View className="mb-3" />
                        )}

                        {/* Confirm Password */}
                        <Text className="text-base font-semibold mb-1 text-[#e01d47]">Confirm Password</Text>
                        <View className="relative flex-row items-center mb-1">
                            <TextInput
                                secureTextEntry={!showConfirmPassword}
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                                }}
                                placeholder="Confirm new password"
                                className={`bg-gray-100 rounded-lg px-4 py-4 text-base w-full ${errors.confirmPassword ? "border border-red-500" : ""}`}
                            />
                            <TouchableOpacity 
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                                className="absolute right-3"
                                activeOpacity={0.7}
                            >
                                <Ionicons 
                                    name={showConfirmPassword ? "eye-off" : "eye"} 
                                    size={24} 
                                    color="#666" 
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword ? (
                            <Text className="text-red-500 text-xs mb-4">{errors.confirmPassword}</Text>
                        ) : (
                            <View className="mb-6" />
                        )}

                        {/* Password Requirements */}
                        <View className="bg-gray-50 p-4 rounded-lg mb-6">
                            <Text className="text-sm font-semibold text-gray-700 mb-2">Password must contain:</Text>
                            <Text className="text-xs text-gray-600">• At least 8 characters</Text>
                            <Text className="text-xs text-gray-600">• Mix of letters and numbers</Text>
                            <Text className="text-xs text-gray-600">• At least one special character</Text>
                        </View>

                        {/* Reset Button */}
                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={isLoading || !newPassword || !confirmPassword}
                            className={`bg-[#e01d47] py-4 rounded-lg items-center ${
                                (isLoading || !newPassword || !confirmPassword) ? "opacity-50" : ""
                            }`}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Reset Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default ResetPassword;