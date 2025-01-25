import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getHistoryByRider } from '../../redux/actions/deliverySessionActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Footer from './Footer';

const History = () => {
    const dispatch = useDispatch();
    const history = useSelector((state) => state.deliverySession.historySessions);
    const error = useSelector((state) => state.deliverySession.error);

    useEffect(() => {
        const fetchRiderId = async () => {
            try {
                const id = await AsyncStorage.getItem('riderId');
                if (!id) {
                    Alert.alert("Error", "Rider ID not found.");
                    return;
                }
                dispatch(getHistoryByRider(id));
            } catch (err) {
                console.error("Error fetching rider ID:", err);
            }
        };

        fetchRiderId();
    }, [dispatch]);

    console.log('History:', history);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Delivery History</Text>
            <ScrollView>
                {history?.length > 0 ? (
                    history.map((session) => (
                        <View key={session._id} style={styles.sessionCard}>
                            <Text style={styles.sessionText}>Session ID: {session._id}</Text>
                            <Text style={styles.sessionText}>Status: {session.status}</Text>
                            <Text style={styles.sessionText}>Truck Plate No: {session.truck?.plateNo}</Text>
                            <Text style={styles.sessionText}>Rider Accepted: {session.riderAccepted}</Text>
                            <Text style={styles.sessionText}>Orders:</Text>
                            {session.orders.map((order) => (
                                <View key={order._id} style={styles.orderCard}>
                                    <Text style={styles.orderText}>Order ID: {order._id}</Text>
                                    <Text style={styles.orderText}>Total Price: ₱{order.totalPrice}</Text>
                                    <Text style={styles.orderText}>Status: {order.status}</Text>
                                    <Text style={styles.orderText}>Payment: {order.paymentInfo}</Text>
                                    <Text style={styles.orderText}>Products:</Text>
                                    {order.orderProducts.map((product) => (
                                        <Text key={product.product} style={styles.productText}>
                                            Product ID: {product.product}, Quantity: {product.quantity}, Price: ₱{product.price}
                                        </Text>
                                    ))}
                                </View>
                            ))}
                            <Text style={styles.sessionText}>Delivered On: {new Date(session.endTime).toLocaleDateString()}</Text>
                        </View>
                    ))
                ) : (
                    <Text>No delivery history available.</Text>
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
    orderCard: {
        marginTop: 10,
        padding: 10,
        backgroundColor: "#e0e0e0",
        borderRadius: 8,
    },
    orderText: {
        fontSize: 14,
        marginBottom: 3,
    },
    productText: {
        fontSize: 12,
        color: '#333',
    },
});

export default History;
