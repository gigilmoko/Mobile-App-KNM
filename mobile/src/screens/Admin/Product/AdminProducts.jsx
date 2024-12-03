import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../../redux/actions/productActions";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { products, loading } = useSelector((state) => state.product); // Removed error handling

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const handleProductClick = (productId) => {
    navigation.navigate("adminproductsupdate", { productId });
  };

  const handleNewProductClick = () => {
    navigation.navigate("adminproductscreate"); // Redirect to the adminproductcreate screen
  };

  return (
    <View className="flex-1 bg-yellow-400">
      <Header back={true} />

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg">Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="bg-white rounded-t-3xl pt-0 mt-5 h-full px-4 shadow-lg">
            <View className="items-center">
              <Text className="text-xl font-bold mt-3 mb-1">Products</Text>
            </View>

            {/* New Product Button */}
            <View className="mt-5 mb-4">
              <TouchableOpacity
                onPress={handleNewProductClick}
                className="bg-blue-500 p-4 rounded-lg shadow-md"
              >
                <Text className="text-white text-lg font-bold text-center">New Product</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-5">
              {products.map((product) => (
                <TouchableOpacity
                  key={product._id} // Corrected key to _id
                  className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md"
                  onPress={() => handleProductClick(product._id)} // Corrected id reference
                >
                  <Text className="text-lg font-bold">{product.name}</Text>
                  <Text className="text-sm text-gray-600">Price: ₱{product.price}</Text>
                  <Text className="text-sm text-gray-600">Stock: {product.stock}</Text>
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

export default AdminProducts;
