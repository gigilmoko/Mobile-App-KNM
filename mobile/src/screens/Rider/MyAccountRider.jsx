import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  Alert
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { 
  getRiderProfile, 
  riderLogout, 
  updateRiderAvatar 
} from "../../redux/actions/riderActions";
import NewFooter from "./NewFooter";
import tw from 'twrnc';

const MyAccountRider = ({ navigation }) => {
  const dispatch = useDispatch();
  const { rider, loading } = useSelector((state) => state.rider);
  const [avatar, setAvatar] = useState("");
  const [isAvatarChanged, setIsAvatarChanged] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    dispatch(getRiderProfile());
  }, [dispatch]);

  useEffect(() => {
    if (rider?.avatar) {
      setAvatar(rider.avatar);
    }
  }, [rider]);

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const imageUri = result.assets[0].uri;
        setAvatar(imageUri);
        setIsAvatarChanged(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
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
      await dispatch(updateRiderAvatar(imageUrl));
      setIsAvatarChanged(false);
      Alert.alert("Success", "Profile photo updated successfully");
    } catch (error) {
      console.error("Failed to upload avatar", error);
      Alert.alert("Update Failed", "Please try again");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout Confirmation",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            await dispatch(riderLogout());
            navigation.navigate("login");
          },
          style: "destructive"
        }
      ]
    );
  };

  if (loading && !rider) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#e01d47" />
        <Text style={tw`mt-3 text-base text-[#e01d47]`}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`pb-24`}
      >
        {/* Profile Header */}
        <View style={tw`bg-[#e01d47] pt-16 pb-8 rounded-b-[30px]`}>
          <View style={tw`items-center`}>
            {/* Profile Image */}
            <View style={tw`mb-4`}>
              <View style={tw`relative`}>
                {avatar ? (
                  <Image 
                    source={{ uri: avatar }} 
                    style={tw`w-28 h-28 rounded-full border-4 border-white`} 
                  />
                ) : (
                  <View style={tw`w-28 h-28 rounded-full border-4 border-white bg-black/20 justify-center items-center`}>
                    <Text style={tw`text-4xl font-bold text-white`}>
                      {rider?.fname?.charAt(0) || ""}
                      {rider?.lname?.charAt(0) || ""}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={openImagePicker}
                  style={tw`absolute bottom-1 right-1 bg-[#e01d47] w-9 h-9 rounded-full justify-center items-center border-3 border-white`}
                >
                  <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Name */}
            <Text style={tw`text-2xl font-bold text-white mb-1`}>
              {rider?.fname} {rider?.lname}
            </Text>
            <Text style={tw`text-sm text-white bg-black/20 px-3 py-1 rounded-full`}>
              KNM Delivery Rider
            </Text>

            {/* Update Avatar Button */}
            {isAvatarChanged && (
              <TouchableOpacity 
                style={tw`bg-black/25 px-5 py-2 rounded-full mt-4`}
                onPress={handleAvatarUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={tw`text-white font-semibold`}>Update Photo</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={tw`px-5 py-6`}>
          {/* Personal Information */}
          <Text style={tw`text-lg font-semibold text-gray-700 mb-3 ml-1`}>Personal Information</Text>
          
          <View style={tw`bg-white rounded-2xl p-4 shadow mb-3`}>
            <View style={tw`flex-row items-center mb-3`}>
              <View style={tw`w-12 h-12 rounded-full bg-[#e01d47]/10 items-center justify-center mr-4`}>
                <Ionicons name="mail" size={22} color="#e01d47" />
              </View>
              <View>
                <Text style={tw`text-xs text-gray-500`}>Email Address</Text>
                <Text style={tw`text-base font-semibold text-gray-800`}>{rider?.email || "Not provided"}</Text>
              </View>
            </View>
            
            <View style={tw`h-[1px] bg-gray-100 my-2`} />
            
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-12 h-12 rounded-full bg-[#e01d47]/10 items-center justify-center mr-4`}>
                <Ionicons name="call" size={22} color="#e01d47" />
              </View>
              <View>
                <Text style={tw`text-xs text-gray-500`}>Phone Number</Text>
                <Text style={tw`text-base font-semibold text-gray-800`}>{rider?.phone || "Not provided"}</Text>
              </View>
            </View>
          </View>
          
          {/* Account Settings */}
          <Text style={tw`text-lg font-semibold text-gray-700 mt-6 mb-3 ml-1`}>Account Settings</Text>
          
          <TouchableOpacity 
            style={tw`bg-white rounded-2xl p-4 shadow flex-row items-center mb-3`}
            onPress={() => navigation.navigate("changepassword")}
          >
            <View style={tw`w-10 h-10 rounded-full bg-[#e01d47]/10 items-center justify-center mr-4`}>
              <Ionicons name="key-sharp" size={20} color="#e01d47" />
            </View>
            <Text style={tw`text-base font-medium text-gray-800 flex-1`}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#aaa" />
          </TouchableOpacity>

          {/* App Version */}
          <View style={tw`items-center mt-8`}>
            <Text style={tw`text-sm text-gray-400`}>KNM Delivery App v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Logout Button */}
      <View style={tw`px-5 absolute bottom-20 w-full`}>
        <TouchableOpacity 
          style={tw`bg-[#e01d47] flex-row items-center justify-center py-3.5 rounded-xl shadow`}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={tw`text-white font-semibold text-base ml-2`}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <NewFooter />
    </View>
  );
};

export default MyAccountRider;