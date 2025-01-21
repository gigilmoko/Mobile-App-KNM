import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import CartItem from "../../components/Cart/CartItem";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Cart = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { cartItems } = useSelector((state) => state.cart);

    const incrementHandler = (id, name, price, image, stock, quantity) => {
        const newQty = quantity + 1;
        if (stock <= quantity) {
            return Toast.show({
                type: "error",
                text1: "Maximum value added",
            });
        }
        dispatch({
            type: "addToCart",
            payload: { product: id, name, price, image, stock, quantity: newQty },
        });
    };

    const decrementHandler = (id, name, price, image, stock, quantity) => {
        const newQty = quantity - 1;
        if (1 >= quantity) {
            return dispatch({ type: "removeFromCart", payload: id });
        }
        dispatch({
            type: "addToCart",
            payload: { product: id, name, price, image, stock, quantity: newQty },
        });
    };

    const handleDelete = (id) => {
        dispatch({ type: "removeFromCart", payload: id });
    };

    const renderRightActions = (id) => (
        <TouchableOpacity
            style={styles.swipeActionDelete}
            onPress={() => handleDelete(id)}
        >
            <Text style={styles.swipeActionText}>Delete</Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item, index }) => (
        <Swipeable
            renderRightActions={() => renderRightActions(item.product)}
        >
            <CartItem
                navigate={navigation}
                id={item.product}
                name={item.name}
                stock={item.stock}
                amount={item.price}
                imgSrc={item.image}
                index={index}
                qty={item.quantity}
                incrementHandler={incrementHandler}
                decrementHandler={decrementHandler}
            />
        </Swipeable>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#fff', position: 'relative' }}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Cart</Text>
                </View>
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.product}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    ListEmptyComponent={<Text style={{ textAlign: "center", fontSize: 18 }}>No Items Yet</Text>}
                />
                <OrderInfo cartItems={cartItems} />
                <CheckoutButton cartItems={cartItems} navigation={navigation} />
            </View>
        </GestureHandlerRootView>
    );
};

const OrderInfo = ({ cartItems }) => {
    const subtotal = cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
    const itemsCount = cartItems.length;
    const shipping = 10; // Example shipping cost

    return (
        <View style={styles.orderInfoContainer}>
            <Text style={styles.orderInfoTitle}>Order Info</Text>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Subtotal</Text>
                <Text style={styles.orderInfoValue}>₱{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Items</Text>
                <Text style={styles.orderInfoValue}>{itemsCount}</Text>
            </View>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoLabel}>Shipping</Text>
                <Text style={styles.orderInfoValue}>₱{shipping.toFixed(2)}</Text>
            </View>
            <View style={styles.orderInfoRow}>
                <Text style={styles.orderInfoTotalLabel}>Total</Text>
                <Text style={styles.orderInfoTotalValue}>₱{(subtotal + shipping).toFixed(2)}</Text>
            </View>
        </View>
    );
};

const CheckoutButton = ({ cartItems, navigation }) => (
    <View>
        <TouchableOpacity
            onPress={cartItems.length > 0 ? () => navigation.navigate("confirmorder") : null}
            style={styles.checkoutButton}
        >
            <Text style={styles.checkoutButtonText}>
                Checkout
            </Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        marginBottom: 10,
    },
    backButton: {
        position: "absolute",
        left: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    swipeActionDelete: {
        backgroundColor: '#bc430b',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        borderRadius: 10,
        marginVertical: 6,
        height: 100,
        marginLeft: 10,
    },
    swipeActionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orderInfoContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f9f9f9',
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        // flex: 1,
        
    },
    orderInfoTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        marginBottom: 10,
    },
    orderInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    orderInfoTotalLabel: {
        fontSize: 20,
        fontWeight: '400',
        maxWidth: '80%',
        color: '#000',
    },
    orderInfoTotalValue: {
        fontSize: 24,
        fontWeight: '500',
        color: '#000',
    },
    checkoutButton: {
        // height: 40,
        backgroundColor: '#bc430b',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 15,
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
        color: '#ffffff',
        padding: 10,
    },
});

export default Cart;