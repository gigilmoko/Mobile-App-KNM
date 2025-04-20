import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, getRiderProfile } from "../../redux/actions/riderActions";
import Toast from "react-native-toast-message";
import Header from "../../components/Layout/Header";

const ChangePassword = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    const dispatch = useDispatch();
    const rider = useSelector((state) => state.rider.rider);

    const submitHandler = async () => {
        if (!rider) {
            console.error("Rider not found. Please log in first.");
            return;
        }

        const passwordData = { oldPassword, newPassword };

        try {
            const response = await dispatch(updatePassword(rider._id, passwordData));
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
        }
    };

    useEffect(() => {
        const loadRiderData = async () => {
            await dispatch(getRiderProfile());
        };

        loadRiderData();
    }, [dispatch]);

    useEffect(() => {
        if (isPasswordChanged) {
            navigation.navigate("account");
        }
    }, [isPasswordChanged, navigation]);

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white p-5">
                <View className="flex-1 justify-center items-center">
                    <Header title="Change Password" />
                    <View className="w-full bg-white rounded-lg p-3 shadow-md items-center">
                        <View className="bg-[#fce8ec] p-4 rounded-full mb-5">
                            <Ionicons name="key" size={80} color="#e01d47" />
                        </View>
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
                            <View className="w-full bg-gray-100 p-4 rounded-2xl mb-5">
                                <Text className="text-gray-600">✔ At least 8 characters</Text>
                                <Text className="text-gray-600">✔ At least one uppercase letter (A-Z)</Text>
                                <Text className="text-gray-600">✔ At least one lowercase letter (a-z)</Text>
                                <Text className="text-gray-600">✔ At least one number (0-9)</Text>
                                <Text className="text-gray-600">✔ At least one special character (!@#$%^&*)</Text>
                            </View>
                            <TouchableOpacity
                                className={`bg-[#e01d47] py-3 rounded-lg items-center w-full ${
                                    oldPassword === "" || newPassword === "" ? "opacity-50" : ""
                                }`}
                                disabled={oldPassword === "" || newPassword === ""}
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
