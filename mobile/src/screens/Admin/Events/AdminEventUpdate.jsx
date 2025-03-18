import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Header from "../../../components/Layout/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvent, updateEvent } from "../../../redux/actions/calendarActions";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import mime from 'mime';
import { Picker } from '@react-native-picker/picker';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons

const AdminEventUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { eventId } = route.params;
  const { event, loading } = useSelector((state) => state.calendar);

  const [updatedEvent, setUpdatedEvent] = useState({
    title: "",
    description: "",
    date: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    location: "",
    audience: "all",
    image: null,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEvent(eventId));
    }
  }, [dispatch, eventId]);

  useEffect(() => {
    if (event) {
      setUpdatedEvent({
        title: event.title || "",
        description: event.description || "",
        date: new Date(event.date) || new Date(),
        startDate: new Date(event.startDate) || new Date(),
        endDate: new Date(event.endDate) || new Date(),
        location: event.location || "",
        audience: event.audience || "all",
        image: event.image || null,
      });
    }
  }, [event]);

  const handleInputChange = (field, value) => {
    setUpdatedEvent((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!updatedEvent.title || !updatedEvent.description || !updatedEvent.location || !updatedEvent.audience || !updatedEvent.image) {
      Toast.show({
        type: "error",
        text1: "All fields are required!",
      });
      return;
    }

    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append("file", {
        uri: updatedEvent.image,
        type: mime.getType(updatedEvent.image),
        name: updatedEvent.image.split("/").pop(),
      });
      formData.append("upload_preset", "ml_default");

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const eventData = {
        ...updatedEvent,
        image: response.data.secure_url,
        id: eventId,
      };

      dispatch(updateEvent(eventData));

      setIsUpdating(false);
      Toast.show({
        type: "success",
        text1: "Event Updated Successfully!",
      });
      navigation.navigate("adminevents");
    } catch (error) {
      console.error("Failed to upload image or update event", error);
      setIsUpdating(false);
      Toast.show({
        type: "error",
        text1: "Failed to update event. Please try again.",
      });
    }
  };

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      return alert("Permission to access gallery is required");
    }

    const data = await ImagePicker.launchImageLibraryAsync();

    if (data.assets) {
      const imageUri = data.assets[0].uri;
      setUpdatedEvent((prevState) => ({
        ...prevState,
        image: imageUri,
      }));
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (selectedDate) => {
    setUpdatedEvent((prevState) => ({
      ...prevState,
      date: selectedDate,
    }));
    hideDatePicker();
  };

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (selectedDate) => {
    setUpdatedEvent((prevState) => ({
      ...prevState,
      startDate: selectedDate,
    }));
    hideStartTimePicker();
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (selectedDate) => {
    setUpdatedEvent((prevState) => ({
      ...prevState,
      endDate: selectedDate,
    }));
    hideEndTimePicker();
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View className="w-11/12 rounded-lg p-5">
          <Header title="Update Event" />

          {/* Basic Information */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Basic Information</Text>
          </View>

          <Text className="text-md font-bold text-gray-600 mb-2">Event Title <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter event title"
            value={updatedEvent.title}
            onChangeText={(text) => handleInputChange("title", text)}
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Description <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4 h-24 text-top"
            placeholder="Enter event description"
            value={updatedEvent.description}
            onChangeText={(text) => handleInputChange("description", text)}
            multiline
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Location <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter event location"
            value={updatedEvent.location}
            onChangeText={(text) => handleInputChange("location", text)}
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Audience <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <View className="border border-gray-300 rounded-md mb-4">
            <Picker
              selectedValue={updatedEvent.audience}
              onValueChange={(value) => handleInputChange("audience", value)}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label="All" value="all" />
              <Picker.Item label="Members" value="member" />
            </Picker>
          </View>

          {/* Event Date and Time */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Event Date and Time</Text>
          </View>

          <Text className="text-sm font-bold text-gray-600 mb-2">
            Event Date <Ionicons name="star" size={12} color="#e01d47" />
          </Text>
          <TouchableOpacity onPress={showDatePicker} style={styles.dateTimeInput}>
            <TextInput
              style={{ flex: 1 }}
              placeholder="Select event date"
              value={updatedEvent.date.toDateString()}
              editable={false}
            />
            <MaterialCommunityIcons name="calendar" size={24} color="#000" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
          />

          {/* Start Time */}
          <Text className="text-sm font-bold text-gray-600 mb-2">
            Start Time <Ionicons name="star" size={12} color="#e01d47" />
          </Text>
          <TouchableOpacity onPress={showStartTimePicker} style={styles.dateTimeInput}>
            <TextInput
              style={{ flex: 1 }}
              placeholder="Select start time"
              value={updatedEvent.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              editable={false}
            />
            <MaterialCommunityIcons name="clock" size={24} color="#000" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isStartTimePickerVisible}
            mode="time"
            onConfirm={handleStartTimeConfirm}
            onCancel={hideStartTimePicker}
          />

          {/* End Time */}
          <Text className="text-sm font-bold text-gray-600 mb-2">
            End Time <Ionicons name="star" size={12} color="#e01d47" />
          </Text>
          <TouchableOpacity onPress={showEndTimePicker} style={styles.dateTimeInput}>
            <TextInput
              style={{ flex: 1 }}
              placeholder="Select end time"
              value={updatedEvent.endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              editable={false}
            />
            <MaterialCommunityIcons name="clock" size={24} color="#000" />
          </TouchableOpacity>
          <DateTimePickerModal
            isVisible={isEndTimePickerVisible}
            mode="time"
            onConfirm={handleEndTimeConfirm}
            onCancel={hideEndTimePicker}
          />

          {/* Event Image */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="camera-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Event Image</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={openImagePicker}
              className="border border-gray-400 rounded-lg w-24 h-24 flex items-center justify-center"
            >
              <Ionicons name="cloud-upload-outline" size={30} color="gray" />
              <Text className="text-gray-500 text-xs mt-1">Upload</Text>
            </TouchableOpacity>

            {updatedEvent.image && (
              <Image
                source={{ uri: updatedEvent.image }}
                className="w-24 h-24 rounded-md ml-2"
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleUpdate}
            className={`bg-[#e01d47] p-3 rounded-md items-center ${isUpdating ? 'opacity-50' : ''}`}
            disabled={isUpdating}
          >
            <Text className="text-white font-bold">
              {isUpdating ? 'Updating...' : 'Update Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminEventUpdate;

const styles = StyleSheet.create({
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});