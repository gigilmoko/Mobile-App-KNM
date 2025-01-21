import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../../redux/actions/calendarActions";
import moment from "moment";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const EventsList = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState("month");
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const { events, loading } = useSelector((state) => state.calendar);

    useEffect(() => {
        dispatch(getAllEvents());
    }, [dispatch]);

    const filteredEvents = React.useMemo(() => {
        const today = moment();
        const endOfMonth = moment().endOf("month");
        const startOfNextMonth = moment().add(1, "month").startOf("month");
        const endOfNextMonth = moment().add(1, "month").endOf("month");

        let filtered = events;

        if (activeTab === "past") {
            filtered = events.filter((event) => moment(event.date).isBefore(today, "day"));
        } else if (activeTab === "month") {
            filtered = events.filter((event) =>
                moment(event.date).isBetween(today, endOfMonth, "day", "[]")
            );
        } else if (activeTab === "nextMonth") {
            filtered = events.filter((event) =>
                moment(event.date).isBetween(startOfNextMonth, endOfNextMonth, "day", "[]")
            );
        }

        if (searchQuery) {
            filtered = filtered.filter((event) => event.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        filtered.sort((a, b) => moment(b.date) - moment(a.date));
        return filtered;
    }, [events, activeTab, searchQuery]);

    const upcomingEvent = React.useMemo(() => {
        return events
            .filter((event) => moment(event.date).isAfter(moment()))
            .sort((a, b) => moment(a.date) - moment(b.date))[0];
    }, [events]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Events</Text>
            </View>
            <View style={styles.mainContent}>
                <TextInput
                    style={styles.searchBox}
                    placeholder="Search events..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

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
                            <Text>Loading...</Text>
                        </View>
                    ) : (
                        <View>
                            {filteredEvents && filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <TouchableOpacity
                                        key={event._id} // Ensure each event has a unique key
                                        onPress={() => navigation.navigate("eventinfo", { eventId: event._id })}
                                        style={styles.eventItem}
                                    >
                                        <Text
                                            style={[
                                                styles.eventTitle,
                                                moment(event.date).isBetween(moment(), moment().endOf("month"), "day", "[]") && { color: "#ffb703" },
                                            ]}
                                        >
                                            {event.title}
                                        </Text>
                                        <Text style={styles.eventLocation}>{event.location}</Text>
                                        <Text style={styles.eventDate}>
                                            {moment(event.date).format("MM-DD-YYYY")}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.noEventsText}>No events available</Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
            <Footer style={styles.footer} activeRoute={"home"} />
        </View>
    );
};

export default EventsList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    mainContent: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 10,
        marginBottom: 40,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    backButton: {
        position: "absolute",
        left: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    tabsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    tab: {
        borderRadius: 5,
        backgroundColor: "#ffb703",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 5,
    },
    activeTab: {
        backgroundColor: "#bc430b",
    },
    tabText: {
        fontWeight: "bold",
        color: "#fff",
        padding: 8,
    },
    loadingContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    eventsLabel: {
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    eventItem: {
        marginVertical: 5,
        borderColor: "#F4B546",
        borderWidth: 1,
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold", 
        paddingBottom: 5,
    },
    eventDate: {
        fontSize: 14,
        color: "#777",
    },
    eventLocation: {
        fontSize: 12,
        color: "#333",
    },
    noEventsText: {
        fontSize: 16,
        color: "#888",
        textAlign: "center",
    },
    upcomingEventContainer: {
        backgroundColor: "#ffb703",
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
    searchBox: {
        padding: 5,
        margin: 5,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
    },
});