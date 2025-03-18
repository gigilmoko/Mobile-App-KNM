import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity } from "react-native";
import Header from "../../../components/Layout/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetails, updateProduct } from "../../../redux/actions/productActions"; 
import { getAllCategories } from "../../../redux/actions/categoryActions"; // Import getAllCategories action
import * as ImagePicker from 'expo-image-picker'; // Updated image picker library
import axios from 'axios'; // Axios for HTTP requests
import Toast from 'react-native-toast-message'; // For notifications
import mime from 'mime';
import { Picker } from '@react-native-picker/picker'; // Import Picker from @react-native-picker/picker
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons
import { Ionicons } from "@expo/vector-icons";

const AdminProductsUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  // Get the productId from route params
  const { productId } = route.params;

  // Redux state: loading, product details, categories
  const { product, loading: loadingProduct } = useSelector((state) => state.product);
  const { categories, loading: loadingCategories } = useSelector((state) => state.category);

  // Local state for handling updates to product
  const [updatedProduct, setUpdatedProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    category: "",
    images: [], // Store image URIs
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (productId) {
      // Dispatch the action to fetch product details based on the productId
      dispatch(getProductDetails(productId));
    }
    // Dispatch the action to fetch all categories
    dispatch(getAllCategories());
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
      setUpdatedProduct({
        name: product.name || "",
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || "",
        category: product.category || "",
        images: product.images ? product.images.map((img) => img.url) : [], // Handle undefined images
      });
    }
  }, [product]);

  const handleInputChange = (field, value) => {
    setUpdatedProduct((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.stock || !updatedProduct.category || updatedProduct.images.length === 0) {
      Toast.show({
        type: "error",
        text1: "All fields are required!",
      });
      return;
    }

    try {
      setIsUpdating(true);

      // Remove duplicate image URIs
      const uniqueImages = [...new Set(updatedProduct.images)];

      // Prepare form data for image uploads
      const uploadResponses = await Promise.all(
        uniqueImages.map(async (imageUri) => {
          const formData = new FormData();
          formData.append("file", {
            uri: imageUri,
            type: mime.getType(imageUri),
            name: imageUri.split("/").pop(),
          });
          formData.append("upload_preset", "ml_default");

          const response = await axios.post(
            'https://api.cloudinary.com/v1_1/dglawxazg/image/upload', 
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );

          return {
            public_id: response.data.public_id,
            url: response.data.secure_url,
          };
        })
      );

      const productData = {
        ...updatedProduct,
        images: uploadResponses, 
        id: productId, 
      };

      dispatch(updateProduct(productData));

      setIsUpdating(false);
      Toast.show({
        type: "success",
        text1: "Product Updated Successfully!",
      });
      navigation.navigate("adminproducts");
    } catch (error) {
      console.error("Failed to upload images or update product", error);
      setIsUpdating(false);
      Toast.show({
        type: "error",
        text1: "Failed to update product. Please try again.",
      });
    }
  };

  // Function to pick images and update the local state
  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return alert("Permission to access gallery is required");
    }
    const data = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });

    if (data.assets) {
      const imageUris = data.assets.map(asset => asset.uri);
      setUpdatedProduct((prevState) => ({
        ...prevState,
        images: [...prevState.images, ...imageUris], // Add selected images
      }));
    }
  };

  // Function to remove an image from the list
  const removeImage = (imageUri) => {
    setUpdatedProduct((prevState) => ({
      ...prevState,
      images: prevState.images.filter((uri) => uri !== imageUri), // Filter out the image to remove
    }));
  };

  // If either product or categories are loading, show a loading screen
  if (loadingProduct || loadingCategories) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}>
        <View className="w-11/12 rounded-lg p-5">
          <Header title="Update Product" />

          {/* Basic Information */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Basic Information</Text>
          </View>

          <Text className="text-md font-bold text-gray-600 mb-2">Product Name <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter product name"
            value={updatedProduct.name}
            onChangeText={(text) => handleInputChange("name", text)}
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Description <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4 h-24 text-top"
            placeholder="Enter product description"
            value={updatedProduct.description}
            onChangeText={(text) => handleInputChange("description", text)}
            multiline
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Category <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <View className="border border-gray-300 rounded-md mb-4">
            <Picker
              selectedValue={updatedProduct.category}
              onValueChange={(itemValue) => handleInputChange("category", itemValue)}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label="Select Category" value="" />
              {categories && categories.map((cat) => (
                <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
              ))}
            </Picker>
          </View>

          {/* Pricing and Inventory */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Pricing and Inventory</Text>
          </View>

          <Text className="text-sm text-gray-600 font-bold mb-2">Price <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter price"
            value={String(updatedProduct.price)}
            onChangeText={(text) => handleInputChange("price", text)}
            keyboardType="numeric"
          />

          <Text className="text-sm text-gray-600 font-bold mb-2">Stock <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter stock quantity"
            value={String(updatedProduct.stock)}
            onChangeText={(text) => handleInputChange("stock", text)}
            keyboardType="numeric"
          />

          {/* Product Images */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="camera-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Product Images</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={openImagePicker}
              className="border border-gray-400 rounded-lg w-24 h-24 flex items-center justify-center"
            >
              <Ionicons name="cloud-upload-outline" size={30} color="gray" />
              <Text className="text-gray-500 text-xs mt-1">Upload</Text>
            </TouchableOpacity>

            {updatedProduct.images.length > 0 && (
              <ScrollView horizontal>
                <View className="flex-row ml-2">
                  {updatedProduct.images.map((imageUri, index) => (
                    <View key={index} className="relative mr-2 mb-2">
                      <Image source={{ uri: imageUri }} className="w-24 h-24 rounded-md" />
                      <TouchableOpacity
                        onPress={() => removeImage(imageUri)}
                        className="absolute top-0 right-0 bg-black bg-opacity-50 p-1 rounded-full"
                      >
                        <MaterialCommunityIcons name="delete" size={24} color="#ff0000" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Update Button */}
          <TouchableOpacity
            className={`bg-[#e01d47] p-3 rounded-md items-center ${isUpdating ? 'opacity-50' : ''}`}
            onPress={handleUpdate}
            disabled={isUpdating}
          >
            <Text className="text-white font-bold">
              {isUpdating ? 'Updating...' : 'Update Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminProductsUpdate;