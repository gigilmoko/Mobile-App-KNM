import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";

const ProductCard = ({
  stock,
  name,
  price,
  image,
  id,
  addToCartHandler,
  navigate,
  categoryName, 
  averageRating, 
}) => {
  // console.log(image)
  // console.log(averageRating)
  return (
    <TouchableOpacity
      onPress={() => navigate.navigate("productdetail", { id })}
      className="w-44 border border-[#ff6b81] rounded-xl bg-white p-2 m-2 shadow-sm relative"
    >
      {/* Product Image */}
      <View className="relative">
      <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            height: 150,
            resizeMode: "cover",
            borderRadius: 10,
          }}
        />

        {/* Cart Icon Positioned on Top of the Image */}
        <TouchableOpacity
          onPress={() => addToCartHandler(id, name, price, image, stock)}
          className="absolute top-1 right-1 bg-[#ff6b81] rounded-full w-9 h-9 flex justify-center items-center shadow-md z-10"
        >
          <FontAwesome name="shopping-cart" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Name and Price in the Same Row */}
      <View className="flex-row justify-between w-full mt-1">
        <Text className="text-xs font-semibold text-gray-800">{name}</Text>
        <Text className="text-xs font-bold text-[#ff6b81]">₱{price}</Text>
      </View>

      {/* Category and Ratings in the Same Row */}
      <View className="flex-row justify-between w-full mt-1 items-center">
        <Text className="text-xs text-gray-500">{categoryName}</Text>
        <View className="flex-row">
          {[...Array(5)].map((_, index) => (
            <FontAwesome
              key={index}
              name="star"
              size={12}
              color={index < Math.round(averageRating) ? "#ffcc00" : "#ccc"} // Display average rating
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
