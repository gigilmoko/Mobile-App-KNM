import React from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Footer from "../../components/Layout/Footer";

const { width } = Dimensions.get("window");

const Wishlist = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  
  const removeWishlistHandler = (id) => {
    dispatch({
      type: "removeFromWishlist",
      payload: id,
    });
    
    Toast.show({
      type: "success",
      text1: "Removed from Wishlist",
    });
  };
  
  const addToCartHandler = (id, name, price, image, stock) => {
    if (stock === 0) {
      return Toast.show({
        type: "error",
        text1: "Out Of Stock",
      });
    }
    
    dispatch({
      type: "addToCart",
      payload: {
        product: id,
        name,
        price,
        image,
        stock,
        quantity: 1,
      },
    });
    
    Toast.show({
      type: "success",
      text1: "Added To Cart",
    });
  };

  const EmptyWishlist = () => (
    <View className="flex-1 justify-center items-center px-5">
      <Ionicons name="heart-outline" size={80} color="#e0e0e0" />
      <Text className="text-lg font-medium text-gray-500 mt-4">Your wishlist is empty</Text>
      <Text className="text-sm text-gray-400 text-center mt-2 mb-6">
        Add products to your wishlist to save them for later
      </Text>
      <TouchableOpacity
        className="bg-[#e01d47] py-3 px-8 rounded-full"
        onPress={() => navigation.navigate("home")}
      >
        <Text className="text-white font-medium">Browse Products</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-800">
            My Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
          </Text>
          
          <View className="w-8" />
        </View>
      </View>

      {wishlistItems.length > 0 ? (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        >
          {wishlistItems.map((item, index) => (
            <View 
              key={item.product}
              className="mb-3 bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <TouchableOpacity 
                className="flex-row"
                onPress={() => navigation.navigate("productdetail", { id: item.product })}
                activeOpacity={0.9}
              >
                {/* Product Image */}
                <View className="w-24 h-24 bg-gray-100 p-2">
                  <Image
                    source={{ uri: item.image || "https://via.placeholder.com/100" }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                  {item.stock <= 0 && (
                    <View className="absolute inset-0 bg-black bg-opacity-60 rounded-lg items-center justify-center">
                      <Text className="text-white text-xs font-bold">Out of Stock</Text>
                    </View>
                  )}
                </View>
                
                {/* Product Details */}
                <View className="flex-1 p-3 justify-between">
                  <View>
                    <Text numberOfLines={1} className="text-base font-medium text-gray-800">
                      {item.name}
                    </Text>
                    <Text className="text-[#e01d47] font-bold text-lg mt-0.5">
                      ₱{parseFloat(item.price).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View>
                    <Text className="text-xs text-gray-500">
                      {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {/* Action Buttons */}
              <View className="flex-row border-t border-gray-100">
                <TouchableOpacity
                  className="flex-1 py-3 flex-row justify-center items-center"
                  onPress={() => removeWishlistHandler(item.product)}
                >
                  <Ionicons name="trash-outline" size={16} color="#666" />
                  <Text className="ml-2 text-gray-700">Remove</Text>
                </TouchableOpacity>
                
                <View className="w-px bg-gray-100" />
                
                <TouchableOpacity
                  className={`flex-1 py-3 flex-row justify-center items-center ${
                    item.stock <= 0 ? "opacity-50" : ""
                  }`}
                  onPress={() => addToCartHandler(
                    item.product, 
                    item.name, 
                    item.price, 
                    item.image, 
                    item.stock
                  )}
                  disabled={item.stock <= 0}
                >
                  <Ionicons 
                    name="cart-outline" 
                    size={16} 
                    color={item.stock > 0 ? "#e01d47" : "#999"} 
                  />
                  <Text 
                    className={`ml-2 ${item.stock > 0 ? "text-[#e01d47]" : "text-gray-400"}`}
                  >
                    Add to Cart
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyWishlist />
      )}
      
      {/* Footer */}
      <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"wishlist"} />
      </View>
    </View>
  );
};

export default Wishlist;