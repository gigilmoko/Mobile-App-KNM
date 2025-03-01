import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Layout/Header";
import OrderList from "../../components/OrderList";
import { getUserOrders } from "../../redux/actions/orderActions";
import { getUserDetails } from "../../redux/actions/userActions"; // Import getUserDetails action

const MyOrders = () => {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const navigate = useNavigation();
    const { loading, orders } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.user); // Assuming user details are in the 'user' slice
    const [selectedTab, setSelectedTab] = useState("Preparing");

    useEffect(() => {
        if (isFocused) {
            dispatch(getUserOrders());
            if (user) {
                dispatch(getUserDetails(user._id)); // Fetch user details including address
                // console.log("User details fetched:", user);
            }
        }
    }, [isFocused, dispatch, user]);

    useEffect(() => {
        // console.log("Fetched Orders:", orders); // Log fetched orders
    }, [orders]);

    const getStatusColor = (status) => {
        if (!status) return 'gray';
        switch (status.toLowerCase()) {
            case 'preparing':
                return 'red';
            case 'shipped':
                return 'yellow';
            case 'delivered pending':
                return 'orange';
            case 'delivered':
                return 'green';
            case 'cancelled':
                return 'gray';
            default:
                return 'gray';
        }
    };

    const filteredOrders = orders
        .filter(order => order.status && order.status === selectedTab)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <>
            <Header back={true} />
            <View style={styles.container}>
                <View style={styles.screenNameContainer}>
                    <Text style={styles.screenNameText}>My Orders</Text>
                    <Text style={styles.screenNameParagraph}>Your order and your order status</Text>
                </View>
                <View style={styles.tabContainer}>
                    <TouchableOpacity onPress={() => setSelectedTab("Preparing")}>
                        <Text style={[styles.tabText, selectedTab === "Preparing" && styles.activeTabText]}>Preparing</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Shipped")}>
                        <Text style={[styles.tabText, selectedTab === "Shipped" && styles.activeTabText]}>Shipping</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Delivered Pending")}>
                        <Text style={[styles.tabText, selectedTab === "Delivered Pending" && styles.activeTabText]}>Confirmation</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Delivered")}>
                        <Text style={[styles.tabText, selectedTab === "Delivered" && styles.activeTabText]}>Delivered</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedTab("Cancelled")}>
                        <Text style={[styles.tabText, selectedTab === "Cancelled" && styles.activeTabText]}>Cancelled</Text>
                    </TouchableOpacity>
                </View>
                {loading ? (
                    <Text>Loading...</Text>
                ) : filteredOrders.length > 0 ? (
                    <ScrollView style={{ flex: 1, width: "100%", padding: 20 }} showsVerticalScrollIndicator={false}>
                        {filteredOrders.map((item, index) => (
                            <View key={item._id}>
                                <OrderList
                                    id={item._id}
                                    i={index}
                                    price={item.totalPrice}
                                    status={item.status}
                                    statusColor={getStatusColor(item.status)}
                                    paymentInfo={item.paymentInfo}
                                    orderedOn={item.createdAt.split("T")[0]}
                                    address={
                                        item.user?.deliveryAddress?.[0]
                                            ? `${item.user.deliveryAddress[0].houseNo}, ${item.user.deliveryAddress[0].streetName}, ${item.user.deliveryAddress[0].barangay}, ${item.user.deliveryAddress[0].city}`
                                            : 'Address not available'
                                    }
                                />
                                <View style={styles.emptyView}></View>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.ListContiainerEmpty}>
                        <Text style={styles.secondaryTextSmItalic}>
                            "There are no orders placed yet."
                        </Text>
                    </View>
                )}
            </View>
        </>
    );
};

export default MyOrders;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        flexDirection: "column",
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1,
    },
    screenNameContainer: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 0,
        width: "100%",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
    },
    screenNameText: {
        fontSize: 30,
        fontWeight: "800",
    },
    screenNameParagraph: {
        marginTop: 5,
        fontSize: 15,
    },
    tabContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingVertical: 10,
        backgroundColor: "#fff",
    },
    tabText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#707981",
    },
    activeTabText: {
        color: "#000",
        borderBottomWidth: 2,
        borderBottomColor: "#000",
    },
    confirmButton: {
        backgroundColor: "#ffb703",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
    },
    confirmButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    emptyView: {
        height: 20,
    },
    ListContiainerEmpty: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    secondaryTextSmItalic: {
        fontStyle: "italic",
        fontSize: 15,
        color: "#707981",
    },
});
