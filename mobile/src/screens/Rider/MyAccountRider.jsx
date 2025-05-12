import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button } from "react-native-paper";
import { CameraIcon } from "react-native-heroicons/outline";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";
import OptionList from "../../components/User/OptionList";
import { getRiderProfile, riderLogout, updateRiderAvatar } from "../../redux/actions/riderActions";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import axios from "axios";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
const MyAccountRider = ({ navigation }) => {    
    const dispatch = useDispatch();
    const { rider } = useSelector((state) => state.rider);
    const [avatar, setAvatar] = useState(rider?.avatar || "");
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(getRiderProfile());
    }, [dispatch]);

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
        formData.append("file", {
            uri: avatar,
            type: mime.getType(avatar),
            name: avatar.split("/").pop(),
        });
        formData.append("upload_preset", "ml_default");
        try {
            setIsUpdating(true);
            const response = await axios.post(
                "https://api.cloudinary.com/v1_1/dglawxazg/image/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            const imageUrl = response.data.secure_url;
            dispatch(updateRiderAvatar(imageUrl));
            setIsAvatarChanged(false);
            setIsUpdating(false);

            Toast.show({
                type: "success",
                text1: "Avatar Updated Successfully",
            });
        } catch (error) {
            console.error("Failed to upload avatar", error);
            alert("Failed to upload avatar. Please try again.");
            setIsUpdating(false);

            Toast.show({
                type: "error",
                text1: "Avatar Update Failed",
            });
        }
    };

    const handleLogout = async () => {
        await dispatch(riderLogout());
        navigation.navigate("login");
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="px-5 py-5">
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
                                {rider?.fname} {rider?.middlei}. {rider?.lname}
                            </Text>
                        
                        </View>

                        <View className="mt-6 w-full">
  <Text className="text-lg font-medium px-3 py-2 text-[#c5c5c5]">Personal Information</Text>

  {/* Email Box */}
  <View className="bg-white rounded-lg shadow-sm px-4 py-3 flex-row items-center mb-3">
    <View className="bg-pink-100 rounded-full p-3 mr-4">
      <Ionicons name="mail" size={20} color="#e01d47" />
    </View>
    <View>
      <Text className="text-sm font-medium text-gray-500">Email</Text>
      <Text className="text-base font-semibold text-gray-800">{rider?.email}</Text>
    </View>
  </View>

  {/* Phone Box */}
  <View className="bg-white rounded-lg shadow-sm px-4 py-3 flex-row items-center">
    <View className="bg-pink-100 rounded-full p-3 mr-4">
      <Ionicons name="call" size={20} color="#e01d47" />
    </View>
    <View>
      <Text className="text-sm font-medium text-gray-500">Phone</Text>
      <Text className="text-base font-semibold text-gray-800">{rider?.phone}</Text>
    </View>
  </View>
</View>
                    </View>

                    <Text className="text-lg font-medium px-3 py-2 text-[#c5c5c5] mb-2">Account Settings</Text>

                    <OptionList
                        text={"Change Password"}
                        Icon={CameraIcon}
                        iconName={"key-sharp"}
                        onPress={() => navigation.navigate("changepassword")}
                        iconColor="#e01d47"
                        textColor="#e01d47"
                    />
                    {/* <OptionList
                        text={"Camera"}
                        Icon={CameraIcon}
                        iconName={"camera"}
                        onPress={() => navigation.navigate("cameracomponent")}
                        iconColor="#e01d47"
                        textColor="#e01d47"
                    /> */}
                    {/* <OptionList
                        text={"Leaflet"}
                        Icon={CameraIcon}
                        iconName={"map"}
                        onPress={() => navigation.navigate("leaflet")}
                        iconColor="#e01d47"
                        textColor="#e01d47"
                    />
                    <OptionList
                        text={"Leaflet Update"}
                        Icon={CameraIcon}
                        iconName={"map"}
                        onPress={() => navigation.navigate("leafletupdate")}
                        iconColor="#e01d47"
                        textColor="#e01d47"
                    /> */}
                </View>
            </ScrollView>

            <View className="absolute bottom-8 w-full px-6">
                <Button
                    mode="contained"
                    onPress={handleLogout}
                    className="bg-[#e01d47] rounded-lg py-2"
                >
                    Logout
                </Button>
            </View>

            {/* <View className="absolute bottom-0 w-full">
                <Footer activeRoute={"home"} />
            </View> */}
        </View>
    );
};

export default MyAccountRider;