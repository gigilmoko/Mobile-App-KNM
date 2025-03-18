import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, ToastAndroid } from "react-native";
import { Picker } from '@react-native-picker/picker';
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useRoute, useNavigation } from "@react-navigation/native"; 
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "../../../redux/actions/orderActions"; 
import { getUserDetails } from "../../../redux/actions/userActions"; 
import { processOrder, processOrderAny } from "../../../redux/actions/orderActions";
import { Ionicons } from "@expo/vector-icons";

const AdminOrdersDetails = () => {
    const route = useRoute();
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { orderId } = route.params;
    const dispatch = useDispatch();
    const [selectedStatus, setSelectedStatus] = useState("");
    const [showStatusOptions, setShowStatusOptions] = useState(false); // State to show/hide status options

    useEffect(() => {
        dispatch({ type: 'CLEAR_ORDER_DETAILS' }); // Clear the order data
        dispatch(getOrderDetails(orderId));
    }, [dispatch, orderId]);

    const { order, error, success } = useSelector((state) => state.order);
    const { userDetails, loadingUser, errorUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user._id));
        }
    }, [dispatch, order]);

    useEffect(() => {
        if (success) {
            ToastAndroid.show("Order updated successfully!", ToastAndroid.SHORT);
            dispatch(getOrderDetails(orderId));
            navigation.navigate("adminorders");
        }
    }, [success, dispatch, orderId, navigation]);

    const handleStatusChange = (newStatus) => {
        if (newStatus !== order.status) {
            setSelectedStatus(newStatus);
        }
    };

    const handleSubmit = () => {
        if (selectedStatus !== order.status) {
            dispatch(processOrderAny(order._id, selectedStatus, navigation));
        }
    };

    const handleStatusChangeAny = (newStatus) => {
        if (newStatus !== selectedStatus) {
            setSelectedStatus(newStatus);
            setShowStatusOptions(false); // Hide options after selection
        }
    };

    useEffect(() => {
        if (order && order._id) {
            setSelectedStatus(order.status);
        }
    }, [order]);

    useEffect(() => {
        if (order) {
            setLoading(false);
        }
    }, [order]);

    const handleUserDetailsClick = () => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user._id)); // Fetch user details again on click
        }
    };

     const subtotal = order?.orderProducts 
            ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0)
            : 0;
        
        const shipping = order?.shippingCharges || 0; // Use order.shippingCharges
        
        const overallPrice = subtotal + shipping; // Total price includes subtotal + shipping
    
        
        // Ensure order status exists before rendering the UI
        if (loading) {
            return (
                <View className="flex-1 items-center justify-center bg-gray-200">
                    <ActivityIndicator size="large" color="#FB6831" />
                </View>
            );
        }

    const getStatusIcon = (status) => {
        if (!status) {
            return <Ionicons name="help-circle-outline" size={20} color="#000" />;
        }
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

    return (
        <View className="flex-1 bg-white items-center justify-center px-5 pb-0">
        {loading && (
            <View className="absolute inset-0 flex-1 items-center justify-center bg-gray-200 z-10">
                <ActivityIndicator size="large" color="#FB6831" />
            </View>
        )}
        <ScrollView className="flex-1 w-full px-5 py-5" showsVerticalScrollIndicator={false}>
            <Header title="Order Details"/>

            {/* Order ID, Date, and Status */}
            <View className="flex-row justify-between items-center mb-2 mt-2">
                <View>
                    <Text className="text-md font-bold text-red-500">{order?._id}</Text>
                    <Text className="text-sm text-gray-600">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</Text>
                </View>
                <TouchableOpacity
                    className="flex-row items-center bg-blue-100 px-3 py-1 rounded-full"
                    onPress={() => setShowStatusOptions(!showStatusOptions)} 
                >
                    {getStatusIcon(selectedStatus)}
                    <Text className="ml-2 text-blue-600">{selectedStatus || "Unknown"}</Text>
                </TouchableOpacity>
            </View>

            {showStatusOptions && (
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

            {/* Customer Information */}
            <View className="bg-white border border-gray-500 p-4 mt-5 rounded-lg shadow-sm">
                <Text className="text-md font-bold text-gray-800 mb-2">Customer Information</Text>
                <Text className="text-base font-bold text-red-500">{userDetails?.fname || ""} {userDetails?.lname || ""}</Text>
                <Text className="text-sm text-gray-600">{userDetails?.email || ""}</Text>
                <View className="border-b border-gray-200 my-2" />
                <Text className="text-sm font-semibold text-gray-800">Shipping Address</Text>
                <Text className="text-sm text-gray-600">
                    {userDetails?.deliveryAddress?.[0]?.houseNo || ""} {userDetails?.deliveryAddress?.[0]?.streetName || ""},{" "}
                    {userDetails?.deliveryAddress?.[0]?.barangay || ""}, {userDetails?.deliveryAddress?.[0]?.city || ""}
                </Text>
                <View className="border-b border-gray-200 my-2" />
                <Text className="text-sm font-semibold text-gray-800">Payment Method</Text>
                <Text className="text-sm text-gray-600">{order?.paymentInfo || "N/A"}</Text>
            </View>

            <View className="border border-gray-500 rounded-lg px-1 pt-1 bg-white mt-5">
                <Text className="text-md font-bold text-gray-800 mt-2 mb-2">Items in your Order</Text>
                {order?.orderProducts?.map((i, index) => (
                    <View
                        key={i.product?._id || index}
                        className="flex-row items-center justify-between mb-3 mx-2 border-gray-200"
                    >
                        {i.product?.images?.length > 0 && (
                            <Image source={{ uri: i.product.images[0].url }} className="w-12 h-12 rounded-md" />
                        )}

                        <View className="flex-1 ml-2"> 
                            <Text className="text-sm font-medium text-gray-800">{i.product?.name || "Unknown Product"}</Text>
                            <Text className="text-xs text-gray-500 ml-1">Qty: {i.quantity || 1}</Text> 
                        </View>

                        <Text className="text-base font-semibold text-red-500">
                            ₱{i.price?.toFixed(2) || "0.00"}
                        </Text>
                    </View>
                ))}
            </View>
      
          

            {/* Payment Information */}
            {order?.orderProducts?.length > 0 && (
                <View className="mt-2 w-full ">
                    <View className="bg-white p-4 mt-5 rounded-lg shadow-sm border border-gray-500">
                       
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-sm text-gray-600">Subtotal</Text>
                            <Text className="text-sm text-gray-800">₱{subtotal.toFixed(2)}</Text>
                        </View>

                        <View className="flex-row justify-between mb-2">
                            <Text className="text-sm text-gray-600">Shipping</Text>
                            <Text className="text-sm text-gray-800">₱{shipping.toFixed(2)}</Text>
                        </View>

                        <View className="border-b border-gray-200 my-2" />

                        <View className="flex-row justify-between items-center mt-2">
                            <Text className="text-base font-bold text-gray-800">Total</Text>
                            <Text className="text-lg font-bold text-red-500">₱{overallPrice.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            )}

            <View className="h-4"></View>

             <TouchableOpacity
                    onPress={handleSubmit}
                    className={`bg-[#e01d47] p-3 rounded-md items-center `}
                    
                  >
                    <Text className="ml-1 text-white">Update Order</Text>
                  </TouchableOpacity>
        </ScrollView>
    </View>
    );
};


export default AdminOrdersDetails;