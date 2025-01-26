import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Header back={true} />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Submit Your Feedback</Text>
        <Image
          source={{
            uri: 'https://res.cloudinary.com/dglawxazg/image/upload/v1732302161/logo_edz3ze.png',
          }}
          style={styles.logo}
        />
        <Text style={styles.contactDetails}>Email: kbituin123@gmail.com</Text>

        {/* Rating Stars */}
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleStarClick(star)}>
              <Text style={[styles.star, rating >= star && styles.selectedStar]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Text Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter your feedback here"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={3}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        <TouchableOpacity
          onPress={handleSubmitFeedback}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  contactDetails: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  star: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  selectedStar: {
    color: '#FFD700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 10,
    width: '90%',
    height: 150,
    textAlignVertical: 'top',
    marginBottom: 30,
  },
  submitButton: {
    backgroundColor: '#bc430b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Feedback;