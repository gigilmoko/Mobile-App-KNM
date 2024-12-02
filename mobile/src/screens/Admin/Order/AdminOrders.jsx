import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { getAdminOrders } from "../../../redux/actions/orderActions"; // Import the action
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native"; // Import navigation hook

const AdminOrders = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation(); // Initialize navigation
    const { adminOrders, loading, error } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(getAdminOrders());
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

    return (
        <View className="flex-1 bg-yellow-500">
            <Header back={true} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View className="bg-white rounded-t-3xl mt-5 p-4 shadow-md">
                    <Text className="text-lg font-bold text-center mb-4">Orders List</Text>

                    {loading ? (
                        <Text className="text-center text-gray-500">Loading...</Text>
                    ) : adminOrders?.length > 0 ? (
                        adminOrders.map((order) => (
                            <TouchableOpacity
                                key={order._id}
                                className={`p-4 rounded-lg mb-3 shadow ${
                                    order.orderStatus === "Preparing"
                                        ? "bg-gray-800"
                                        : order.orderStatus === "Shipped"
                                        ? "bg-yellow-600"
                                        : order.orderStatus === "Delivered"
                                        ? "bg-green-500"
                                        : "bg-gray-100"
                                }`}
                                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })} // Navigate to details screen
                            >
                                <Text className="font-bold text-white">Order ID: {order._id}</Text>
                                <Text className="text-white">Status: {order.orderStatus}</Text>
                                <Text className="text-white">Items: {order.orderItems.length}</Text>
                                <Text className="text-white">Total: ₱{order.totalAmount.toFixed(2)}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text className="text-center text-gray-500">No orders found</Text>
                    )}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 w-full mt-10">
                <Footer activeRoute={"home"} />
            </View>
        </View>
    );
};

export default AdminOrders;
