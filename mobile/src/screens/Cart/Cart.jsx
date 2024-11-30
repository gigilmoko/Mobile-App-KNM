import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import CartItem from "../../components/Cart/CartItem";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import Header from '../../components/Layout/Header';
import { Swipeable } from 'react-native-gesture-handler'; 

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
            style={{
                backgroundColor: '',
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                borderRadius: 10,
                marginVertical: 6,
                height: 120
            }}
            onPress={() => handleDelete(id)}
        >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ width: '100%', height: '100%', backgroundColor: '#ffffff', position: 'relative' }}>
            <Header back={true} emptyCart={true} emptyWishlist={false} />
            <Text style={{ fontSize: 26, color: '#000000', fontWeight: '700', letterSpacing: 1, paddingTop: 5, paddingLeft: 16, marginBottom: 10 }}>
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
            <View style={{
                paddingHorizontal: 16,
                paddingVertical: 20,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor: '#ffcc73',
            }}>
                {/* Order Info */}
                <Text style={{ fontSize: 16, color: '#000', fontWeight: '500', letterSpacing: 1, marginBottom: 10 }}>Order Info</Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '400', maxWidth: '80%', color: '#333', opacity: 0.7 }}>Subtotal</Text>
                    <Text style={{ fontSize: 14, fontWeight: '400', color: '#333', opacity: 0.8 }}>${cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0)}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                    <Text style={{ fontSize: 14, fontWeight: '400', maxWidth: '80%', color: '#333', opacity: 0.7 }}>Items</Text>
                    <Text style={{ fontSize: 14, fontWeight: '400', color: '#333', opacity: 0.8 }}>{cartItems.length}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 20, fontWeight: '400', maxWidth: '80%', color: '#000' }}>Total</Text>
                    <Text style={{ fontSize: 24, fontWeight: '500', color: '#000' }}>
                        ${cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0)}
                    </Text>
                </View>

                {/* Checkout Button */}
                <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                        onPress={cartItems.length > 0 ? () => navigation.navigate("confirmorder") : null}
                        style={{
                            width: '100%',
                            height: 50,
                            backgroundColor: '#bc430b',
                            borderRadius: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontSize: 16, fontWeight: '500', letterSpacing: 1, color: '#ffffff', textTransform: 'uppercase' }}>
                            CHECKOUT
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default Cart;
