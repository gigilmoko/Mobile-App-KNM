import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { updatePassword, loadUser } from "../../redux/actions/userActions"; // Import loadUser action
import Toast from "react-native-toast-message";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ChangePassword = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isPasswordChanged, setIsPasswordChanged] = useState(false);

    const dispatch = useDispatch();
    
    // Select user data from Redux state
    const user = useSelector((state) => state.user.user);

    const submitHandler = async () => {
        if (!user) {
            console.error("User not found. Please log in first.");
            return;
        }
    
        try {
            const response = await dispatch(updatePassword(user._id, oldPassword, newPassword));
            Toast.show({
                type: 'success',
                text1: 'Password Updated Successfully',
                text2: 'Your password has been updated.',
            });
            setIsPasswordChanged(true);
        } catch (error) {
            console.error("Error in submitHandler:", error);
            // Display error toast notification
            Toast.show({
                type: 'error',
                text1: 'Password Update Failed',
                text2: error.response?.data.message || 'Please try again.',
            });
        } finally {
            setOldPassword("");
            setNewPassword("");
        }
    };
    
    useEffect(() => {
        const loadUserData = async () => {
            await dispatch(loadUser()); // Load user data when the component mounts
        };

        loadUserData();
    }, [dispatch]);

    useEffect(() => {
        if (isPasswordChanged) {
            navigation.navigate('myaccount');
        }
    }, [isPasswordChanged, navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Change Password</Text>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.formContainer}>
                    <View style={styles.logoContainer}>
                        <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
                    </View>
                    <Text style={styles.title}>Change Password</Text>
                    <Text style={styles.label}>Current Password</Text>
                    <TextInput
                        placeholder="Enter current password"
                        secureTextEntry={true}
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        style={styles.input}
                    />
                    <Text style={styles.label}>New Password</Text>
                    <TextInput
                        placeholder="Enter new password"
                        secureTextEntry={true}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        style={styles.input}
                    />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            disabled={oldPassword === "" || newPassword === ""}
                            onPress={submitHandler}
                        >
                            <Text style={styles.buttonText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
      },
      backButton: {
        position: "absolute",
        left: 10,
      },
      headerText: {
        fontSize: 20,
        fontWeight: "bold",
      },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 20,
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
    label: {
        color: "#333",
        fontWeight: "bold",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 12,
        height: 40,
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: 16,
    },
    button: {
        backgroundColor: "#bc430b",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        padding: 10,
    },
});

export default ChangePassword;