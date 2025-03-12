import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from "react-native";
import Header from "../../components/Layout/Header";
import { Avatar, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getProductDetails } from "../../redux/actions/productActions";
import { Ionicons } from "@expo/vector-icons";
import { fetchProductFeedbacksMobile } from "../../redux/actions/productFeedbackActions";
import { getUserOrdersMobile } from "../../redux/actions/orderActions";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const QuantityControl = React.memo(({ quantity, incrementQty, decrementQty }) => (
  <View style={styles.quantityControl}>
    <TouchableOpacity onPress={decrementQty} disabled={quantity <= 1}>
      <Avatar.Icon
        icon={"minus"}
        size={20}
        style={styles.quantityButton}
      />
    </TouchableOpacity>
    <Text style={styles.quantity}>{quantity}</Text>
    <TouchableOpacity onPress={incrementQty}>
      <Avatar.Icon
        icon={"plus"}
        size={18}
        style={styles.quantityButton}
      />
    </TouchableOpacity>
  </View>
));

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Ionicons
        key={i}
        name={i <= rating ? "star" : "star-outline"}
        size={20}
        color="#ffd700"
      />
    );
  }
  return <View style={{ flexDirection: "row" }}>{stars}</View>;
};

const ProductDetails = ({ route: { params } }) => {
  const navigate = useNavigation();
const dispatch = useDispatch();
const isFocused = useIsFocused();

const { isLoading, product, error } = useSelector((state) => state.product);
const { feedbacks, feedbackLoading } = useSelector((state) => state.feedbacks);
const { user } = useSelector((state) => state.user);
const userOrdersMobile = useSelector((state) => state.order);

const [quantity, setQuantity] = useState(1);
const { name, price, stock, description, images } = product || {};

const isOutOfStock = stock === 0;

useEffect(() => {
  dispatch(getProductDetails(params.id));
  dispatch(fetchProductFeedbacksMobile(params.id));
  dispatch(getUserOrdersMobile());
}, [dispatch, params.id, isFocused]);

// console.log("User Orders Mobile:", userOrdersMobile);
// console.log("Product Details:", product);

const productExistsInOrders = userOrdersMobile.orders?.find(order =>
  order.orderProducts.some(product => product._id === product._id)
);

const orderIdContainingProduct = productExistsInOrders ? productExistsInOrders._id : null;

// console.log("Product exists in orders:", !!productExistsInOrders);
// console.log("Order ID containing product:", orderIdContainingProduct);

const navigateToFeedback = () => {
  navigate.navigate("productfeedback", { orderId: orderIdContainingProduct, productId: params.id });
};

useEffect(() => {
  if (product) {
    
  }
  if (error) {
    Toast.show({
      type: "error",
      text1: error,
    });
  }
}, [product, error]);

const incrementQty = () => {
  if (stock <= quantity) {
    return Toast.show({
      type: "error",
      text1: "Maximum Value Added",
    });
  }
  setQuantity((prev) => prev + 1);
};

const decrementQty = () => {
  if (quantity <= 1) return;
  setQuantity((prev) => prev - 1);
};

const addToCartHandler = (id, name, price, image, stock) => {
  if (!user) {
    navigate.navigate("login");
    return Toast.show({
      type: "info",
      text1: "Log in to continue.",
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
      quantity,
    },
  });
  Toast.show({
    type: "success",
    text1: "Added To Cart",
  });
};

const addToWishlistHandler = (id, name, price, image, stock) => {
  if (!user) {
    navigate.navigate("login");
    return Toast.show({
      type: "info",
      text1: "Log in to continue.",
    });
  }

  dispatch({
    type: "addToWishlist",
    payload: {
      product: id,
      name,
      price,
      image,
      stock,
    },
  });

  Toast.show({
    type: "success",
    text1: "Added To Wishlist",
  });
};

if (isLoading || feedbackLoading) {
  return (
    <View style={styles.loadingContainer}>
      <Text>Loading...</Text>
    </View>
  );
}

// console.log(feedbacks);

const getAverageRating = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) return 0;

  const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
  return (totalRating / feedbacks.length).toFixed(1); 
};

const averageRating = getAverageRating(feedbacks);
// console.log("Average Rating:", averageRating);


  
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <View className="absolute top-5 left-5 right-5 z-10 flex-row items-center py-3">
{/* Back Button */}
<TouchableOpacity 
  onPress={() => navigate.goBack()} 
  className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
>
  <Ionicons name="arrow-back" size={20} color="#ffffff" />
