import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";

import Header from "../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, loadUser } from "../../redux/actions/userActions"; 
import { useIsFocused } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker"; 

const UpdateProfile = ({ navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { user } = useSelector(state => state.user);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fname, setFname] = useState(user?.fname || "");
    const [lname, setLname] = useState(user?.lname || "");
    const [middlei, setMiddlei] = useState(user?.middlei || "");
    const [email, setEmail] = useState(user?.email || "");
    const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth?.split('T')[0] || ""); 
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [isProfileChanged, setIsProfileChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState("");

    const handleFocus = (field) => setFocusedField(field);
    const handleBlur = () => setFocusedField("");

    const submitHandler = async () => {
        setLoading(true);
        try {
            const updatedProfileData = {
                userId: user._id,
                fname,
                lname,
                middlei,
                email,
                dateOfBirth,
                phone,
            };

            await dispatch(updateProfile(updatedProfileData));
            setIsProfileChanged(true);
            
            Toast.show({
                type: 'success',
                text1: 'Profile updated successfully!',
            });
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Failed to update profile. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) {
            dispatch(loadUser());
        }
    }, [dispatch, isFocused]);

    useEffect(() => {
        if (isProfileChanged) {
            navigation.replace('myaccount');
        }
    }, [isProfileChanged, navigation]);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date(dateOfBirth);
        setShowDatePicker(false);
        setDateOfBirth(currentDate.toISOString().split('T')[0]); 
    };

    return (
        <View className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-1 items-center bg-white py-5 px-5">
                <Header title="Update Profile" />
                <View className="w-full bg-white rounded-lg p-5 shadow-md justify-center">
                    <Text className="text-xl font-bold my-4 text-[#e01d47]">Personal Details</Text>
    
                    <View className="flex-row space-x-2">
                        <View className="flex-1">
                            <Text className="text-[#ff7895] font-bold">First Name</Text>
                            <TextInput
                                placeholder="Enter first name"
                                value={fname}
                                onChangeText={setFname}
                                onFocus={() => handleFocus("fname")}
                                onBlur={handleBlur}
                                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                            />
                        </View>
                        <View className="w-1/3">
                            <Text className="text-[#ff7895] font-bold ml-4">M.I.</Text>
                            <TextInput
                                value={middlei}
                                onChangeText={setMiddlei}
                                onFocus={() => handleFocus("middlei")}
                                onBlur={handleBlur}
                                className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                            />
                        </View>
                    </View>
    
                    <Text className="text-[#ff7895] font-bold mb-1">Last Name</Text>
                    <TextInput
                        placeholder="Enter last name"
                        value={lname}
                        onChangeText={setLname}
                        onFocus={() => handleFocus("lname")}
                        onBlur={handleBlur}
                        className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                    />
    
                    <Text className="text-[#ff7895] font-bold mb-1">Email Address</Text>
                    <TextInput
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => handleFocus("email")}
                        onBlur={handleBlur}
                        className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                    />
    
                    <Text className="text-[#ff7895] font-bold mb-1">Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <TextInput
                            placeholder="Enter date of birth"
                            value={dateOfBirth}
                            editable={false}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={new Date(dateOfBirth || Date.now())}
                            mode="date"
                            is24Hour={true}
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}
    
                    <Text className="text-[#ff7895] font-bold mb-1">Phone</Text>
                    <TextInput
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        onFocus={() => handleFocus("phone")}
                        onBlur={handleBlur}
                        className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                    />
                </View>
            </View>
        </ScrollView>
    
        {/* Button at the bottom */}
        <View className="p-5">
            <TouchableOpacity
                className="bg-[#e01d47] w-full py-3 rounded-lg items-center"
                onPress={submitHandler}
                disabled={loading}
            >
                <Text className="text-white font-bold text-lg">Update</Text>
            </TouchableOpacity>
        </View>
    </View>
    
    

    );
};



export default UpdateProfile;