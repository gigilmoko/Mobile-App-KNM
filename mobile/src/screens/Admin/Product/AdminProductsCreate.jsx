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
    <View style={{ flex: 1 }}>
      <Header back={true} />
      <ScrollView
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Product</Text>

          {/* Product Name */}
          <Text style={styles.label}>Product Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={productName}
            onChangeText={setProductName}
          />

          {/* Description */}
          <Text style={styles.label}>Description*</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Enter product description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Price */}
          <Text style={styles.label}>Price*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Stock */}
          <Text style={styles.label}>Stock*</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter stock quantity"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />

          {/* Category Dropdown */}
          <Text style={styles.label}>Category*</Text>
          <View style={styles.pickerContainer}>
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
          <Text style={styles.label}>Product Images*</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <TouchableOpacity
              onPress={openImagePicker}
              style={styles.imagePickerButton}
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
                      style={styles.selectedImage}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={isUpdating}
          >
            <Text style={styles.submitButtonText}>
              {isUpdating ? 'Creating...' : 'Create Product'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "90%",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 20,
    elevation: 5, 
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333333",
    paddingTop: 15,
  },
  label: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    marginBottom: 15,
  },
  imagePickerButton: {
    backgroundColor: "#DDDDDD",
    padding: 12,
    borderRadius: 5,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: "#bc430b",
    padding: 12,
    borderRadius:10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AdminProductsCreate;