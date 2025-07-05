import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { updatePasswordMobile, loadUser } from "../../redux/actions/userActions";
import Toast from "react-native-toast-message";
import Header from "../../components/Layout/Header";

const ChangePassword = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const validateForm = () => {
    let isValid = true;
    const newErrors = { oldPassword: "", newPassword: "", confirmPassword: "" };

    // Old password validation
    if (!oldPassword.trim()) {
      newErrors.oldPassword = "Current password is required";
      isValid = false;
    }

    // New password validation
    if (!newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const submitHandler = async () => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Authentication Error",
        text2: "Please log in first.",
      });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await dispatch(updatePasswordMobile(user._id, oldPassword, newPassword, confirmPassword));
      
      if (response === 'success') {
        Toast.show({
          type: "success",
          text1: "Password Updated Successfully",
          text2: "Your password has been updated.",
        });
        
        // Clear form
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Navigate back
        navigation.navigate("myaccount");
      } else {
        throw new Error("Failed to update password");
      }
    } catch (error) {
      console.error("Error in submitHandler:", error);
      Toast.show({
        type: "error",
        text1: "Password Update Failed",
        text2: error?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
        <View className="flex-1 justify-center items-center">
          <Header title="Change Password" />
          
          <View className="w-full bg-white rounded-lg p-3 shadow-md items-center">
            {/* Large Icon */}
            <View className="bg-[#fce8ec] p-4 rounded-full mb-5">
              <Ionicons name="key" size={80} color="#e01d47" />
            </View>

            {/* Input Fields */}
            <View className="w-full max-w-sm px-3">
              {/* Current Password */}
              <Text className="text-base font-bold mb-1 text-[#e01d47]">Current Password</Text>
              <View className="relative flex-row items-center">
                <TextInput
                  placeholder="Enter current password"
                  secureTextEntry={!showOldPassword}
                  value={oldPassword}
                  onChangeText={(text) => {
                    setOldPassword(text);
                    if (errors.oldPassword) setErrors({...errors, oldPassword: ""});
                  }}
                  className={`p-4 bg-gray-100 text-gray-700 rounded-2xl mb-1 flex-1 ${errors.oldPassword ? "border border-red-500" : ""}`}
                />
                <TouchableOpacity 
                  onPress={() => setShowOldPassword(!showOldPassword)} 
                  className="absolute right-3"
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showOldPassword ? "eye-off" : "eye"} 
                    size={24} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.oldPassword ? (
                <Text className="text-red-500 text-xs mb-2">{errors.oldPassword}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* New Password */}
              <Text className="text-base font-bold mb-1 text-[#e01d47]">New Password</Text>
              <View className="relative flex-row items-center">
                <TextInput
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) setErrors({...errors, newPassword: ""});
                  }}
                  className={`p-4 bg-gray-100 text-gray-700 rounded-2xl mb-1 flex-1 ${errors.newPassword ? "border border-red-500" : ""}`}
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)} 
                  className="absolute right-3"
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off" : "eye"} 
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
              <Text className="text-base font-bold mb-1 text-[#e01d47]">Confirm New Password</Text>
              <View className="relative flex-row items-center">
                <TextInput
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                  }}
                  className={`p-4 bg-gray-100 text-gray-700 rounded-2xl mb-1 flex-1 ${errors.confirmPassword ? "border border-red-500" : ""}`}
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
                <Text className="text-red-500 text-xs mb-2">{errors.confirmPassword}</Text>
              ) : (
                <View className="mb-3" />
              )}

              {/* Forgot Password Link */}
              <TouchableOpacity 
                onPress={() => navigation.navigate("forgetpassword")} 
                className="self-end mb-5"
              >
                <Text className="text-[#e01d47] font-bold text-sm">Forgot Current Password?</Text>
              </TouchableOpacity>

              {/* Password Requirements */}
              <View className="w-full bg-gray-100 p-4 rounded-2xl mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Password must contain:</Text>
                <Text className="text-xs text-gray-600">✔ At least 8 characters</Text>
                <Text className="text-xs text-gray-600">✔ Mix of letters and numbers</Text>
                <Text className="text-xs text-gray-600">✔ At least one special character</Text>
              </View>

              {/* Update Button */}
              <TouchableOpacity
                className={`bg-[#e01d47] py-4 rounded-lg items-center w-full ${
                  (isLoading || !oldPassword || !newPassword || !confirmPassword) ? "opacity-50" : ""
                }`}
                disabled={isLoading || !oldPassword || !newPassword || !confirmPassword}
                onPress={submitHandler}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePassword;