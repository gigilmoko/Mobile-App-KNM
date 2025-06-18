import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from "react-native";
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
  const userOrdersMobile = useSelector((state) => state.order) || {}; // Fix: Add default empty object

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { name, price, stock, description, images } = product || {};

  const isOutOfStock = stock === 0;

  useEffect(() => {
    dispatch(getProductDetails(params.id));
    dispatch(fetchProductFeedbacksMobile(params.id));
    dispatch(getUserOrdersMobile());
  }, [dispatch, params.id, isFocused]);

  // Fix: Use optional chaining to prevent errors
  const productExistsInOrders = userOrdersMobile.orders?.find(order =>
    order.orderProducts?.some(orderProduct => orderProduct._id === params.id)
  );

  const orderIdContainingProduct = productExistsInOrders ? productExistsInOrders._id : null;

  const navigateToFeedback = () => {
    navigate.navigate("productfeedback", { orderId: orderIdContainingProduct, productId: params.id });
  };

  useEffect(() => {
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

  const getAverageRating = (feedbacks) => {
    if (!feedbacks || feedbacks.length === 0) return 0;
    const totalRating = feedbacks.reduce((sum, fb) => sum + fb.rating, 0);
    return (totalRating / feedbacks.length).toFixed(1);
  };

  const averageRating = getAverageRating(feedbacks);

  if (isLoading || feedbackLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#e01d47" />
        <Text className="mt-3 text-gray-500">Loading product details...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Floating Action Buttons */}
      <View className="absolute top-10 left-4 right-4 z-10 flex-row justify-between">
        <TouchableOpacity 
          onPress={() => navigate.goBack()} 
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
        >
          <Ionicons name="arrow-back" size={22} color="#e01d47" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => addToWishlistHandler(params.id, name, price, images?.[0]?.url, stock)} 
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
        >
          <Ionicons name="heart-outline" size={22} color="#e01d47" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const contentOffset = e.nativeEvent.contentOffset;
            const viewSize = e.nativeEvent.layoutMeasurement;
            const selectedIndex = Math.floor(contentOffset.x / viewSize.width);
            setSelectedImageIndex(selectedIndex);
          }}
        >
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image.url }}
                className="w-full h-[350px]"
                style={{ width: Dimensions.get("window").width }}
                resizeMode="cover"
              />
            ))
          ) : (
            <View className="w-full h-[350px] flex justify-center items-center bg-gray-100">
              <Ionicons name="image-outline" size={80} color="#d1d1d1" />
              <Text className="text-gray-400 mt-4">No Images Available</Text>
            </View>
          )}
        </ScrollView>

        {/* Image Pagination Dots */}
        {images && images.length > 1 && (
          <View className="flex-row justify-center mt-2">
            {images.map((_, index) => (
              <View 
                key={index}
                className={`h-2 w-2 rounded-full mx-1 ${
                  selectedImageIndex === index ? 'bg-[#e01d47]' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        )}

        {/* Product Information */}
        <View className="px-4 pt-4">
          {/* Category */}
          <Text className="text-xs text-gray-500 mb-1">
            {product?.category?.name || "Uncategorized"}
          </Text>
          
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-gray-800 flex-1 mr-4" numberOfLines={2}>
              {name || "Product Name"}
            </Text>
            <Text className="text-2xl font-bold text-[#e01d47]">
              ₱{parseFloat(price || 0).toFixed(2)}
            </Text>
          </View>

          {/* Ratings */}
          <View className="flex-row items-center mb-3">
            <StarRating rating={averageRating} />
            <Text className="ml-2 text-gray-500">
              ({averageRating}) • {feedbacks?.length || 0} {feedbacks?.length === 1 ? "review" : "reviews"}
            </Text>
          </View>

          {/* Stock Status */}
          <View className="flex-row items-center mb-4">
            <View className={`h-3 w-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'} mr-2`} />
            <Text className={`text-sm ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
              {isOutOfStock ? "Out of Stock" : `${stock} in stock`}
            </Text>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">Description</Text>
            <Text className="text-gray-600 leading-6">
              {description || "No description available"}
            </Text>
          </View>

          {/* Quantity and Add to Cart */}
          <View className="flex-row justify-between items-center mb-6">
            {/* Quantity Selector */}
            <View className="flex-row bg-gray-100 rounded-lg px-2 py-1 items-center">
              <TouchableOpacity 
                onPress={decrementQty} 
                className="w-8 h-8 items-center justify-center"
                disabled={quantity <= 1}
              >
                <Text className={`text-xl ${quantity <= 1 ? 'text-gray-300' : 'text-gray-700'}`}>-</Text>
              </TouchableOpacity>
              <Text className="mx-3 text-base font-medium w-6 text-center">{quantity}</Text>
              <TouchableOpacity 
                onPress={incrementQty} 
                className="w-8 h-8 items-center justify-center"
                disabled={stock <= quantity}
              >
                <Text className={`text-xl ${stock <= quantity ? 'text-gray-300' : 'text-gray-700'}`}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              onPress={() => addToCartHandler(params.id, name, price, images?.[0]?.url, stock)}
              disabled={isOutOfStock}
              className={`py-3 px-6 rounded-lg ${isOutOfStock ? 'bg-gray-400' : 'bg-[#e01d47]'}`}
            >
              <Text className="text-white font-bold">Add to Cart</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="h-px bg-gray-200 my-4" />

          {/* Reviews Section */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-gray-800 mb-3">Reviews</Text>

            {feedbacks && feedbacks.length > 0 ? (
              feedbacks.map((item) => (
                <View key={item._id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    {item.userId?.avatar ? (
                      <Image
                        source={{ uri: item.userId.avatar }}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                    ) : (
                      <View className="w-10 h-10 bg-[#ff7895] rounded-full items-center justify-center mr-3">
                        <Text className="text-white font-bold">
                          {item.userId?.fname?.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </View>
                    )}
                    
                    <View className="flex-1">
                      <Text className="font-bold text-gray-800">
                        {`${item.userId?.fname || ""} ${item.userId?.lname || ""}`}
                      </Text>
                      <View className="flex-row mt-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Ionicons
                            key={idx}
                            name={idx < item.rating ? "star" : "star-outline"}
                            size={14}
                            color="#ffd700"
                          />
                        ))}
                        <Text className="text-xs text-gray-500 ml-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-gray-700">{item.feedback}</Text>
                </View>
              ))
            ) : (
              <View className="py-8 items-center">
                <Ionicons name="chatbox-outline" size={40} color="#d1d1d1" />
                <Text className="text-gray-400 mt-2">No reviews yet</Text>
              </View>
            )}

            {productExistsInOrders && (
              <TouchableOpacity
                onPress={navigateToFeedback}
                className="bg-[#e01d47] py-3 rounded-lg items-center mt-4"
              >
                <Text className="text-white font-bold">Write a Review</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
  }
});

export default ProductDetails;