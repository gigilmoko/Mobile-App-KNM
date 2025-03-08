import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, loadUser } from "../../redux/actions/userActions";
import Toast from "react-native-toast-message";
import Header from "../../components/Layout/Header";

const ChangePassword = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const submitHandler = async () => {
    if (!user) {
      console.error("User not found. Please log in first.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Password Mismatch",
        text2: "New password and confirm password do not match.",
      });
      return;
    }

    try {
      await dispatch(updatePassword(user._id, oldPassword, newPassword));
      Toast.show({
        type: "success",
        text1: "Password Updated Successfully",
        text2: "Your password has been updated.",
      });
      setIsPasswordChanged(true);
    } catch (error) {
      console.error("Error in submitHandler:", error);
      Toast.show({
        type: "error",
        text1: "Password Update Failed",
        text2: error.response?.data.message || "Please try again.",
      });
    } finally {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (isPasswordChanged) {
      navigation.navigate("myaccount");
    }
  }, [isPasswordChanged, navigation]);

  return (
    <View className="flex-1 bg-white">
      {/* Fixed Header */}
     
      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
        <View className="flex-1 justify-center items-center ">
        <Header title="Change Password" />
          <View className="w-full bg-white rounded-lg p-3 shadow-md items-center">
            {/* Large Icon */}
            <View className="bg-[#fce8ec] p-4 rounded-full mb-5">
              <Ionicons name="key" size={80} color="#e01d47" />
            </View>

            {/* Input Fields */}
            <View className="w-full max-w-sm px-3">
              <Text className="text-base font-bold mb-1 text-[#e01d47]">Current Password</Text>
              <TextInput
                placeholder="Enter current password"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
              />

              <Text className="text-base font-bold mb-1 text-[#e01d47]">New Password</Text>
              <TextInput
                placeholder="Enter new password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
              />

              <Text className="text-base font-bold mb-1 text-[#e01d47]">Confirm Password</Text>
              <TextInput
                placeholder="Enter new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
              />

              <TouchableOpacity onPress={() => navigation.navigate("forgetpassword")} className="self-end mb-5">
                <Text className="text-[#e01d47] font-bold text-sm">Forgot Password?</Text>
              </TouchableOpacity>

              <View className="w-full bg-gray-100 p-4 rounded-2xl mb-5">
                <Text className="text-gray-600">✔ At least 8 characters</Text>
                <Text className="text-gray-600">✔ At least one uppercase letter (A-Z)</Text>
                <Text className="text-gray-600">✔ At least one lowercase letter (a-z)</Text>
                <Text className="text-gray-600">✔ At least one number (0-9)</Text>
                <Text className="text-gray-600">✔ At least one special character (!@#$%^&*)</Text>
              </View>

              <TouchableOpacity
                className={`bg-[#e01d47] py-3 rounded-lg items-center w-full ${
                  oldPassword === "" || newPassword === "" || confirmPassword === "" ? "opacity-50" : ""
                }`}
                disabled={oldPassword === "" || newPassword === "" || confirmPassword === ""}
                onPress={submitHandler}
              >
                <Text className="text-white font-bold text-lg">Update Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ChangePassword;
