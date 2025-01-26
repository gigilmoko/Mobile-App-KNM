import React, { useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { loadUser } from '../../redux/actions/userActions';
import { fetchEventFeedback } from '../../redux/actions/eventFeedbackActions';
import { getUserInterest } from '../../redux/actions/userInterestActions';  // Import the action
import { expressInterest } from '../../redux/actions/userInterestActions';  // Import the expressInterest action
import Toast from 'react-native-toast-message';
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
        dispatch(fetchEventFeedback(eventId));
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

    return (
        <View style={styles.container}>
            <Header back={true} />

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
                        <Text style={styles.eventTime}>
                            Event time: {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                        </Text>
                        <Text style={styles.eventDescription}>{event.description}</Text>

                        {loadingInterest ? (
                            <Text style={styles.loadingText}>Checking your interest...</Text>
                        ) : (
                            <Text style={styles.userInterestText}>
                                {userRegistered ? 'You are interested in this event.' : 'You are not interested in this event.'}
                            </Text>
                        )}

                        {/* Conditional Button Rendering */}
                        {!isEventPast && !userRegistered && !userAttended && (
                            <Button
                                title="Register for Event"
                                onPress={handleRegister}  // Call the handleRegister function
                                color="#4CAF50"
                            />
                        )}

                        <Button
                            title={buttonText}
                            onPress={userRegistered && userAttended ? handleRating : null}
                            color={userRegistered ? "#FFD700" : "gray"}
                            disabled={!userRegistered || !userAttended}
                        />

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
        backgroundColor: "#e0e0e0", 
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
        flex: 1, 
        marginTop: 20, 
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