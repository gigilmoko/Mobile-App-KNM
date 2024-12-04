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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons

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

      // console.log("Data sent to newEvent frontend:", eventData);
      dispatch(newEvent(eventData));

      setIsUpdating(false);
      Toast.show({
        type: "success",
        text1: "Event Created Successfully!",
      });

      // Navigate to admin events screen after successful creation
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
    <View style={{ flex: 1,  }}>
      <Header back={true} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
          borderTopRightRadius: 30,
          borderTopLeftRadius: 30,
          paddingBottom: 100,
        }}
      >
        <View
          style={{
            backgroundColor: "#F5F5F5",
            width: "90%",
            padding: 20,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              textAlign: "center",
              color: "#333333",
              paddingTop: 5,
            }}
          >
            Create Event
          </Text>

          {/* Event Title */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Event Title*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Enter event title"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Description*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="Enter event description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Event Date */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Event Date*
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
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Start Time*
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
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            End Time*
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

          {/* Location */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Location*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Enter event location"
            value={location}
            onChangeText={setLocation}
          />

          {/* Audience Dropdown */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Audience*
          </Text>
          <View style={{ borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 5, marginBottom: 15 }}>
            <Picker
              selectedValue={audience}
              onValueChange={setAudience}
              style={{ height: 50, width: '100%' }}
            >
              <Picker.Item label="All" value="all" />
              <Picker.Item label="Members" value="member" />
            </Picker>
          </View>

          {/* Image Picker */}
          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Event Image*
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <TouchableOpacity
              onPress={openImagePicker}
              style={{
                backgroundColor: "#ffb703",
                padding: 12,
                borderRadius: 5,
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#000" />
            </TouchableOpacity>

            {image && (
              <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, borderRadius: 10, marginRight: 10 }}
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#bc430b",
              padding: 12,
              borderRadius: 5,
              alignItems: "center",
            }}
            disabled={isUpdating}
          >
            <Text style={{ color: "#000", fontWeight: "bold" }}>
              {isUpdating ? 'Creating...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <Footer activeRoute={"home"} />
      </View>
    </View>
  );
};

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

export default AdminCreateEvent;