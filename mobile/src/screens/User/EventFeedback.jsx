import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, Dimensions, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { submitEventFeedback } from '../../redux/actions/eventFeedbackActions';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import { Ionicons } from '@expo/vector-icons';

const EventFeedback = ({ route }) => {
  const { eventId } = route.params;

  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const feedbackRegex = /^.{5,500}$/;

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Get event details from Redux state
  const { event, loading, error } = useSelector((state) => state.calendar);

  // Fetch event details when component mounts
  useEffect(() => {
    dispatch(fetchEvent(eventId));
  }, [dispatch, eventId]);

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
  const handleSubmitReview = () => {
    if (!validateForm()) {
      return;
    }

    dispatch(submitEventFeedback(rating, feedback, eventId))
      .then(() => {
        navigation.navigate('home'); // Navigate back to home after successful submission
        Toast.show({
          type: 'success',
          position: 'bottom',
          text1: 'Review Submitted!',
          text2: 'Your review has been successfully submitted.',
        });
      })
      .catch((error) => {
        console.error('Error submitting review:', error);
        Toast.show({
          type: 'error',
          position: 'bottom',
          text1: 'Error!',
          text2: 'Something went wrong. Please try again.',
        });
      });
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

  return (
    <View className="flex-1 bg-white">
      {/* <Header back={true} /> */}

      {/* ScrollView added here to enable scrolling */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        <View className="absolute top-5 left-5 right-5 z-10 flex-row items-center py-3">
                                {/* Back Button */}
                                <TouchableOpacity 
                                onPress={() => navigation.goBack()} 
                                className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
                                >
                                <Ionicons name="arrow-back" size={20} color="#ffffff" />
                                </TouchableOpacity>
        
                              
        
                                <View className="flex-1 mr-10">
                                    <Text className="text-2xl font-bold text-[#e01d47] text-center">
                                        Event Review
                                    </Text>
                                </View>
        
                                </View>
        <View >
          
          {/* Event Image (Optional) */}
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <Text className="text-red-500">{error}</Text>
          ) : (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                                    {event.image ? (
                                            <Image
                                                source={{ uri: event.image }}
                                                style={styles.image}
                                            />
                                        ) : (
                                            <View className="w-full h-[50vh] flex justify-center items-center bg-gray-200 -mt-8">
                                            <Text className="text-gray-500">No Images Available</Text>
                                            </View>
                                        )}
                                        </ScrollView>
          )}
            <View className="bg-white border border-[#e01d47] rounded-2xl mx-5 -mt-8 shadow-md p-5">
                                      <Text className="text-2xl font-bold text-[#e01d47]">{event.title}</Text>
          
                                      <View className="flex-row items-center mt-2">
                                          <Ionicons name="calendar-outline" size={16} color="#e01d47" />
                                          <Text className="text-gray-600 ml-2">{formatDateTime(event.startDate)}</Text>
                                      </View>
                                      
          
          
                                
                                      
                                  </View>
                                  <View className="items-center">
    {/* Rating Question */}
    <Text className="text-xl text-gray-700 mb-2 mt-5">
        How would you rate this event?
    </Text>

    {/* Star Rating */}
    <View className="flex-row justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleStarClick(star)}>
                <Text className={`text-2xl ${rating >= star ? 'text-[#FFD700]' : 'text-[#CCCCCC]'}`}>
                    ★
                </Text>
            </TouchableOpacity>
        ))}
    </View>

    <Text className="text-m text-gray-700 mb-2 ml-5 self-start">
        Your Review
    </Text>
    
    
    <TextInput
    className="border border-gray-300 rounded-lg bg-[#f5f5f5] p-3 w-[90%] h-36 "
    placeholder="Enter your review here"
    placeholderTextColor="#888"
    value={feedback}
    onChangeText={setFeedback}
    multiline
    numberOfLines={3}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
    textAlignVertical="top" // Moves placeholder & text to the top
/>
<Text className="text-m text-gray-500  mb-4 mx-5 self-start">
    Your review should be at least 20 characters long and focus on 
    the experience and things to improve.
    </Text>

    {/* Submit Button */}
    <TouchableOpacity
    onPress={handleSubmitReview}
    className={`py-3 px-5 rounded-lg w-[90%] items-center ${
        feedback.length >= 20 ? 'bg-[#ff7895]' : 'bg-gray-400'
    }`}
    disabled={feedback.length < 20}
>
    <Text className="text-white font-bold text-lg">Submit Review</Text>
</TouchableOpacity>
</View>
        </View>
      </ScrollView>

      {!isFocused && <Footer />}
    </View>
  );
};

export default EventFeedback;

const styles = StyleSheet.create({
imageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: Dimensions.get("window").width, 
    height: Dimensions.get("window").height / 2 + 60, 
  },
});