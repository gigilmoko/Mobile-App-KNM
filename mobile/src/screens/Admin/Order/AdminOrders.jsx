import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Footer from "../../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminOrders } from "../../../redux/actions/orderActions";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import Entypo from 'react-native-vector-icons/Entypo';

const AdminOrders = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation(); // Initialize navigation
    const { orders: adminOrders, loading, error } = useSelector((state) => state.order);

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

    useEffect(() => {
        console.log("Admin Orders:", adminOrders);
    }, [adminOrders]);

    return (
        <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Entypo
                        name="chevron-left"
                        style={{
                            fontSize: 30,
                            color: '#bc430b',
                            padding: 10,
                        }}
                    />
                </TouchableOpacity>
                <Text style={{ flex: 1, fontSize: 24, fontWeight: "bold", textAlign: "center" }}>Orders List</Text>
                <View style={{ width: 40 }} /> {/* Placeholder to balance the back button */}
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View style={{ backgroundColor: "#ffffff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 0, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
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
                                        order.status === "Preparing"
                                            ? "#FA9E03"
                                            : order.status === "Shipped"
                                            ? "#1CBFD8"
                                            : order.status === "Delivered"
                                            ? "#195ECA"
                                            : "#f9f9f9",
                                }}
                                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })} // Navigate to details screen
                            >
                                <Text style={{ fontWeight: "bold", color: "#ffffff" }}>Order ID: {order._id}</Text>
                                <Text style={{ color: "#ffffff" }}>Status: {order.status}</Text>
                                <Text style={{ color: "#ffffff" }}>Items: {order.orderProducts.length}</Text>
                                <Text style={{ color: "#ffffff" }}>Total: ₱{order.totalPrice.toFixed(2)}</Text>
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