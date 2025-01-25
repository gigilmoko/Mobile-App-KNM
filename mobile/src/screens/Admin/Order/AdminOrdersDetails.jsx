import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Picker } from '@react-native-picker/picker';
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useRoute, useNavigation } from "@react-navigation/native"; 
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails } from "../../../redux/actions/orderActions"; 
import { getUserDetails } from "../../../redux/actions/userActions"; 
import { processOrder } from "../../../redux/actions/orderActions";

const AdminOrdersDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderId } = route.params;
    const dispatch = useDispatch();
    const [selectedStatus, setSelectedStatus] = useState("");

    useEffect(() => {
        dispatch(getOrderDetails(orderId));
    }, [dispatch, orderId]);

    const { order, loading, error, success } = useSelector((state) => state.order);
    const { userDetails, loadingUser, errorUser } = useSelector((state) => state.user);

    useEffect(() => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user._id));
        }
    }, [dispatch, order]);

    useEffect(() => {
        if (success) {
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
            dispatch(processOrder(order._id, selectedStatus));
        }
    };

    useEffect(() => {
        if (order && order._id) {
            setSelectedStatus(order.status);
        }
    }, [order]);

    const handleUserDetailsClick = () => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user._id)); // Fetch user details again on click
        }
    };

    return (
        <View style={styles.container}>
            <Header back={true} />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.orderDetailsContainer}>
                    <Text style={styles.orderDetailsTitle}>Order Details:</Text>

                    {loading ? (
                        <Text style={styles.loadingText}>Loading...</Text>
                    ) : order && order._id ? (
                        <>
                            <Text style={styles.orderText}>Order ID: {order._id}</Text>
                            <Text style={styles.orderText}>Status: {order.status}</Text>
                            <Text style={styles.orderText}>Total: ₱{order.totalPrice ? order.totalPrice.toFixed(2) : "N/A"}</Text>
                            <Text style={styles.orderText}>Items: {order.orderProducts && order.orderProducts.length}</Text>
                            <View style={styles.orderProductsContainer}>
                                {order.orderProducts.map((item) => (
                                    <View key={item._id} style={styles.orderProductItem}>
                                        <View>
                                            <Text style={styles.productName}>Product Name: {item.product.name}</Text>
                                            <Text style={styles.productText}>Price: ₱{item.price}</Text>
                                            <Text style={styles.productText}>Quantity: {item.quantity}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    ) : (
                        <Text style={styles.orderText}>No order details available</Text>
                    )}
                </View>

                {userDetails && (
                    <TouchableOpacity onPress={handleUserDetailsClick}>
                        <View style={styles.userDetailsContainer}>
                            <Text style={styles.userDetailsTitle}>User Details:</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                                <View>
                                    <Text style={styles.userDetailsText}>Name: {userDetails.fname} {userDetails.lname}</Text>
                                    <Text style={styles.userDetailsText}>Email: {userDetails.email}</Text>
                                    <Text style={styles.userDetailsText}>Phone: {userDetails.phone}</Text>
                                    <Text style={styles.userDetailsText}>Delivery Address: {userDetails.deliveryAddress?.houseNo}, {userDetails.deliveryAddress?.streetName}, {userDetails.deliveryAddress?.barangay}, {userDetails.deliveryAddress?.city}</Text>
                                    <Text style={styles.userDetailsText}>User ID: {userDetails._id}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Footer />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 50,
        padding: 20,
    },
    orderDetailsContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginTop: 0,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    orderDetailsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    loadingText: {
        textAlign: "center",
        color: "#666666",
    },
    orderText: {
        fontSize: 18,
    },
    orderProductsContainer: {
        marginTop: 20,
    },
    orderProductItem: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
    },
    productName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    productText: {
        fontSize: 16,
    },
    userDetailsContainer: {
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        padding: 20,
        marginTop: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    userDetailsTitle: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
    },
    userDetailsText: {
        fontSize: 16,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});

export default AdminOrdersDetails;