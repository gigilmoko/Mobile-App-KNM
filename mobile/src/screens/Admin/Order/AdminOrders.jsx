import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"; // Add ActivityIndicator
import Footer from "../../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminOrders, processOrderAny } from "../../../redux/actions/orderActions"; // Add this import
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Ionicons } from "@expo/vector-icons"; // Add this import
import Header from "../../../components/Layout/Header";

const AdminOrders = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation(); // Initialize navigation
    const { adminOrders, loading, error, success } = useSelector((state) => state.order);
    const [selectedTab, setSelectedTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState(""); // Add this state
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [selectedStatus, setSelectedStatus] = useState(""); // Add this state
    const [showStatusOptions, setShowStatusOptions] = useState(false); // Add this state
    const [currentOrderId, setCurrentOrderId] = useState(null); // Add this state

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case "preparing":
                return <Ionicons name="time-outline" size={20} color="#FFA500" />;
            case "shipped":
                return <Ionicons name="cube-outline" size={20} color="#1E90FF" />;
            case "delivered":
                return <Ionicons name="checkmark-circle-outline" size={20} color="#32CD32" />;
            case "delivered pending":
                return <Ionicons name="alert-circle-outline" size={20} color="#FF4500" />;
            case "cancelled":
                return <Ionicons name="close-circle-outline" size={20} color="#DC143C" />;
            default:
                return <Ionicons name="help-circle-outline" size={20} color="#000" />;
        }
    };

    const tabMapping = {
        "All": "All",
        "Preparing": "Preparing",
        "Shipping": "Shipped",
        "Pending": "Delivered Pending",
        "Delivered": "Delivered",
        "Cancelled": "Cancelled"
    };

    useEffect(() => {
        dispatch({ type: "clearAdminOrders" }); // Clear orders at the start
        dispatch(getAdminOrders()).then(() => setIsLoading(false)); // Fetch orders and stop loading
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: error,
            });
        }
    }, [error]);

    useEffect(() => {
        if (success) {
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Order updated successfully!",
            });
            dispatch({ type: "clearAdminOrders" });
            dispatch(getAdminOrders());
        }
    }, [success, dispatch]);

    const handleStatusChangeAny = (newStatus) => {
        if (newStatus !== selectedStatus) {
            setSelectedStatus(newStatus);
            setShowStatusOptions(false); // Hide options after selection
            if (currentOrderId) {
                dispatch(processOrderAny(currentOrderId, newStatus, navigation));
            }
        }
    };

    const handleShowStatusOptions = (orderId) => {
        setCurrentOrderId(orderId);
        setShowStatusOptions(!showStatusOptions);
    };

    const filteredOrders = adminOrders.filter(order => 
        (selectedTab === "All" || order.status === selectedTab) && 
        order._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#e01d47" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center py-5 px-5">
            <Header title="Order Management" />
        </View>
    
        {/* Search Box */}
        <View className="flex-row items-center border border-red-600 rounded-full px-3.5 py-1.5 mx-5 bg-white">
    <TextInput
        className="flex-1 text-gray-800"
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
    />
    <Ionicons name="search" size={20} color="#e01d47" />
</View>

{/* Tabs - Fixed under search bar */}
<View className="w-full px-5 mt-3">
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: "row" }}>
        {Object.keys(tabMapping).map((tab) => (
            <TouchableOpacity
                key={tab}
                onPress={() => setSelectedTab(tabMapping[tab])}
                className={`px-3 py-1 mx-1 rounded-md border ${selectedTab === tabMapping[tab] ? "bg-red-600 border-red-600" : "bg-pink-100 border-pink-100"}`}
            >
                <Text className={`text-base font-medium ${selectedTab === tabMapping[tab] ? "text-white" : "text-black"}`}>
                    {tab}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>

    {/* Order count displayed below the tabs, aligned to the right */}
    <View className="flex-row justify-end mt-2">
        <Text className="text-gray-600 text-base font-medium">
            {filteredOrders.length} Orders
        </Text>
    </View>
</View>
        {/* Orders List */}
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
            {loading ? (
                <Text className="text-center mt-5 text-lg text-gray-600">Loading...</Text>
            ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                    <View key={order._id} className="bg-white p-3.5 rounded-lg mb-2.5 mx-5 shadow-md">
                        {/* First Row: Order Details */}
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                {getStatusIcon(order.status)}
                                <View className="ml-3">
                                    <Text className="text-base font-bold">{order.KNMOrderId}</Text>
                                    <Text className="text-sm text-gray-600">
                                        {order.user ? `${order.user.fname} ${order.user.lname}` : "Unknown User"}
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-base font-bold text-red-600">₱{order.totalPrice}</Text>
                                <Text className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </View>
    
                        {/* Second Row: Buttons Positioned Below */}
                        <View className="flex-row mt-3 justify-between">
                            <TouchableOpacity
                                className="border border-gray-300 rounded-md px-3 py-1 mr-2 ml-7 flex-row items-center"
                                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })}
                            >
                                <Ionicons name="eye-outline" size={16} color="#000" />
                                <Text className="ml-1 text-black">Details</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="border border-gray-300 rounded-md px-3 py-1 flex-row items-center"
                                onPress={() => handleShowStatusOptions(order._id)}
                            >
                                <Ionicons name="pencil-outline" size={16} color="#000" />
                                <Text className="ml-1 text-black">Update Status</Text>
                            </TouchableOpacity>
                        </View>

                        {showStatusOptions && currentOrderId === order._id && (
                            <View className="bg-white border border-gray-300 rounded-lg mt-2">
                                {["Preparing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        className="p-2 border-b border-gray-200"
                                        onPress={() => handleStatusChangeAny(status)}
                                    >
                                        <Text className="text-gray-800">{status}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                ))
            ) : (
                <Text className="text-center mt-5 text-lg text-gray-600">No orders available.</Text>
            )}
        </ScrollView>
    </View>
    
    );
};

export default AdminOrders;