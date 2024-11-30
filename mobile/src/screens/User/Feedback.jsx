import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
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
        <View className="flex-1" style={{ backgroundColor: '#ffb703' }}>
            <Header back={true} />

            {/* Centered Content in a Box */}
            <View
                className="flex-1 items-center p-4"
                style={{
                    backgroundColor: 'white',
                    borderTopRightRadius: 50,
                    borderTopLeftRadius: 50,
                    paddingVertical: 50,
                    paddingHorizontal: 10,
                    height: '100%',
                    marginTop: 30,
                    elevation: 5, // Shadow for Android
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                }}
            >
                {/* Feedback Title at the Top */}
                <Text
                    className="text-xl font-bold text-gray-800 mb-8 text-center"
                    style={{ position: 'absolute', top: 30 }} // Position title at the top
                >
                    Submit Your Feedback
                </Text>

                {/* Logo Image */}
                <Image
                    source={{
                        uri: 'https://res.cloudinary.com/dglawxazg/image/upload/v1732302161/logo_edz3ze.png',
                    }}
                    style={{ width: 150, height: 150, marginBottom: 5, marginTop: 50 }}
                />

                {/* Contact Details */}
                <Text className="text-m font-semibold text-gray-800 mb-1 text-center">
                    Email: kbituin123@gmail.com
                </Text>
                <Text className="text-m font-semibold text-gray-800 mb-10 text-center">
                    Contact No. 09993427665
                </Text>

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

            {/* Footer: Show it only when TextInput is not focused */}
            {!isFocused && <Footer />}
        </View>
    );

};

export default Feedback;
