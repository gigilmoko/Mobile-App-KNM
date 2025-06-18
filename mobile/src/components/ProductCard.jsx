import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 24;

const ProductCard = ({
  id,
  name,
  price,
  stock,
  image,
  categoryName,
  averageRating,
  navigate,
  addToCartHandler,
  addToWishlistHandler,
}) => {
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <TouchableOpacity
      onPress={() => navigate.navigate("productdetail", { id })}
      className="m-2"
      style={{ width: cardWidth }}
    >
      <View className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
        {/* Product Image */}
        <View className="relative">
          <Image
            source={{ uri: image || "https://via.placeholder.com/150" }}
            className="w-full"
            style={{ height: cardWidth * 0.9 }}
            resizeMode="cover"
          />

          {/* Top-right Cart Button */}
          {!isOutOfStock && (
            <TouchableOpacity
              onPress={() => addToCartHandler(id, name, price, image, stock)}
              className="absolute top-2 right-2 bg-[#e01d47] rounded-full w-8 h-8 items-center justify-center shadow-md z-10"
            >
              <Ionicons name="cart-outline" size={16} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Top-left Wishlist Button */}
          <TouchableOpacity
            onPress={() => addToWishlistHandler(id, name, price, image, stock)}
            className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-full w-8 h-8 items-center justify-center shadow-sm z-10"
          >
            <Ionicons name="heart-outline" size={16} color="#e01d47" />
          </TouchableOpacity>

          {/* Stock Badge */}
          {isOutOfStock ? (
            <View className="absolute bottom-2 left-2 bg-gray-800 px-2 py-1 rounded-md">
              <Text className="text-white text-xs font-semibold">Out of Stock</Text>
            </View>
          ) : isLowStock ? (
            <View className="absolute bottom-2 left-2 bg-yellow-400 px-2 py-1 rounded-md">
              <Text className="text-black text-xs font-semibold">Low Stock</Text>
            </View>
          ) : null}
        </View>

        {/* Info Section */}
        <View className="p-3">
          <Text numberOfLines={1} className="text-xs text-gray-500 mb-1">
            {categoryName || "Unknown"}
          </Text>

          <Text numberOfLines={2} className="text-sm font-semibold text-gray-800 min-h-[40px]">
            {name}
          </Text>

          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-base font-bold text-[#e01d47]">
              ₱{parseFloat(price).toFixed(2)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-amber-500 font-medium mr-1">
                {averageRating ? parseFloat(averageRating).toFixed(1) : "0"}
              </Text>
              <FontAwesome name="star" size={12} color="#FFD700" />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
