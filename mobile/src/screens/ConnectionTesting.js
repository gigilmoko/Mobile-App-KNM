import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { server } from '../redux/store';

const ConnectionTesting = () => {
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get(`${server}/product`)
            .then((response) => {
                if (response.status === 200) {
                    setConnectionStatus('Connected to Backend!');
                    setProducts(response.data.products || []);
                } else {
                    setConnectionStatus('Failed to Connect.');
                }
            })
            .catch(() => {
                setConnectionStatus('Failed to Connect.');
            });
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Connection Status</Text>
            <Text style={styles.status}>{connectionStatus}</Text>
            {products.length > 0 ? (
                <View>
                    <Text style={styles.subHeader}>Product Names</Text>
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <Text style={styles.productName}>{item.name}</Text>
                        )}
                    />
                </View>
            ) : (
                <Text>No products available</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    status: {
        fontSize: 16,
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productName: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default ConnectionTesting;