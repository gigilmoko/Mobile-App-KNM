import React, { useEffect, useState } from "react";
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
    const { adminOrders, loading, error } = useSelector((state) => state.order);
    const [selectedTab, setSelectedTab] = useState("Preparing");

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

    const filteredOrders = adminOrders.filter(order => order.status === selectedTab);

    return (
        <View style={{ flex: 1 }}>
            <Header back={true} />
            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View style={{ backgroundColor: "#ffffff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 0, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
                    <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Orders List</Text>
                    
                    <View style={{ flexDirection: "row", justifyContent: "space-around", padding: 10, marginBottom: 10,  backgroundColor: "#ffb703", borderRadius: 10 }}>
                        <TouchableOpacity onPress={() => setSelectedTab("Preparing")}>
                            <Text style={{ fontSize: 18, fontWeight: selectedTab === "Preparing" ? "bold" : "normal" }}>Preparing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedTab("Shipped")}>
                            <Text style={{ fontSize: 18, fontWeight: selectedTab === "Shipped" ? "bold" : "normal" }}>Shipped</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setSelectedTab("Delivered")}>
                            <Text style={{ fontSize: 18, fontWeight: selectedTab === "Delivered" ? "bold" : "normal" }}>Delivered</Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <Text style={{ textAlign: "center", color: "#666666" }}>Loading...</Text>
                    ) : Array.isArray(filteredOrders) && filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
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
                                            ? "#DF9755"
                                            : order.status === "Delivered"
                                            ? "#EB5A3C"
                                            : "#f9f9f9",
                                }}
                                onPress={() =>
                                    navigation.navigate("adminordersdetails", { orderId: order._id })
                                }
                            >
                                <Text style={{ fontWeight: "bold", color: "#000" }}>
                                    Order ID: {order._id}
                                </Text>
                                <Text style={{ color: "#000" }}>
                                    Status: {order.status}
                                </Text>
                                <Text style={{ color: "#000" }}>
                                    Items: {order.orderProducts.length}
                                </Text>
                                <Text style={{ color: "#000" }}>
                                    Total: ₱{order.totalPrice.toFixed(2)}
                                </Text>
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