import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { submitProductFeedback } from '../../redux/actions/productFeedbackActions'; // Import the action
import { getProductDetails } from '../../redux/actions/productActions';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Toast from 'react-native-toast-message';

const ProductFeedback = ({ route }) => {
  const { orderId, productId } = route.params;

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const feedbackRegex = /^.{5,500}$/;

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Get product details from Redux state
  const { product, loading, error } = useSelector((state) => state.product);

  // Fetch product details when component mounts
  useEffect(() => {
    dispatch(getProductDetails(productId));
  }, [dispatch, productId]);

  // Handle star click for rating
  const handleStarClick = (star) => {
    setRating(star);
  };

  // Validate the form
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

  // Submit the feedback
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

  return (
    <View className="flex-1" style={{ backgroundColor: '#ffb703' }}>
      <Header back={true} />

      {/* ScrollView added here to enable scrolling */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
        <View
          className="flex-1 items-center p-4"
          style={{
            backgroundColor: 'white',
            borderTopRightRadius: 50,
            borderTopLeftRadius: 50,
            paddingVertical: 50,
            paddingHorizontal: 10,
            marginTop: 30,
            elevation: 5,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
          }}
        >
          <Text
            className="text-xl font-bold text-gray-800 mb-8 text-center"
            style={{ position: 'relative', top: 30 }}
          >
            Product Feedback
          </Text>

          {/* Product Card */}
          {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
              <Text style={{ color: 'red' }}>{error}</Text>
            ) : (
            <View
              style={{
                backgroundColor: '#f8f8f8',
                padding: 20,
                borderRadius: 10,
                width: '90%',
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
                elevation: 5,
              }}
            >
              {/* Product Image */}
              <Image
                source={{ uri: product.images && product.images[0]?.url }} // Safe check for undefined images array
                style={{
                  width: '100%',
                  height: 200,
                  resizeMode: 'contain',
                  borderRadius: 10,
                  marginBottom: 15,
                }}
              />
              <Text className="text-lg font-bold text-gray-800 mb-2">{product.name}</Text>
              <Text className="text-sm text-gray-600 mb-2">{product.description}</Text>
              <Text className="text-md font-semibold text-gray-800">Price: ${product.price}</Text>
            </View>
          )}

          {/* Rating Stars */}
          <View className="flex-row justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleStarClick(star)}>
                <Text
                  style={{
                    fontSize: 24,
                    color: rating >= star ? '#FFD700' : '#CCCCCC',
                  }}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback Text Input */}
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
              padding: 10,
              width: '90%',
              height: 150,
              textAlignVertical: 'top',
              marginBottom: 30,
            }}
            placeholder="Enter your feedback here"
            value={feedback}
            onChangeText={setFeedback}
            multiline
            numberOfLines={3}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmitFeedback}
            style={{
              backgroundColor: '#bc430b',
              paddingVertical: 10,
              paddingHorizontal: 15,
              borderRadius: 8,
              width: '90%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
              Submit Feedback
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {!isFocused && <Footer />}
    </View>
  );
};

export default ProductFeedback;
