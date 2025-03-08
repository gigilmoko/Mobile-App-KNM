import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { CameraIcon } from "react-native-heroicons/outline"; // Import CameraIcon from Heroicons
import OptionList from "../../components/User/OptionList";
import { Avatar, Button } from "react-native-paper";
import { loadUser, updateAvatar, logout } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import mime from "mime";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message"; // Import Toast
import Header from "../../components/Layout/Header";

const { height } = Dimensions.get("window"); // Get the screen height

const MyAccount = ({ navigation, route }) => {
    const { user } = useSelector((state) => state.user);
    const navigate = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(loadUser());
    }, [route.params, dispatch, isFocused]);

    useEffect(() => {
        if (user?.avatar) {
            setAvatar(user.avatar);
        }
    }, [user]);

    const openImagePicker = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            return alert("Permission to access gallery is required");
        }
        const data = await ImagePicker.launchImageLibraryAsync();
        if (data.assets) {
            const imageUri = data.assets[0].uri;
            setAvatar(imageUri);
            setIsAvatarChanged(true);
        }
    };

    const handleAvatarUpdate = async () => {
        if (!avatar || !isAvatarChanged) return;
        const formData = new FormData();
        formData.append('file', {
            uri: avatar,
            type: mime.getType(avatar),
            name: avatar.split("/").pop(),
        });
        formData.append('upload_preset', 'ml_default');
        try {
            setIsUpdating(true);
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const imageUrl = response.data.secure_url;
            dispatch(updateAvatar(imageUrl));
            setIsAvatarChanged(false);
            setIsUpdating(false);

            // Display success toast notification
            Toast.show({
                type: 'success',
                text1: 'Avatar Updated Successfully',
            });
        } catch (error) {
            console.error('Failed to upload avatar', error);
            alert('Failed to upload avatar. Please try again.');
            setIsUpdating(false);

            // Display error toast notification
            Toast.show({
                type: 'error',
                text1: 'Avatar Update Failed',
            });
        }
    };

    const handleLogout = async () => {
        await dispatch(logout());
        navigation.navigate("home"); // Navigate to login screen after logout
    };

    return (
      <View className="flex-1 bg-white">
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-5 py-5">
            {/* My Account Section */}
            <View className="flex items-center">
                <Header title="My Account" />


                <View className="relative flex items-center justify-center mb-8">
                    <Avatar.Image
                        source={{ uri: avatar.toString() }}
                        size={100}
                        className="bg-[#c70049]"
                    />
                    <TouchableOpacity 
                        onPress={openImagePicker} 
                        className="absolute bg-white rounded-full p-1 shadow-md right-0 bottom-0"
                    >
                        <CameraIcon size={24} color="#e01d47" />
                    </TouchableOpacity>
                    {isAvatarChanged && (
                        <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUpdating}>
                            <Button 
                                loading={isUpdating} 
                                textColor="#fff" 
                                className="bg-[#e01d47] mb-2 rounded-lg px-5 py-2"
                            >
                                {isUpdating ? "Updating..." : "Update"}
                            </Button>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex items-center">
                    <Text className="text-xl font-bold -mt-2 ">
                        {user?.fname} {user?.middlei}. {user?.lname}
                    </Text>
                    <Text className="text-lg text-gray-500 mb-1">{user?.email}</Text>
                    <Text className="text-sm text-gray-500">{user?.address}</Text>
                </View>
            </View>

            {/* All Options in One Full-Width Box */}
          
                <Text className="text-lg font-medium px-3 py-2 text-[#c5c5c5]">Account Settings</Text>
                
                {user?.role !== "admin" && (
                    <OptionList
                        text={"My Orders"}
                        Icon={Ionicons}
                        iconName={"bag-check"}
                        onPress={() => navigation.navigate("myorders")}
                        iconColor="#e01d47"
                        textColor="#e01d47"
                    />
                )}

                {user?.role === "admin" && (
                    <OptionList
                        text={"Dashboard"}
                        Icon={Ionicons}
                        iconName={"grid-outline"}
                        onPress={() => navigation.navigate("dashboard")}
                        iconColor="#e01d47"
                        textColor="#e01d47"
                    />
                )}

                <OptionList
                    text={"Change Password"}
                    Icon={Ionicons}
                    iconName={"key-sharp"}
                    onPress={() => navigation.navigate("changepassword")}
                    iconColor="#e01d47"
                    textColor="#e01d47"
                />
                <OptionList
                    text={"Update Profile"}
                    Icon={Ionicons}
                    iconName={"person"}
                    onPress={() => navigation.navigate("updateprofile")}
                    iconColor="#e01d47"
                    textColor="#e01d47"
                />
                <OptionList
                    text={"Contact and Feedback"}
                    Icon={Ionicons}
                    iconName={"chatbox-ellipses"}
                    onPress={() => navigation.navigate("feedback")}
                    iconColor="#e01d47"
                    textColor="#e01d47"
                />

             
               
            </View>
      
    </ScrollView>

    <View className="absolute bottom-16 w-full px-5">
        <Button 
            mode="contained" 
            onPress={handleLogout} 
            className="bg-[#e01d47] rounded-lg py-2"
        >
            Logout
        </Button>
    </View>

    {/* Footer */}
    <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"home"} />
    </View>
</View>

    
    
    );
};



export default MyAccount;