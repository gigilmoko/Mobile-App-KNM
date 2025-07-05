import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { submitFeedback } from '../../redux/actions/feedbackActions';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Layout/Header';
import Toast from 'react-native-toast-message';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const feedbackRegex = /^.{5,500}$/;

  const dispatch = useDispatch();
  const navigation = useNavigation();

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
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    
    dispatch(submitFeedback(rating, feedback))
      .then(() => {
        setIsSubmitting(false);
        navigation.navigate('home');
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Thank you for your feedback!',
          text2: 'Your input helps us improve our service.',
        });
      })
      .catch((error) => {
        setIsSubmitting(false);
        console.error('Error submitting feedback:', error);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error',
          text2: 'Something went wrong. Please try again.',
        });
      });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="pt-5 pb-4 px-5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-2">Share Your Feedback</Text>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20 }}>
        {/* Decorative Element */}
        <View className="items-center my-6">
          <View className="w-24 h-24 rounded-full bg-[#fff5f7] items-center justify-center mb-4">
            <Ionicons name="chatbubble-ellipses-outline" size={40} color="#e01d47" />
          </View>
          <Text className="text-gray-600 text-center px-6">
            Your feedback helps us improve our app and provide better service
          </Text>
        </View>
        
        {/* Rating Section */}
        <View className="bg-[#f9f9f9] p-5 rounded-xl shadow-sm mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-800">How would you rate your experience?</Text>
          <View className="flex-row justify-center py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => handleStarClick(star)}
                className="mx-3"
                disabled={isSubmitting}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color={star <= rating ? "#FFD700" : "#d1d1d1"}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Feedback Input */}
        <View className="mb-10">
          <Text className="text-lg font-bold mb-2 text-gray-800">Tell us your thoughts</Text>
          <TextInput
            className="border border-gray-200 bg-gray-50 rounded-xl p-4 text-base text-gray-700"
            placeholder="Share your experience and suggestions for improvement..."
            value={feedback}
            onChangeText={setFeedback}
            multiline
            textAlignVertical="top"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ height: 150 }}
            editable={!isSubmitting}
          />
          <Text className="text-xs text-gray-500 mt-2 ml-2">
            {feedback.length}/500 characters
          </Text>
        </View>
      </ScrollView>
      
      {/* Submit Button */}
      <View className="px-5 pb-8 pt-2 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSubmitFeedback}
          className={`py-3 rounded-xl items-center ${feedback.trim().length >= 5 && rating > 0 && !isSubmitting ? 'bg-[#e01d47]' : 'bg-gray-300'}`}
          disabled={feedback.trim().length < 5 || rating === 0 || isSubmitting}
        >
          <View className="flex-row items-center justify-center">
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-bold text-lg ml-2">Submitting...</Text>
              </>
            ) : (
              <>
                <Text className="text-white font-bold text-lg mr-2">Submit Feedback</Text>
                <Ionicons name="send" size={18} color="white" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Feedback;