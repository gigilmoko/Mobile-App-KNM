import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  FlatList, 
  Image,
  ActivityIndicator 
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-native-paper";
import { getAllEvents, deleteEvent, fetchEventsBeforeCurrentDay, fetchEventsAfterCurrentDay } from "../../../redux/actions/calendarActions";
import moment from "moment";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from 'react-native-toast-message';
import { sendPushNotification } from "../../../redux/actions/notificationActions";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';

const AdminEvents = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [processingEventId, setProcessingEventId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(null);

  const dispatch = useDispatch();
  const { events = [], loading, beforeCurrentDayEvents, afterCurrentDayEvents } = useSelector((state) => state.calendar);

  useFocusEffect(
    React.useCallback(() => {
      dispatch({ type: 'CLEAR_EVENTS' });
      if (activeTab === "all") {
        dispatch(getAllEvents());
      } else if (activeTab === "upcoming") {
        dispatch(fetchEventsAfterCurrentDay());
      } else if (activeTab === "previous") {
        dispatch(fetchEventsBeforeCurrentDay());
      }
    }, [dispatch, activeTab])
  );

  const toggleDropdown = (eventId) => {
    setDropdownVisible(dropdownVisible === eventId ? null : eventId);
  };

  const renderDropdown = (event) => (
    <View className="absolute bottom-4 right-4 bg-white border border-pink-500 rounded-lg shadow-lg w-44 z-10">
      <TouchableOpacity
        className="flex-row items-center p-3 border-b border-gray-300 active:bg-gray-100"
        onPress={() => {
          navigation.navigate("admineventattendees", { eventId: event._id });
          setDropdownVisible(null);
        }}
      >
        <Ionicons name="people-outline" size={18} color="#D81B60" />
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
      <TouchableOpacity
        className="flex-row items-center p-3 border-b border-gray-300 active:bg-gray-100"
        onPress={() => {
          handleNotification(event);
          setDropdownVisible(null);
        }}
      >
        <Ionicons name="notifications-outline" size={18} color="#D81B60" />
        <Text className="text-gray-800 ml-2">Send Notification</Text>
      </TouchableOpacity>
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

  const filteredEvents = React.useMemo(() => {
    const eventsToFilter = activeTab === "all" ? events : activeTab === "upcoming" ? afterCurrentDayEvents : beforeCurrentDayEvents;
    return eventsToFilter
      .filter(event => event?.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => moment(a.date) - moment(b.date));
  }, [events, beforeCurrentDayEvents, afterCurrentDayEvents, activeTab, searchQuery]);

  // Calculate event stats
  const eventStats = React.useMemo(() => {
    const today = moment();
    return {
      total: events.length,
      upcoming: events.filter(event => moment(event.date).isAfter(today)).length,
      past: events.filter(event => moment(event.date).isBefore(today)).length,
      thisMonth: events.filter(event => 
        moment(event.date).isSame(today, 'month')
      ).length
    };
  }, [events]);

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

  const handleNotification = async (event) => {
    if (!event || !event._id || !event.title || !event.description || !event.date) {
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
      Toast.show({ type: 'success', text1: 'Push notification sent successfully' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to send push notification' });
    }

    setProcessingEventId(null);
  };

  return (
    <Provider>
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center py-5 px-5">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
            >
              <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-[#e01d47] text-center">
                Event Management
              </Text>
            </View>
            <View className="w-10" />
          </View>

          {/* Stats Cards */}
          <View className="flex-row justify-between px-5 my-3">
            <View className="bg-green-500 p-4 rounded-lg w-[31%] shadow-sm">
              <View className="bg-green-400 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="calendar-outline" size={24} color="#fff" />
              </View>
              <Text className="text-xl font-bold text-white">{eventStats.total}</Text>
              <Text className="text-white text-xs">Total Events</Text>
            </View>
            
            <View className="bg-blue-500 p-4 rounded-lg w-[31%] shadow-sm">
              <View className="bg-blue-400 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="time-outline" size={24} color="#fff" />
              </View>
              <Text className="text-xl font-bold text-white">{eventStats.upcoming}</Text>
              <Text className="text-white text-xs">Upcoming</Text>
            </View>
            
            <View className="bg-amber-500 p-4 rounded-lg w-[31%] shadow-sm">
              <View className="bg-amber-400 rounded-full w-10 h-10 items-center justify-center mb-2">
                <Ionicons name="stats-chart-outline" size={24} color="#fff" />
              </View>
              <Text className="text-xl font-bold text-white">{eventStats.thisMonth}</Text>
              <Text className="text-white text-xs">This Month</Text>
            </View>
          </View>

          {/* Search Box */}
          <View className="flex-row items-center border border-[#e01d47] rounded-full px-4 py-2 mx-5 bg-white">
            <TextInput
              className="flex-1 text-gray-700 placeholder-gray-400"
              placeholder="Search events..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={20} color="#e01d47" />
          </View>

          {/* Main content */}
          <View className="flex-1 bg-white pt-2">
            {/* Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
            >
              <TouchableOpacity
                className={`px-4 py-2 mx-1 rounded-full ${
                  activeTab === "all" ? "bg-[#e01d47]" : "bg-white border border-[#e01d47]"
                }`}
                onPress={() => setActiveTab("all")}
              >
                <Text className={`font-bold ${activeTab === "all" ? "text-white" : "text-[#e01d47]"}`}>
                  All Events
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-4 py-2 mx-1 rounded-full ${
                  activeTab === "upcoming" ? "bg-[#e01d47]" : "bg-white border border-[#e01d47]"
                }`}
                onPress={() => setActiveTab("upcoming")}
              >
                <Text className={`font-bold ${activeTab === "upcoming" ? "text-white" : "text-[#e01d47]"}`}>
                  Upcoming
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-4 py-2 mx-1 rounded-full ${
                  activeTab === "previous" ? "bg-[#e01d47]" : "bg-white border border-[#e01d47]"
                }`}
                onPress={() => setActiveTab("previous")}
              >
                <Text className={`font-bold ${activeTab === "previous" ? "text-white" : "text-[#e01d47]"}`}>
                  Previous
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Events list */}
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#e01d47" />
                <Text className="mt-4 text-gray-500">Loading events...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredEvents}
                keyExtractor={(event) => event._id}
                contentContainerStyle={{ padding: 15, paddingBottom: 80 }}
                ListEmptyComponent={
                  <View className="flex-1 justify-center items-center p-10">
                    <Ionicons name="calendar-outline" size={60} color="#e0e0e0" />
                    <Text className="text-lg text-gray-400 mt-4">No events found</Text>
                    <Text className="text-sm text-gray-400 text-center mt-2">
                      {searchQuery ? "Try adjusting your search" : "Create your first event!"}
                    </Text>
                  </View>
                }
                renderItem={({ item: event }) => (
                  <View className="bg-white rounded-lg shadow-md mb-5 overflow-hidden border border-gray-200">
                    {/* Event Status Label */}
                    <View className={`absolute top-2 right-2 z-10 rounded-full px-2 py-1 ${
                      moment(event.date).isBefore(moment()) 
                        ? "bg-gray-700" 
                        : moment(event.date).isSame(moment(), 'day')
                          ? "bg-green-500" 
                          : "bg-blue-500"
                    }`}>
                      <Text className="text-white text-xs font-medium">
                        {moment(event.date).isBefore(moment()) 
                          ? "Past" 
                          : moment(event.date).isSame(moment(), 'day')
                            ? "Today" 
                            : `In ${moment(event.date).diff(moment(), 'days')}d`}
                      </Text>
                    </View>

                    {/* Event Image */}
                    <Image 
                      source={{ uri: event.image }} 
                      className="w-full h-40" 
                      style={{ resizeMode: 'cover' }}
                    />
                
                    {/* Event Details Card */}
                    <View className="p-4">
                      <Text className="text-xl font-bold text-pink-600">{event?.title}</Text>
                
                      <View className="flex-row items-center mt-2">
                        <Ionicons name="calendar-outline" size={16} color="#D81B60" />
                        <Text className="text-gray-600 ml-1">{moment(event?.date).format("MMM Do, YYYY")}</Text>
                      </View>
                
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={16} color="#D81B60" />
                        <Text className="text-gray-600 ml-1">
                          {moment(event?.startDate).format("h:mm A")} - {moment(event?.endDate).format("h:mm A")}
                        </Text>
                      </View>
                
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={16} color="#D81B60" />
                        <Text className="text-gray-600 ml-1">{event?.location}</Text>
                      </View>

                      <View className="flex-row mt-2">
                        <View className="bg-pink-50 rounded-full px-2 py-1 mr-2">
                          <Text className="text-xs text-pink-700">
                            Audience: {event?.audience === "all" ? "Everyone" : "Members Only"}
                          </Text>
                        </View>
                        <View className="bg-blue-50 rounded-full px-2 py-1">
                          <Text className="text-xs text-blue-700">
                            {event?.interestedUsers?.length || 0} Registered
                          </Text>
                        </View>
                      </View>
                
                      {/* About the Event */}
                      <Text className="font-bold text-base mt-3">About this Event</Text>
                      <Text className="text-gray-600 text-sm mt-1" numberOfLines={2}>
                        {event?.description}
                      </Text>
                
                      {/* Manage Button with Dropdown */}
                      <View className="mt-4 flex-row justify-between">
                        <TouchableOpacity
                          className="bg-blue-500 py-2 px-4 rounded-md flex-row items-center"
                          onPress={() => navigation.navigate("eventinfo", { eventId: event._id })}
                        >
                          <Ionicons name="eye-outline" size={16} color="#fff" />
                          <Text className="text-white font-medium ml-1">Preview</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="bg-pink-600 py-2 px-4 rounded-md flex-row items-center"
                          onPress={() => toggleDropdown(event._id)}
                        >
                          <Text className="text-white font-medium mr-1">Manage</Text>
                          <Ionicons name="chevron-down" size={16} color="#fff" />
                        </TouchableOpacity>
                        
                        {dropdownVisible === event._id && renderDropdown(event)}
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Create Event FAB */}
          <TouchableOpacity
            className="absolute bottom-8 right-6 bg-[#e01d47] p-4 rounded-full shadow-lg"
            onPress={() => navigation.navigate("admineventcreate")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Provider>
  );
};

export default AdminEvents;