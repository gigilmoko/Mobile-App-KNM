import React, { useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { loadUser } from '../../redux/actions/userActions';
import { fetchEventFeedbackMobile } from '../../redux/actions/eventFeedbackActions';
import { getUserInterest } from '../../redux/actions/userInterestActions';  // Import the action
import { expressInterest } from '../../redux/actions/userInterestActions';  // Import the expressInterest action
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';

const EventInfo = ({ route }) => {
    const { eventId } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const { event, loading, error } = useSelector(state => state.calendar);
    const { user } = useSelector(state => state.auth || {});
    const { eventFeedback, loadingFeedback } = useSelector(state => state.eventFeedback || {});
    const { interestData, loadingInterest, errorInterest } = useSelector(state => state.userInterested || {});

    const attendedUsers = interestData.attendedUsers || [];
    const interestedUsers = interestData.interestedUsers || [];

    useEffect(() => {
        dispatch(fetchEvent(eventId));
        dispatch(fetchEventFeedbackMobile(eventId));
        dispatch(loadUser());
        dispatch(getUserInterest(eventId));  // Fetch user interest for the specific event
    }, [eventId, dispatch]);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to fetch event',
                text2: error,
            });
        }
    }, [error]);

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const isEventPast = event ? moment(event.endDate).isBefore(moment()) : false;

    const handleRating = () => {
        navigation.navigate('eventfeedback', { eventId });
    };

    const userRegistered = interestedUsers.some(user => user.email === user?.email && user.interested);
    const userAttended = attendedUsers.some(user => user.email === user?.email && user.isAttended);

    // Define the button text based on registration and attendance status
    let buttonText = '';
    if (!userRegistered) {
        buttonText = "You did not register for this event";
    } else if (userRegistered && !userAttended) {
        buttonText = "You registered but did not attend";
    } else if (userRegistered && userAttended) {
        buttonText = "Rate the Event";
    }

    const handleRegister = () => {
        dispatch(expressInterest(eventId));  // Dispatch expressInterest when the button is pressed
    };

    console.log("feedback:",eventFeedback);

    return (
        <View className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
            {loading ? (
                <Text className="text-center text-gray-500 mt-5">Loading event details...</Text>
            ) : event ? (
                <View>
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
                                Event Details
                            </Text>
                        </View>
                    </View>
                    
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
    
                    <View className="bg-white border border-[#e01d47] rounded-2xl mx-5 -mt-8 shadow-md p-5">
                        <Text className="text-2xl font-bold text-[#e01d47]">{event.title}</Text>
    
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="calendar-outline" size={16} color="#e01d47" />
                            <Text className="text-gray-600 ml-2">{formatDateTime(event.startDate)}</Text>
                        </View>
    
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="time-outline" size={16} color="#e01d47" />
                            <Text className="text-gray-600 ml-2">
                                {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                            </Text>
                        </View>
    
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="location-outline" size={16} color="#e01d47" />
                            <Text className="text-gray-600 ml-2">{event.location}</Text>
                        </View>
    
                        <Text className="font-bold text-[#e01d47] mt-4">About this Event</Text>
                        <Text className="text-gray-700 mt-1">{event.description}</Text>
    
                        {/* Conditional Button Rendering */}
                        <TouchableOpacity
                            onPress={!isEventPast && !userRegistered && !userAttended ? handleRegister : userRegistered && userAttended ? handleRating : null}
                            className="mt-5 py-3 rounded-full items-center bg-[#e01d47]"
                            disabled={isEventPast && (!userRegistered || !userAttended)}
                        >
                            <Text className="font-bold text-white">
                                {isEventPast ? buttonText : "Register Now"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl text-[#e01d47] font-bold ml-4 mt-2">Reviews</Text>
                    {isEventPast && eventFeedback && eventFeedback.length > 0 ? (
                        <FlatList
                            data={eventFeedback}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <View className=" p-3 bg-white rounded-md flex-row items-start">
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
                                        <View className="flex-row justify-between items-center">
                                            <Text className="font-bold">
                                                {`${item.userId?.fname || ""} ${item.userId?.middlei || ""} ${item.userId?.lname || ""}`}
                                            </Text>
                                            <View className="flex-row">
                                                {Array.from({ length: item.rating || 0 }).map((_, index) => (
                                                    <Text key={index} className="text-yellow-500">⭐</Text>
                                                ))}
                                            </View>
                                        </View>
    
                                        <Text className="mt-1 text-gray-700">{item.description}</Text>
    
                                        <Text className="text-gray-500 text-xs">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        />
                    ) : null}
                </View>
            ) : (
                <Text className="text-center text-gray-500 mt-5">No event details available.</Text>
            )}
        </ScrollView>
        <Footer activeRoute={"eventInfo"} />
    </View>
    );
};

export default EventInfo;

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
