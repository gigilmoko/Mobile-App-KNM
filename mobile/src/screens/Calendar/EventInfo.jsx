import React, { useEffect } from 'react';
import { View, Text, Image, Button, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvent } from '../../redux/actions/calendarActions';
import { expressInterest, getUserInterest } from '../../redux/actions/userInterestActions';
import { loadUser } from '../../redux/actions/userActions';
import { fetchEventFeedback } from '../../redux/actions/eventFeedbackActions';
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
    const { interestData, getInterestLoading, getInterestError } = useSelector(state => state.userInterested || {});
    const { eventFeedback, loadingFeedback, errorFeedback } = useSelector(state => state.eventFeedback || {});


    useEffect(() => {
        if (eventId) {
        dispatch(getUserInterest(eventId));
        dispatch(fetchEvent(eventId));
        dispatch(fetchEventFeedback(eventId));
        }
        if (user) {
        dispatch(loadUser());
        }
    }, [eventId, dispatch, user]);


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


    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };


    const isEventPast = event ? moment(event.endDate).isBefore(moment()) : false;


    const handleInterest = () => {
        dispatch(expressInterest(eventId));
    };


    const handleRating = () => {
        navigation.navigate('eventfeedback', { eventId });
    };


    const isUserInterested = Array.isArray(interestData) && interestData.some(item => item.eventId === eventId);


    if (loading) {
        return (
        <View style={styles.loadingContainer}>
            <Text>Loading event details...</Text>
        </View>
        );
    }


    return (
        <View style={styles.container}>
        <Header back={true} />
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {event && (
            <>
                {event.image && (
                <View style={styles.imageWrapper}>
                    <Image
                    source={{ uri: event.image }}
                    style={styles.image}
                    />
                </View>
                )}
                <View style={styles.eventDetailsContainer}>
                <Text numberOfLines={2} style={styles.eventTitle}>
                    {event.title}
                </Text>
                <Text style={styles.eventTime}>
                    Event time: {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                </Text>
                <Text style={styles.eventDescription}>
                    {event.description}
                </Text>


                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={isEventPast ? handleRating : handleInterest}
                    disabled={getInterestLoading || isUserInterested}
                    >
                    <Button
                        title={isEventPast
                        ? "Rate the Event"
                        : getInterestLoading
                            ? "Loading..."
                            : isUserInterested
                            ? "You are already interested"
                            : "Express Interest"}
                        color={isEventPast ? "#bc430b" : isUserInterested ? "gray" : "#4CAF50"}
                    />
                    </TouchableOpacity>
                </View>


                {isEventPast && eventFeedback && eventFeedback.length > 0 && (
                    <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackTitle}>Event Ratings and Feedback:</Text>
                    {loadingFeedback ? (
                        <Text style={styles.loadingFeedback}>Loading feedback...</Text>
                    ) : (
                        eventFeedback.map(feedback => (
                        <View key={feedback._id} style={styles.feedbackBox}>
                            <Text style={styles.feedbackRating}>Rating: {feedback.rating} ⭐</Text>
                            <Text style={styles.feedbackDescription}>{feedback.description}</Text>
                            <Text style={styles.feedbackDate}>
                            {new Date(feedback.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        ))
                    )}
                    </View>
                )}
                </View>
            </>
            )}
        </ScrollView>
        <Footer style={styles.footer} activeRoute={"eventInfo"} />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 50, // Add padding to ensure content is not hidden behind the footer
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    imageWrapper: {
        flex: 1,
        alignItems: "center",
    },
    image: {
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height / 2 -50,
    },
    eventDetailsContainer: {
        padding: 15,
        marginTop: -40,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        backgroundColor: "#fff",
        flex: 1,
    },
    eventTitle: {
        fontSize: 25,
    },
    eventTime: {
        fontSize: 15,
        fontWeight: "400",
    },
    eventDescription: {
        lineHeight: 20,
        marginVertical: 15,
        color: "grey",
    },
    buttonContainer: {
        flexDirection: "column",
        marginTop: 20,
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
    feedbackDescription: {
        color: "gray",
        fontSize: 12,
    },
    feedbackDate: {
        color: "gray",
        fontSize: 12,
    },
    loadingFeedback: {
        color: "gray",
        textAlign: "center",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});


export default EventInfo;
