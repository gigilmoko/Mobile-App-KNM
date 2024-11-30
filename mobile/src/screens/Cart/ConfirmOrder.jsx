import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import ConfirmOrderItem from '../../components/Cart/ConfirmOrderItem';
import { loadUser } from '../../redux/actions/userActions';
import { placeOrder } from '../../redux/actions/orderActions';
import { useSelector, useDispatch } from "react-redux";
import { RadioButton } from "react-native-paper";
import Header from '../../components/Layout/Header';
import { useMessageAndErrorOrder } from '../../../utils/hooks';

const ConfirmOrder = ({ navigation }) => {
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const { cartItems } = useSelector((state) => state.cart);
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const itemsPrice = cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
    const shippingCharges = itemsPrice > 1000 ? 0 : 75;
    const totalAmount = itemsPrice + shippingCharges;

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    const handlePlaceOrder = () => {
        if (!isAuthenticated) {
            navigation.navigate("login");
            return;
        }

        const shippingInfo = {
            address: user?.address,
        };

        dispatch(
            placeOrder(
                cartItems,
                shippingInfo,
                paymentMethod,
                itemsPrice,
                shippingCharges,
                totalAmount,
                navigation
            )
        );
    };

    const loading = useMessageAndErrorOrder(
        dispatch,
        navigation,
        "home",
        () => ({ type: "clearCart" })
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <Header back={true} />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 10, paddingTop: 0, textAlign: 'center' }}>
                    Order Summary
                </Text>
                <View style={{
                    padding: 10,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    backgroundColor: '#f9f9f9',
                    marginHorizontal: 16,
                    borderRadius: 8,
                }}>
                    <Text style={{ fontSize: 16, fontWeight: '500' }}>Name: {user?.fname} {user?.lname}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 8 }}>Phone: {user?.phone}</Text>
                    <Text style={{ fontSize: 16, fontWeight: '500', marginTop: 8 }}>Address: {user?.address}</Text>
                </View>

                {/* Product List */}
                <View style={{
                    margin: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    backgroundColor: '#f9f9f9',
                }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 5 }}>Products</Text>
                    {cartItems.map((i) => (
                        <ConfirmOrderItem key={i.product} price={i.price} image={i.image} name={i.name} quantity={i.quantity} />
                    ))}
                </View>

                {/* Order Summary */}
                <View style={{
                    marginHorizontal: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    backgroundColor: '#f9f9f9',
                }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Order Summary</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text>Subtotal:</Text>
                        <Text>${itemsPrice.toFixed(2)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                        <Text>Shipping:</Text>
                        <Text>${shippingCharges.toFixed(2)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, fontWeight: '600' }}>
                        <Text>Total:</Text>
                        <Text>${totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={{
                    margin: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 8,
                    backgroundColor: '#f9f9f9',
                }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Payment Method</Text>
                    <RadioButton.Group onValueChange={setPaymentMethod} value={paymentMethod}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <RadioButton value="COD" color="#c70049" />
                            <Text>Cash on Delivery</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <RadioButton value="Ewallet" color="#c70049" />
                            <Text>E-wallet</Text>
                        </View>
                    </RadioButton.Group>
                </View>
            </ScrollView>

            {/* Fixed Bottom */}
            <View style={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                padding: 16,
                backgroundColor: '#ffcc73',
                borderTopWidth: 1,
                borderColor: '#ddd',
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>Total:</Text>
                    <Text style={{ fontSize: 18, fontWeight: '600' }}>${totalAmount.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    disabled={loading}
                    onPress={handlePlaceOrder}
                    style={{
                        backgroundColor: '#bc430b',
                        padding: 15,
                        borderRadius: 8,
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>Place Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ConfirmOrder;