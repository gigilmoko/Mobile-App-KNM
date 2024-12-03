import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Button, ActivityIndicator } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getSingleCategory, updateCategory } from "../../../redux/actions/categoryActions";

const AdminCategoryUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  // Get categoryId from route parameters
  const { categoryId } = route.params;
  console.log("Category ID from route:", categoryId); // Log the categoryId from the route params

  const { category, loading, success } = useSelector((state) => state.category);

  const [updatedCategory, setUpdatedCategory] = useState({
    name: "",
    description: "",
  });

  // Fetch the category details using the categoryId when the component mounts
  useEffect(() => {
    if (categoryId) {
      console.log("Fetching category details for ID:", categoryId); // Added log for categoryId
      dispatch(getSingleCategory(categoryId));
    }
  }, [dispatch, categoryId]);

  // Once category is fetched, populate the form with the existing data
  useEffect(() => {
    if (category) {
      console.log("Fetched category details:", category); // Log fetched category details
      setUpdatedCategory({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category]);

  // Handle input change for the form fields
  const handleInputChange = (field, value) => {
    setUpdatedCategory((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Handle category update on form submission
  const handleUpdate = () => {
    console.log("Updating category with data:", updatedCategory); // Log updated category data
  
    // Ensure categoryId is included in the payload
    const updatedCategoryData = {
      ...updatedCategory,
      _id: categoryId, // Add categoryId to the request data
 
    };
  
    dispatch(updateCategory(updatedCategoryData));
  
    if (success) {
      console.log("Category updated successfully!"); // Log success message
      navigation.navigate("admincategory");
    }
  };
  

  return (
    <View className="flex-1 bg-yellow-400">
      <Header back={true} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg">Loading category details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}>
          <View className="bg-white rounded-t-3xl pt-0 mt-5 h-full px-4 shadow-lg">
            <View className="items-center">
              <Text className="text-xl font-bold mt-3 mb-1">Category Update</Text>
            </View>
           
            <View className="mt-5">
              <Text className="text-lg font-bold">Category Name</Text>
              <TextInput
                value={updatedCategory.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Category Name"
                className="border-b-2 border-gray-300 p-2 text-lg mt-4"
              />
            </View>

            <View className="mt-5">
              <Text className="text-lg font-bold">Description</Text>
              <TextInput
                value={updatedCategory.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Category Description"
                multiline
                className="border-b-2 border-gray-300 p-2 text-lg mt-4"
              />
            </View>

            <View className="mt-5">
              <Button title="Update Category" onPress={handleUpdate} />
            </View>
          </View>

          <View className="absolute bottom-0 w-full pt-0">
            <Footer activeRoute={"home"} />
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default AdminCategoryUpdate;
