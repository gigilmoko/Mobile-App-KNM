import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Header from "../../../components/Layout/Header";
import Toast from "react-native-toast-message"; // Import Toast
import { useDispatch } from "react-redux";
import { createCategory } from "../../../redux/actions/categoryActions";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation
import { Ionicons } from "@expo/vector-icons";
const AdminCategoryCreate = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const navigation = useNavigation(); // Initialize useNavigation hook
  const [centered, setCentered] = useState(true);

  const handleCreateCategory = () => {
    if (!name || !description) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Name and Description are required.",
      });
      return;
    }

    const categoryData = { name, description };

    // Dispatch createCategory and handle success/failure
    dispatch(createCategory(categoryData))
      .then((response) => {
        // If successful, navigate to admin category list page
        navigation.navigate("admincategory"); // Replace "AdminCategory" with your route name
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Category created successfully!",
        });
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Something went wrong.",
        });
      });

    // console.log(categoryData);
  };

  return (
    <View className="flex-1 bg-white">
    <ScrollView
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100, // Prevents content from being cut off
      }}
      keyboardShouldPersistTaps="handled"
    >  
      <View className="w-11/12 rounded-lg p-5">
        <Header title="Create Category" />
  
        <Text className="text-sm text-gray-600 font-bold mb-2 mt-5">
          Name <Ionicons name="star" size={12} color="#e01d47" />
        </Text>
        <TextInput
          className="border border-[#CCCCCC] rounded p-2 mb-4"
          placeholder="Enter category name"
          value={name}
          onChangeText={setName}
        />
  
        <Text className="text-sm text-gray-600 font-bold mb-2">
          Description <Ionicons name="star" size={12} color="#e01d47" />
        </Text>
        <TextInput
          className="border border-[#CCCCCC] rounded p-2 mb-4 h-24 text-top"
          placeholder="Enter category description"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>
    </ScrollView>
  
    {/* Button Fixed at Bottom */}
    <View className="p-5">
      <TouchableOpacity
        className="bg-[#e01d47] p-3 rounded"
        onPress={handleCreateCategory}
      >
        <Text className="text-center text-white font-bold">
          Create Category
        </Text>
      </TouchableOpacity>
    </View>
  </View>
  
  );
};

export default AdminCategoryCreate;