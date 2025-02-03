import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import Footer from "./Footer";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { CameraIcon } from "react-native-heroicons/outline";
import OptionList from "../../components/User/OptionList";
import { Avatar, Button } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { getRiderProfile, riderLogout, updateRiderAvatar } from "../../redux/actions/riderActions";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get("window");

const MyAccountRider = ({ navigation }) => {
    const dispatch = useDispatch();
    const { rider, loading, error } = useSelector((state) => state.rider);
    const [avatar, setAvatar] = useState(rider?.avatar || "");
    const [isAvatarChanged, setIsAvatarChanged] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        dispatch(getRiderProfile());
    }, [dispatch]);

    if (loading) {
        return <ActivityIndicator size="large" color="#219ebc" style={styles.loader} />;
    }

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
            dispatch(updateRiderAvatar(imageUrl));
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
        await dispatch(riderLogout());
        navigation.navigate("login");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <Header back={true} />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.boxContainer}>
                    <View style={styles.UserContainer}>
                        <View style={styles.screenNameContainer}>
                            <Text style={styles.screenNameText}>My Account</Text>
                        </View>
                        <View style={styles.avatarContainer}>
                            <Avatar.Image
                                source={{ uri: avatar || "https://via.placeholder.com/150" }}
                                size={100}
                                style={{ backgroundColor: "#c70049" }}
                            />
                            <TouchableOpacity style={styles.cameraIconContainer} onPress={openImagePicker}>
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
                                {rider?.fname} {rider?.middlei}. {rider?.lname}
                            </Text>
                            <Text style={styles.secondaryText}>{rider?.email}</Text>
                            <Text style={styles.addressText}>{rider?.phone}</Text>
                        </View>
                    </View>

                    <View style={styles.OptionsContainer}>
                        <OptionList text={"Change Password"} Icon={Ionicons} iconName={"key-sharp"} onPress={() => navigation.navigate("changepassword")} />
                    </View>
                    <View style={styles.OptionsContainer}>
                        <OptionList text={" Leaflet"} Icon={Ionicons} iconName={"key-sharp"} onPress={() => navigation.navigate("leaflet")} />
                    </View>

                    <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} >
                        Logout
                    </Button>
                </View>

                <View style={styles.footer}>
                    <Footer activeRoute={"home"} />
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    screenNameContainer: {
        marginTop: 20,
        padding: 16,
        alignItems: "center",
    },
    screenNameText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    UserContainer: {
        alignItems: "center",
    },
    avatarContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
        position: "relative",
    },
    cameraIconContainer: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#fff",
        borderRadius: 50,
        padding: 5,
    },
    infoContainer: {
        alignItems: "center",
    },
    usernameText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    secondaryText: {
        fontSize: 16,
        color: "#888",
        marginBottom: 5,
    },
    addressText: {
        fontSize: 14,
        color: "#888",
    },
    updateButton: {
        backgroundColor: "#219ebc",
        marginBottom: 10,
        borderRadius: 20,
    },
    OptionsContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    logoutButton: {
        backgroundColor: "#bc430b",
        borderRadius: 10,
        margin: 20,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default MyAccountRider;