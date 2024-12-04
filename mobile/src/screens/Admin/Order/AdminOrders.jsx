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
        <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
            <Header back={true} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View style={{ backgroundColor: "#ffffff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 0, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
                    <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Orders List</Text>

                    {loading ? (
                        <Text style={{ textAlign: "center", color: "#666666" }}>Loading...</Text>
                    ) : adminOrders?.length > 0 ? (
                        adminOrders.map((order) => (
                            <TouchableOpacity
                                key={order._id}
                                style={{
                                    padding: 15,
                                    borderRadius: 10,
                                    marginBottom: 10,
                                    shadowColor: "#000",
                                    shadowOpacity: 0.1,
                                    shadowRadius: 5,
                                    shadowOffset: { width: 0, height: 3 },
                                    elevation: 2,
                                    backgroundColor:
                                        order.orderStatus === "Preparing"
                                            ? "#FA9E03"
                                            : order.orderStatus === "Shipped"
                                            ? "#1CBFD8"
                                            : order.orderStatus === "Delivered"
                                            ? "#195ECA"
                                            : "#f9f9f9",
                                }}
                                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })} // Navigate to details screen
                            >
                                <Text style={{ fontWeight: "bold", color: "#ffffff" }}>Order ID: {order._id}</Text>
                                <Text style={{ color: "#ffffff" }}>Status: {order.orderStatus}</Text>
                                <Text style={{ color: "#ffffff" }}>Items: {order.orderItems.length}</Text>
                                <Text style={{ color: "#ffffff" }}>Total: ₱{order.totalAmount.toFixed(2)}</Text>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={{ textAlign: "center", color: "#666666" }}>No orders found</Text>
                    )}
                </View>
            </ScrollView>

            <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
                <Footer activeRoute={"home"} />
            </View>
        </View>
    );
};

export default AdminOrders;