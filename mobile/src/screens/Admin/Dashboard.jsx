import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons"; // Use Ionicons for the icons
import OptionList from "../../components/User/OptionList";

import { loadUser } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import mime from "mime";
import Header from "../../components/Layout/Header";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import Toast from "react-native-toast-message"; // Import Toast

const { height } = Dimensions.get("window"); // Get the screen height

const Dashboard = ({ navigation, route }) => {
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

    return (
        <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
            <Header back={true} />
    
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.boxContainer}>
                    <View style={styles.UserContainer}>
                        <Text style={styles.usernameText}>
                            Dashboard
                        </Text>
                    </View>
    
                    <View style={styles.OptionsContainer}>
                        {/* Conditionally Render "My Orders" or "Manage Orders" */}
                        <OptionList
                            text={"Orders"}
                            Icon={Ionicons}
                            iconName={"bag-check-outline" /* Change Icon */}
                            onPress={() => navigation.navigate("adminorders")}
                        />
                        <OptionList
                            text={"Products"}
                            Icon={Ionicons}
                            iconName={"bag-outline" /* Change Icon */}
                            onPress={() => navigation.navigate("adminproducts")}
                        />
                        <OptionList
                            text={"Category"}
                            Icon={Ionicons}
                            iconName={"file-tray-full-outline" /* Change Icon */}
                            onPress={() => navigation.navigate("admincategory")}
                        />
                        <OptionList
                            text={"Events"}
                            Icon={Ionicons}
                            iconName={"calendar-outline" /* Change Icon */}
                            onPress={() => navigation.navigate("adminevents")}
                        />
                    </View>
    
            
                </View>
              
                <View style={styles.footer}>
                    <Footer activeRoute={"home"} />
                </View>
            </ScrollView>
        </View>
    );
};

export default Dashboard;

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
        marginTop: 20,
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
    usernameText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    OptionsContainer: {
        marginTop: 10,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingTop: 0,
    },
});
