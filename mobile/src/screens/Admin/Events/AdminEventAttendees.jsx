import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Button, TouchableOpacity, Image, FlatList, ActivityIndicator, TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import { fetchEvent } from "../../../redux/actions/calendarActions";
import { getAllInterestedUsers, changeAttended } from "../../../redux/actions/userInterestActions";
import Header from "../../../components/Layout/Header";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons"; // Add this import

const AdminEventAttendees = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const { eventId } = route.params;
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // Add this state
  const { event, loading: eventLoading } = useSelector((state) => state.calendar);
  const { interestData, loading: interestLoading } = useSelector((state) => state.userInterested);

  useEffect(() => {
    if (eventId) {
      dispatch({ type: 'CLEAR_INTEREST_DATA' }); // Clear previous data
      dispatch(fetchEvent(eventId));
      dispatch(getAllInterestedUsers(eventId));
    }
  }, [dispatch, eventId]);

  const isEventPast = () => {
    if (!event?.endDate) return false;
    const currentTime = new Date();
    const eventEndDate = new Date(event.endDate);
    return currentTime > eventEndDate;
  };

  const handleAttendanceChange = async (userId) => {
    await dispatch(changeAttended(userId, eventId));
    dispatch(getAllInterestedUsers(eventId)); // Refresh the data
  };

  const filteredData = selectedTab === "all" 
    ? interestData.filter(user => user.fname.toLowerCase().includes(searchQuery.toLowerCase()) || user.lname.toLowerCase().includes(searchQuery.toLowerCase()))
    : interestData.filter(user => !user.isAttended && (user.fname.toLowerCase().includes(searchQuery.toLowerCase()) || user.lname.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <View className="flex-1 bg-white">
    <ScrollView contentContainerStyle={{ justifyContent: "center", alignItems: "center" }}>
      <View className="w-11/12 rounded-lg py-5 px-3">
        <Header title="Event Attendees" />
  
        {eventLoading || interestLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            <Text className="text-lg font-bold">{event?.title}</Text>
            
            {/* Start Date + Registered Count */}
            <View className="flex-row justify-between items-center">
              <Text className="text-md">
                {event?.startDate ? format(new Date(event.startDate), "MMMM dd, yyyy") : ""}
              </Text>
              <Text className="text-md text-gray-600">{filteredData.length} Registered</Text>
            </View>
  
            {/* Divider */}
            <View className="border-b border-gray-300 my-2" />
  
            {/* Search Box */}
            <View className="flex-row items-center border border-[#e01d47] rounded-full px-4 py-2 mt-2 bg-white">
              <TextInput
                className="flex-1 text-gray-700 placeholder-gray-400"
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Ionicons name="search" size={20} color="#e01d47" />
            </View>

            {isEventPast() && (
              <View className="flex-row justify-center mt-4 bg-gray-100 rounded-lg overflow-hidden">
                <TouchableOpacity
                  onPress={() => setSelectedTab("all")}
                  className={`flex-1 py-2 items-center ${
                    selectedTab === "all" ? "bg-red-500" : "bg-white"
                  }`}
                >
                  <Text className={selectedTab === "all" ? "text-white font-bold" : "text-black"}>
                    All
                  </Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  onPress={() => setSelectedTab("didNotAttend")}
                  className={`flex-1 py-2 items-center ${
                    selectedTab === "didNotAttend" ? "bg-red-500" : "bg-white"
                  }`}
                >
                  <Text className={selectedTab === "didNotAttend" ? "text-white font-bold" : "text-black"}>
                    Did Not Attend
                  </Text>
                </TouchableOpacity>
              </View>
            )}
  
        
  
            {filteredData.length === 0 ? (
              <Text className="text-center text-gray-500">
                {isEventPast() ? "No one registered and attended." : "No one registered yet."}
              </Text>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(user) => user.userId}
                renderItem={({ item: user }) => (
                  <View className="mt-2 flex-row justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                    {/* User Info */}
                    <View className="flex-row items-center">
                      <Image
                        source={{ uri: user.avatar }}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <View>
                        <Text className="text-sm font-semibold">{user.fname} {user.lname}</Text>
                        <Text className="text-sm text-gray-500">{user.email}</Text>
                        <Text className="text-xs text-gray-400">Registered: March 1, 2025</Text>
                      </View>
                    </View>
  
                    {/* Attended Status - Touchable */}
                    <TouchableOpacity
                      onPress={isEventPast() ? () => handleAttendanceChange(user.userId) : null}
                      className={`px-3 py-1 rounded-full ${
                        isEventPast()
                          ? user.isAttended ? "bg-green-100" : "bg-red-100"
                          : "bg-green-100"
                      }`}
                      disabled={!isEventPast()}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          isEventPast()
                            ? user.isAttended ? "text-green-600" : "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {isEventPast()
                          ? user.isAttended ? "Attended" : "Did not Attend"
                          : "Confirmed"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  </View>
  );
};

export default AdminEventAttendees;
