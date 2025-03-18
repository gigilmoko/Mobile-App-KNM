import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Header from "../../../components/Layout/Header";
import Toast from "react-native-toast-message"; // Import Toast
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getSingleCategory, updateCategory } from "../../../redux/actions/categoryActions";
import { Ionicons } from "@expo/vector-icons";

const AdminCategoryUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { categoryId } = route.params;

  const { category, loading, success } = useSelector((state) => state.category);

  const [updatedCategory, setUpdatedCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (categoryId) {
      dispatch(getSingleCategory(categoryId));
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (category) {
      setUpdatedCategory({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category]);

  const handleInputChange = (field, value) => {
    setUpdatedCategory((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = () => {
    if (!updatedCategory.name || !updatedCategory.description) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Name and Description are required.",
      });
      return;
    }

    const updatedCategoryData = {
      ...updatedCategory,
      _id: categoryId,
    };

    dispatch(updateCategory(updatedCategoryData));
    if (success) {
      Toast.show({
        type: "success",
        text1: "Category Updated",
        text2: "Category details have been updated successfully.",
      });
      navigation.navigate("admincategory");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg">Loading category details...</Text>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 100, // Prevents content from being cut off
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-11/12 rounded-lg p-5">
              <Header title="Update Category" />

              <Text className="text-sm text-gray-600 font-bold mb-2 mt-5">
                Name <Ionicons name="star" size={12} color="#e01d47" />
              </Text>
              <TextInput
                className="border border-[#CCCCCC] rounded p-2 mb-4"
                placeholder="Enter category name"
                value={updatedCategory.name}
                onChangeText={(text) => handleInputChange("name", text)}
              />

              <Text className="text-sm text-gray-600 font-bold mb-2">
                Description <Ionicons name="star" size={12} color="#e01d47" />
              </Text>
              <TextInput
                className="border border-[#CCCCCC] rounded p-2 mb-4 h-24 text-top"
                placeholder="Enter category description"
                value={updatedCategory.description}
                onChangeText={(text) => handleInputChange("description", text)}
                multiline
              />
            </View>
          </ScrollView>

          {/* Button Fixed at Bottom */}
          <View className="p-5">
            <TouchableOpacity
              className="bg-[#e01d47] p-3 rounded"
              onPress={handleUpdate}
            >
              <Text className="text-center text-white font-bold">
                Update Category
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default AdminCategoryUpdate;