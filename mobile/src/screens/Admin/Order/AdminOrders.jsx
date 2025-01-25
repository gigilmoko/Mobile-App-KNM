import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import Footer from "../../../components/Layout/Footer";
import { useDispatch, useSelector } from "react-redux";
import { getAdminOrders } from "../../../redux/actions/orderActions";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Order Summary</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setSelectedTab("Preparing")}>
                        <Text style={[styles.tabText, selectedTab === "Preparing" && styles.activeTabText]}>Preparing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Shipped")}>
                        <Text style={[styles.tabText, selectedTab === "Shipped" && styles.activeTabText]}>Shipped</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Delivered")}>
                        <Text style={[styles.tabText, selectedTab === "Delivered" && styles.activeTabText]}>Delivered</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                ) : filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                        <View key={order._id} style={styles.orderCard}>
                            <Text style={styles.orderText}>Order ID: {order._id}</Text>
                            <Text style={styles.orderText}>Status: {order.status}</Text>
                            <Text style={styles.orderText}>Total Price: ₱{order.totalPrice}</Text>
                            <Text style={styles.orderText}>Ordered On: {new Date(order.createdAt).toLocaleDateString()}</Text>
                            <TouchableOpacity
                                style={styles.detailsButton}
                                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })}
                            >
                                <Text style={styles.detailsButtonText}>View Details</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noOrdersText}>No orders available.</Text>
                )}
            </ScrollView>
            <Footer activeRoute={"home"} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
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
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 50,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        marginBottom: 10,
        backgroundColor: "#ffb703",
        borderRadius: 10,
        margin: 20,
    },
    tabText: {
        fontSize: 18,
    },
    activeTabText: {
        fontWeight: "bold",
    },
    loadingText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 18,
        color: "#666",
    },
    noOrdersText: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 18,
        color: "#666",
    },
    orderCard: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    orderText: {
        fontSize: 16,
        marginBottom: 5,
    },
    detailsButton: {
        backgroundColor: "#ffb703",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    detailsButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});

export default AdminOrders;