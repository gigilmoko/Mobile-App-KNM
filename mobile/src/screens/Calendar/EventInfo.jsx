import React, { useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { expressInterest, getUserInterest } from '../../redux/actions/userInterestActions';
import { loadUser } from '../../redux/actions/userActions';
import { fetchEventFeedback } from '../../redux/actions/eventFeedbackActions'; // Add fetchEventFeedback action
import Toast from 'react-native-toast-message';
import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native'; // Add this import

const EventInfo = ({ route }) => {
    const { eventId } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();  // Initialize the useNavigation hook
    // console.log("event id: ", eventId)
    
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
            // console.log('Fetched User Interest Data:', interestData); 
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
    // console.log("userInterested:", isUserInterested)
    return (
        <View style={styles.container}>
            <Header back={true} />

            <ScrollView contentContainerStyle={styles.scrollViewContent} >
                {loading ? (
                    <Text style={styles.loadingText}>Loading event details...</Text>
                ) : event ? (
                    <View>
                        <View style={styles.imageContainer}>
                            {event.image ? (
                                <Image
                                    source={{ uri: event.image }}
                                    style={styles.eventImage}
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage} />
                            )}
                        </View>
                        <Text style={styles.eventTitle}>{event.title}</Text>
                        <Text style={styles.eventTime}>Event time: {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}</Text>
                        <Text style={styles.eventDescription}>{event.description}</Text>

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
                            color={isEventPast ? "#FFD700" : isUserInterested ? "gray" : "#bc430b"} 
                        />

                        {/* Show feedback only if the event is past */}
                        {isEventPast && eventFeedback && eventFeedback.length > 0 && (
                            <View style={styles.feedbackContainer}>
                                <Text style={styles.feedbackTitle}>Event Ratings and Feedback:</Text>
                                {loadingFeedback ? (
                                    <Text style={styles.loadingFeedback}>Loading feedback...</Text>
                                ) : (
                                    eventFeedback.map(feedback => (
                                        <View key={feedback._id} style={styles.feedbackBox}>
                                            <Text style={styles.feedbackRating}>Rating: {feedback.rating}</Text>
                                            <Text style={styles.feedbackDate}>{moment(feedback.date).format('MMMM Do YYYY, h:mm:ss a')}</Text>
                                            <Text style={styles.feedbackDescription}>{feedback.description}</Text>
                                        </View>
                                    ))
                                )}
                            </View>
                        )}

                    </View>
                ) : (
                    <Text style={styles.noEventDetails}>No event details available.</Text>
                )}
            </ScrollView>

            <Footer activeRoute={"eventInfo"} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    scrollViewContent: {
        padding: 16,
        paddingBottom: 70
    },
    loadingText: {
        textAlign: "center",
        color: "#888",
        marginTop: 20,
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 16,
    },
    imageContainer: {
        width: "100%",
        height: 200,
        marginTop: 16,
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#e0e0e0", // Placeholder background color
    },
    eventImage: {
        width: "100%",
        height: "100%",
    },
    placeholderImage: {
        width: "100%",
        height: "100%",
        backgroundColor: "#e0e0e0",
    },
    eventTime: {
        color: "#666",
        marginTop: 8,
    },
    eventDescription: {
        color: "#444",
        marginTop: 8,
    },
    feedbackContainer: {
        padding: 15,
        backgroundColor: "#ffb703",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        flex: 1, // Ensure it occupies the remaining space
        marginTop: 20, // Add distance between Add to Wishlist and Feedbacks
    },
    feedbackTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    feedbackBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 5,
    },
    feedbackRating: {
        fontWeight: "bold",
    },
    feedbackDate: {
        color: "gray",
        fontSize: 12,
    },
    feedbackDescription: {
        color: "#666",
        marginTop: 4,
    },
    noEventDetails: {
        textAlign: "center",
        color: "#888",
        marginTop: 20,
    },
});

export default EventInfo;