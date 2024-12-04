import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents, deleteEvent } from "../../../redux/actions/calendarActions";
import moment from "moment";
import { Swipeable } from "react-native-gesture-handler";
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

    if (activeTab === "past") {
      return events.filter((event) => event?.date && moment(event.date).isBefore(today, "day"));
    } else if (activeTab === "month") {
      return events.filter((event) => event?.date && moment(event.date).isBetween(today, endOfMonth, "day", "[]"));
    } else if (activeTab === "nextMonth") {
      return events.filter((event) => event?.date && moment(event.date).isBetween(startOfNextMonth, endOfNextMonth, "day", "[]"));
    }
    return events;
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
    <View className="flex-row items-center px-2 rounded-xl h-24">
      <TouchableOpacity
        className="p-2 rounded-md border-2 border-[#ffb703] justify-center items-center mr-2"
        onPress={() => navigation.navigate("admineventupdate", { eventId })}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity
        className="p-2 rounded-md border-2 border-[#ffb703] justify-center items-center"
        onPress={() => handleDelete(eventId)}
      >
        <MaterialCommunityIcons name="trash-can" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-[#ffb703]">
      <Header back={true} />
      <View className="flex-1 bg-white rounded-t-3xl p-4 pt-2">
        <View className="items-center mb-2">
          <Text className="text-2xl font-bold text-black">Events</Text>
        </View>

       <ScrollView
  contentContainerStyle={{ flexGrow: 1, paddingBottom: 70 }}
  showsVerticalScrollIndicator={false}
  
>
          <View className="mb-5 bg-white rounded-xl shadow-md">
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

          <View className="flex-row justify-around mb-2">
            <TouchableOpacity
              className={`py-2 px-4 rounded-md ${activeTab === "past" ? "bg-[#bc430b]" : "bg-[#ffb703]"}`}
              onPress={() => setActiveTab("past")}
            >
              <Text className="text-sm font-bold text-white">Past Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-2 px-4 rounded-md ${activeTab === "month" ? "bg-[#bc430b]" : "bg-[#ffb703]"}`}
              onPress={() => setActiveTab("month")}
            >
              <Text className="text-sm font-bold text-white">This Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-2 px-4 rounded-md ${activeTab === "nextMonth" ? "bg-[#bc430b]" : "bg-[#ffb703]"}`}
              onPress={() => setActiveTab("nextMonth")}
            >
              <Text className="text-sm font-bold text-white">Next Month</Text>
            </TouchableOpacity>
          </View>

          {filteredEvents.length === 0 ? (
            <Text className="text-center text-lg text-gray-500">No events to display</Text>
          ) : (
            filteredEvents.map((event) => (
              <Swipeable key={event._id} renderRightActions={() => renderRightActions(event._id)}>
                <View className="my-2 border-2 border-[#F4B546] rounded-xl bg-white p-2">
                  <Text className="text-lg font-semibold text-black">{event.title}</Text>
                  <Text className="text-sm text-gray-600">{moment(event.date).format("MMM Do, YYYY")}</Text>
                </View>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </View>
      <Footer />
    </View>
  );
};

export default AdminEvents;
