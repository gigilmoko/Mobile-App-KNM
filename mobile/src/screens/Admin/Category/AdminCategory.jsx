import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, Dimensions } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories, deleteCategory } from "../../../redux/actions/categoryActions";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler"; // Import Swipeable for swipe actions
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

const AdminCategory = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { categories, loading } = useSelector((state) => state.category);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => {
      subscription?.remove();
    };
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigation.navigate("admincategoryupdate", { categoryId });
  };

  const handleNewCategoryClick = () => {
    navigation.navigate("admincategorycreate");
  };

  const handleDelete = (categoryId) => {
    Alert.alert("Delete Category", "Are you sure you want to delete this category?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          setIsDeleting(true);
          dispatch(deleteCategory(categoryId));
        },
      },
    ]);
  };

  const handleCheckboxPress = (categoryId) => {
    setSelectedCategories((prevState) => ({
      ...prevState,
      [categoryId]: !prevState[categoryId],
    }));
  };

  const handleDeleteSelected = () => {
    const selectedCategoryIds = Object.keys(selectedCategories).filter((id) => selectedCategories[id]);
    selectedCategoryIds.forEach((categoryId) => {
      dispatch(deleteCategory(categoryId));
    });
    setSelectedCategories({});
  };

  const handleSelectAll = () => {
    const newSelectedCategories = {};
    categories.forEach((category) => {
      newSelectedCategories[category._id] = !selectAll;
    });
    setSelectedCategories(newSelectedCategories);
    setSelectAll(!selectAll);
  };

  const columnWidths = {
    checkbox: screenWidth * 0.1,
    category: screenWidth * 0.45,
    description: screenWidth * 0.45,
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAnyCategorySelected = Object.values(selectedCategories).some((isSelected) => isSelected);

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center py-5 px-5">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>

          {/* Title */}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#e01d47] text-center">
              Categories
            </Text>
          </View>

          {/* Spacer */}
          <View className="w-10" />
        </View>

        {/* Search Box */}
        <View className="flex-row items-center border border-[#e01d47] rounded-full px-4 py-2 mx-5 bg-white">
          <TextInput
            className="flex-1 text-gray-700 placeholder-gray-400"
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#e01d47" />
        </View>

        {/* Delete Button and Filter */}
        <View className="flex-row items-center px-5 my-2">
          <TouchableOpacity onPress={handleSelectAll} className="p-2 bg-white rounded-md items-center justify-center flex-row py-2 mr-2">
            <Ionicons name={selectAll ? "checkbox" : "square-outline"} size={20} color="gray" />
            <Text className="text-gray-700 ml-2">Select All</Text>
          </TouchableOpacity>
          <View className="flex-1" />
          <View className="mr-2">
            {isAnyCategorySelected && (
              <TouchableOpacity 
                onPress={handleDeleteSelected} 
                className="p-2 border border-[#e01d47] bg-white rounded-md items-center justify-center flex-row px-4 py-2"
              >
                <Ionicons name="trash" size={20} color="#e01d47" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">Loading...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
            {/* Table Header */}
            <View className="flex-row bg-[#fce8ec] p-2.5 rounded-md">
              <Text className="font-bold text-gray-800" style={{ width: columnWidths.checkbox }}> </Text>
              <Text className="font-bold text-gray-800" style={{ width: columnWidths.category }}>Category</Text>
              <Text className="font-bold text-gray-800" style={{ width: columnWidths.description }}>Description</Text>
            </View>

            {/* Category List */}
            {filteredCategories.map((category) => (
              <View key={category._id} className="flex-row items-center py-2.5 border-b border-gray-300">
                {/* Checkbox */}
                <TouchableOpacity onPress={() => handleCheckboxPress(category._id)} style={{ width: columnWidths.checkbox }}>
                  <Ionicons name={selectedCategories[category._id] ? "checkbox" : "square-outline"} size={24} color="black" />
                </TouchableOpacity>

                {/* Category Info */}
                <TouchableOpacity onPress={() => handleCategoryClick(category._id)} style={{ width: columnWidths.category }} className="flex-row items-center">
                  <View>
                    <Text className="font-bold text-gray-800">{category.name}</Text>
                  </View>
                </TouchableOpacity>

                {/* Description */}
                <Text 
  className="text-left text-gray-800"
  style={{ width: columnWidths.description }}
  numberOfLines={1} 
  ellipsizeMode="tail"
>
  {category.description}
</Text>

                {/* Delete Button */}
                <TouchableOpacity onPress={() => handleDelete(category._id)} style={{ marginLeft: 10 }}>
                  <Ionicons name="trash" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Floating + Icon Button */}
        <TouchableOpacity
          className="absolute bottom-8 right-6 bg-[#e01d47] p-4 rounded-full shadow-lg"
          onPress={handleNewCategoryClick}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

export default AdminCategory;