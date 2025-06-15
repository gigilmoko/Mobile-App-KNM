import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Avatar, Button } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import mime from "mime";
import { useDispatch, useSelector } from "react-redux";
import { useMessageAndErrorUser } from "../../../utils/hooks";
import { register, registerUserMember } from "../../redux/actions/userActions";
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Toast from "react-native-toast-message";

const SignUp = ({ navigation, route }) => {
    // Form state
    const [avatar, setAvatar] = useState("");
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [middlei, setMiddlei] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // UI state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [showMemberIdModal, setShowMemberIdModal] = useState(false);
    const [memberId, setMemberId] = useState("");
    const [googleLogin, setGoogleLogin] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        fname: "",
        lname: "",
        email: "",
        password: "",
        confirmPassword: "",
        dateOfBirth: "",
        phone: ""
    });

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const loading = useMessageAndErrorUser(navigation, dispatch, "profile");
    
    // Check if all required fields are filled
    const isFormComplete = fname && lname && email && password && confirmPassword && dateOfBirth && phone && password === confirmPassword;

    useEffect(() => {
        if (user) {
            setFname(user.fname || "");
            setLname(user.lname || "");
            setMiddlei(user.middlei || "");
            setEmail(user.email || "");
            setAvatar(user.picture || "");
        }
    }, [user]);

    useEffect(() => {
        if (route.params?.image) setAvatar(route.params.image);
    }, [route.params]);

    // Validate all form fields
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            fname: "",
            lname: "",
            email: "",
            password: "",
            confirmPassword: "",
            dateOfBirth: "",
            phone: ""
        };

        // Name validation
        if (!fname.trim()) {
            newErrors.fname = "First name is required";
            isValid = false;
        } else if (!/^[a-zA-Z\s]*$/.test(fname)) {
            newErrors.fname = "First name should only contain letters";
            isValid = false;
        }

        if (!lname.trim()) {
            newErrors.lname = "Last name is required";
            isValid = false;
        } else if (!/^[a-zA-Z\s]*$/.test(lname)) {
            newErrors.lname = "Last name should only contain letters";
            isValid = false;
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = "Email is required";
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
            isValid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            isValid = false;
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
            isValid = false;
        }

        // Date of birth validation
        if (!dateOfBirth) {
            newErrors.dateOfBirth = "Date of birth is required";
            isValid = false;
        }

        // Phone validation
        if (!phone) {
            newErrors.phone = "Phone number is required";
            isValid = false;
        } else if (!/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
            newErrors.phone = "Please enter a valid phone number";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker(false);
        setDateOfBirth(currentDate.toISOString().split('T')[0]);
        setErrors({...errors, dateOfBirth: ""});
    };

    const openImagePicker = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Toast.show({
                    type: "error",
                    text1: "Permission Denied",
                    text2: "Permission to access gallery is required"
                });
                return;
            }
            
            const data = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            });
            
            if (!data.canceled && data.assets && data.assets[0]?.uri) {
                setAvatar(data.assets[0].uri);
                setIsAvatarChanged(true);
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to select image",
                text2: "Please try again"
            });
        }
    };

    const submitHandler = async (isMember) => {
        if (!validateForm()) return;
        
        setIsLoading(true);

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

        // Upload avatar if provided
        if (avatar && isAvatarChanged) {
            try {
                const file = {
                    uri: avatar,
                    type: mime.getType(avatar) || 'image/jpeg',
                    name: avatar.split("/").pop() || "default.jpg",
                };

                const avatarFormData = new FormData();
                avatarFormData.append('file', file);
                avatarFormData.append('upload_preset', 'ml_default');

                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                    avatarFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                registrationData.avatar = response.data.secure_url;
            } catch (error) {
                console.error('Failed to upload avatar', error);
                Toast.show({
                    type: 'error',
                    text1: 'Failed to upload avatar',
                    text2: 'Registration will continue without profile picture'
                });
            }
        }

        try {
            // Handle member vs non-member registration
            if (isMember) {
                registrationData.memberId = memberId;
                const result = await dispatch(registerUserMember(registrationData));
                
                if (result === 'success') {
                    Toast.show({
                        type: 'success',
                        text1: 'Registration successful!',
                        text2: 'Your account has been created with member privileges.'
                    });
                    navigation.navigate('home');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration failed',
                        text2: 'Please check your member ID and try again.'
                    });
                }
            } else {
                const result = await dispatch(register(registrationData));
                
                if (result === 'success') {
                    Toast.show({
                        type: 'success',
                        text1: 'Registration successful!',
                        text2: 'Your account has been created. Please login.'
                    });
                    navigation.navigate('home');
                } else {
                    Toast.show({
                        type: 'error',
                        text1: 'Registration failed',
                        text2: 'Please try again with different credentials.'
                    });
                }
            }
        } catch (error) {
            console.error('Error during registration:', error);
            Toast.show({
                type: 'error',
                text1: 'Registration failed',
                text2: error?.message || 'Please try again later.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <View className="flex-1 bg-white">
         <View className="pt-10 px-5 flex-row items-center">
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="p-2 rounded-full bg-gray-100"
            >
                <Ionicons name="arrow-back" size={24} color="#e01d47" />
            </TouchableOpacity>
            <View className="flex-1" />
        </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} className="bg-white">
                <View className="flex-1 px-5 py-8">
                    <Text className="text-2xl font-bold mb-1 text-[#e01d47]">Create Account</Text>
                    <Text className="text-base font-medium mb-8 text-[#c5c5c5]">Sign up to join our community</Text>
                    
                    {/* Profile Photo */}
                    <View className="items-center mb-8">
                        <View className="relative">
                            <Avatar.Image
                                source={avatar ? { uri: avatar } : require("../../assets/images/default-user-icon.jpg")}
                                size={100}
                                className="bg-[#c70049]"
                            />
                            <TouchableOpacity 
                                onPress={openImagePicker} 
                                className="absolute bg-white rounded-full p-2 shadow-md right-0 bottom-0"
                            >
                                <Ionicons name="camera" size={24} color="#e01d47" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-500 mt-2 text-sm">Upload Profile Photo</Text>
                    </View>

                    {/* Name Fields */}
                    <View className="flex-row space-x-2">
                        <View className="flex-1">
                            <Text className="text-base font-semibold mb-1 text-[#e01d47]">First Name</Text>
                            <TextInput
                                placeholder="Enter first name"
                                value={fname}
                                onChangeText={(text) => {
                                    setFname(text);
                                    if (errors.fname) setErrors({...errors, fname: ""});
                                }}
                                className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base ${errors.fname ? "border border-red-500" : ""}`}
                            />
                            {errors.fname ? <Text className="text-red-500 text-xs mb-2">{errors.fname}</Text> : <View className="mb-3" />}
                        </View>
                        
                        <View className="w-1/4">
                            <Text className="text-base font-semibold mb-1 text-[#e01d47]">M.I.</Text>
                            <TextInput
                                placeholder="M.I."
                                value={middlei}
                                onChangeText={setMiddlei}
                                maxLength={2}
                                className="bg-gray-100 rounded-lg px-4 py-3 mb-4 text-base"
                            />
                        </View>
                    </View>

                    <Text className="text-base font-semibold mb-1 text-[#e01d47]">Last Name</Text>
                    <TextInput
                        placeholder="Enter last name"
                        value={lname}
                        onChangeText={(text) => {
                            setLname(text);
                            if (errors.lname) setErrors({...errors, lname: ""});
                        }}
                        className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base ${errors.lname ? "border border-red-500" : ""}`}
                    />
                    {errors.lname ? <Text className="text-red-500 text-xs mb-2">{errors.lname}</Text> : <View className="mb-3" />}

                    <Text className="text-base font-semibold mb-1 text-[#e01d47]">Email Address</Text>
                    <TextInput
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (errors.email) setErrors({...errors, email: ""});
                        }}
                        className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base ${errors.email ? "border border-red-500" : ""}`}
                    />
                    {errors.email ? <Text className="text-red-500 text-xs mb-2">{errors.email}</Text> : <View className="mb-3" />}

                    {/* Password Field with toggle */}
                    <Text className="text-base font-semibold mb-1 text-[#e01d47]">Password</Text>
                    <View className="relative flex-row items-center">
                        <TextInput
                            placeholder="Enter password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({...errors, password: ""});
                            }}
                            className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base flex-1 ${errors.password ? "border border-red-500" : ""}`}
                        />
                        <TouchableOpacity 
                            onPress={togglePasswordVisibility} 
                            className="absolute right-3"
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name={showPassword ? "eye-off" : "eye"} 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.password ? <Text className="text-red-500 text-xs mb-2">{errors.password}</Text> : <View className="mb-3" />}

                    {/* Confirm Password Field */}
                    <Text className="text-base font-semibold mb-1 text-[#e01d47]">Confirm Password</Text>
                    <View className="relative flex-row items-center">
                        <TextInput
                            placeholder="Confirm password"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                            }}
                            className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base flex-1 ${errors.confirmPassword ? "border border-red-500" : ""}`}
                        />
                        <TouchableOpacity 
                            onPress={toggleConfirmPasswordVisibility} 
                            className="absolute right-3"
                            activeOpacity={0.7}
                        >
                            <Ionicons 
                                name={showConfirmPassword ? "eye-off" : "eye"} 
                                size={24} 
                                color="#666" 
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? <Text className="text-red-500 text-xs mb-2">{errors.confirmPassword}</Text> : <View className="mb-3" />}

                    {/* Date of Birth */}
                    <Text className="text-base font-semibold mb-1 text-[#e01d47]">Date of Birth</Text>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <View className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 flex-row items-center justify-between ${errors.dateOfBirth ? "border border-red-500" : ""}`}>
                            <TextInput
                                placeholder="Select date of birth"
                                value={dateOfBirth}
                                editable={false}
                                className="flex-1 text-base text-gray-700"
                            />
                            <Ionicons name="calendar-outline" size={24} color="#666" />
                        </View>
                    </TouchableOpacity>
                    {errors.dateOfBirth ? <Text className="text-red-500 text-xs mb-2">{errors.dateOfBirth}</Text> : <View className="mb-3" />}
                    
                    {showDatePicker && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={dateOfBirth ? new Date(dateOfBirth) : new Date()}
                            mode="date"
                            display="default"
                            maximumDate={new Date()}
                            onChange={handleDateChange}
                        />
                    )}

                    {/* Phone */}
                    <Text className="text-base font-semibold mb-1 text-[#e01d47]">Phone Number</Text>
                    <TextInput
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(text) => {
                            setPhone(text);
                            if (errors.phone) setErrors({...errors, phone: ""});
                        }}
                        className={`bg-gray-100 rounded-lg px-4 py-3 mb-1 text-base ${errors.phone ? "border border-red-500" : ""}`}
                    />
                    {errors.phone ? <Text className="text-red-500 text-xs mb-2">{errors.phone}</Text> : <View className="mb-3" />}
                </View>
            </ScrollView>

            {/* Action Buttons Fixed at Bottom */}
            <View className="absolute bottom-0 left-0 right-0 bg-white p-5 shadow-lg border-t border-gray-200">
                <TouchableOpacity
                    className={`bg-[#e01d47] py-3 rounded-lg items-center w-full mb-2 ${(isLoading) ? "opacity-50" : ""}`}
                    // disabled={!isFormComplete || isLoading}
                    onPress={() => setShowMemberModal(true)}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign Up</Text>
                    )}
                </TouchableOpacity>
                
                <View className="flex-row justify-center mt-2">
                    <Text className="text-gray-500 text-sm">Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("login")}>
                        <Text className="text-[#e01d47] font-bold text-sm ml-1">Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Member Modal */}
            <Modal visible={showMemberModal} transparent animationType="slide" onRequestClose={() => setShowMemberModal(false)}>
                <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                    <View className="w-4/5 bg-white p-6 rounded-lg shadow">
                        <Text className="text-xl font-bold mb-4 text-center">Are you a member of KNM?</Text>
                        <View className="flex-row justify-between w-full mt-4">
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowMemberModal(false);
                                    setShowMemberIdModal(true);
                                }}
                                className="bg-[#e01d47] px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-bold">Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowMemberModal(false);
                                    submitHandler(false);
                                }}
                                className="bg-gray-200 px-6 py-3 rounded-lg"
                            >
                                <Text className="text-gray-700 font-bold">No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Member ID Modal */}
            <Modal visible={showMemberIdModal} transparent animationType="slide" onRequestClose={() => setShowMemberIdModal(false)}>
                <View className="flex-1 justify-center items-center bg-white bg-opacity-50">
                    <View className="w-4/5 bg-white p-6 rounded-lg shadow">
                        <Text className="text-xl font-bold mb-4 text-center">Enter your Member ID</Text>
                        <TextInput
                            placeholder="Enter Member ID"
                            value={memberId}
                            onChangeText={setMemberId}
                            className="bg-gray-100 rounded-lg px-4 py-3 mb-4 text-base w-full border border-gray-300"
                        />
                        <View className="flex-row justify-between w-full mt-2">
                            <TouchableOpacity 
                                onPress={() => setShowMemberIdModal(false)}
                                className="bg-gray-200 px-5 py-2 rounded-lg"
                            >
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    setShowMemberIdModal(false);
                                    submitHandler(true);
                                }}
                                className="bg-[#e01d47] px-5 py-2 rounded-lg"
                                disabled={!memberId.trim()}
                            >
                                <Text className="text-white font-bold">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SignUp;