import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
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
                address,
            };

            // console.log("Data to be sent:", updatedProfileData); 
        
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
        <>
            <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
                <Header back={true} />
                <ScrollView>
                    <View className="flex-1">
                        <View className="flex-row justify-center mt-[-40px]">
                            <Image
                                source={require("../../assets/images/logo.png")}
                                style={{ width: 100, height: 100, marginTop: 30 }}
                            />
                        </View>
                        <View className="flex-1 bg-white px-8 pt-8 rounded-t-[20px] shadow-lg justify-center">
                            <Text className="text-gray-700 text-2xl font-bold text-center mb-4">
                                Update Profile
                            </Text>
                            <View style={styles.form}>
                                {/* First Name */}
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    placeholder="Enter first name"
                                    value={fname}
                                    onChangeText={setFname}
                                    onFocus={() => handleFocus("fname")}
                                    onBlur={handleBlur}
                                    style={[
                                        styles.input,
                                        focusedField === "fname" && { borderColor: "orange" },
                                    ]}
                                />

                                {/* Last Name */}
                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    placeholder="Enter last name"
                                    value={lname}
                                    onChangeText={setLname}
                                    onFocus={() => handleFocus("lname")}
                                    onBlur={handleBlur}
                                    style={[
                                        styles.input,
                                        focusedField === "lname" && { borderColor: "orange" },
                                    ]}
                                />

                                {/* Middle Initial */}
                                <Text style={styles.label}>Middle Initial</Text>
                                <TextInput
                                    placeholder="Enter middle initial (optional)"
                                    value={middlei}
                                    onChangeText={setMiddlei}
                                    onFocus={() => handleFocus("middlei")}
                                    onBlur={handleBlur}
                                    style={[
                                        styles.input,
                                        focusedField === "middlei" && { borderColor: "orange" },
                                    ]}
                                />

                                {/* Email Address */}
                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    placeholder="Enter email address"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => handleFocus("email")}
                                    onBlur={handleBlur}
                                    style={[
                                        styles.input,
                                        focusedField === "email" && { borderColor: "orange" },
                                    ]}
                                />

                                {/* Date of Birth */}
                                <Text style={styles.label}>Date of Birth</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <TextInput
                                        placeholder="Enter date of birth"
                                        value={dateOfBirth}
                                        editable={false}
                                        style={styles.input}
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

                                {/* Phone */}
                                <Text style={styles.label}>Phone</Text>
                                <TextInput
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                    onFocus={() => handleFocus("phone")}
                                    onBlur={handleBlur}
                                    style={[
                                        styles.input,
                                        focusedField === "phone" && { borderColor: "orange" },
                                    ]}
                                />

                                {/* Address */}
                                <Text style={styles.label}>Address</Text>
                                <TextInput
                                    placeholder="Enter address"
                                    value={address}
                                    onChangeText={setAddress}
                                    onFocus={() => handleFocus("address")}
                                    onBlur={handleBlur}
                                    style={[
                                        styles.input,
                                        focusedField === "address" && { borderColor: "orange" },
                                    ]}
                                />
                            </View>
                            <View className="flex items-center mb-5">
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: "#bc430b",
                                        width: 350,
                                        height: 50,
                                        borderRadius: 10,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                    onPress={submitHandler}
                                    disabled={loading}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                                        Update
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </>
    );
};

export default UpdateProfile;

const styles = StyleSheet.create({
    form: {
        flex: 1,
        // paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

    },
    label: {
        fontSize: 16,
        // color: "#4a4a4a",
        fontWeight: "bold",
        marginBottom: 2,
    },
    input: {
        width: "100%",
        padding: 0,

        backgroundColor: "#f5f5f5",
        // color: "#333",
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
    },
});
