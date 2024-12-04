import React, { useEffect } from 'react';
import { View, Text, Image, Button, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { expressInterest, getUserInterest } from '../../redux/actions/userInterestActions';
import { loadUser } from '../../redux/actions/userActions';
import { fetchEventFeedback } from '../../redux/actions/eventFeedbackActions'; // Add fetchEventFeedback action
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native'; // Add this import

const EventInfo = ({ route }) => {
    const { eventId } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();  // Initialize the useNavigation hook
    console.log("event id: ", eventId)
    
    // Access the calendar data and user info from the Redux store
    const { event, loading, error } = useSelector(state => state.calendar);
    const { user } = useSelector(state => state.auth || {}); 
    const { interestData, getInterestLoading, getInterestError } = useSelector(state => state.userInterested || {});
    const { eventFeedback, loadingFeedback, errorFeedback } = useSelector(state => state.eventFeedback || {}); // Access event feedback from Redux

    // Fetch event data and user interest data when the component mounts
    useEffect(() => {
        if (eventId) {
            dispatch(getUserInterest(eventId)); 
            dispatch(fetchEvent(eventId)); 
            dispatch(fetchEventFeedback(eventId)); // Fetch feedback when eventId changes
        }   
        if (user) {
            dispatch(loadUser()); 
        }
    }, [eventId, dispatch, user]);
    
    // Log the interestData after it is fetched
    useEffect(() => {
        if (interestData) {
            console.log('Fetched User Interest Data:', interestData); 
        }
    }, [interestData]);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to fetch event',
                text2: error,
            });
        }
    }, [error]);

    // Helper function to format dates
    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Check if the event date is in the past
    const isEventPast = event ? moment(event.endDate).isBefore(moment()) : false;

    const handleInterest = () => {
        dispatch(expressInterest(eventId)); 
    };

    const handleRating = () => {
        // Navigate to the 'eventreview' screen if the event has passed
        navigation.navigate('eventfeedback', { eventId });
    };

    // Ensure interestData is an array before using .some()
    const isUserInterested = Array.isArray(interestData) && interestData.some(item => item.eventId === eventId);

    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <Header back={true} />

            <ScrollView contentContainerStyle={tw`p-4`}>
                {loading ? (
                    <Text style={tw`text-center text-gray-500 mt-6`}>Loading event details...</Text>
                ) : event ? (
                    <View>
                        <Text style={tw`text-xl font-bold text-gray-800`}>{event.title}</Text>
                        {event.image && (
                            <Image
                                source={{ uri: event.image }}
                                style={tw`w-full h-48 mt-4 rounded-lg`}
                                resizeMode="cover"
                            />
                        )}
                        <Text style={tw`text-gray-600 mt-2`}>Event time: {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}</Text>
                        <Text style={tw`text-gray-700 mt-2`}>{event.description}</Text>

                        {/* Conditional button */}
                        <Button
                            title={isEventPast 
                                ? "Rate the Event" 
                                : getInterestLoading 
                                ? "Loading..." 
                                : isUserInterested 
                                ? "You are already interested" 
                                : "Express Interest"}
                            onPress={isEventPast ? handleRating : handleInterest}
                            color={isEventPast ? "#FFD700" : isUserInterested ? "gray" : "#4CAF50"} 
                        />

                        {/* Show feedback only if the event is past */}
                        {isEventPast && eventFeedback && eventFeedback.length > 0 && (
                            <View style={tw`mt-6`}>
                                <Text style={tw`text-lg font-bold text-gray-800`}>Event Ratings and Feedback:</Text>
                                {loadingFeedback ? (
                                    <Text style={tw`text-gray-500 mt-4`}>Loading feedback...</Text>
                                ) : (
                                    eventFeedback.map(feedback => (
                                        <View key={feedback._id} style={tw`mt-4 border-b pb-4`}>
                                            <Text style={tw`text-gray-700`}>Rating: {feedback.rating}</Text>
                                            <Text style={tw`text-gray-600 mt-1`}>{feedback.description}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}

                    </View>
                ) : (
                    <Text style={tw`text-center text-gray-500 mt-6`}>No event details available.</Text>
                )}
            </ScrollView>

            <Footer activeRoute={"eventInfo"} />
        </View>
    );
};

export default EventInfo;
