import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import Footer from "../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons"; 
import OptionList from "../../components/User/OptionList";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 
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
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Order Summary</Text>
                </View>
                <View style={styles.OptionsContainer}>
                    <View style={styles.optionRow}>
                        <OptionList
                            text={"Orders"}
                            Icon={Ionicons}
                            iconName={"bag-check-outline"}
                            onPress={() => navigation.navigate("adminorders")}
                            style={styles.optionBox}
                        />
                        <OptionList
                            text={"Products"}
                            Icon={Ionicons}
                            iconName={"bag-outline"}
                            onPress={() => navigation.navigate("adminproducts")}
                            style={styles.optionBox}
                        />
                        <OptionList
                            text={"Category"}
                            Icon={Ionicons}
                            iconName={"file-tray-full-outline"}
                            onPress={() => navigation.navigate("admincategory")}
                            style={styles.optionBox}
                        />
                        <OptionList
                            text={"Events"}
                            Icon={Ionicons}
                            iconName={"calendar-outline"}
                            onPress={() => navigation.navigate("adminevents")}
                            style={styles.optionBox}
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
    screenNameContainer: {
        padding: 16,
        alignItems: 'center',
    },
    screenNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingTop: 20,
    },
    UserContainer: {
        alignItems: 'center',
    },
    usernameText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        marginTop: 30,
    },
    OptionsContainer: {
        marginTop: 10,
        padding: 20,
    },
    optionRow: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    optionBox: {
        flex: 1,
        marginHorizontal: 10,
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5, // For shadow (Android)
        shadowColor: "#000", // For shadow (iOS)
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingTop: 0,
    },
});