import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import OptionList from "../../components/User/OptionList";
import { Avatar } from "react-native-paper";
import { loadUser, updateAvatar, logout } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import mime from "mime";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message";

const MyAccount = ({ navigation, route }) => {
    const { user, loading: userLoading } = useSelector((state) => state.user);
    const navigate = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    
    const [avatar, setAvatar] = useState(user?.avatar || "");
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      await dispatch(loadUser());
      setPageLoading(false);
    };

    if (isFocused) {
      fetchData();
    }
  }, [route.params, dispatch, isFocused]);

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    }
  }, [user]);

  const openImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Toast.show({
          type: "error",
          text1: "Permission Denied",
          text2: "Permission to access gallery is required",
        });
        return;
      }

      const data = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!data.canceled && data.assets && data.assets[0]?.uri) {
        setAvatar(data.assets[0].uri);
        setIsAvatarChanged(true);
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to open image picker",
      });
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
      const response = await axios.post("https://api.cloudinary.com/v1_1/dglawxazg/image/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const imageUrl = response.data.secure_url;
      await dispatch(updateAvatar(imageUrl));
      setIsAvatarChanged(false);

      Toast.show({
        type: "success",
        text1: "Profile Photo Updated",
        text2: "Your profile photo has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to upload avatar", error);

      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Could not update profile photo. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await dispatch(logout());
            Toast.show({
                type: 'success',
                text1: 'Logged Out Successfully',
                text2: 'See you again soon!'
            });
            navigation.navigate("home");
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'Please try again'
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (isLoggingOut) {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#e01d47" />
            <Text className="text-[#e01d47] mt-4 font-medium">Signing out...</Text>
        </View>
    );
} else if (pageLoading || userLoading) {
    return (
        <View className="flex-1 justify-center items-center bg-white">
            <ActivityIndicator size="large" color="#e01d47" />
            <Text className="text-[#e01d47] mt-4 font-medium">Loading your profile...</Text>
        </View>
    );
}
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Simple Header with Back Button */}
        <View className="bg-[#e01d47] pt-12 pb-8 px-5">
          <View className="flex-row justify-start mb-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-white bg-opacity-20 rounded-full">
              <Ionicons name="arrow-back" size={22} color="#e01d47" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-5">
              <Text className="text-white text-xl font-bold">My Account</Text>
            </View>
          </View>

          {/* Profile Info */}
          <View className="items-center">
            <View className="relative">
              <Avatar.Image
                source={{ uri: avatar || "https://via.placeholder.com/150" }}
                size={90}
                className="bg-white"
              />
              <TouchableOpacity
                onPress={openImagePicker}
                className="absolute bg-white rounded-full p-2 shadow-sm right-0 bottom-0"
              >
                <Ionicons name="camera" size={18} color="#e01d47" />
              </TouchableOpacity>
            </View>

            {isAvatarChanged && (
              <TouchableOpacity
                onPress={handleAvatarUpdate}
                disabled={isUpdating}
                className="mt-3 bg-white rounded-full px-4 py-1.5"
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#e01d47" />
                ) : (
                  <Text className="text-[#e01d47] font-bold">Update Photo</Text>
                )}
              </TouchableOpacity>
            )}

            <Text className="text-white text-lg font-bold mt-3">
              {user?.fname} {user?.middlei ? user?.middlei + "." : ""} {user?.lname}
            </Text>
            <Text className="text-white text-sm">{user?.email}</Text>

            {user?.role === "admin" && (
              <View className="bg-white bg-opacity-20 rounded-full px-3 py-1 mt-2">
                <Text className="text-red-500 font-medium">Administrator</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 pt-6 pb-32">
          {/* Personal Information Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 mb-3 px-1 uppercase">Personal Information</Text>

            <View className="bg-gray-50 rounded-lg p-4 mb-2">
              {/* Phone Information */}
              <View className="flex-row items-center mb-4">
                <View className="bg-gray-100 rounded-full p-2">
                  <Ionicons name="call-outline" size={18} color="#e01d47" />
                </View>
                <View className="ml-3">
                  <Text className="text-sm text-gray-500">Phone</Text>
                  <Text className="text-base font-medium">{user?.phone || "Not provided"}</Text>
                </View>
              </View>

              {/* Address Information */}
              <View className="flex-row items-start mb-4">
                <View className="bg-gray-100 rounded-full p-2 mt-1">
                  <Ionicons name="location-outline" size={18} color="#e01d47" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm text-gray-500">Delivery Address</Text>
                  {user?.deliveryAddress && user.deliveryAddress.length > 0 ? (
                    <Text className="text-base font-medium">
                      {user.deliveryAddress[0].houseNo !== "none" ? user.deliveryAddress[0].houseNo + ", " : ""}
                      {user.deliveryAddress[0].streetName !== "none" ? user.deliveryAddress[0].streetName + ", " : ""}
                      {user.deliveryAddress[0].barangay !== "none"
                        ? "Brgy. " + user.deliveryAddress[0].barangay + ", "
                        : ""}
                      {user.deliveryAddress[0].city !== "none" ? user.deliveryAddress[0].city : ""}
                    </Text>
                  ) : (
                    <Text className="text-base font-medium">No address provided</Text>
                  )}
                </View>
              </View>

              {/* Date of Birth Information */}
              <View className="flex-row items-center">
                <View className="bg-gray-100 rounded-full p-2">
                  <Ionicons name="calendar-outline" size={18} color="#e01d47" />
                </View>
                <View className="ml-3">
                  <Text className="text-sm text-gray-500">Date of Birth</Text>
                  <Text className="text-base font-medium">
                    {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "Not provided"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Account Settings Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 mb-3 px-1 uppercase">Account Settings</Text>

            <View className="bg-gray-50 rounded-lg mb-2">
              {user?.role !== "admin" && (
                <OptionList
                  text={"My Orders"}
                  Icon={Ionicons}
                  iconName={"bag-outline"}
                  onPress={() => navigation.navigate("myorders")}
                  iconColor="#e01d47"
                  textColor="#333"
                />
              )}

              {user?.role === "admin" && (
                <OptionList
                  text={"Admin Dashboard"}
                  Icon={Ionicons}
                  iconName={"grid-outline"}
                  onPress={() => navigation.navigate("dashboard")}
                  iconColor="#e01d47"
                  textColor="#333"
                />
              )}

              <OptionList
                text={"Change Password"}
                Icon={Ionicons}
                iconName={"key-outline"}
                onPress={() => navigation.navigate("changepassword")}
                iconColor="#e01d47"
                textColor="#333"
              />

              <OptionList
                text={"Update Profile"}
                Icon={Ionicons}
                iconName={"person-outline"}
                onPress={() => navigation.navigate("updateprofile")}
                iconColor="#e01d47"
                textColor="#333"
              />

              <OptionList
                text={"Update Address"}
                Icon={Ionicons}
                iconName={"location-outline"}
                onPress={() => navigation.navigate("editaddress")}
                iconColor="#e01d47"
                textColor="#333"
                noBorder
              />
            </View>
          </View>

          {/* Support Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 mb-3 px-1 uppercase">Support & Feedback</Text>

            <View className="bg-gray-50 rounded-lg mb-2">
              <OptionList
                text={"Contact and Feedback"}
                Icon={Ionicons}
                iconName={"chatbox-ellipses-outline"}
                onPress={() => navigation.navigate("feedback")}
                iconColor="#e01d47"
                textColor="#333"
                noBorder
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View className="absolute bottom-20 w-full px-6">
        <TouchableOpacity
          onPress={handleLogout}
          disabled={isLoggingOut}
          className="bg-gray-100 rounded-lg py-3 flex-row justify-center items-center"
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#e01d47" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={18} color="#e01d47" />
              <Text className="text-[#e01d47] font-medium ml-2">Log Out</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"profile"} />
      </View>
    </View>
  );
};

export default MyAccount;
