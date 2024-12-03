import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput, Image, Button } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getProductDetails, updateProduct } from "../../../redux/actions/productActions"; // Assuming the updateProduct action exists

const AdminProductsUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  // Get the productId from route params
  const { productId } = route.params;

  // Redux state: loading, product details
  const { product, loading, success } = useSelector((state) => state.product);

  // Local state for handling updates to product
  const [updatedProduct, setUpdatedProduct] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    images: [],
  });

  useEffect(() => {
    if (productId) {
      // Dispatch the action to fetch product details based on the productId
      dispatch(getProductDetails(productId));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (product) {
      // Set the fetched product details in local state
      setUpdatedProduct({
        name: product.name || "",
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || "",
        images: product.images || [],
      });
    }
  }, [product]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setUpdatedProduct((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  // Handle product update
  const handleUpdate = () => {
    // Dispatch the update product action
    dispatch(updateProduct(updatedProduct));
    if (success) {
      // Navigate to another page or show a success message
      navigation.goBack();
    }
  };

  return (
    <View className="flex-1 bg-yellow-400">
      <Header back={true} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg">Loading product details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 70}}>
          <View className="bg-white rounded-t-3xl pt-0 mt-5 h-full px-4 shadow-lg">
            <View className="items-center">
              <Text className="text-xl font-bold mt-3 mb-1">Product Update</Text>
            </View>

            {/* Displaying product images */}
            <View className="mt-5">
              <Text className="text-lg font-bold">Product Images:</Text>
              <ScrollView horizontal>
                {updatedProduct.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image.url }}
                    style={{ width: 100, height: 100, marginRight: 10 }}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Input fields for updating product details */}
            <View className="mt-5">
              <Text className="text-lg font-bold">Product Name</Text>
             
              <TextInput
                value={updatedProduct.name}
                onChangeText={(text) => handleInputChange("name", text)}
                placeholder="Product Name"
                className="border-b-2 border-gray-300 p-2 text-lg"
              />

              <Text className="text-lg font-bold mt-4">Price</Text>
              <TextInput
                value={String(updatedProduct.price)}
                onChangeText={(text) => handleInputChange("price", text)}
                placeholder="Price"
                keyboardType="numeric"
                className="border-b-2 border-gray-300 p-2 text-lg mt-4"
                />

              <Text className="text-lg font-bold mt-4">Stock</Text>
              <TextInput
                value={String(updatedProduct.stock)}
                onChangeText={(text) => handleInputChange("stock", text)}
                placeholder="Stock"
                keyboardType="numeric"
                className="border-b-2 border-gray-300 p-2 text-lg mt-4"
                />

              <Text className="text-lg font-bold mt-4">Description</Text>
              <TextInput
                value={updatedProduct.description}
                onChangeText={(text) => handleInputChange("description", text)}
                placeholder="Description"
                multiline
                className="border-b-2 border-gray-300 p-2 text-lg mt-4"
              />
            </View>

            {/* Update Button */}
            <View className="mt-5">
              <Button title="Update Product" onPress={handleUpdate} />
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

export default AdminProductsUpdate;
