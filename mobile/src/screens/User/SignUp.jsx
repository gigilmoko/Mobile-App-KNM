import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import Footer from "../../components/Layout/Footer";
import * as Icons from "react-native-heroicons/solid";
import { useNavigation } from "@react-navigation/native";
import Entypo from 'react-native-vector-icons/Entypo';
import { Avatar, Button } from "react-native-paper";
import mime from "mime";
import { useDispatch, useSelector } from "react-redux";
import { useMessageAndErrorUser } from "../../../utils/hooks";
import { register, registerUserMember, updateAvatar } from "../../redux/actions/userActions";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Toast from "react-native-toast-message";

const SignUp = ({ navigation, route }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [avatar, setAvatar] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [middlei, setMiddlei] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [googleLogin, setGoogleLogin] = useState(false);
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showMemberIdModal, setShowMemberIdModal] = useState(false);
    const [memberId, setMemberId] = useState("");

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dateOfBirth;
        setShowDatePicker(false);
        setDateOfBirth(currentDate.toISOString().split('T')[0]); // Set date in "YYYY-MM-DD"
    };

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const disableBtn = !fname || !lname || !email || !password || !dateOfBirth || !phone;

    useEffect(() => {
        if (user) {
            setFname(user.fname);
            setLname(user.lname);
            setMiddlei(user.middlei);
            setEmail(user.email);
            setAvatar(user.picture);
            setPassword(password);
        }
    }, [user]);

    const submitHandler = async (isMember) => {
        const registrationData = {
            fname,
            lname,
            middlei,
            email,
            password,
            dateOfBirth,
            phone,
            googleLogin,
        };

        if (avatar) {
            const file = {
                uri: avatar,
                type: mime.getType(avatar) || 'image/jpeg',
                name: avatar.split("/").pop() || "default.jpg",
            };

            const avatarFormData = new FormData();
            avatarFormData.append('file', file);
            avatarFormData.append('upload_preset', 'ml_default');

            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                    avatarFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                const imageUrl = response.data.secure_url;
                registrationData.avatar = imageUrl;

                Toast.show({
                    type: 'success',
                    text1: 'Avatar uploaded successfully!',
                });

            } catch (error) {
                console.error('Failed to upload avatar', error);

                Toast.show({
                    type: 'error',
                    text1: 'Failed to upload avatar. Please try again.',
                });

                return;
            }
        }

        if (isMember) {
            registrationData.memberId = memberId;
            try {
                const result = await dispatch(registerUserMember(registrationData));
                if (result === 'success') {
                    Toast.show({
                        type: 'success',
                        text1: 'Registration successful!',
                    });
                    navigation.navigate('home');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration failed. Please try again.',
                    });
                }
            } catch (error) {
                console.error('Error during registration:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Registration failed. Please try again.',
                });
            }
        } else {
            try {
                const result = await dispatch(register(registrationData));
                if (result === 'success') {
                    Toast.show({
                        type: 'success',
                        text1: 'Registration successful!',
                    });
                    navigation.navigate('home');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration failed. Please try again.',
                    });
                }
            } catch (error) {
                console.error('Error during registration:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Registration failed. Please try again.',
                });
            }
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
            setAvatar(imageUri);
            setIsAvatarChanged(true);
        }
    };

    const loading = useMessageAndErrorUser(navigation, dispatch, "profile");

    useEffect(() => {
        if (route.params?.image) setAvatar(route.params.image);
    }, [route.params]);

    return (
        <View className="flex-1">
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="flex-1 justify-center items-center bg-white py-5 px-5">
            <View className="w-full bg-white rounded-lg p-5 shadow-md">
                <View className="space-y-2">
                    <Text className="text-2xl font-bold mt-4 px-3 text-[#e01d47]">Sign Up</Text>
                    <Text className="text-base font-medium mb-8 px-3 text-[#c5c5c5]">Sign up to your account</Text>

                    {/* Avatar */}
                    <View className="relative ">
                        <Avatar.Image
                            style={{ alignSelf: "center", backgroundColor: "#c70049" }}
                            size={80}
                            source={avatar ? { uri: avatar } : require("../../assets/images/default-user-icon.jpg")}
                        />
                        <TouchableOpacity 
                            onPress={openImagePicker} 
                            className="absolute bg-white rounded-full p-1 shadow-md"
                            style={{ right: -5, bottom: -5 }}
                        >
                            <Icons.CameraIcon size={24} color="#c70049" />
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View className="flex-row space-x-2">
                        <View className="flex-1">
                            <Text className="text-[#e01d47] font-bold ml-4">First Name</Text>
                            <TextInput placeholder="Enter first name" value={fname} onChangeText={setFname} className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" />
                        </View>
                        <View className="w-1/3">
                            <Text className="text-[#e01d47] font-bold ml-4">M.I.</Text>
                            <TextInput placeholder="M.I." value={middlei} onChangeText={setMiddlei} className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" />
                        </View>
                    </View>

                    <Text className="text-[#e01d47] font-bold ml-4">Last Name</Text>
                    <TextInput placeholder="Enter last name" value={lname} onChangeText={setLname} className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" />

                    <Text className="text-[#e01d47] font-bold ml-4">Email Address</Text>
                    <TextInput placeholder="Enter email address" keyboardType="email-address" value={email} onChangeText={setEmail} className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" />

                    <Text className="text-[#e01d47] font-bold ml-4">Password</Text>
                    <TextInput secureTextEntry placeholder="Enter password" value={password} onChangeText={setPassword} className="p-4 bg-gray-100 text-gray-700 rounded-2xl" />

                    <Text className="text-[#e01d47] font-bold ml-4">Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <TextInput placeholder="Enter date of birth" value={dateOfBirth} editable={false} className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" />
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker testID="dateTimePicker" value={new Date(dateOfBirth || Date.now())} mode="date" is24Hour display="default" onChange={handleDateChange} />
                    )}

                    <Text className="text-[#e01d47] font-bold ml-4">Phone</Text>
                    <TextInput placeholder="Enter phone number" keyboardType="phone-pad" value={phone} onChangeText={setPhone} className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3" />
                </View>
            </View>
        </View>
    </ScrollView>

    {/* Fixed Sign Up & Login Section */}
    <View className="absolute bottom-0 w-full bg-white p-5 shadow-lg">
        <TouchableOpacity className="py-3 rounded-xl bg-[#e01d47]" disabled={disableBtn} onPress={() => setShowMemberModal(true)}>
            <Text className="text-white font-bold text-center">Sign Up</Text>
        </TouchableOpacity>


        
        <View className="flex-row justify-center py-2">
            <Text className="text-gray-500 font-semibold">Already have an account?</Text>
            <TouchableOpacity onPress={() => {
                dispatch({ type: "resetUser" });
                navigation.navigate('login');
            }}>
                <Text className="text-[#e01d47] font-semibold ml-2">Login</Text>
            </TouchableOpacity>
        </View>
    </View>
    
    <Modal visible={showMemberModal} transparent animationType="slide" onRequestClose={() => setShowMemberModal(false)}>
    <View className="flex-1 justify-center items-center bg-transparent">
        <View className="w-4/5 bg-white p-5 rounded-lg items-center shadow-lg">
            <Text className="text-lg font-bold mb-4">Are you a member of KNM?</Text>
            <View className="flex-row justify-between w-full">
                <Button onPress={() => {
                    setShowMemberModal(false);
                    setShowMemberIdModal(true);
                }}>Yes</Button>
                <Button onPress={() => {
                    setShowMemberModal(false);
                    submitHandler(false);
                }}>No</Button>
            </View>
        </View>
    </View>
</Modal>
    
            <Modal visible={showMemberIdModal} transparent animationType="slide" onRequestClose={() => setShowMemberIdModal(false)}>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="w-4/5 bg-white p-5 rounded-lg items-center">
                        <Text className="text-lg font-bold mb-4">Enter your Member ID</Text>
                        <TextInput placeholder="Enter Member ID" value={memberId} onChangeText={setMemberId} className="w-full p-2 border border-gray-400 rounded-md mb-4" />
                        <Button onPress={() => {
                            setShowMemberIdModal(false);
                            submitHandler(true);
                        }}>Submit</Button>
                    </View>
                </View>
            </Modal>
        </View>
   
    

    );
};


export default SignUp;