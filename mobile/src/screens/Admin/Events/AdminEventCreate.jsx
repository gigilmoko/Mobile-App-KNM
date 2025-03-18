import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { newEvent } from "../../../redux/actions/calendarActions";
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import mime from 'mime';
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons

const AdminCreateEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("all");
  const [image, setImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!title || !description || !location || !audience || !image) {
      Toast.show({
        type: "error",
        text1: "All fields are required!",
      });
      return;
    }

    // Prepare form data for image upload
    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append("file", {
        uri: image,
        type: mime.getType(image),
        name: image.split("/").pop(),
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
        title,
        description,
        date,
        startDate,
        endDate,
        location,
        audience,
        image: response.data.secure_url,
      };

      dispatch(newEvent(eventData));

      setIsUpdating(false);
      Toast.show({
        type: "success",
        text1: "Event Created Successfully!",
      });

      navigation.navigate("adminevents");
    } catch (error) {
      console.error('Failed to upload image or create event', error);
      setIsUpdating(false);
      Toast.show({
        type: "error",
        text1: "Failed to create event. Please try again.",
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
      setImage(imageUri);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (selectedDate) => {
    setDate(selectedDate);
    hideDatePicker();
  };

  const showStartTimePicker = () => {
    setStartTimePickerVisibility(true);
  };

  const hideStartTimePicker = () => {
    setStartTimePickerVisibility(false);
  };

  const handleStartTimeConfirm = (selectedDate) => {
    setStartDate(selectedDate);
    hideStartTimePicker();
  };

  const showEndTimePicker = () => {
    setEndTimePickerVisibility(true);
  };

  const hideEndTimePicker = () => {
    setEndTimePickerVisibility(false);
  };

  const handleEndTimeConfirm = (selectedDate) => {
    setEndDate(selectedDate);
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
          <Header title="Create Event" />

          {/* Basic Information */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="alert-circle-outline" size={20} color="#e01d47" />
            <Text className="text-sm text-gray font-bold ml-2">Basic Information</Text>
          </View>

          <Text className="text-md font-bold text-gray-600 mb-2">Event Title <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter event title"
            value={title}
            onChangeText={setTitle}
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Description <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4 h-24 text-top"
            placeholder="Enter event description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Location <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <TextInput
            className="border border-gray-300 rounded-md p-2 mb-4"
            placeholder="Enter event location"
            value={location}
            onChangeText={setLocation}
          />

          <Text className="text-sm font-bold text-gray-600 mb-2">Audience <Ionicons name="star" size={12} color="#e01d47" /></Text>
          <View className="border border-gray-300 rounded-md mb-4">
            <Picker
              selectedValue={audience}
              onValueChange={setAudience}
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
              value={date.toDateString()}
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
              value={startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              value={endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

            {image && (
              <Image
                source={{ uri: image }}
                className="w-24 h-24 rounded-md ml-2"
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className={`bg-[#e01d47] p-3 rounded-md items-center ${isUpdating ? 'opacity-50' : ''}`}
            disabled={isUpdating}
          >
            <Text className="text-white font-bold">
              {isUpdating ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

     
    </View>
  );
};

export default AdminCreateEvent;

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