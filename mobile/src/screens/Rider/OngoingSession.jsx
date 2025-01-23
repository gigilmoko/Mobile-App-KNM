import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getSessionsByRider,  completeDeliverySession, startDeliverySession } from "../../redux/actions/deliverySessionActions";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation

const OngoingSession = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();  // Initialize useNavigation hook
    const [loading, setLoading] = useState(true);
    const [riderId, setRiderId] = useState(null);

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
                dispatch(getSessionsByRider(id));  // Fetch ongoing sessions
            } catch (err) {
                console.error("Error fetching rider ID:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRiderId();
    }, [dispatch]);

    const handleStartDelivery = (id) => {
        dispatch(startDeliverySession(id));
        Alert.alert("Success", "You have started the delivery.");
    };

    const handleCompleteDelivery = (id) => {
        dispatch(completeDeliverySession(id));
        Alert.alert("Success", "You have completed the delivery.");
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Ongoing Session</Text>

            {error ? (
                <Text style={styles.errorText}>Error: {JSON.stringify(error)}</Text>
            ) : ongoingSessions?.length > 0 ? (
                ongoingSessions.map((session) => (
                    <View key={session._id} style={styles.sessionCard}>
                        <Text style={styles.sessionText}>Session ID: {session._id}</Text>
                        <Text style={styles.sessionText}>Status: {session.status}</Text>
                       
                        <Text style={styles.sessionText}>
                            Rider: {session.rider ? `${session.rider.fname} ${session.rider.lname}` : "N/A"}
                        </Text>
                        <Text style={styles.sessionText}>
                            Truck: {session.truck ? `${session.truck.model} - ${session.truck.plateNo}` : "N/A"}
                        </Text>

                        <View style={styles.buttonContainer}>
                            <Button title="Start Delivery" onPress={() => handleStartDelivery(session._id)} color="blue" />
                            <Button title="Complete Delivery" onPress={() => handleCompleteDelivery(session._id)} color="green" />
                        </View>
                    </View>
                ))
            ) : (
                <Text>No ongoing sessions available.</Text>
            )}

            <View style={styles.buttonContainer}>
                <Button title="Refresh Sessions" onPress={() => dispatch(getSessionsByRider(riderId))} />
            </View>
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
    sessionCard: {
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginBottom: 10,
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
});

export default OngoingSession;
