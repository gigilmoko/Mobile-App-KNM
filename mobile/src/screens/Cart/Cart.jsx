import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import CartItem from "../../components/Cart/CartItem";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Header from '../../components/Layout/Header';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'; 

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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', position: 'relative' }}>
                <Header back={true} emptyCart={true} emptyWishlist={false} />
                <Text style={styles.cartTitle}>
                    My Cart
                </Text>
                <ScrollView style={{ paddingHorizontal: 16 }}>
                    {/* Cart Items Section */}
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => (
                            <Swipeable
                                key={item.product}
                                renderRightActions={() => renderRightActions(item.product)} // Render delete button
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
                        ))
                    ) : (
                        <Text style={{ textAlign: "center", fontSize: 18 }}>No Items Yet</Text>
                    )}
                </ScrollView>

                {/* Combined Order Info and Checkout Button in a single box */}
                <View style={styles.orderInfoContainer}>
                    {/* Order Info */}
                    <Text style={styles.orderInfoTitle}>Order Info</Text>

                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Subtotal</Text>
                        <Text style={styles.orderInfoValue}>${cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0)}</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoLabel}>Items</Text>
                        <Text style={styles.orderInfoValue}>{cartItems.length}</Text>
                    </View>
                    <View style={styles.orderInfoRow}>
                        <Text style={styles.orderInfoTotalLabel}>Total</Text>
                        <Text style={styles.orderInfoTotalValue}>
                            ${cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0)}
                        </Text>
                    </View>

                    {/* Checkout Button */}
                    <View style={{ marginTop: 10 }}>
                        <TouchableOpacity
                            onPress={cartItems.length > 0 ? () => navigation.navigate("confirmorder") : null}
                            style={styles.checkoutButton}
                        >
                            <Text style={styles.checkoutButtonText}>
                                CHECKOUT
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    cartTitle: {
        fontSize: 26,
        color: '#000000',
        fontWeight: '700',
        letterSpacing: 1,
        paddingTop: 5,
        paddingLeft: 16,
        marginBottom: 10,
    },
    swipeActionDelete: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 10,
        marginVertical: 6,
        height: 120,
    },
    swipeActionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    orderInfoContainer: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#ffcc73',
    },
    orderInfoTitle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
        letterSpacing: 1,
        marginBottom: 10,
    },
    orderInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    orderInfoLabel: {
        fontSize: 14,
        fontWeight: '400',
        maxWidth: '80%',
        color: '#333',
        opacity: 0.7,
    },
    orderInfoValue: {
        fontSize: 14,
        fontWeight: '400',
        color: '#333',
        opacity: 0.8,
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
        width: '100%',
        height: 50,
        backgroundColor: '#bc430b',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkoutButtonText: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 1,
        color: '#ffffff',
        textTransform: 'uppercase',
    },
});

export default Cart;