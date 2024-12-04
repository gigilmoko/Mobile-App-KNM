import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import Footer from "../../../components/Layout/Footer";
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

const AdminProductsUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  // Get the productId from route params
  const { productId } = route.params;

  // Redux state: loading, product details, categories
  const { product, loading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);

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
      // Set the fetched product details in local state
      setUpdatedProduct({
        name: product.name || "",
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || "",
        category: product.category || "",
        images: product.images.map(img => img.url) || [], // Initial images from the product
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
        images: uploadResponses, // Add uploaded images with URLs and public_ids
        id: productId, // Add the productId here
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

  return (
    <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
      <Header back={true} />
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ fontSize: 18 }}>Loading product details...</Text>
        </View>
      ) : (
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
              Update Product
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
              value={updatedProduct.name}
              onChangeText={(text) => handleInputChange("name", text)}
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
              value={updatedProduct.description}
              onChangeText={(text) => handleInputChange("description", text)}
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
              value={String(updatedProduct.price)}
              onChangeText={(text) => handleInputChange("price", text)}
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
              value={String(updatedProduct.stock)}
              onChangeText={(text) => handleInputChange("stock", text)}
              keyboardType="numeric"
            />

            {/* Category Dropdown */}
            <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
              Category*
            </Text>
            <View style={{ borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 5, marginBottom: 15 }}>
              <Picker
                selectedValue={updatedProduct.category}
                onValueChange={(value) => handleInputChange("category", value)}
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

              {updatedProduct.images.length > 0 && (
                <ScrollView horizontal>
                  <View style={{ flexDirection: "row" }}>
                    {updatedProduct.images.map((imageUri, index) => (
                      <View key={index} style={{ position: "relative", marginRight: 10 }}>
                        <Image
                          source={{ uri: imageUri }}
                          style={{ width: 100, height: 100, borderRadius: 10 }}
                        />
                        <TouchableOpacity
                          onPress={() => removeImage(imageUri)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            padding: 5,
                            borderRadius: 50,
                          }}
                        >
                          <MaterialCommunityIcons name="close" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleUpdate}
              style={{
                backgroundColor: "#ffb703",
                padding: 12,
                borderRadius: 5,
                alignItems: "center",
              }}
              disabled={isUpdating}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                {isUpdating ? 'Updating...' : 'Update Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Footer */}
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <Footer activeRoute={"home"} />
      </View>
    </View>
  );
};

export default AdminProductsUpdate;