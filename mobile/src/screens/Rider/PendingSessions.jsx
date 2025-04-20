import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, Button, RefreshControl, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getSessionsByRider, acceptWork, declineWork } from "../../redux/actions/deliverySessionActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PendingSessions = () => {
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [riderId, setRiderId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);

    const pendingSessions = useSelector((state) => state.deliverySession.pendingSessions);
    const error = useSelector((state) => state.deliverySession.error);

    const fetchData = async () => {
        try {
            const id = await AsyncStorage.getItem("riderId");
            if (!id) {
                Alert.alert("Error", "Rider ID not found.");
                setLoading(false);
                return;
            }
            setRiderId(id);
            await dispatch(getSessionsByRider(id));
        } catch (err) {
            console.error("Error fetching rider ID:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dispatch]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const handleAccept = (sessionId) => {
        dispatch(acceptWork(sessionId));
        Alert.alert("Success", "You have accepted the session.");
    };

    const handleDecline = (sessionId, truckId) => {
        dispatch(declineWork(sessionId, riderId, truckId));
        Alert.alert("Declined", "You have declined the session.");
    };

    const handleViewDetails = (session) => {
        setSelectedSession(session);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedSession(null);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <>
            <ScrollView
                className="flex-grow"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {error ? (
                    <Text className="text-red-500 text-lg">Error: {JSON.stringify(error)}</Text>
                ) : pendingSessions?.length > 0 ? (
                    pendingSessions.map((session) => (
                        <View key={session?._id} className="p-4 bg-gray-100 rounded-lg mb-3">
                            <View className="p-4 bg-white rounded-lg border border-gray-300">
                                {/* Order ID */}
                                <Text className="text-sm text-gray-500 mb-1">
                                    Order ID: <Text className="font-bold">ORD-{session?.orders?.[0]?._id?.slice(-4)}</Text>
                                </Text>

                                {/* Customer Name */}
                                <Text className="text-lg font-bold mb-1">
                                    {session?.orders?.[0]?.user?.fname} {session?.orders?.[0]?.user?.lname}
                                </Text>

                                {/* Address */}
                                {session?.orders?.[0]?.user?.deliveryAddress?.[0] && (
                                    <Text className="text-sm text-gray-500 mb-1">
                                        <FontAwesome5 name="map-marker-alt" size={12} color="gray" />{" "}
                                        {`${session.orders[0].user.deliveryAddress[0].houseNo} ${session.orders[0].user.deliveryAddress[0].streetName}, ${session.orders[0].user.deliveryAddress[0].barangay}, ${session.orders[0].user.deliveryAddress[0].city}`}
                                    </Text>
                                )}

                                {/* Items */}
                                <Text className="text-sm text-gray-500 mb-3 flex-row items-center">
                                    <FontAwesome5 name="box" size={12} color="gray" /> {` ${session?.orders?.length} items`}
                                </Text>

                                {/* Buttons */}
                                <View className="flex-row justify-between gap-2">
                                    <View className="flex-1">
                                        <TouchableOpacity
                                            className="bg-white border border-gray-400 py-2 rounded items-center"
                                            onPress={() => handleViewDetails(session)}
                                        >
                                            <Text className="text-black">View Details</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-1">
                                        <TouchableOpacity
                                            className="bg-red-600 py-2 rounded items-center"
                                            onPress={() => handleAccept(session?._id)}
                                        >
                                            <Text className="text-white">Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text className="text-center text-lg text-gray-500">No pending sessions available.</Text>
                )}
            </ScrollView>

            {/* Modal for Order Details */}
            {modalVisible && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={closeModal}
                >
                    <View className="flex-1 justify-center items-center bg-black/30">
                        <View className="w-11/12 bg-white rounded-lg p-4 my-20">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">Order Details</Text>
                                <TouchableOpacity onPress={closeModal}>
                                    <Text className="text-lg font-bold text-red-500">X</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {selectedSession && selectedSession.orders.map((order, index) => (
                                    <View key={order._id} className="mb-4">
                                        <View className="border-gray-300 pb-4">
                                            <Text className="text-sm text-gray-500 mb-1">
                                                Order ID: <Text className="font-bold">ORD-{order._id.slice(-7)}</Text>
                                            </Text>
                                            <Text className="text-lg font-bold mb-1">
                                                {order.user.fname} {order.user.lname}
                                            </Text>
                                            {order.user.deliveryAddress[0] && (
                                                <Text className="text-sm text-gray-500 mb-1">
                                                    <FontAwesome5 name="map-marker-alt" size={12} color="gray" />{" "}
                                                    {`${order.user.deliveryAddress[0].houseNo} ${order.user.deliveryAddress[0].streetName}, ${order.user.deliveryAddress[0].barangay}, ${order.user.deliveryAddress[0].city}`}
                                                </Text>
                                            )}
                                            <Text className="text-sm text-gray-500 mb-2">
                                                <FontAwesome5 name="box" size={12} color="gray" />{" "}
                                                {`${order.orderProducts.length} items`}
                                            </Text>
                                            {order.orderProducts.map((product, idx) => (
                                                <View key={product._id} className="flex-row justify-between mb-1">
                                                    <Text className="text-sm text-gray-700">
                                                        {product.quantity}x Item {idx + 1}
                                                    </Text>
                                                    <Text className="text-sm text-gray-700">₱ {product.price.toFixed(2)}</Text>
                                                </View>
                                            ))}
                                            <View className="border-t border-gray-300 my-2" />
                                            <View className="flex-row justify-between mt-2">
                                                <Text className="text-sm text-gray-700">Delivery Fee</Text>
                                                <Text className="text-sm text-gray-700">₱ {order.shippingCharges.toFixed(2)}</Text>
                                            </View>
                                            <View className="flex-row justify-between">
                                                <Text className="text-sm text-gray-700">Payment Method</Text>
                                                <Text className="text-sm text-gray-700">{order.paymentInfo}</Text>
                                            </View>
                                            <View className="border-t border-gray-300 my-2" />
                                            <View className="flex-row justify-between mt-2">
                                                <Text className="text-lg font-bold">Total</Text>
                                                <Text className="text-lg font-bold text-red-500">₱ {order.totalPrice.toFixed(2)}</Text>
                                            </View>
                                        </View>
                                        {index < selectedSession.orders.length - 1 && (
                                            <View className="h-1 my-4" style={{ backgroundColor: "#e01d47" }} />
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                            <TouchableOpacity
                                className="bg-red-600 py-2 rounded items-center "
                                onPress={closeModal}
                            >
                                <Text className="text-white">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            )}
        </>
    );
};

export default PendingSessions;
