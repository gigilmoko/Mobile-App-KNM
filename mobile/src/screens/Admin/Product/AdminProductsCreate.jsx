import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Picker } from '@react-native-picker/picker'; // Import Picker from the new package
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message"; // Import Toast
import { getAllCategories } from "../../../redux/actions/categoryActions";
const AdminProductsCreate = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  const dispatch = useDispatch();
  const categories = useSelector(state => state.category.categories); // Assuming categories are in Redux state

  const handleSubmit = () => {
    // Handle the form submission logic here
    // For example, dispatch an action to create a new product
    Toast.show({
      type: "success",
      text1: "Product Created Successfully!",
    });
  };

  useEffect(() => {
    // Dispatch action to fetch categories
    dispatch(getAllCategories());
  }, [dispatch]);

  return (
    <View className="flex-1 bg-yellow-400">
      <Header back={true} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
        <View className="bg-white rounded-t-3xl pt-0 mt-5 h-full px-4 shadow-lg">
          <View className="items-center">
            <Text className="text-2xl font-bold mt-3 mb-4">Create Product</Text>
          </View>

          {/* Product Name */}
          <Text className="text-lg font-semibold mb-2">Product Name</Text>
          <TextInput
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {/* Description */}
          <Text className="text-lg font-semibold mb-2">Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Enter product description"
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {/* Price */}
          <Text className="text-lg font-semibold mb-2">Price</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="Enter price"
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {/* Stock */}
          <Text className="text-lg font-semibold mb-2">Stock</Text>
          <TextInput
            value={stock}
            onChangeText={setStock}
            placeholder="Enter stock quantity"
            keyboardType="numeric"
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {/* Category Dropdown */}
          <Text className="text-lg font-semibold mb-2">Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={{ height: 50, width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}
          >
            <Picker.Item label="Select Category" value="" />
            {categories && categories.map((cat) => (
              <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
            ))}
          </Picker>

          {/* Image URL */}
          <Text className="text-lg font-semibold mb-2">Image URL</Text>
          <TextInput
            value={image}
            onChangeText={setImage}
            placeholder="Enter image URL"
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-500 rounded-lg py-3 mt-4 mb-4 items-center"
          >
            <Text className="text-white text-lg font-semibold">Create Product</Text>
          </TouchableOpacity>
        </View>

        <View className="absolute bottom-0 w-full pt-0">
          <Footer activeRoute={"home"} />
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminProductsCreate;
