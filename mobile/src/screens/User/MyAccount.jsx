import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { CameraIcon } from "react-native-heroicons/outline"; // Import CameraIcon from Heroicons
import OptionList from "../../components/User/OptionList";
import { Avatar, Button } from "react-native-paper";
import { loadUser, updateAvatar, logout } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import mime from "mime";
import Header from "../../components/Layout/Header";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message"; // Import Toast

const { height } = Dimensions.get("window"); // Get the screen height

const MyAccount = ({ navigation, route }) => {
    const { user } = useSelector((state) => state.user);
    const defaultAvatar = require("../../assets/images/default-user-icon.jpg");
    const [avatar, setAvatar] = useState(user?.avatar || defaultAvatar);
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    useEffect(() => {
        dispatch(loadUser());
    }, [route.params, dispatch, isFocused]);

    useEffect(() => {
        if (user?.avatar) {
            setAvatar(user.avatar);
        }
    }, [user]);

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

    const handleAvatarUpdate = async () => {
        if (!avatar || !isAvatarChanged) return;
        const formData = new FormData();
        formData.append('file', {
            uri: avatar,
            type: mime.getType(avatar),
            name: avatar.split("/").pop(),
        });
        formData.append('upload_preset', 'ml_default');
        try {
            setIsUpdating(true);
            const response = await axios.post(
                'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            const imageUrl = response.data.secure_url;
            dispatch(updateAvatar(imageUrl));
            setIsAvatarChanged(false);
            setIsUpdating(false);

            // Display success toast notification
            Toast.show({
                type: 'success',
                text1: 'Avatar Updated Successfully',
            });
        } catch (error) {
            console.error('Failed to upload avatar', error);
            alert('Failed to upload avatar. Please try again.');
            setIsUpdating(false);

            // Display error toast notification
            Toast.show({
                type: 'error',
                text1: 'Avatar Update Failed',
            });
        }
    };

    const handleLogout = async () => {
        await dispatch(logout());
        navigation.navigate("home"); // Navigate to login screen after logout
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
            <Header back={true} />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.boxContainer}>
                    <View style={styles.UserContainer}>
                        <View style={styles.screenNameContainer}>
                            <Text style={styles.screenNameText}>My Account</Text>
                        </View>
                        <View style={styles.avatarContainer}>
                            <Avatar.Image
                                source={{ uri: avatar.toString() }}
                                size={100}
                                style={{ backgroundColor: "#c70049" }}
                            />
                            <TouchableOpacity onPress={openImagePicker} style={styles.cameraIconContainer}>
                                <CameraIcon size={24} color="#219ebc" />
                            </TouchableOpacity>
                            {isAvatarChanged && (
                                <TouchableOpacity onPress={handleAvatarUpdate} disabled={isUpdating}>
                                    <Button loading={isUpdating} textColor="#fff" style={styles.updateButton}>
                                        {isUpdating ? "Updating..." : "Update"}
                                    </Button>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.infoContainer}>
                            <Text style={styles.usernameText}>
                                {user?.fname} {user?.middlei}. {user?.lname}
                            </Text>
                            <Text style={styles.secondaryText}>{user?.email}</Text>
                            <Text style={styles.addressText}>{user?.address}</Text>
                        </View>
                    </View>

                    <View style={styles.OptionsContainer}>
                        {/* Conditionally Render "My Orders" or "Manage Orders" */}
                        {user?.role === "admin" ? (
                            <OptionList
                                text={"Dashboard"}
                                Icon={Ionicons}
                                iconName={"grid-outline"} // Icon for a dashboard-like appearance
                                onPress={() => navigation.navigate("dashboard")}
                            />
                        ) : (
                            <OptionList
                                text={"My Orders"}
                                Icon={Ionicons}
                                iconName={"bag-check"}
                                onPress={() => navigation.navigate("myorders")}
                            />
                        )}

                        <OptionList
                            text={"Change Password"}
                            Icon={Ionicons}
                            iconName={"key-sharp"}
                            onPress={() => navigation.navigate("changepassword")}
                        />
                        <OptionList
                            text={"Update Profile"}
                            Icon={Ionicons}
                            iconName={"person"}
                            onPress={() => navigation.navigate("updateprofile")}
                        />
                         <OptionList
                            text={"Address"}
                            Icon={Ionicons}
                            iconName={"person"}
                            onPress={() => navigation.navigate("currentaddress")}
                        />
                        <OptionList
                            text={"Contact and Feedback"}
                            Icon={Ionicons}
                            iconName={"person"}
                            onPress={() => navigation.navigate("feedback")}
                        />
                    </View>

                    {/* Logout Button */}
                    <Button mode="contained" onPress={handleLogout} style={styles.logoutButton}>
                        Logout
                    </Button>
                </View>
                {/* End of Box */}

                <View style={styles.footer}>
                    <Footer activeRoute={"home"} />
                </View>
            </ScrollView>
        </View>
    );
};

export default MyAccount;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    screenNameContainer: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    screenNameText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    boxContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: 0,
        height: '100%',
        paddingHorizontal: 16,
        elevation: 5, // For shadow (Android)
        shadowColor: "#000", // For shadow (iOS)
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    UserContainer: {
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 50,
        padding: 5,
    },
    infoContainer: {
        alignItems: 'center',
    },
    usernameText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: -10,
    },
    secondaryText: {
        fontSize: 16,
        color: '#888',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#888',
    },
    updateButton: {
        backgroundColor: "#219ebc",
        marginBottom: 10,
        borderRadius: 20,
    },
    OptionsContainer: {
        marginTop: 30,
    },
    logoutButton: {
        backgroundColor: "#bc430b",
        borderRadius: 5,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingTop: 0,
    },
});