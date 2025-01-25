import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getPendingSessionsByRider, acceptWork, declineWork, getSessionsByRider, completeDeliverySession, startDeliverySession } from "../../redux/actions/deliverySessionActions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const RiderDashboard = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();  // Initialize useNavigation hook
    const [loading, setLoading] = useState(true);
    const [riderId, setRiderId] = useState(null);
    const [selectedTab, setSelectedTab] = useState("TaskToday");
    const [taskTab, setTaskTab] = useState("Pending");

    const pendingSessions = useSelector((state) => state.deliverySession.pendingSessions);
    const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions);
    const completedSessions = useSelector((state) => state.deliverySession.completedSessions);
    const error = useSelector((state) => state.deliverySession.error);
    const rider = useSelector((state) => state.user.user);

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

    useEffect(() => {
        if (rider) {
            console.log("Rider Details:", {
                name: `${rider.fname} ${rider.lname}`,
                email: rider.email,
                phone: rider.phone,
                avatar: rider.avatar,
            });
        }
    }, [rider]);

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

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rider Dashboard</Text>

            <View style={styles.tabContainer}>
                <TouchableOpacity onPress={() => setSelectedTab("TaskToday")}>
                    <Text style={[styles.tabText, selectedTab === "TaskToday" && styles.activeTabText]}>Task Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("History")}>
                    <Text style={[styles.tabText, selectedTab === "History" && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedTab("MyAccount")}>
                    <Text style={[styles.tabText, selectedTab === "MyAccount" && styles.activeTabText]}>My Account</Text>
                </TouchableOpacity>
            </View>

            {selectedTab === "TaskToday" && (
                <>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => setTaskTab("Pending")}>
                            <Text style={[styles.tabText, taskTab === "Pending" && styles.activeTabText]}>Pending</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setTaskTab("Ongoing")}>
                            <Text style={[styles.tabText, taskTab === "Ongoing" && styles.activeTabText]}>Ongoing</Text>
                        </TouchableOpacity>
                    </View>

                    {taskTab === "Pending" && (
                        <ScrollView>
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
                                <Text>No pending sessions available.</Text>
                            )}
                        </ScrollView>
                    )}

                    {taskTab === "Ongoing" && (
                        <ScrollView>
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
                                <Text>No ongoing sessions available.</Text>
                            )}
                        </ScrollView>
                    )}
                </>
            )}

            {selectedTab === "History" && (
                <ScrollView>
                    {completedSessions?.length > 0 ? (
                        completedSessions.map((session) => (
                            <View key={session?._id} style={styles.sessionCard}>
                                <Text style={styles.sessionText}>Session ID: {session?._id}</Text>
                                <Text style={styles.sessionText}>Status: {session?.status}</Text>
                                <Text style={styles.sessionText}>Order ID: {session?.order?._id}</Text>
                                <Text style={styles.sessionText}>Product ID: {session?.order?.product?._id}</Text>
                                <Text style={styles.sessionText}>Product Name: {session?.order?.product?.name}</Text>
                                <Text style={styles.sessionText}>Delivered On: {new Date(session?.completedAt).toLocaleDateString()}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No completed sessions available.</Text>
                    )}
                </ScrollView>
            )}

            {selectedTab === "MyAccount" && (
                <View>
                    <Text>My Account Details</Text>
                    {rider ? (
                        <View style={styles.accountDetails}>
                            <Image source={{ uri: rider.avatar }} style={styles.avatar} />
                            <Text style={styles.accountText}>Name: {rider.fname} {rider.lname}</Text>
                            <Text style={styles.accountText}>Email: {rider.email}</Text>
                            <Text style={styles.accountText}>Phone: {rider.phone}</Text>
                        </View>
                    ) : (
                        <Text>Loading account details...</Text>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    tabText: {
        fontSize: 18,
        fontWeight: 'normal',
    },
    activeTabText: {
        fontWeight: 'bold',
        color: 'blue',
    },
    sessionCard: {
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 10,
    },
    taskContainer: {
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
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
    accountDetails: {
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginTop: 10,
    },
    accountText: {
        fontSize: 16,
        marginBottom: 5,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
});

export default RiderDashboard;