import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import Toast from "react-native-toast-message"; // Import Toast
import { useDispatch } from "react-redux";
import { createCategory } from "../../../redux/actions/categoryActions";

const AdminCategoryCreate = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();

  const handleCreateCategory = () => {
    if (!name || !description) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Name and Description are required."
      });
      return;
    }

    const categoryData = { name, description }; 
    dispatch(createCategory(categoryData));
    console.log(categoryData)
  };

  return (
    <View className="flex-1 bg-yellow-500">
      <Header back={true} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="bg-white rounded-t-[50px] mt-5 h-full px-4 shadow-lg">
          <View className="items-center">
            <Text className="text-xl font-bold mt-4 mb-2">Create Category</Text>
          </View>

          <View className="mt-5">
            <Text className="text-base font-semibold mb-1">Category Name</Text>
            <TextInput
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter category name"
              value={name}
              onChangeText={setName}
            />

            <Text className="text-base font-semibold mb-1">Description</Text>
            <TextInput
              className="w-full border border-gray-300 rounded-md p-2 mb-4"
              placeholder="Enter category description"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <TouchableOpacity
              className="bg-yellow-500 rounded-md p-3 mt-4"
              onPress={handleCreateCategory}
            >
              <Text className="text-white text-center font-bold">Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="absolute bottom-0 w-full">
          <Footer activeRoute={"home"} />
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminCategoryCreate;