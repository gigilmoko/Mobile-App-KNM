import { View, Text, StyleSheet, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, loadUser } from "../../redux/actions/userActions"; // Import loadUser action
import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native";

const ChangePassword = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    const dispatch = useDispatch();
    
    // Select user data from Redux state
    const user = useSelector((state) => state.user.user);

    const submitHandler = async () => {
        console.log("Submitting password update");
        
        if (!user) {
            console.error("User not found. Please log in first.");
            return;
        }
    
        try {
            const response = await dispatch(updatePassword(user._id, oldPassword, newPassword));
            console.log("Password successfully updated", response);
            // Display success toast notification
            Toast.show({
                type: 'success',
                text1: 'Password Updated Successfully',
                text2: 'Your password has been updated.',
            });
            setIsPasswordChanged(true);
        } catch (error) {
            console.error("Error in submitHandler:", error);
            // Display error toast notification
            Toast.show({
                type: 'error',
                text1: 'Password Update Failed',
                text2: error.response?.data.message || 'Please try again.',
            });
        } finally {
            setOldPassword("");
            setNewPassword("");
        }
    };
    
    
    useEffect(() => {
        const loadUserData = async () => {
            await dispatch(loadUser()); // Load user data when the component mounts
        };

        loadUserData();
    }, [dispatch]);

    useEffect(() => {
        console.log("User state:", user);
    }, [user]);

    useEffect(() => {
        if (isPasswordChanged) {
            navigation.navigate('myaccount');
        }
    }, [isPasswordChanged, navigation]);

    return (
        <>
        <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
        <Header back={true} />
        <View className="flex-1">
            <View className="flex-row justify-center mt-[-40px]">
                <Image source={require("../../assets/images/logo.png")}
                    style={{ width: 200, height: 200, marginTop: 50 }}
                />
            </View>
            <View className="flex-1 bg-white px-8 pt-8 rounded-t-[40px] shadow-lg justify-center">
                <View className="form space-y-2">
                <Text className="text-gray-700 text-2xl font-bold text-center mb-4">Change Password</Text>
                    <Text className="text-gray-700 ml-4 font-bold">
                        Current Password
                    </Text>
                <TextInput
                    placeholder="Enter current password"
                    secureTextEntry={true}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                    style={{
                        height: 20,
                        elevation: 2,
                    }}
                    />

                    <Text className="text-gray-700 ml-4 font-bold">
                        New Password
                    </Text>
                    <TextInput
                        placeholder="Enter new password"
                        secureTextEntry={true}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-4"
                        style={{
                            height: 20,
                            elevation: 2,
                        }}
                    />
                    {/* Center the button and make it the same width as the text inputs */}
                    <View style={{ alignItems: "center", marginTop: 16 }}>
                        <TouchableOpacity
                            style={{ backgroundColor: '#bc430b', width: 350, height: 40, justifyContent: 'center', alignItems: 'center' }}
                            className="py-2 rounded-lg"
                            disabled={oldPassword === "" || newPassword === ""}
                            onPress={submitHandler}
                        >
                            <Text style={{ color: '#fff' }} className="font-bold text-center text-sm">
                                Change
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
            </View>
        </View>
    </>    
    );
};



export default ChangePassword;
