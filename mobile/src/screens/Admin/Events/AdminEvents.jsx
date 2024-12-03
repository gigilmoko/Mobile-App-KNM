import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { Calendar } from "react-native-calendars";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../../../redux/actions/calendarActions";

const AdminEvents = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = React.useState("");
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.calendar);

  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  useEffect(() => {
    if (events) {
      console.log("Fetched events:", events);
    }
  }, [events]);

  return (
    <View className="flex-1 bg-yellow-500">
      <Header back={true} />
      <View className="bg-white rounded-t-[50px] h-full px-4 shadow-lg">
        <View className="items-center">
          <Text className="text-xl font-bold mt-4 mb-2">Events</Text>
        </View>

        <View className="mt-0 rounded-lg overflow-hidden">
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                marked: true,
                selectedColor: "#ffb703",
              },
            }}
            theme={{
              todayTextColor: "#ffb703",
              arrowColor: "#ffb703",
              selectedDayBackgroundColor: "#ffb703",
              selectedDayTextColor: "#ffffff",
            }}
          />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-800">Loading...</Text>
          </View>
        ) : (
          <View className="mt-5">
            <Text className="text-lg font-bold mb-2 text-gray-800">List of Events</Text>
            <ScrollView>
              {events && events.length > 0 ? (
                events.map((event) => (
                  <TouchableOpacity
                    key={event.id}
                    onPress={() =>
                      navigation.navigate("eventDetail", { id: event.id })
                    }
                    className="my-1 border border-yellow-400 rounded-lg bg-white p-3"
                  >
                    <Text className="text-lg font-semibold text-black tracking-wide">
                      {event.title}
                    </Text>
                    <Text className="text-base text-gray-600">{event.date}</Text>
                    <Text className="text-sm text-gray-700 mt-1">
                      {event.location}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-lg text-gray-600 text-center">
                  No events available
                </Text>
              )}
            </ScrollView>
          </View>
        )}
      </View>

      <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"home"} />
      </View>
    </View>
  );
};

export default AdminEvents;
