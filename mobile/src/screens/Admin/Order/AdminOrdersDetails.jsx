import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useRoute } from "@react-navigation/native"; 
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "../../../redux/actions/orderActions"; 
import { getUserDetails } from "../../../redux/actions/userActions"; 
import { processOrder } from "../../../redux/actions/orderActions"; // Import the processOrder action

const AdminOrdersDetails = () => {
    const route = useRoute();
    const { orderId } = route.params;
    const dispatch = useDispatch();

    const [selectedStatus, setSelectedStatus] = useState("");

    // Fetch order details when component mounts
    useEffect(() => {
        dispatch(getOrderDetails(orderId));
    }, [dispatch, orderId]);

    // Fetch user details every time the order is fetched or updated
    useEffect(() => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user)); // Always fetch user details when the order is available
        }
    }, [dispatch, order]);

    const { order, loading, error } = useSelector((state) => state.order);
    const { userDetails, loadingUser, errorUser } = useSelector((state) => state.user);

    const handleStatusChange = (newStatus) => {
        if (newStatus !== order.orderStatus) {
            setSelectedStatus(newStatus);
            dispatch(processOrder(order._id, newStatus));
        }
    };

    useEffect(() => {
        if (order && order._id) {
            setSelectedStatus(order.orderStatus);
        }
    }, [order]);

    const handleUserDetailsClick = () => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user)); // Fetch user details again on click
        }
    };

    return (
        <View className="flex-1 bg-yellow-400">
            <Header back={true} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View className="bg-white rounded-lg p-4 mt-5 shadow-md">
                    <Text className="text-lg font-bold">Order Details:</Text>
                    {loading ? (
                        <Text>Loading...</Text>
                    ) : order && order._id ? (
                        <>
                            <Text className="text-lg">Order ID: {order._id}</Text>
                            <Text className="text-lg">Status: {order.orderStatus}</Text>
                            <View className="mt-4">
                                <Text className="text-md font-bold">Change Status:</Text>
                                <View className="border border-gray-300 rounded-lg mt-2">
                                    <TouchableOpacity onPress={() => handleStatusChange("Preparing")} className={`p-2 ${selectedStatus === "Preparing" ? "bg-gray-300" : ""}`}>
                                        <Text className="text-md">Preparing</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleStatusChange("Shipped")} className={`p-2 ${selectedStatus === "Shipped" ? "bg-gray-300" : ""}`}>
                                        <Text className="text-md">Shipped</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleStatusChange("Delivered")} className={`p-2 ${selectedStatus === "Delivered" ? "bg-gray-300" : ""}`}>
                                        <Text className="text-md">Delivered</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text className="text-lg">Total: ₱{order.totalAmount.toFixed(2)}</Text>
                            <Text className="text-lg">Items: {order.orderItems && order.orderItems.length}</Text>
                        </>
                    ) : (
                        <Text className="text-lg">No order details available</Text>
                    )}
                </View>

                {order && order.orderItems && order.orderItems.length > 0 && (
                    <View className="bg-white rounded-lg p-4 mt-10 shadow-md">
                        <Text className="text-lg font-bold">Products Bought:</Text>
                        {order.orderItems.map((item) => (
                            <View key={item._id} className="flex-row items-center mt-4">
                                <Image source={{ uri: item.image }} style={{ width: 50, height: 50, resizeMode: 'cover', marginRight: 10 }} />
                                <View>
                                    <Text className="text-md font-bold">Product Name: {item.name}</Text>
                                    <Text className="text-md">Price: ₱{item.price}</Text>
                                    <Text className="text-md">Quantity: {item.quantity}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {userDetails && (
                    <TouchableOpacity onPress={handleUserDetailsClick}>
                        <View className="bg-white rounded-lg p-4 mt-10 shadow-md">
                            <Text className="text-lg font-bold">User Details:</Text>
                            <View className="flex-row items-center mt-4">
                                <Image source={{ uri: userDetails.avatar }} style={{ width: 50, height: 50, borderRadius: 25, marginRight: 10 }} />
                                <View>
                                    <Text className="text-md font-bold">Name: {userDetails.fname} {userDetails.middlei}. {userDetails.lname}</Text>
                                    <Text className="text-md">Email: {userDetails.email}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View className="absolute bottom-0 w-full mt-10">
                <Footer activeRoute={"home"} />
            </View>
        </View>
    );
};


export default AdminOrdersDetails;
