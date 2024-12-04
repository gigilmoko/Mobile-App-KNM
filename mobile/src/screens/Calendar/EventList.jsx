import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Footer from "../../components/Layout/Footer";
import Header from "../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../../redux/actions/calendarActions";
import moment from "moment";

const EventsList = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState("month");
    const dispatch = useDispatch();

    // Get events and loading state from Redux store
    const { events, loading } = useSelector((state) => state.calendar);

    // Fetch events on component mount
    useEffect(() => {
        dispatch(getAllEvents());
    }, [dispatch]);

    // Filter events based on the active tab
    const filteredEvents = React.useMemo(() => {
        const today = moment();
        const endOfMonth = moment().endOf("month");
        const startOfNextMonth = moment().add(1, "month").startOf("month");
        const endOfNextMonth = moment().add(1, "month").endOf("month");

        if (activeTab === "past") {
        return events.filter((event) => moment(event.date).isBefore(today, "day"));
        } else if (activeTab === "month") {
        return events.filter((event) =>
            moment(event.date).isBetween(today, endOfMonth, "day", "[]")
        );
        } else if (activeTab === "nextMonth") {
        return events.filter((event) =>
            moment(event.date).isBetween(startOfNextMonth, endOfNextMonth, "day", "[]")
        );
        }
        return events;
    }, [events, activeTab]);

    // Find the most upcoming event
    const upcomingEvent = React.useMemo(() => {
        return events
        .filter((event) => moment(event.date).isAfter(moment()))
        .sort((a, b) => moment(a.date) - moment(b.date))[0];
    }, [events]);

    return (
        <View style={styles.container}>
        <Header back={true} />
        <View style={styles.mainContent}>
            {upcomingEvent && (
            <View style={styles.upcomingEventContainer}>
                <Text style={styles.upcomingEventTitle}>Upcoming Event</Text>
                <Text style={styles.eventTitle}>{upcomingEvent.title}</Text>
                <Text style={styles.eventDate}>
                {moment(upcomingEvent.date).format("MM-DD-YYYY")}
                </Text>
                <Text style={styles.eventLocation}>{upcomingEvent.location}</Text>
                <Text style={styles.eventDescription}>{upcomingEvent.description}</Text>
            </View>
            )}

            <View style={styles.tabsContainer}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "past" && styles.activeTab]}
                onPress={() => setActiveTab("past")}
            >
                <Text style={styles.tabText}>Past Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === "month" && styles.activeTab]}
                onPress={() => setActiveTab("month")}
            >
                <Text style={styles.tabText}>Events for the Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === "nextMonth" && styles.activeTab]}
                onPress={() => setActiveTab("nextMonth")}
            >
                <Text style={styles.tabText}>Future Events</Text>
            </TouchableOpacity>
            </View>

            <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            >
            {loading ? (
                <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <View style={styles.eventsContainer}>
                {filteredEvents && filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <TouchableOpacity
                        key={event._id} // Ensure each event has a unique key
                        onPress={() =>
                            navigation.navigate("eventinfo", { eventId: event._id })  // Passing event._id as eventId
                        }
                        style={styles.eventItem}
                    >
                        <Text
                            style={[
                                styles.eventTitle,
                                moment(event.date).isBetween(
                                    moment(),
                                    moment().endOf("month"),
                                    "day",
                                    "[]"
                                ) && { color: "#ffb703" },
                            ]}
                        >
                            {event.title}
                        </Text>
                        <Text style={styles.eventDate}>
                            {moment(event.date).format("MM-DD-YYYY")}
                        </Text>
                        <Text style={styles.eventLocation}>{event.location}</Text>
                    </TouchableOpacity>
                    
                    ))
                ) : (
                    <Text style={styles.noEventsText}>No events available</Text>
                )}
                </View>
            )}
            </ScrollView>
        </View>
        <Footer activeRoute={"home"} />
        </View>
    );
};

export default EventsList;

// Styles (unchanged)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#ffb703",
    },
    mainContent: {
        flex: 1,
        // backgroundColor: "#fff",
        // borderTopLeftRadius: 30,
        // borderTopRightRadius: 30,
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    tabsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 0,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: "#ffb703",
    },
    activeTab: {
        backgroundColor: "#bc430b",
    },
    tabText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontSize: 16,
        color: "#888",
    },
    eventsContainer: {
        marginTop: 20,
    },
    eventsLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    eventItem: {
        marginVertical: 6,
        borderColor: "#F4B546",
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "600",
        letterSpacing: 1,
        color: "#000",
    },
    eventDate: {
        fontSize: 14,
        color: "#777",
    },
    eventLocation: {
        fontSize: 12,
        color: "#333",
        marginTop: 4,
    },
    noEventsText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
    },
    upcomingEventContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    upcomingEventTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    eventDescription: {
        fontSize: 14,
        color: "#666",
        marginTop: 10,
    },
});