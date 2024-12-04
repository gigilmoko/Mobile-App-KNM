import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents, deleteEvent } from "../../../redux/actions/calendarActions";
import moment from "moment";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AdminEvents = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("month");
  const dispatch = useDispatch();

  // Get events and loading state from Redux store
  const { events = [], loading } = useSelector((state) => state.calendar);

  // Generate markedDates object for Calendar
  const markedDates = React.useMemo(() => {
    const marks = {};
    const today = moment().format("YYYY-MM-DD");

    events?.forEach((event) => {
      if (event && event.date) {
        const eventDate = moment(event.date).format("YYYY-MM-DD");
        marks[eventDate] = {
          marked: true,
          dotColor: "#bc430b",
          textStyle: { color: "#ffb703" },
        };
      }
    });

    marks[today] = {
      ...marks[today],
      marked: true,
      selected: true,
      selectedColor: "#ffb703",
      textStyle: { color: "#000" },
    };

    return marks;
  }, [events]);

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
      filtered = events.filter((event) => event?.date && moment(event.date).isBefore(today, "day"));
    } else if (activeTab === "month") {
      filtered = events.filter((event) => event?.date && moment(event.date).isBetween(today, endOfMonth, "day", "[]"));
    } else if (activeTab === "nextMonth") {
      filtered = events.filter((event) => event?.date && moment(event.date).isBetween(startOfNextMonth, endOfNextMonth, "day", "[]"));
    }

    return filtered.sort((a, b) => moment(a.date) - moment(b.date));
  }, [events, activeTab]);

  const handleDelete = (eventId) => {
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
        <Header back={true} />
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Events</Text>
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  navigation.navigate("admineventcreate", { selectedDate: day.dateString });
                }}
                markedDates={markedDates}
                theme={{
                  todayTextColor: "#ffb703",
                  arrowColor: "#ffb703",
                  selectedDayBackgroundColor: "#bc430b",
                  selectedDayTextColor: "#ffffff",
                }}
              />
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "past" && styles.activeTabButton]}
                onPress={() => setActiveTab("past")}
              >
                <Text style={styles.tabButtonText}>Past Events</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "month" && styles.activeTabButton]}
                onPress={() => setActiveTab("month")}
              >
                <Text style={styles.tabButtonText}>This Month</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "nextMonth" && styles.activeTabButton]}
                onPress={() => setActiveTab("nextMonth")}
              >
                <Text style={styles.tabButtonText}>Next Month</Text>
              </TouchableOpacity>
            </View>

            {filteredEvents.length === 0 ? (
              <Text style={styles.noEventsText}>No events to display</Text>
            ) : (
              filteredEvents.map((event) => (
                <Swipeable key={event._id} renderRightActions={() => renderRightActions(event._id)}>
                  <View style={styles.eventCard}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{moment(event.date).format("MMM Do, YYYY")}</Text>
                  </View>
                </Swipeable>
              ))
            )}
          </ScrollView>
        </View>
        <Footer />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  calendarContainer: {
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: "#ffb703",
  },
  activeTabButton: {
    backgroundColor: "#bc430b",
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  noEventsText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderColor: "#ffb703",
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  swipeActionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    height: 70,
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

export default AdminEvents;