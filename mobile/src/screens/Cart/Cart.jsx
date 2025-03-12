import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import CartItem from "../../components/Cart/CartItem";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {Ionicons} from "@expo/vector-icons";
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

    const addToWishlistHandler = (id, name, price, image, stock) => {
        // if (!user) {
        //     navigation.navigate("login");
        //     return Toast.show({
        //         type: "info",
        //         text1: "Log in to continue.",
        //     });
        // }
    
        dispatch({
            type: "addToWishlist",
            payload: {
                product: id,
                name,
                price,
                image,
                stock,
            },
        });
    
        Toast.show({
            type: "success",
            text1: "Added To Wishlist",
        });
    
        handleDelete(id);
    };

    const handleDelete = (id) => {
        dispatch({ type: "removeFromCart", payload: id });
        Toast.show({
            type: "info",
            text1: "Product moved to wishlist",
        });
    };

    const renderRightActions = (id) => (
        <TouchableOpacity
            className="bg-[#bc430b] justify-center items-center w-15 rounded-lg my-1 h-24 ml-2"
            onPress={() => handleDelete(id)}
        >
            <Text className="text-white font-bold text-lg">Delete</Text>
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
                addToWishlistHandler={addToWishlistHandler} // Pass the handler as a prop
            />
        </Swipeable>
    );

    return (
        <GestureHandlerRootView className="flex-1">
        <View className="w-full h-full bg-white relative">
            {/* Header */}
            <View className="flex-row items-center justify-center p-2 bg-white  mb-2">
                <View className="absolute top-5 left-5 right-5 z-10 flex-row items-center py-3">
                    {/* Back Button */}
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
                    >
                        <Ionicons name="arrow-back" size={20} color="#ffffff" />
                    </TouchableOpacity>
    
                    <View className="flex-1 mr-10">
                        <Text className="text-2xl font-bold text-[#e01d47] text-center">
                            My Cart ({cartItems.length})
                        </Text>
                    </View>
                </View>
            </View>
    
            {/* Cart Items */}
            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.product}
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 50 }}
                ListEmptyComponent={<Text className="text-center text-lg">No Items Yet</Text>}
            />
    
            {/* Order Info & Checkout */}
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
        <View className="mx-4">
    {/* Divider */}
    <View className="border-t border-gray-300 my-2" />

    {/* Order Info */}
    <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base">Subtotal</Text>
        <Text className="text-base">₱{subtotal.toFixed(2)}</Text>
    </View>
    <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base">Items</Text>
        <Text className="text-base">{itemsCount}</Text>
    </View>
    <View className="flex-row items-center justify-between mb-1">
        <Text className="text-base">Shipping</Text>
        <Text className="text-base">₱{shipping.toFixed(2)}</Text>
    </View>

    {/* Divider before Total */}
    <View className="border-t border-gray-300 my-2" />

    {/* Total */}
    <View className="flex-row items-center justify-between">
        <Text className="text-xl font-medium">Total</Text>
        <Text className="text-xl text-[#e01d47] font-medium">₱{(subtotal + shipping).toFixed(2)}</Text>
    </View>
</View>
    );
};

const CheckoutButton = ({ cartItems, navigation }) => (
    <View>
    <TouchableOpacity
        onPress={cartItems.length > 0 ? () => navigation.navigate("confirmorder") : null}
        className="bg-[#e01d47] rounded-lg justify-center items-center mx-4 my-2"
    >
        <Text className="text-lg font-medium text-white py-2">Checkout</Text>
    </TouchableOpacity>
</View>
);

export default Cart;