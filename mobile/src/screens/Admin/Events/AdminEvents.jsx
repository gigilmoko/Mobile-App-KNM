import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents, deleteEvent } from "../../../redux/actions/calendarActions";
import moment from "moment";
import { Swipeable } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons

const AdminEvents = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("month");
  const dispatch = useDispatch();

  // Get events and loading state from Redux store
  const { events, loading } = useSelector((state) => state.calendar);

  // Generate markedDates object for Calendar
  const markedDates = React.useMemo(() => {
    const marks = {};
    const today = moment().format("YYYY-MM-DD");

    events?.forEach((event) => {
      const eventDate = moment(event.date).format("YYYY-MM-DD"); // Format date
      marks[eventDate] = {
        marked: true,
        dotColor: "#bc430b",
        textStyle: {
          color: "#ffb703", 
        },
      };
    });

    marks[today] = {
      ...marks[today], // Preserve any existing marks for today
      marked: true,
      selected: true,
      selectedColor: "#ffb703", // Yellow background
      textStyle: {
        color: "#000", // Black text for today
      },
    };

    // console.log("Marked Dates:", marks);
    return marks;
  }, [events]);

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

  const handleDelete = (eventId) => {
    // Confirm delete action
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          dispatch(deleteEvent(eventId));
        },
      },
    ]);
  };

  const renderRightActions = (eventId) => (
    <View style={styles.swipeActionContainer}>
      <TouchableOpacity
        style={styles.swipeActionEdit}
        onPress={() => navigation.navigate("admineventupdate", { eventId })}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeActionDelete}
        onPress={() => handleDelete(eventId)}
      >
        <MaterialCommunityIcons name="trash-can" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header back={true} />
      <View style={styles.mainContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Events</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.calendarContainer}>
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString); // Set selected date
                navigation.navigate("admineventcreate", { selectedDate: day.dateString }); // Navigate to Create Event screen with the selected date
              }}
              markedDates={markedDates} // Pass marked dates
              theme={{
                todayTextColor: "#ffb703", // Color for today's text
                arrowColor: "#ffb703",
                selectedDayBackgroundColor: "#bc430b",
                selectedDayTextColor: "#ffffff",
              }}
            />
          </View>

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

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              {/* <Text style={styles.eventsLabel}>List of Events</Text> */}
              {filteredEvents && filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <Swipeable
                      key={event._id} // Ensure each event has a unique key
                      renderRightActions={() => renderRightActions(event._id)}
                      overshootRight={false}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("eventDetail", { id: event._id })
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
                            ) && { color: "#ffb703" }
                          ]}
                        >
                          {event.title}
                        </Text>
                        <Text style={styles.eventDate}>
                          {moment(event.date).format("MM-DD-YYYY")}
                        </Text>
                        <Text style={styles.eventLocation}>{event.location}</Text>
                      </TouchableOpacity>
                    </Swipeable>
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

export default AdminEvents;

// Styles (unchanged)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffb703",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
  calendarContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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
  swipeActionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    height: 100,
  },
  swipeActionEdit: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#ffb703",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  swipeActionDelete: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#ffb703",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});