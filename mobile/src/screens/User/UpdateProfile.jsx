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
        <View style={styles.container}>
            <Header back={true} />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.contentContainer}>
                    <View style={styles.formContainer}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../../assets/images/logo.png")}
                                style={styles.logo}
                            />
                        </View>
                        <Text style={styles.title}>Update Profile</Text>
                        <View style={styles.form}>
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

                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={submitHandler}
                                    disabled={loading}
                                >
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    logoContainer: {
        alignItems: "center",
        // marginBottom: 20,
    },
    logo: {
        width: 100,
        height: 100,
    },
    formContainer: {
        width: "100%",
        backgroundColor: "#f9f9f9",
        borderRadius: 10,
        padding: 20,
        elevation: 5, // For Android shadow
        shadowColor: "#000", // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    form: {
        width: "100%",
    },
    label: {
        fontSize: 16,
        color: "#333",
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 5,
        marginBottom: 15,
        fontSize: 14,
        borderWidth: 1,
        borderColor: "#ccc",
        height: 35,
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 16,
    },
    button: {
        backgroundColor: "#bc430b",
        width: "100%",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default UpdateProfile;