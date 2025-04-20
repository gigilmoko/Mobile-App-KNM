import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, Button, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getSessionsByRider, startDeliverySession, completeDeliverySession } from "../../redux/actions/deliverySessionActions";
import AsyncStorage from "@react-native-async-storage/async-storage";

const OngoingSessions = () => {
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const [riderId, setRiderId] = useState(null);

    const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions);
    const error = useSelector((state) => state.deliverySession.error);

    const fetchData = async () => {
        try {
            const id = await AsyncStorage.getItem("riderId");
            if (!id) {
                Alert.alert("Error", "Rider ID not found.");
                return;
            }
            setRiderId(id);
            dispatch(getSessionsByRider(id));
        } catch (err) {
            console.error("Error fetching rider ID:", err);
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

    const handleStartDelivery = (id) => {
        dispatch(startDeliverySession(id));
        Alert.alert("Success", "You have started the delivery.");
    };

    const handleCompleteDelivery = (id) => {
        dispatch(completeDeliverySession(id));
        Alert.alert("Success", "You have completed the delivery.");
    };

    return (
        <ScrollView
            className="flex-grow"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {error ? (
                <Text className="text-red-500 text-lg">Error: {JSON.stringify(error)}</Text>
            ) : ongoingSessions?.length > 0 ? (
                ongoingSessions.map((session) => (
                    <View key={session?._id} className="p-4 bg-gray-100 rounded-lg mb-3">
                        <View className="p-4 bg-white rounded-lg border border-gray-300">
                            <Text className="text-lg font-bold mb-2">Session ID: {session?._id}</Text>
                            <Text className="text-lg mb-2">Status: {session?.status}</Text>
                            <View className="flex-row justify-between mt-3">
                                <Button title="Start Delivery" onPress={() => handleStartDelivery(session?._id)} color="blue" />
                                <Button title="Complete Delivery" onPress={() => handleCompleteDelivery(session?._id)} color="green" />
                            </View>
                        </View>
                    </View>
                ))
            ) : (
                <Text className="text-center text-lg text-gray-500">No ongoing sessions available.</Text>
            )}
        </ScrollView>
    );
};

export default OngoingSessions;