</TouchableOpacity>

<View className="flex-1" />

{/* Wishlist Button */}
<TouchableOpacity 
  onPress={() => addToWishlistHandler(params.id, name, price, images[0]?.url, stock)} 
  className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
>
  <Ionicons name="heart" size={20} color="#ffffff" />
</TouchableOpacity>
</View>
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
      {images && images.length > 0 ? (
        images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image
              source={{ uri: image.url }}
              style={styles.image}
            />
          </View>
        ))
      ) : (
        <View className="w-full h-[50vh] flex justify-center items-center bg-gray-200 -mt-8">
          <Text className="text-gray-500">No Images Available</Text>
        </View>
      )}
    </ScrollView>

      <View className="p-4 -mt-10 bg-white rounded-t-3xl shadow-lg flex-1">
        <View className="px-2">
        <View className="flex-row justify-between items-center">
        <Text numberOfLines={2} className="text-2xl font-semibold flex-1">
          {name}
        </Text>
        <Text className="text-lg font-medium text-gray-700">${price}</Text>
      </View>
      <StarRating rating={averageRating} />
        <Text numberOfLines={8} className="text-gray-500 my-4">
          {description}
        </Text>
        </View>

        <View className="flex-row justify-between items-center mt-5 px-2">
        {/* Add to Cart Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() =>
            addToCartHandler(params.id, name, price, images[0]?.url, stock)
          }
          disabled={isOutOfStock}
          className={`bg-[#e01d47] py-3 rounded-lg items-center justify-center flex-1 mr-2 ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        >
          <Text className="text-white font-semibold">{isOutOfStock ? "Out Of Stock" : "Add to Cart"}</Text>
        </TouchableOpacity>

        {/* Quantity Control */}
        <View className="w-1/3 bg-[#f5a8b8] flex-row items-center justify-between px-2 py-2 rounded-lg">
          <TouchableOpacity onPress={decrementQty} className="px-2">
            <Text className="text-white text-lg font-bold">-</Text>
          </TouchableOpacity>
          
          <Text className="text-white text-lg font-semibold">{quantity}</Text>
          
          <TouchableOpacity onPress={incrementQty} className="px-2">
            <Text className="text-white text-lg font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>      
      {/* Add Rating Button */}
      
      <View className="p-4 rounded-t-md mt-2">
      <View className="h-1 w-full bg-[#f5a8b8] rounded-full mb-4" />
      <Text className="text-2xl text-[#e01d47] font-bold">Reviews</Text>
      {feedbacks && feedbacks.length > 0 ? (
  <FlatList
    data={feedbacks}
    keyExtractor={(item) => item._id}
    renderItem={({ item }) => (
      <View className="mt-3 p-3 bg-white rounded-md flex-row items-start">
      
      {item.userId?.avatar ? (
          <Image
            source={{ uri: item.userId.avatar }}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <View className="w-10 h-10 bg-pink-300 rounded-full flex items-center justify-center mr-3">
            <Text className="text-white font-bold">
              {item.userId?.fname?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}

        <View className="flex-1">
          {/* User name and stars in the same row, aligned properly */}
          <View className="flex-row justify-between items-center">
            <Text className="font-bold">
              {`${item.userId?.fname || ""} ${item.userId?.middlei || ""} ${item.userId?.lname || ""}`}
            </Text>
            <View className="flex-row">
              {Array.from({ length: item.rating }).map((_, index) => (
                <Text key={index} className="text-yellow-500">⭐</Text>
              ))}
            </View>
          </View>

          {/* Feedback text */}
          <Text className="mt-1 text-gray-700">{item.feedback}</Text>

          {/* Date */}
          {/* <Text className="text-gray-500 text-xs">
            {new Date(item.createdAt).toLocaleDateString()}
          </Text> */}
        </View>
      </View>
    )}
  />
) : (
        <Text className="mt-3 text-gray-500 text-center">
          No reviews available yet.
        </Text>
      )}
      {productExistsInOrders && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={navigateToFeedback}
          className="bg-[#e01d47] py-3 rounded-lg items-center justify-center mt-4"
        >
          <Text className="text-white font-semibold">Add Rating</Text>
        </TouchableOpacity>
      )}
    </View>
    </View>
  </ScrollView>

  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: Dimensions.get("window").width, 
    height: Dimensions.get("window").height / 2 + 60, 
  },
  noImageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2 + 30, 
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginTop: -30, 
  },
  
});

export default ProductDetails;