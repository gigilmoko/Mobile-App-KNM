import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories } from "../../../redux/actions/categoryActions";
import { useNavigation } from "@react-navigation/native";

const AdminCategory = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { categories, loading } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigation.navigate("admincategoryupdate", { categoryId });
  };

  const handleNewCategoryClick = () => {
    navigation.navigate("admincategorycreate");
  };

  return (
    <View className="flex-1 bg-[#ffb703]">
      <Header back={true} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg">Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
          <View className="bg-white rounded-t-3xl pt-0 mt-5 h-full px-4 shadow-lg">
            <View className="items-center">
              <Text className="text-xl font-bold mt-3 mb-1">Categories</Text>
            </View>

            <View className="mt-5 mb-4">
              <TouchableOpacity
                onPress={handleNewCategoryClick}
                className="bg-blue-500 p-4 rounded-lg shadow-md"
              >
                <Text className="text-white text-lg font-bold text-center">New Category</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category._id}
                  className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md"
                  onPress={() => handleCategoryClick(category._id)}
                >
                  <Text className="text-lg font-bold">{category.name}</Text>
                  <Text className="text-sm text-gray-600">{category.description}</Text>
                </TouchableOpacity>
              ))}
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

export default AdminCategory;
