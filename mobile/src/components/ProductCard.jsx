import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { getSingleCategory } from "../redux/actions/categoryActions"; // Adjust path as needed

const ProductCard = ({
  stock,
  name,
  price,
  image,
  id,
  addToCartHandler,
  navigate,
  category, // This is the category ID
}) => {
  const [categoryName, setCategoryName] = useState("Loading...");
  const dispatch = useDispatch();
  const categoryData = useSelector((state) => state.category.category); // FIXED: Correct selector

  useEffect(() => {
    if (category && typeof category === "string" && category.length === 24) {
      dispatch(getSingleCategory(category));
    }
  }, [dispatch, category]);

  useEffect(() => {
    if (categoryData && categoryData._id === category) {
      setCategoryName(categoryData.name);
    }
  }, [categoryData, category]);

  return (
    <TouchableOpacity
      onPress={() => navigate.navigate("productdetail", { id })}
      style={{
        width: 180,
        borderWidth: 1,
        borderColor: "#ff6b81",
        borderRadius: 12,
        backgroundColor: "#fff",
        padding: 10,
        margin: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        position: "relative",
      }}
    >
      {/* Product Image */}
      <View style={{ position: "relative" }}>
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
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            backgroundColor: "#ff6b81",
            borderRadius: 20,
            width: 35,
            height: 35,
            justifyContent: "center",
            alignItems: "center",
            elevation: 3,
            zIndex: 10,
          }}
        >
          <FontAwesome name="shopping-cart" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Name and Price in the Same Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 5,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#333" }}>{name}</Text>
        <Text style={{ fontSize: 12, fontWeight: "bold", color: "#ff6b81" }}>₱{price}</Text>
      </View>

      {/* Category and Ratings in the Same Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 3,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 12, color: "#999" }}>{categoryName}</Text>
        <View style={{ flexDirection: "row" }}>
          {[...Array(5)].map((_, index) => (
            <FontAwesome key={index} name="star" size={12} color="#ffcc00" />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
