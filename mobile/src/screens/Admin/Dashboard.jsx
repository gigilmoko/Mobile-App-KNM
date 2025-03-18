import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
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
import { calculateTotalPrice, getMonthlyOrderTotal, getTotalCustomer, getTotalProducts, getNextThreeEvents, getLatestOrders } from "../../redux/actions/dashboardActions";
import { toggleNotificationReadStatus } from "../../redux/actions/notificationActions";

const { height } = Dimensions.get("window"); // Get the screen height

const Dashboard = ({ navigation, route }) => {
    const { user } = useSelector((state) => state.user);
    const { totalPrice, monthlyOrderTotal, totalCustomers, totalProducts, nextThreeEvents, latestOrders } = useSelector((state) => state.dashboard);
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

    useEffect(() => {
        dispatch(calculateTotalPrice());
        dispatch(getMonthlyOrderTotal());
        dispatch(getTotalCustomer());
        dispatch(getTotalProducts());
        dispatch(getNextThreeEvents());
        dispatch(getLatestOrders());
    }, [dispatch]);

    useEffect(() => {
        // console.log("Total Price:", totalPrice);
        // console.log("Monthly Order Total:", monthlyOrderTotal);
        // console.log("Total Customers:", totalCustomers);
        // console.log("Total Products:", totalProducts);
        // console.log("Next Three Events:", nextThreeEvents);
        // console.log("Latest Orders:", latestOrders);
    }, [totalPrice, monthlyOrderTotal, totalCustomers, totalProducts, nextThreeEvents, latestOrders]);

    const handleNotificationPress = async (notifId, eventId) => {
        await dispatch(toggleNotificationReadStatus(notifId));
        navigation.navigate("eventinfo", { eventId });
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-row items-center py-5 px-5">
                    {/* Back Button */}
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
                    >
                        <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    </TouchableOpacity>

                    {/* Title */}
                    <View className="flex-1">
                        <Text className="text-2xl font-bold text-[#e01d47] text-center">
                            Dashboard
                        </Text>
                    </View>

                    {/* Spacer */}
                    <View className="w-10" />
                </View>

                <Text className="text-xl font-bold text-black mt-2 px-5">
                    Welcome back, Admin!
                </Text>
                
                <View className="mt-2 px-5">
                    <View className="flex-row flex-wrap justify-between">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("adminorders")}
                            className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md mb-3"
                        >
                            <Ionicons name="bag-check-outline" size={24} color="#e01d47" />
                            <Text className="mt-2 font-bold">Orders</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("adminproducts")}
                            className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md mb-3"
                        >
                            <Ionicons name="bag-outline" size={24} color="#e01d47" />
                            <Text className="mt-2 font-bold">Products</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("admincategory")}
                            className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md"
                        >
                            <Ionicons name="file-tray-full-outline" size={24} color="#e01d47" />
                            <Text className="mt-2 font-bold">Category</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigation.navigate("adminevents")}
                            className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md"
                        >
                            <Ionicons name="calendar-outline" size={24} color="#e01d47" />
                            <Text className="mt-2 font-bold">Events</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text className="text-xl font-bold text-black mt-2 px-5">
                    Quick Stats
                </Text>

                <View className="mt-2 px-5">
    <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md mb-3">
            <Ionicons name="cash-outline" size={24} color="#e01d47" />
            <Text className="mt-2 font-bold">Total Sales</Text>
            <Text className="mt-2">₱{totalPrice}</Text>
        </View>

        <View className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md mb-3">
            <Ionicons name="bar-chart-outline" size={24} color="#e01d47" />
            <Text className="mt-2 font-bold">Monthly Sales</Text>
            <Text className="mt-2">
                ₱{monthlyOrderTotal.reduce((sum, order) => sum + order.totalPrice, 0)}
            </Text>
        </View>

        <View className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md">
            <Ionicons name="people-outline" size={24} color="#e01d47" />
            <Text className="mt-2 font-bold">Total Customers</Text>
            <Text className="mt-2">{totalCustomers}</Text>
        </View>

        <View className="w-[48%] p-5 bg-gray-100 rounded-lg items-center justify-center shadow-md">
            <Ionicons name="cube-outline" size={24} color="#e01d47" />
            <Text className="mt-2 font-bold">Total Products</Text>
            <Text className="mt-2">{totalProducts}</Text>
        </View>
    </View>
</View>


                <Text className="text-xl font-bold text-black mt-2 px-5">
                    Upcoming Events
                </Text>

                <View className="mt-2 px-5">
                    {nextThreeEvents.map((event, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleNotificationPress(event._id, event._id)}
                            className={`flex-row items-center p-2 mb-2 rounded`}
                            style={{ backgroundColor: '#fafaff' }} // Color based on read status
                        >
                            <Image
                                source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741731158/image_2025-03-12_061207062-removebg-preview_hsp3wa.png" }}
                                className="w-14 h-14 mr-3" // Adjust width & height as needed
                                resizeMode="contain"
                            />
                            <View className="flex-1">
                                <Text className="text-[#e01d47] font-bold">
                                    {`New event: ${event.title}`}
                                </Text>
                                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                    {event.description}
                                </Text>
                            </View>
                            <Text className="text-gray-500 text-xs pl-2">{formatDate(event.startDate)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text className="text-xl font-bold text-black mt-2 px-5">
                    Latest Orders
                </Text>

                <View className="mt-2 px-5">
                    {latestOrders.map((order, index) => (
                        <TouchableOpacity
                            key={index}
                            className={`flex-row items-center p-2 mb-2 rounded`}
                            style={{ backgroundColor: '#fafaff' }} // Color based on read status
                        >
                            <View className="flex-1">
                                <View className="flex-row justify-between">
                                    <Text className="text-[#e01d47] font-bold text-sm">
                                        {`${order._id}`}
                                    </Text>
                                    <Text className="text-[#ff7895] text-xs">
                                        {formatDate(order.createdAt)}
                                    </Text>
                                </View>
                                <View className="flex-row justify-between">
                                <Text className="text-gray-600">
                                    {`${order.user.fname} ${order.user.lname}`}
                                </Text>
                                <Text className="text-gray-600 text-sm">
                                    {` ₱${order.totalPrice}`}
                                </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default Dashboard;