import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
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

      // Navigate to adminproducts screen after successful creation
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
    <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
      <Header back={true} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
          paddingBottom: 100, // Add padding to avoid overlap with footer
        }}
      >
        <View
          style={{
            backgroundColor: "#F5F5F5",
            width: "90%",
            padding: 20,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              textAlign: "center",
              color: "#333333",
              paddingTop: 15,
            }}
          >
            Create Product
          </Text>

          {/* Product Name */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Product Name*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Enter product name"
            value={productName}
            onChangeText={setProductName}
          />

          {/* Description */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Description*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="Enter product description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Price */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Price*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Enter price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Stock */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Stock*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Enter stock quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />

          {/* Category Dropdown */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Category*
          </Text>
          <View style={{ borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 5, marginBottom: 15 }}>
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

          {/* Image Picker */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Product Images*
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <TouchableOpacity
              onPress={openImagePicker}
              style={{
                backgroundColor: "#ffb703",
                padding: 12,
                borderRadius: 5,
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#000" />
            </TouchableOpacity>

            {images.length > 0 && (
              <ScrollView horizontal>
                <View style={{ flexDirection: "row" }}>
                  {images.map((imageUri, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageUri }}
                      style={{ width: 100, height: 100, borderRadius: 10, marginRight: 10 }}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#ffb703",
              padding: 12,
              borderRadius: 5,
              alignItems: "center",
            }}
            disabled={isUpdating}
          >
            <Text style={{ color: "#000", fontWeight: "bold" }}>
              {isUpdating ? 'Creating...' : 'Create Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <Footer activeRoute={"home"} />
      </View>
    </View>
  );
};

export default AdminProductsCreate;