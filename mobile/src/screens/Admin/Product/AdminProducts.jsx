import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, Dimensions, TextInput, ScrollView, ImageBackground } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, deleteProduct } from "../../../redux/actions/productActions";
import { getAllCategories } from "../../../redux/actions/categoryActions";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Picker } from '@react-native-picker/picker';
import Icon from "react-native-vector-icons/Ionicons"; 

const AdminProducts = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { products = [], loading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getAllCategories());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(Dimensions.get("window").width);
    };

    const subscription = Dimensions.addEventListener("change", handleResize);
    return () => {
      subscription?.remove();
    };
  }, []);

  // Calculate product stats
  const productStats = {
    total: products.length,
    outOfStock: products.filter(product => product.stock === 0).length,
    lowStock: products.filter(product => product.stock > 0 && product.stock <= 5).length,
  };

  // Get top categories
  const categoryCounts = {};
  products.forEach(product => {
    if (product.category && product.category._id) {
      const categoryId = product.category._id;
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
    }
  });

  const handleProductPress = (productId) => {
    navigation.navigate("adminproductsupdate", { productId });
  };

  const handleCheckboxPress = (productId) => {
    setSelectedProducts((prevState) => ({
      ...prevState,
      [productId]: !prevState[productId],
    }));
  };

  const handleDeleteSelected = () => {
    const selectedProductIds = Object.keys(selectedProducts).filter((id) => selectedProducts[id]);
    selectedProductIds.forEach((productId) => {
      dispatch(deleteProduct(productId));
    });
    setSelectedProducts({});
  };

  const handleSelectAll = () => {
    const newSelectedProducts = {};
    filteredProducts.forEach((product) => {
      newSelectedProducts[product._id] = !selectAll;
    });
    setSelectedProducts(newSelectedProducts);
    setSelectAll(!selectAll);
  };

  const columnWidths = {
    checkbox: screenWidth * 0.1,
    product: screenWidth * 0.45,
    price: screenWidth * 0.2,
    stock: screenWidth * 0.1,
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory ? product.category?._id === selectedCategory : true)
  );

  const isAnyProductSelected = Object.values(selectedProducts).some((isSelected) => isSelected);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center py-5 px-5">
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Title */}
        <View className="flex-1">
          <Text className="text-2xl font-bold text-[#e01d47] text-center">
            Product Management
          </Text>
        </View>

        {/* Spacer */}
        <View className="w-10" />
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between px-5 my-3">
        <View className="bg-blue-500 p-4 rounded-lg w-[31%] shadow-sm">
          <View className="bg-blue-400 rounded-full w-10 h-10 items-center justify-center mb-2">
            <Ionicons name="cube-outline" size={24} color="#fff" />
          </View>
          <Text className="text-xl font-bold text-white">{productStats.total}</Text>
          <Text className="text-white text-xs">Total Products</Text>
        </View>
        
        <View className="bg-amber-500 p-4 rounded-lg w-[31%] shadow-sm">
          <View className="bg-amber-400 rounded-full w-10 h-10 items-center justify-center mb-2">
            <Ionicons name="alert-circle-outline" size={24} color="#fff" />
          </View>
          <Text className="text-xl font-bold text-white">{productStats.lowStock}</Text>
          <Text className="text-white text-xs">Low Stock</Text>
        </View>
        
        <View className="bg-red-500 p-4 rounded-lg w-[31%] shadow-sm">
          <View className="bg-red-400 rounded-full w-10 h-10 items-center justify-center mb-2">
            <Ionicons name="close-circle-outline" size={24} color="#fff" />
          </View>
          <Text className="text-xl font-bold text-white">{productStats.outOfStock}</Text>
          <Text className="text-white text-xs">Out of Stock</Text>
        </View>
      </View>

      {/* Search Box */}
      <View className="flex-row items-center border border-[#e01d47] rounded-full px-4 py-2 mx-5 bg-white">
        <TextInput
            className="flex-1 text-gray-700 placeholder-gray-400"
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="#e01d47" />
      </View>

      {/* Delete Button and Filter */}
      <View className="flex-row items-center px-5">
        <TouchableOpacity onPress={handleSelectAll} className="p-2 bg-white rounded-md items-center justify-center flex-row py-2 mr-2">
          <Ionicons name={selectAll ? "checkbox" : "square-outline"} size={20} color="gray" />
          <Text className="text-gray-700 ml-2">Select All</Text>
        </TouchableOpacity>
        <View className="flex-1" />
        <View className="mr-2">
        {isAnyProductSelected && (
            <TouchableOpacity 
              onPress={handleDeleteSelected} 
              className="p-2 border border-[#e01d47] bg-white rounded-md items-center justify-center flex-row px-4 py-2"
            >
              <Ionicons name="trash" size={20} color="#e01d47" />
            </TouchableOpacity>
          )}
        </View>
        <View className="flex-row items-center space-x-2 border border-gray-300 rounded-md px-2 my-5">
        
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={{ height: 40, width: 40, fontSize: 12 }}
          >
            <Picker.Item label="Filter" value="" style={{ fontSize: 12 }} />
            {categories.map((category) => (
              <Picker.Item key={category._id} label={category.name} value={category._id} style={{ fontSize: 12 }} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Categories Overview */}
      <View className="px-5 mb-3">
        <Text className="font-bold text-gray-700 mb-2">Category Overview</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-2">
          {categories.map(category => {
            const count = categoryCounts[category._id] || 0;
            return (
              <TouchableOpacity 
                key={category._id} 
                className="mr-3 px-3 py-2 bg-gray-100 rounded-md"
                onPress={() => setSelectedCategory(category._id === selectedCategory ? "" : category._id)}
              >
                <Text className="font-medium">{category.name}</Text>
                <Text className="text-xs text-gray-500">{count} products</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">Loading...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
          {/* Table Header */}
          <View className="flex-row bg-[#fce8ec] p-2.5 rounded-md">
            <Text className="font-bold text-gray-800" style={{ width: columnWidths.checkbox }}> </Text>
            <Text className="font-bold text-gray-800" style={{ width: columnWidths.product }}>Product</Text>
            <Text className="font-bold text-gray-800" style={{ width: columnWidths.price }}>Price</Text>
            <Text className="font-bold text-gray-800" style={{ width: columnWidths.stock }}>Stock</Text>
          </View>

          {/* Product List */}
          {filteredProducts.map((item) => (
            <View key={item._id} className="flex-row items-center py-2.5  border-b border-gray-300">
              {/* Checkbox */}
              <TouchableOpacity onPress={() => handleCheckboxPress(item._id)} style={{ width: columnWidths.checkbox }}>
                <Ionicons name={selectedProducts[item._id] ? "checkbox" : "square-outline"} size={24} color="black" />
              </TouchableOpacity>

              {/* Product Info */}
              <TouchableOpacity onPress={() => handleProductPress(item._id)} style={{ width: columnWidths.product }} className="flex-row items-center">
                <ImageBackground
                  source={{ uri: item.images?.[0]?.url || "https://via.placeholder.com/150" }}
                  style={{ width: 50, height: 50, marginRight: 10 }}
                  imageStyle={{ borderRadius: 8 }} 
                />
                <View>
                  <Text className="font-bold text-gray-800">{item.name}</Text>
                  <Text className="text-gray-500 text-xs">{item.category?.name}</Text>
                  <View className="flex-row mt-1.25">
                    <View className={`py-0.75 px-2 rounded-full ${item.stock === 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                      <Text className={`text-xs ${item.stock === 0 ? 'text-red-800' : 'text-green-800'}`}>
                        {item.stock === 0 ? 'Out of Stock' : 'Active'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Price and Stock */}
              <Text className="text-center text-gray-800" style={{ width: columnWidths.price }}>₱{item.price.toFixed(2)}</Text>
              <Text className="text-center text-gray-800" style={{ width: columnWidths.stock }}>{item.stock}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-6 bg-[#e01d47] p-4 rounded-full shadow-lg"
        onPress={() => navigation.navigate("adminproductscreate")}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminProducts;