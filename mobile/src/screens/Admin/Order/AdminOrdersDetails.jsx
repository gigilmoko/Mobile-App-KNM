import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
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

    // Fetch user details every time the order is fetched or updated
    useEffect(() => {
        if (order && order.user) {
            dispatch(getUserDetails(order.user));
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
            dispatch(getUserDetails(order.user)); // Fetch user details again on click
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Header back={true} />

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }}>
                <View style={{ backgroundColor: "#ffffff", borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: 0, padding: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
                    <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Order Details:</Text>

                    {loading ? (
                        <Text style={{ textAlign: "center", color: "#666666" }}>Loading...</Text>
                    ) : order && order._id ? (
                        <>
                            <Text style={{ fontSize: 18 }}>Order ID: {order._id}</Text>
                            <Text style={{ fontSize: 18 }}>Status: {order.status}</Text>
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ fontSize: 16, fontWeight: "bold" }}>Change Status:</Text>
                                <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginTop: 10 }}>
                                    <Picker
                                        selectedValue={selectedStatus}
                                        onValueChange={(itemValue) => handleStatusChange(itemValue)}
                                        style={{ height: 50, width: '100%' }}
                                    >
                                        <Picker.Item label="Preparing" value="Preparing" />
                                        <Picker.Item label="Shipped" value="Shipped" />
                                        <Picker.Item label="Delivered" value="Delivered" />
                                    </Picker>
                                </View>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    style={{
                                        backgroundColor: "#ffb703",
                                        padding: 10,
                                        borderRadius: 10,
                                        marginTop: 10,
                                        alignItems: "center",
                                    }}
                                >
                                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>Update Status</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={{ fontSize: 18 }}>Total: ₱{order.totalPrice ? order.totalPrice.toFixed(2) : "N/A"}</Text>
                            <Text style={{ fontSize: 18 }}>Items: {order.orderProducts && order.orderProducts.length}</Text>
                        </>
                    ) : (
                        <Text style={{ fontSize: 18 }}>No order details available</Text>
                    )}
                </View>

                {order && order.orderProducts && order.orderProducts.length > 0 && (
                    <View style={{ backgroundColor: "#ffffff", borderRadius: 10, padding: 20, marginTop: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
                        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Products Bought:</Text>
                        {order.orderProducts.map((item) => (
                            <View key={item._id} style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>Product Name: {item.product}</Text>
                                    <Text style={{ fontSize: 16 }}>Price: ₱{item.price}</Text>
                                    <Text style={{ fontSize: 16 }}>Quantity: {item.quantity}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {userDetails && (
                    <TouchableOpacity onPress={handleUserDetailsClick}>
                        <View style={{ backgroundColor: "#ffffff", borderRadius: 10, padding: 20, marginTop: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 3 }, elevation: 2 }}>
                            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>User Details:</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: "bold" }}>Name: {userDetails.fname} {userDetails.middlei}. {userDetails.lname}</Text>
                                    <Text style={{ fontSize: 16 }}>Email: {userDetails.email}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
                <Footer />
            </View>
        </View>
    );
};

export default AdminOrdersDetails;