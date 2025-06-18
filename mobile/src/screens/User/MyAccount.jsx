import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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

  // Only fetch user data when parameters change or on first load
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!user || !user._id) {
          setPageLoading(true);
          await dispatch(loadUser());
          setPageLoading(false);
        } else {
          setPageLoading(false);
        }
      };

      fetchData();
    }, [dispatch, route.params])
  );

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
        {/* Header with gradient background */}
        <View className="bg-[#e01d47] pt-2 pb-8 px-5">
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
                <Text className="text-[#e01d47] font-medium">Administrator</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 pt-6 pb-32">
          {/* Personal Information Section */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 mb-3 px-1 uppercase">Personal Information</Text>

            <View className="bg-gray-50 rounded-lg p-4 mb-2 shadow-sm">
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

          {/* Account Settings Section - REDESIGNED */}
          <View className="mb-6">
            <Text className="text-sm font-bold text-gray-500 mb-3 px-1 uppercase">Account Settings</Text>

            {/* Modern card-based design with icons */}
            <View className="flex-row flex-wrap justify-between">
              {user?.role !== "admin" && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate("myorders")}
                  className="w-[48%] bg-white shadow-sm rounded-xl p-4 mb-4 border border-gray-100"
                >
                  <View className="bg-pink-50 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
                    <Ionicons name="bag-outline" size={20} color="#e01d47" />
                  </View>
                  <Text className="font-bold text-gray-800">My Orders</Text>
                  <Text className="text-xs text-gray-500 mt-1">View all orders</Text>
                </TouchableOpacity>
              )}

              {user?.role === "admin" && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate("dashboard")}
                  className="w-[48%] bg-white shadow-sm rounded-xl p-4 mb-4 border border-gray-100"
                >
                  <View className="bg-purple-50 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
                    <Ionicons name="grid-outline" size={20} color="#8b5cf6" />
                  </View>
                  <Text className="font-bold text-gray-800">Dashboard</Text>
                  <Text className="text-xs text-gray-500 mt-1">Admin panel</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => navigation.navigate("changepassword")}
                className="w-[48%] bg-white shadow-sm rounded-xl p-4 mb-4 border border-gray-100"
              >
                <View className="bg-blue-50 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
                  <Ionicons name="key-outline" size={20} color="#3b82f6" />
                </View>
                <Text className="font-bold text-gray-800">Password</Text>
                <Text className="text-xs text-gray-500 mt-1">Change password</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate("updateprofile")}
                className="w-[48%] bg-white shadow-sm rounded-xl p-4 mb-4 border border-gray-100"
              >
                <View className="bg-amber-50 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
                  <Ionicons name="person-outline" size={20} color="#f59e0b" />
                </View>
                <Text className="font-bold text-gray-800">Profile</Text>
                <Text className="text-xs text-gray-500 mt-1">Update info</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate("editaddress")}
                className="w-[48%] bg-white shadow-sm rounded-xl p-4 border border-gray-100"
              >
                <View className="bg-green-50 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
                  <Ionicons name="location-outline" size={20} color="#10b981" />
                </View>
                <Text className="font-bold text-gray-800">Address</Text>
                <Text className="text-xs text-gray-500 mt-1">Update address</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => navigation.navigate("feedback")}
                className="w-[48%] bg-white shadow-sm rounded-xl p-4 border border-gray-100"
              >
                <View className="bg-orange-50 p-2 rounded-full w-10 h-10 items-center justify-center mb-2">
                  <Ionicons name="chatbox-ellipses-outline" size={20} color="#f97316" />
                </View>
                <Text className="font-bold text-gray-800">Feedback</Text>
                <Text className="text-xs text-gray-500 mt-1">Contact us</Text>
              </TouchableOpacity>
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