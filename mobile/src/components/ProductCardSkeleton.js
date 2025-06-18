import React from "react";
import { View, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const cardWidth = width / 2 - 24;

const ProductCardSkeleton = () => {
  return (
    <View
      className="m-2 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 animate-pulse"
      style={{ width: cardWidth }}
    >
      {/* Image skeleton */}
      <View 
        className="bg-gray-200" 
        style={{ height: cardWidth * 0.9 }}
      />

      {/* Info section skeleton */}
      <View className="p-3">
        {/* Category skeleton */}
        <View className="bg-gray-200 h-3 w-16 rounded-md mb-2" />

        {/* Title skeleton - two lines */}
        <View className="bg-gray-200 h-4 w-full rounded-md mb-1.5" />
        <View className="bg-gray-200 h-4 w-3/4 rounded-md mb-3" />

        {/* Price and rating skeleton */}
        <View className="flex-row justify-between items-center mt-1">
          <View className="bg-gray-200 h-5 w-16 rounded-md" />
          <View className="bg-gray-200 h-4 w-10 rounded-md" />
        </View>
      </View>
    </View>
  );
};

export default ProductCardSkeleton;