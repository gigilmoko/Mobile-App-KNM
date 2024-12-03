import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Picker } from '@react-native-picker/picker';
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { getAllCategories } from "../../../redux/actions/categoryActions";
import { newProduct } from "../../../redux/actions/productActions";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import mime from 'mime';

const AdminProductsCreate = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]); // Change to handle multiple images
  const [isUpdating, setIsUpdating] = useState(false);

  const dispatch = useDispatch();
  const categories = useSelector(state => state.category.categories);

  const handleSubmit = async () => {
    if (!productName || !description || !price || !stock || !category || images.length === 0) {
      Toast.show({
        type: "error",
        text1: "All fields are required!",
      });
      return;
    }

    // Prepare form data for image uploads
    const formData = new FormData();
    images.forEach((imageUri, index) => {
      formData.append("file", {
        uri: imageUri,
        type: mime.getType(imageUri),
        name: imageUri.split("/").pop(),
      });
    });
    formData.append("upload_preset", "ml_default");

    try {
      setIsUpdating(true);
      const responses = await Promise.all(
        images.map(imageUri =>
          axios.post(
            'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          )
        )
      );

      // Extract image URLs and public_ids from responses
      const imageData = responses.map(response => ({
        public_id: response.data.public_id,
        url: response.data.secure_url,
      }));

      const productData = {
        name: productName,
        description,
        price,
        stock,
        category,
        images: imageData,
      };

      console.log("Data sent to newProduct action:", productData);
      dispatch(newProduct(productData));

      setIsUpdating(false);
      Toast.show({
        type: "success",
        text1: "Product Created Successfully!",
      });
    } catch (error) {
      console.error('Failed to upload images or create product', error);
      setIsUpdating(false);
      Toast.show({
        type: "error",
        text1: "Failed to create product. Please try again.",
      });
    }
  };

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return alert("Permission to access gallery is required");
    }
    const data = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true, // Allow multiple image selection
      selectionLimit: 5, // You can set the limit if needed
    });

    if (data.assets) {
      const imageUris = data.assets.map(asset => asset.uri);
      setImages(imageUris); // Set multiple images
    }
  };

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

          {/* Image Picker */}
          <Text className="text-lg font-semibold mb-2">Product Images</Text>
          <TouchableOpacity
            onPress={openImagePicker}
            className="bg-blue-500 rounded-lg py-3 mb-4 items-center"
          >
            <Text className="text-white text-lg font-semibold">Choose Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View className="flex-row flex-wrap mb-4">
              {images.map((imageUri, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={{ width: 100, height: 100, borderRadius: 10, margin: 5 }}
                />
              ))}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-500 rounded-lg py-3 mt-4 mb-4 items-center"
            disabled={isUpdating}
          >
            <Text className="text-white text-lg font-semibold">{isUpdating ? 'Creating...' : 'Create Product'}</Text>
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
