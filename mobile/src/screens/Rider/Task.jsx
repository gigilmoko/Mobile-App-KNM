import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Alert, Button, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getPendingSessionsByRider, getSessionsByRider, acceptWork, declineWork, startDeliverySession, completeDeliverySession } from "../../redux/actions/deliverySessionActions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from "./Footer";

const Task = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [riderId, setRiderId] = useState(null);
    const [taskTab, setTaskTab] = useState("Pending");

    const pendingSessions = useSelector((state) => state.deliverySession.pendingSessions);
    const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions);
    const error = useSelector((state) => state.deliverySession.error);

    useEffect(() => {
        const fetchRiderId = async () => {
            try {
                const id = await AsyncStorage.getItem('riderId');
                if (!id) {
                    Alert.alert("Error", "Rider ID not found.");
                    return;
                }
                setRiderId(id);
                dispatch(getPendingSessionsByRider(id));
                dispatch(getSessionsByRider(id));
            } catch (err) {
                console.error("Error fetching rider ID:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRiderId();
    }, [dispatch]);

    const handleAccept = (sessionId) => {
        dispatch(acceptWork(sessionId));
        Alert.alert("Success", "You have accepted the session.");
        setTaskTab("Ongoing");
    };

    const handleDecline = (sessionId, truckId) => {
        dispatch(declineWork(sessionId, riderId, truckId));
        Alert.alert("Declined", "You have declined the session.");
    };

    const handleStartDelivery = (id) => {
        dispatch(startDeliverySession(id));
        Alert.alert("Success", "You have started the delivery.");
    };

    const handleCompleteDelivery = (id) => {
        dispatch(completeDeliverySession(id));
        Alert.alert("Success", "You have completed the delivery.");
        setTaskTab("History");
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setTaskTab("Pending")} style={[styles.tab, taskTab === "Pending" && styles.activeTab]}>
                    <Text style={[styles.tabText, taskTab === "Pending" && styles.activeTabText]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTaskTab("Ongoing")} style={[styles.tab, taskTab === "Ongoing" && styles.activeTab]}>
                    <Text style={[styles.tabText, taskTab === "Ongoing" && styles.activeTabText]}>Ongoing</Text>
                </TouchableOpacity>
            </View>

            {taskTab === "Pending" && (
                <ScrollView contentContainerStyle={styles.centerContent}>
                    {error ? (
                        <Text style={styles.errorText}>Error: {JSON.stringify(error)}</Text>
                    ) : pendingSessions?.length > 0 ? (
                        pendingSessions.map((session) => (
                            <View key={session?._id} style={styles.sessionCard}>
                                <View style={styles.taskContainer}>
                                    <Text style={styles.sessionText}>Session ID: {session?._id}</Text>
                                    <Text style={styles.sessionText}>Status: {session?.status}</Text>
                                    <Text style={styles.sessionText}>Rider: {session?.rider?.fname} {session?.rider?.lname}</Text>
                                    <Text style={styles.sessionText}>Truck: {session?.truck?.model} - {session?.truck?.plateNo}</Text>

                                    <View style={styles.buttonContainer}>
                                        <Button title="Accept" onPress={() => handleAccept(session?._id)} color="green" />
                                        <Button title="Decline" onPress={() => handleDecline(session?._id, session?.truck?._id)} color="red" />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noSessionsText}>No pending sessions available.</Text>
                    )}
                </ScrollView>
            )}

            {taskTab === "Ongoing" && (
                <ScrollView contentContainerStyle={styles.centerContent}>
                    {ongoingSessions?.length > 0 ? (
                        ongoingSessions.map((session) => (
                            <View key={session?._id} style={styles.sessionCard}>
                                <View style={styles.taskContainer}>
                                    <Text style={styles.sessionText}>Session ID: {session?._id}</Text>
                                    <Text style={styles.sessionText}>Status: {session?.status}</Text>
                                    <Text style={styles.sessionText}>Order ID: {session?.order?._id}</Text>
                                    <Text style={styles.sessionText}>Product ID: {session?.order?.product?._id}</Text>
                                    <Text style={styles.sessionText}>Product Name: {session?.order?.product?.name}</Text>
                                    <Text style={styles.sessionText}>Rider: {session?.rider?.fname} {session?.rider?.lname}</Text>
                                    <Text style={styles.sessionText}>Truck: {session?.truck?.model} - {session?.truck?.plateNo}</Text>

                                    <View style={styles.buttonContainer}>
                                        <Button title="Start Delivery" onPress={() => handleStartDelivery(session?._id)} color="blue" />
                                        <Button title="Complete Delivery" onPress={() => handleCompleteDelivery(session?._id)} color="green" />
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noSessionsText}>No ongoing sessions available.</Text>
                    )}
                </ScrollView>
            )}

            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: '#ffb703',
    },
    tabText: {
        fontSize: 18,
        fontWeight: 'normal',
    },
    activeTabText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    sessionCard: {
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 10,
    },
    taskContainer: {
        padding: 10,
    },
    sessionText: {
        fontSize: 16,
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    errorText: {
        color: "red",
        fontSize: 16,
    },
    noSessionsText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
    },
    centerContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },
});

export default Task;