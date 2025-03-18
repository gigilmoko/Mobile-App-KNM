import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput, FlatList, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Divider, Provider } from "react-native-paper";
import { getAllEvents, deleteEvent, fetchEventsBeforeCurrentDay, fetchEventsAfterCurrentDay } from "../../../redux/actions/calendarActions";
import moment from "moment";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from 'react-native-toast-message';
import { sendPushNotification } from "../../../redux/actions/notificationActions";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';

const AdminEvents = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [processingEventId, setProcessingEventId] = useState(null); // State to track processing event
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();
  const [refresh, setRefresh] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(null);

  const toggleDropdown = (eventId) => {
    setDropdownVisible(dropdownVisible === eventId ? null : eventId);
  };

  const renderDropdown = (event) => (
    <View className="absolute bottom-4 right-4 bg-white border border-pink-500 rounded-lg shadow-lg w-44">
      {/* Edit Event */}
      <TouchableOpacity
        className="flex-row items-center p-3 border-b border-gray-300 active:bg-gray-100"
        onPress={() => {
          navigation.navigate("admineventattendees", { eventId: event._id });
          setDropdownVisible(null);
        }}
      >
        <Ionicons name="pencil-outline" size={18} color="#D81B60" />
        <Text className="text-gray-800 ml-2">Manage Attendees</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="flex-row items-center p-3 border-b border-gray-300 active:bg-gray-100"
        onPress={() => {
          navigation.navigate("admineventupdate", { eventId: event._id });
          setDropdownVisible(null);
        }}
      >
        <Ionicons name="pencil-outline" size={18} color="#D81B60" />
        <Text className="text-gray-800 ml-2">Edit Event</Text>
      </TouchableOpacity>
  
      {/* Delete Event */}
      <TouchableOpacity
        className="flex-row items-center p-3 active:bg-gray-100"
        onPress={() => {
          handleDelete(event._id);
          setDropdownVisible(null);
        }}
      >
        <Ionicons name="trash-outline" size={18} color="#D81B60" />
        <Text className="text-gray-800 ml-2">Delete Event</Text>
      </TouchableOpacity>
    </View>
  );
  

  // Get events and loading state from Redux store
  const { events = [], loading, beforeCurrentDayEvents, afterCurrentDayEvents } = useSelector((state) => state.calendar);

  useFocusEffect(
    React.useCallback(() => {
      dispatch({ type: 'CLEAR_EVENTS' }); // Clear events data
      if (activeTab === "all") {
        dispatch(getAllEvents());
      } else if (activeTab === "upcoming") {
        dispatch(fetchEventsAfterCurrentDay());
      } else if (activeTab === "previous") {
        dispatch(fetchEventsBeforeCurrentDay());
      }
    }, [dispatch, activeTab])
  );

  useEffect(() => {
    dispatch({ type: 'CLEAR_EVENTS' }); // Clear events data
    if (activeTab === "all") {
      dispatch(getAllEvents());
    } else if (activeTab === "upcoming") {
      dispatch(fetchEventsAfterCurrentDay());
    } else if (activeTab === "previous") {
      dispatch(fetchEventsBeforeCurrentDay());
    }
  }, [dispatch, activeTab]);

  const filteredEvents = React.useMemo(() => {
    const eventsToFilter = activeTab === "all" ? events : activeTab === "upcoming" ? afterCurrentDayEvents : beforeCurrentDayEvents;
    return eventsToFilter
      .filter(event => event?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => moment(a.date) - moment(b.date));
  }, [events, beforeCurrentDayEvents, afterCurrentDayEvents, activeTab, searchQuery]);

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

 
  const handleNotification = async (event) => {
    console.log('Event object:', event);

    if (!event || !event._id || !event.title || !event.description || !event.date) {
      console.error('Invalid event object:', event);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Invalid event data' });
      return;
    }

    setProcessingEventId(event._id);

    Alert.alert('Processing', 'Sending push notification...', [{ text: 'OK' }]);

    try {
      const pushData = {
        title: event.title,
        description: event.description,
        eventDate: event.date,
        eventId: event._id,
      };

      const response = await dispatch(sendPushNotification(pushData));

      console.log('Push notification response:', response);
      Toast.show({ type: 'success', text1: 'Push notification sent successfully' });
    } catch (error) {
      console.error('Error sending push notification:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to send push notification' });
    }

    setProcessingEventId(null);
  };

  return (
    <Provider>
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex-row items-center py-5 px-5">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-[#e01d47] text-center">
              Events
            </Text>
          </View>
          <View className="w-10" />
        </View>
        <View className="flex-row items-center border border-[#e01d47] rounded-full px-4 py-2 mx-5 bg-white">
          <TextInput
            className="flex-1 text-gray-700 placeholder-gray-400"
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons name="search" size={20} color="#e01d47" />
        </View>
        <View className="flex-1 bg-white px-5 my-2">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 70}}
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row justify-around mb-2">
              <TouchableOpacity
                className={`px-4 py-2 mt-2 rounded-full border ${
                  activeTab === "all"
                    ? "bg-[#e01d47] text-white"
                    : "bg-white border-[#e01d47]"
                }`}
                onPress={() => setActiveTab("all")}
              >
                <Text className={`font-bold ${activeTab === "all" ? "text-white" : "text-[#e01d47]"}`}>
                  All
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-4 py-2 mt-2 rounded-full border ${
                  activeTab === "upcoming"
                    ? "bg-[#e01d47] text-white"
                    : "bg-white border-[#e01d47]"
                }`}
                onPress={() => setActiveTab("upcoming")}
              >
                <Text className={`font-bold ${activeTab === "upcoming" ? "text-white" : "text-[#e01d47]"}`}>
                  Upcoming Events
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-4 py-2 mt-2 rounded-full border ${
                  activeTab === "previous"
                    ? "bg-[#e01d47] text-white"
                    : "bg-white border-[#e01d47]"
                }`}
                onPress={() => setActiveTab("previous")}
              >
                <Text className={`font-bold ${activeTab === "previous" ? "text-white" : "text-[#e01d47]"}`}>
                  Previous Events
                </Text>
              </TouchableOpacity>
            </View>
            {filteredEvents.length === 0 ? (
              <Text className="text-center text-lg text-gray-600 mt-5">No events to display</Text>
            ) : (
              <FlatList
              data={filteredEvents}
              keyExtractor={(event) => event._id}
              renderItem={({ item: event }) => (
                <View className="bg-white rounded-lg shadow-md m-4 overflow-hidden border border-gray-300">
                  {/* Event Image */}
                  <Image source={{ uri: event.image }} className="w-full h-40" />
            
                  {/* Event Details Card */}
                  <View className="p-4 bg-white border border-gray-300 rounded-lg -mt-4 shadow-sm">
                    <Text className="text-xl font-bold text-pink-600">{event?.title}</Text>
            
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="calendar-outline" size={16} color="#D81B60" />
                      <Text className="text-gray-600 ml-1">{moment(event?.date).format("MMM Do, YYYY")}</Text>
                    </View>
            
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="time-outline" size={16} color="#D81B60" />
                      <Text className="text-gray-600 ml-1">
                        {moment(event?.startDate).format("hh:mm A")} - {moment(event?.endDate).format("hh:mm A")}
                      </Text>
                    </View>
            
                    <View className="flex-row items-center mt-1">
                      <Ionicons name="location-outline" size={16} color="#D81B60" />
                      <Text className="text-gray-600 ml-1">{event?.location}</Text>
                    </View>
            
                    {/* About the Event */}
                    <Text className="font-bold text-base mt-3">About this Event</Text>
                    <Text className="text-gray-600 text-sm mt-1">{event?.description}</Text>
            
                    {/* Manage Button with Dropdown */}
                    <View className="mt-14">
                      <TouchableOpacity
                        className="bg-pink-600 py-2 px-4 rounded-lg flex-row items-center justify-center mt-4 absolute bottom-4 right-2"
                        onPress={() => toggleDropdown(event._id)}
                      >
                        <Text className="text-white font-semibold mr-2">Manage</Text>
                        <Ionicons name="chevron-down" size={20} color="#fff" className="ml-3" />
                      </TouchableOpacity>
                      {dropdownVisible === event._id && renderDropdown(event)}
                      </View>
                  </View>
                </View>
              )}
            />
            
            )}
          </ScrollView>
        </View>
      </View>
         <TouchableOpacity
                        className="absolute bottom-8 right-6 bg-[#e01d47] p-4 rounded-full shadow-lg"
                        onPress={() => navigation.navigate("admineventcreate")}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
            
    </GestureHandlerRootView>
    </Provider>
  );
};

export default AdminEvents;