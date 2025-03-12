import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image } from "react-native";
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

    return (
        <View className="flex-1 bg-white pb-">
             <View className="px-5 py-5">
                <View className="flex items-center">
                    <Header title="Event List" />
                </View>
            </View>
            <View className="flex-1 px-4 pt-2 mb-10">
            <View className="mt-[-20px] flex-row items-center border border-[#e01d47] rounded-full px-4 py-2 bg-white">
    <TextInput
        className="flex-1 text-gray-700 placeholder-gray-400"
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
    />
    <Ionicons name="search" size={20} color="#e01d47" />
</View>
                {upcomingEvent && (
                    <View className="bg-white rounded p-2 shadow border border-yellow-500">
                        <Text className="text-lg font-bold text-gray-800 mb-1">Upcoming Event</Text>
                        <Text className="text-base font-bold">Title: {upcomingEvent.title}</Text>
                        <Text className="text-sm text-gray-800">Venue: {upcomingEvent.location}</Text>
                        <Text className="text-sm text-gray-600">Date: 
                             {moment(upcomingEvent.date).format("MM-DD-YYYY")}
                        </Text>
                    
                        <Text className="text-sm text-gray-600">Description: {upcomingEvent.description}</Text>
                    </View>
                )}

                <View className="flex-row justify-around my-4">
                <TouchableOpacity
    className={`px-4 py-2 mt-2 rounded-full border ${
        activeTab === "past"
            ? "bg-[#e01d47] text-white"
            : "bg-white border-[#e01d47]"
    }`}
    onPress={() => setActiveTab("past")}
>
    <Text className={`font-bold ${activeTab === "past" ? "text-white" : "text-[#e01d47]"}`}>
        Past Events
    </Text>
</TouchableOpacity>

<TouchableOpacity
    className={`px-4 py-2 mt-2 rounded-full border ${
        activeTab === "month"
            ? "bg-[#e01d47] text-white"
            : "bg-white border-[#e01d47]"
    }`}
    onPress={() => setActiveTab("month")}
>
    <Text className={`font-bold ${activeTab === "month" ? "text-white" : "text-[#e01d47]"}`}>
        This Month
    </Text>
</TouchableOpacity>

<TouchableOpacity
    className={`px-4 py-2 mt-2 rounded-full border ${
        activeTab === "nextMonth"
            ? "bg-[#e01d47] text-white"
            : "bg-white border-[#e01d47]"
    }`}
    onPress={() => setActiveTab("nextMonth")}
>
    <Text className={`font-bold ${activeTab === "nextMonth" ? "text-white" : "text-[#e01d47]"}`}>
        Future Events
    </Text>
</TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View className="justify-center items-center">
                            <Text>Loading...</Text>
                        </View>
                    ) : (
                        <View>
                            {filteredEvents && filteredEvents.length > 0 ? (
    filteredEvents.map((event, index) => (
        <View key={event._id} className="py-2">
            {/* Event Content */}
            <View className="flex-row items-center">
                {/* Event Image */}
                <Image
                    source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741731158/image_2025-03-12_061207062-removebg-preview_hsp3wa.png" }}
                    className="w-12 h-12 mr-3"
                    resizeMode="contain"
                />

                {/* Event Details */}
                <View className="flex-1">
                    {/* Truncated Title */}
                    <Text
                        className={`text-base font-bold ${
                            moment(event.date).isBetween(moment(), moment().endOf("month"), "day", "[]") ? "text-yellow-500" : ""
                        }`}
                    >
                        {event.title.length > 40 ? `${event.title.substring(0, 40)}...` : event.title}
                    </Text>

                    {/* Truncated Description */}
                    <Text className="text-sm text-gray-800">
                        {event.description.length > 20 ? `${event.description.substring(0, 20)}...` : event.description}
                    </Text>

                    {/* Calendar Icon + Date */}
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="calendar" size={16} color="#e01d47" />
                        <Text className="text-sm text-gray-600 ml-1">
                            {moment(event.date).format("MM-DD-YYYY")}
                        </Text>
                    </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
    onPress={() => navigation.navigate("eventinfo", { eventId: event._id })}
    className="bg-[#e01d47] px-4 py-2 mt-10 rounded-full"
>
    <Text className="text-white text-sm font-bold">View Details</Text>
</TouchableOpacity>
            </View>

            {/* Divider (Except for the last item) */}
            {index !== filteredEvents.length - 1 && <View className="border-b border-gray-300 my-2" />}
        </View>
    ))
                            ) : (
                                <Text className="text-base text-gray-500 text-center">No events available</Text>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
            <Footer className="mb-10" activeRoute={"home"} />
        </View>
    );
};

export default EventsList;