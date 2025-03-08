import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import { submitFeedback } from '../../redux/actions/feedbackActions'; // Import the submitFeedback action
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';
import Toast from 'react-native-toast-message'; // Import Toast

const Feedback = () => {
  const [feedback, setFeedback] = useState(''); // State for feedback text
  const [rating, setRating] = useState(0); // State for rating
  const [isFocused, setIsFocused] = useState(false); // State to track if TextInput is focused
  const feedbackRegex = /^.{5,500}$/; // Regex to validate feedback length

  const dispatch = useDispatch(); // Initialize dispatch
  const navigation = useNavigation(); // Initialize navigation

  // Handle rating star click
  const handleStarClick = (star) => {
    setRating(star);
  };

  // Validate feedback and rating
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

  // Handle submit feedback
  const handleSubmitFeedback = () => {
    if (!validateForm()) {
      return;
    }

    // Dispatch the submitFeedback action
    dispatch(submitFeedback(rating, feedback))
      .then(() => {
        // On success, navigate to the home screen
        navigation.navigate('home'); // Replace 'Home' with the correct name of your home screen

        // Show success toast
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Feedback Submitted!',
          text2: 'Your feedback has been successfully submitted.',
        });
      })
      .catch((error) => {
        // Handle error
        console.error('Error submitting feedback:', error);

        // Show error toast
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error!',
          text2: 'Something went wrong. Please try again.',
        });
      });
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="px-5 py-5 flex-1">
          <Header title="Feedback" />
  
          {/* Rating Section */}
          <View className="items-center mt-20">
            <Text className="text-2xl font-bold mb-3">How would you rate our app?</Text>
            <View className="flex-row justify-center mb-5">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarClick(star)}>
                  <Text className={`text-2xl ${rating >= star ? "text-yellow-400" : "text-gray-400"}`}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
  
          {/* Feedback Input Section */}
          <View className="mt-5 px-5">
            <Text className="text-[#e01d47] text-xl font-bold">Feedback</Text>
            <TextInput
              className="border border-gray-300 bg-gray-200 rounded-lg p-3 w-full h-40 text-base text-gray-700 mb-10"
              placeholder="Tell us more about your experience..."
              value={feedback}
              onChangeText={setFeedback}
              multiline
              textAlignVertical="top" // Ensures placeholder starts at the top
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-10 w-full px-10">
        <TouchableOpacity
          onPress={handleSubmitFeedback}
          className="bg-[#e01d47] py-3 rounded-lg items-center w-full"
        >
          <Text className="text-white font-bold text-lg">Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Feedback;