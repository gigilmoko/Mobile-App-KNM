import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
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
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons
import { Ionicons } from "@expo/vector-icons";
import { getAllEvents } from "../../../redux/actions/calendarActions"; // Import getAllEvents action

const AdminProductsCreate = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]); // Change to handle multiple images
  const [isUpdating, setIsUpdating] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const categories = useSelector(state => state.category.categories);

  const handleSubmit = async () => {
    if (!productName || !description || !price || !stock || !category || images.length === 0) {
      Toast.show({
        type: "error",
        text1: "All fields are required!",
      });
      return;
    }

    // Remove duplicate image URIs by creating a Set, which automatically removes duplicates
    const uniqueImages = [...new Set(images)];

    // Prepare form data for image uploads
    try {
      setIsUpdating(true);

      // Upload images only once for each unique image URI
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
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          return {
            public_id: response.data.public_id,
            url: response.data.secure_url,
          };
        })
      );

      // Prepare the product data with image URLs
      const productData = {
        name: productName,
        description,
        price,
        stock,
        category,
        images: uploadResponses, // Images are now an array of objects with URLs and public_ids
      };

      // console.log("Data sent to newProduct action:", productData);
      dispatch(newProduct(productData));

      setIsUpdating(false);
      Toast.show({
        type: "success",
        text1: "Product Created Successfully!",
      });

      // Refresh AdminEvents data before navigating
      dispatch(getAllEvents());
      navigation.navigate("adminproducts");
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
    <View className="flex-1 bg-white">
  <ScrollView
    contentContainerStyle={{
      justifyContent: "center",
      alignItems: "center",
    }}
  >       
    <View className="w-11/12 rounded-lg p-5">
      <Header title="Create Product" />

      {/* Basic Information */}
      <View className="flex-row items-center mb-2">
        <Ionicons name="alert-circle-outline" size={20} color="#e01d47" />
        <Text className="text-sm text-gray font-bold ml-2">Basic Information</Text>
      </View>

      <Text className="text-md font-bold text-gray-600 mb-2">Product Name <Ionicons name="star" size={12} color="#e01d47" /></Text>
      <TextInput
        className="border border-gray-300 rounded-md p-2 mb-4"
        placeholder="Enter product name"
        value={productName}
        onChangeText={setProductName}
      />

      <Text className="text-sm font-bold text-gray-600 mb-2">Description <Ionicons name="star" size={12} color="#e01d47" /></Text>
      <TextInput
        className="border border-gray-300 rounded-md p-2 mb-4 h-24 text-top"
        placeholder="Enter product description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text className="text-sm font-bold text-gray-600 mb-2">Category <Ionicons name="star" size={12} color="#e01d47" /></Text>
      <View className="border border-gray-300 rounded-md mb-4">
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
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
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text className="text-sm text-gray-600 font-bold mb-2">Stock <Ionicons name="star" size={12} color="#e01d47" /></Text>
      <TextInput
        className="border border-gray-300 rounded-md p-2 mb-4"
        placeholder="Enter stock quantity"
        value={stock}
        onChangeText={setStock}
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

  {images.length > 0 && (
    <ScrollView horizontal>
      <View className="flex-row ml-2">
        {images.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            className="w-24 h-24 rounded-md mr-2"
          />
        ))}
      </View>
    </ScrollView>
  )}
</View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        className={`bg-[#e01d47] p-3 rounded-md items-center ${isUpdating ? 'opacity-50' : ''}`}
        disabled={isUpdating}
      >
        <Text className="text-white font-bold">
          {isUpdating ? 'Creating...' : 'Create Product'}
        </Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</View>

  );
};

export default AdminProductsCreate;