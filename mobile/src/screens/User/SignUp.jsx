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
        <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
            <View className="flex">
                <View
                    style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity onPress={() => navigation.goBack('home')}>
                        <Entypo
                            name="chevron-left"
                            style={{
                                fontSize: 30,
                                color: '#bc430b',
                                padding: 12,
                                borderRadius: 10,
                                marginTop: 30,
                            }}
                        />
                    </TouchableOpacity>
                </View>
                <View className="flex-row justify-center mt-[-40px]">
                    <Image source={require("../../assets/images/logo.png")}
                        style={{ width: 200, height: 200, marginTop: 50 }}
                    />
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 bg-white" style={{
                elevation: 10, borderTopLeftRadius: 50, borderTopRightRadius: 50
            }}>
                <View className="flex-1 bg-white px-8 pt-8" style={{ borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
                    <View className="form space-y-2">
                        <Avatar.Image
                            style={{
                                alignSelf: "center",
                                backgroundColor: "#c70049",
                            }}
                            size={80}
                            source={avatar ? { uri: avatar } : require("../../assets/images/default-user-icon.jpg")}
                        />
                        <TouchableOpacity onPress={openImagePicker}>
                            <Button textColor="gray">Change Photo</Button>
                        </TouchableOpacity>
                                
                        <Text className="text-gray-700 ml-4">First Name</Text>
                        <TextInput
                            placeholder="Enter first name"
                            value={fname}
                            onChangeText={setFname}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />

                        <Text className="text-gray-700 ml-4">Last Name</Text>
                        <TextInput
                            placeholder="Enter last name"
                            value={lname}
                            onChangeText={setLname}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />

                        <Text className="text-gray-700 ml-4">Middle Initial</Text>
                        <TextInput
                            placeholder="Enter middle initial (optional)"
                            value={middlei}
                            onChangeText={setMiddlei}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />

                        <Text className="text-gray-700 ml-4">Email Address</Text>
                        <TextInput
                            placeholder="Enter email address"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />

                        <Text className="text-gray-700 ml-4">Password</Text>
                        <TextInput
                            secureTextEntry={true}
                            placeholder="Enter password"
                            value={password}
                            onChangeText={setPassword}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl"
                        />

                        <Text className="text-gray-700 ml-4">Date of Birth</Text>
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

                        <Text className="text-gray-700 ml-4">Phone</Text>
                        <TextInput
                            placeholder="Enter phone number"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />

                        <TouchableOpacity
                            style={{ backgroundColor: '#bc430b' }}
                            loading={loading}
                            className="py-3 bg-400 rounded-xl"
                            disabled={disableBtn}
                            onPress={() => setShowMemberModal(true)}
                        >
                            <Text style={{ color: '#fff' }} className="text-gray-700 font-bold text-center">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xl text-gray-700 text-center font-bold py-2">Or</Text>
                    <View className="flex-row justify-center py-2">
                        <Text className="text-gray-500 font-semibold">Already have an account?</Text>
                        <TouchableOpacity onPress={() => {
                            dispatch({ type: "resetUser" });
                            navigation.navigate('login');
                        }}>
                            <Text style={{ backgroundColor: '#fff' }} className="text-400 font-semibold ml-2">Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <Modal
                visible={showMemberModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMemberModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Are you a member of KNM?</Text>
                        <View style={styles.modalButtonContainer}>
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

            <Modal
                visible={showMemberIdModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowMemberIdModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter your Member ID</Text>
                        <TextInput
                            placeholder="Enter Member ID"
                            value={memberId}
                            onChangeText={setMemberId}
                            style={styles.modalInput}
                        />
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

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalInput: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        marginBottom: 20,
    },
});

export default SignUp;
