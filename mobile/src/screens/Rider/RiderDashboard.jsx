import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getPendingTruck } from "./../../redux/actions/riderActions";
import { getOrderDetails } from "./../../redux/actions/orderActions";
import { acceptWork, declineWork } from "./../../redux/actions/truckActions"; // Import accept and decline actions
import AsyncStorage from '@react-native-async-storage/async-storage';

const RiderDashboard = () => {
    const dispatch = useDispatch();
    const { pendingTruck, loading, error } = useSelector((state) => state.rider);
    const { order, orderLoading, orderError } = useSelector((state) => state.order); 
    const [isTruckFetched, setIsTruckFetched] = useState(false);

    useEffect(() => {
        const fetchPendingTruck = async () => {
            try {
                const riderId = await AsyncStorage.getItem('riderId');
                if (riderId) {
                    dispatch(getPendingTruck(riderId));
                } else {
                    Alert.alert('Error', 'Rider ID not found.');
                }
            } catch (error) {
                console.error("Error fetching rider ID from AsyncStorage:", error);
            }
        };

        fetchPendingTruck();
    }, [dispatch]);

    useEffect(() => {
        if (pendingTruck && !isTruckFetched) {
            const orderId = pendingTruck.orders && pendingTruck.orders[0];
            if (orderId) {
                dispatch(getOrderDetails(orderId)); // Dispatch the action here
            }
            setIsTruckFetched(true);
        }
    }, [pendingTruck, isTruckFetched, dispatch]);

    const handleAccept = () => {
        const truckId = pendingTruck._id;
        dispatch(acceptWork(truckId)); // Dispatch accept work action
    };

    const handleDecline = () => {
        const truckId = pendingTruck._id;
        dispatch(declineWork(truckId)); // Dispatch decline work action
    };

    if (loading || orderLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (error || orderError) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'red' }}>{error || orderError}</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Rider Dashboard</Text>

            {pendingTruck ? (
                <View style={{ marginTop: 20 }}>
                    <Text style={{ fontSize: 18 }}>Pending Truck Details:</Text>
                    <Text>Truck ID: {pendingTruck._id}</Text>
                    <Text>Truck Model: {pendingTruck.model}</Text>
                    <Text>Truck Plate No.: {pendingTruck.plateNo}</Text>
                    <Text>Status: {pendingTruck.riderAccepted}</Text>

                    {/* Add Accept and Decline Buttons */}
                    {pendingTruck.riderAccepted !== 'accepted' && (
                        <View style={{ marginTop: 10 }}>
                            <Button title="Accept Work" onPress={handleAccept} />
                            <Button title="Decline Work" onPress={handleDecline} />
                        </View>
                    )}

                    {/* Display order details only if order exists */}
                    {order ? (
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ fontSize: 18 }}>Order Details:</Text>
                            <Text>Order ID: {order._id}</Text>
                            <Text>Order Status: {order.status}</Text>
                            <Text>Payment Info: {order.paymentInfo}</Text>
                            <Text>Total Price: {order.totalPrice}</Text>

                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 16 }}>Delivery Address:</Text>
                                {order.deliveryAddress ? (
                                    <>
                                        <Text>Latitude: {order.deliveryAddress.latitude}</Text>
                                        <Text>Longitude: {order.deliveryAddress.longitude}</Text>
                                    </>
                                ) : (
                                    <Text>No delivery address available.</Text>
                                )}
                            </View>

                            {/* Display order products */}
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontSize: 16 }}>Order Products:</Text>
                                {order.orderProducts && order.orderProducts.length > 0 ? (
                                    order.orderProducts.map((product, index) => (
                                        <View key={index} style={{ marginBottom: 5 }}>
                                            <Text>Product ID: {product.product}</Text>
                                            <Text>Quantity: {product.quantity}</Text>
                                            <Text>Price: {product.price}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text>No products in this order.</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <Text>Loading order details...</Text>
                    )}
                </View>
            ) : (
                <Text>No pending truck found.</Text>
            )}
        </View>
    );
};

export default RiderDashboard;
