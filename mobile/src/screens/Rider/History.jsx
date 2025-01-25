import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionsByRider } from '../../redux/actions/deliverySessionActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';

const History = () => {
    const dispatch = useDispatch();
    const completedSessions = useSelector((state) => state.deliverySession.completedSessions);
    const error = useSelector((state) => state.deliverySession.error);

    useEffect(() => {
        const fetchRiderId = async () => {
            try {
                const id = await AsyncStorage.getItem('riderId');
                if (!id) {
                    Alert.alert("Error", "Rider ID not found.");
                    return;
                }
                dispatch(getSessionsByRider(id));
            } catch (err) {
                console.error("Error fetching rider ID:", err);
            }
        };

        fetchRiderId();
    }, [dispatch]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>History</Text>
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
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
});

export default History;