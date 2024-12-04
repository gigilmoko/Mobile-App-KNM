import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getEventDetails, updateEvent } from "../../../redux/actions/calendarActions"; 
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker'; // Updated image picker library
import axios from 'axios'; // Axios for HTTP requests
import Toast from 'react-native-toast-message'; // For notifications
import mime from 'mime';
import { Picker } from '@react-native-picker/picker'; // Import Picker from @react-native-picker/picker
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons

const AdminEventUpdate = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const route = useRoute();

    const { eventId } = route.params;
    const { event, loading } = useSelector((state) => state.calendar);

    // Local state for handling updates to event
    const [updatedEvent, setUpdatedEvent] = useState({
        title: "",
        description: "",
        date: new Date(),
        startDate: new Date(),
        endDate: new Date(),
        location: "",
        audience: "all",
        image: null, // Store image URI
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isStartTimePickerVisible, setStartTimePickerVisibility] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);

    useEffect(() => {
        if (eventId) {
            // Dispatch the action to fetch event details based on the eventId
            dispatch(getEventDetails(eventId));
        }
    }, [dispatch, eventId]);

    useEffect(() => {
        if (event) {
            // Set the fetched event details in local state
            setUpdatedEvent({
                title: event.title || "",
                description: event.description || "",
                date: new Date(event.date) || new Date(),
                startDate: new Date(event.startDate) || new Date(),
                endDate: new Date(event.endDate) || new Date(),
                location: event.location || "",
                audience: event.audience || "all",
                image: event.image || null, // Initial image from the event
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
    
            // Prepare form data for image upload
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
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );
    
            const eventData = {
                ...updatedEvent,
                image: response.data.secure_url, // Add uploaded image URL
                id: eventId, // Add the eventId here
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

    // Function to pick an image and update the local state
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
                image: imageUri, // Set selected image
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
        <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
            <Header back={true} />
            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={{ fontSize: 18 }}>Loading event details...</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#F5F5F5",
                        borderTopRightRadius: 30,
                        borderTopLeftRadius: 30,
                        paddingBottom: 100, // Add padding to avoid overlap with footer
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
                                paddingTop: 15,
                            }}
                        >
                            Update Event
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
                            value={updatedEvent.title}
                            onChangeText={(text) => handleInputChange("title", text)}
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
                            value={updatedEvent.description}
                            onChangeText={(text) => handleInputChange("description", text)}
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
                        <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
                            Start Time*
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
                        <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
                            End Time*
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
                            value={updatedEvent.location}
                            onChangeText={(text) => handleInputChange("location", text)}
                        />

                        {/* Audience Dropdown */}
                        <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
                            Audience*
                        </Text>
                        <View style={{ borderWidth: 1, borderColor: '#CCCCCC', borderRadius: 5, marginBottom: 15 }}>
                            <Picker
                                selectedValue={updatedEvent.audience}
                                onValueChange={(value) => handleInputChange("audience", value)}
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

                            {updatedEvent.image && (
                                <Image
                                    source={{ uri: updatedEvent.image }}
                                    style={{ width: 100, height: 100, borderRadius: 10, marginRight: 10 }}
                                />
                            )}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleUpdate}
                            style={{
                                backgroundColor: "#ffb703",
                                padding: 12,
                                borderRadius: 5,
                                alignItems: "center",
                            }}
                            disabled={isUpdating}
                        >
                            <Text style={{ color: "#000", fontWeight: "bold" }}>
                                {isUpdating ? 'Updating...' : 'Update Event'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}

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

export default AdminEventUpdate;