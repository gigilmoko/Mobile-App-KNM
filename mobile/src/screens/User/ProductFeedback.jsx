import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { submitProductFeedback } from '../../redux/actions/productFeedbackActions'; 
import { getProductDetails } from '../../redux/actions/productActions';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { getOrderDetails } from '../../redux/actions/orderActions';

const ProductFeedback = ({ route }) => {
  const { orderId, productId } = route.params;

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const feedbackRegex = /^.{5,500}$/;

  const dispatch = useDispatch();
  const navigation = useNavigation();

 
  const { product, loading: productLoading, error: productError } = useSelector((state) => state.product);


  const { order, loading: orderLoading, error: orderError } = useSelector((state) => state.order);


  useEffect(() => {
    dispatch(getProductDetails(productId));
  }, [dispatch, productId]);


  useEffect(() => {
    const fetchOrderDetails = async () => {
      const translatedOrderId = orderId; 
      await dispatch(getOrderDetails(translatedOrderId));
    };

    fetchOrderDetails();
  }, [dispatch, orderId]);

  useEffect(() => {
    console.log("Order Details:", order);
  }, [order]);

  const getOrderDate = (order) => {
    if (!order || !order.createdAt) return "N/A";
    const date = new Date(order.createdAt);
    return date.toLocaleDateString();
  };

  const orderDate = getOrderDate(order);

 
  const handleStarClick = (star) => {
    setRating(star);
  };

  const validateForm = () => {
    if (!feedbackRegex.test(feedback.trim())) {
      Alert.alert('Validation Error', 'Feedback must be between 5 and 500 characters!');
      return false;
    }
    if (rating === 0) {
      Alert.alert('Validation Error', 'Please select a rating!');
      return false;
    }
    return true;
  };


  const handleSubmitFeedback = () => {
    if (!validateForm()) {
      return;
    }

    dispatch(submitProductFeedback(rating, feedback, orderId, productId))
      .then(() => {
        navigation.navigate('home');
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Feedback Submitted!',
          text2: 'Your feedback has been successfully submitted.',
        });
      })
      .catch((error) => {
        console.error('Error submitting feedback:', error);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error!',
          text2: 'Something went wrong. Please try again.',
        });
      });
  };

  if (productLoading || orderLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (productError || orderError) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{productError || orderError}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
    <ScrollView contentContainerClassName="flex-grow pb-32">
      <View className="px-5 py-5">
        <View className="flex items-center">
          <Header title="Write a Review" />
          <View className="flex-1 w-full">
            <View className="bg-white p-4 rounded-xl shadow-md m-4">
              <View className="flex-row items-center mb-4">
                <Image
                  source={{ uri: product.images?.[0]?.url }}
                  className="w-16 h-16 rounded-lg mr-3"
                />
                <View>
                  <Text className="text-lg font-bold">{product.name}</Text>
                  <Text className="text-sm text-gray-500">Order ID: {orderId}</Text>
                  <Text className="text-sm text-gray-500">Date Purchased: {orderDate}</Text>
                </View>
              </View>
  
              <Text className="text-center text-lg font-bold my-6">
                How would you rate this product?
              </Text>
  
              <View className="flex-row justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={32} // Enlarged for better touchability
                      color={star <= rating ? "#FFD700" : "#ccc"}
                      className="mx-2"
                    />
                  </TouchableOpacity>
                ))}
              </View>
  
              <Text className="text-sm font-bold mb-1">Your Review</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-3 text-base"
                placeholder="Share your experience with this product"
                multiline
                value={feedback}
                onChangeText={setFeedback}
                style={{ minHeight: 150, textAlignVertical: "top" }} // Ensures text starts from the top
              />
              <Text className="text-xs text-gray-500 mt-2">
                Your review should be at least 20 characters long and focus on the product quality, functionality, and your experience using it.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  
    {/* Fixed Submit Button at Bottom */}
    <View className="absolute bottom-20 left-0 right-0 bg-white p-4 shadow-lg">
  <TouchableOpacity
    onPress={handleSubmitFeedback}
    className="py-3 px-4 rounded-lg w-full items-center"
    style={{
      backgroundColor: feedback.trim().length >= 20 ? "#ff7895" : "#ccc", // Disabled color if less than 20 characters
      opacity: feedback.trim().length >= 20 ? 1 : 0.6, // Reduce opacity if disabled
    }}
    disabled={feedback.trim().length < 20} // Disable button conditionally
  >
    <Text className="text-white font-bold text-lg">Submit Feedback</Text>
  </TouchableOpacity>
</View>
  
    {!isFocused && <Footer />}
  </View>
  
  );
};

export default ProductFeedback;
