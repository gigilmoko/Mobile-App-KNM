import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image,
  ActivityIndicator,
  StatusBar 
} from "react-native";
import Footer from "../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../../redux/actions/calendarActions";
import moment from "moment-timezone";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from "../../components/Layout/Header";

const EventsList = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState("month");
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();
    const { events, loading } = useSelector((state) => state.calendar);

    useEffect(() => {
        dispatch(getAllEvents());
    }, [dispatch]);

    const filteredEvents = React.useMemo(() => {
        const today = moment().tz("Asia/Manila");
        const endOfMonth = moment().tz("Asia/Manila").endOf("month");
        const startOfNextMonth = moment().tz("Asia/Manila").add(1, "month").startOf("month");
        const endOfNextMonth = moment().tz("Asia/Manila").add(1, "month").endOf("month");

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

        // Sort events by date from soonest to farthest
        filtered.sort((a, b) => moment(a.date) - moment(b.date));

        return filtered;
    }, [events, activeTab, searchQuery]);

    const upcomingEvent = React.useMemo(() => {
        return events
            .filter((event) => moment(event.date).isAfter(moment()))
            .sort((a, b) => moment(a.date) - moment(b.date))[0];
    }, [events]);

    // Format date nicely for display
    const formatDate = (date) => {
        return moment(date).format("MMM D, YYYY");
    };

    // Calculate days away
    const getDaysAway = (date) => {
        const eventDate = moment(date);
        const today = moment();
        return eventDate.diff(today, 'days');
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            
            {/* Header */}
            <View className="bg-white pt-2 pb-4 px-5 shadow-sm">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-2xl font-bold text-gray-800">Events</Text>
                </View>
                
                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5 mt-2">
                    <Ionicons name="search" size={18} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-700"
                        placeholder="Search events..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery("")}>
                            <Ionicons name="close-circle" size={18} color="#999" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Filter */}
                <View className="flex-row justify-between mt-4 bg-gray-100 p-1 rounded-xl">
                    <TouchableOpacity
                        className={`flex-1 py-2.5 rounded-lg ${
                            activeTab === "past" ? "bg-white shadow-sm" : ""
                        }`}
                        onPress={() => setActiveTab("past")}
                    >
                        <Text className={`text-center font-medium ${
                            activeTab === "past" ? "text-[#e01d47]" : "text-gray-500"
                        }`}>
                            Past
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-2.5 rounded-lg ${
                            activeTab === "month" ? "bg-white shadow-sm" : ""
                        }`}
                        onPress={() => setActiveTab("month")}
                    >
                        <Text className={`text-center font-medium ${
                            activeTab === "month" ? "text-[#e01d47]" : "text-gray-500"
                        }`}>
                            This Month
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-2.5 rounded-lg ${
                            activeTab === "nextMonth" ? "bg-white shadow-sm" : ""
                        }`}
                        onPress={() => setActiveTab("nextMonth")}
                    >
                        <Text className={`text-center font-medium ${
                            activeTab === "nextMonth" ? "text-[#e01d47]" : "text-gray-500"
                        }`}>
                            Future
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Upcoming Event Feature Card */}
                {upcomingEvent && (
                    <View className="bg-white rounded-xl shadow mb-4 overflow-hidden">
                        <View className="bg-[#e01d47] py-2 px-4">
                            <Text className="text-white font-bold">COMING UP</Text>
                        </View>
                        
                        <View className="p-4">
                            <View className="flex-row items-center mb-3">
                                <View className="bg-[#e01d47] bg-opacity-10 p-2 rounded-lg mr-3">
                                    <Text className="text-[#ffffff] text-xl font-bold">
                                        {moment(upcomingEvent.date).format("D")}
                                    </Text>
                                    <Text className="text-[#ffffff] text-xs font-medium">
                                        {moment(upcomingEvent.date).format("MMM")}
                                    </Text>
                                </View>
                                
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                                        {upcomingEvent.title}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="location" size={14} color="#666" />
                                        <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                                            {upcomingEvent.location || "Location not specified"}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            
                            <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                                {upcomingEvent.description}
                            </Text>
                            
                            <TouchableOpacity
                                onPress={() => navigation.navigate("eventinfo", { eventId: upcomingEvent._id })}
                                className="bg-[#e01d47] py-2.5 rounded-lg items-center"
                            >
                                <Text className="text-white font-medium">View Event Details</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                
                {/* Event List */}
                {loading ? (
                    <View className="flex-1 justify-center items-center py-10">
                        <ActivityIndicator size="large" color="#e01d47" />
                        <Text className="text-gray-500 mt-3">Loading events...</Text>
                    </View>
                ) : filteredEvents.length > 0 ? (
                    <>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-base font-bold text-gray-700">
                                {activeTab === "past" ? "Past Events" : 
                                 activeTab === "month" ? "This Month" : "Future Events"}
                            </Text>
                            <Text className="text-sm text-gray-500">
                                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
                            </Text>
                        </View>
                        
                        {filteredEvents.map((event, index) => (
                            <TouchableOpacity
                                key={event._id}
                                className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden"
                                onPress={() => navigation.navigate("eventinfo", { eventId: event._id })}
                                activeOpacity={0.9}
                            >
                                <View className="p-4">
                                    <View className="flex-row">
                                        <View className="mr-3 bg-gray-100 rounded-lg p-2 items-center justify-center" 
                                              style={{ width: 60, height: 60 }}>
                                            <Text className="text-[#e01d47] text-lg font-bold">
                                                {moment(event.date).format("D")}
                                            </Text>
                                            <Text className="text-[#e01d47] text-xs">
                                                {moment(event.date).format("MMM")}
                                            </Text>
                                        </View>
                                        
                                        <View className="flex-1">
                                            <Text className="text-base font-bold text-gray-800" numberOfLines={1}>
                                                {event.title}
                                            </Text>
                                            
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="time-outline" size={14} color="#666" />
                                                <Text className="text-xs text-gray-500 ml-1">
                                                    {formatDate(event.date)}
                                                </Text>
                                                
                                                {moment(event.date).isAfter(moment()) && (
                                                    <View className="bg-[#e01d47] bg-opacity-10 rounded-full px-2 py-0.5 ml-2">
                                                        <Text className="text-xs text-[#ffffff]">
                                                            In {getDaysAway(event.date)} days
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="location-outline" size={14} color="#666" />
                                                <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
                                                    {event.location || "Location not specified"}
                                                </Text>
                                            </View>
                                            
                                            <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                                                {event.description}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <TouchableOpacity 
                                    className="bg-red-100 py-2 items-center"
                                    onPress={() => navigation.navigate("eventinfo", { eventId: event._id })}
                                >
                                    <Text className="text-sm text-[#e01d47] font-medium">View Details</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </>
                ) : (
                    <View className="flex-1 justify-center items-center py-16">
                        <Ionicons name="calendar-outline" size={70} color="#e0e0e0" />
                        <Text className="text-lg font-medium text-gray-400 mt-4">No events found</Text>
                        <Text className="text-sm text-gray-400 text-center mt-2 px-10">
                            {searchQuery 
                                ? "Try adjusting your search" 
                                : activeTab === "past" 
                                    ? "No past events available"
                                    : activeTab === "month"
                                        ? "No events this month" 
                                        : "No future events scheduled"}
                        </Text>
                    </View>
                )}
            </ScrollView>
            
            {/* Footer */}
            <View className="absolute bottom-0 w-full">
                <Footer activeRoute={"eventlist"} />
            </View>
        </View>
    );
};

export default EventsList;