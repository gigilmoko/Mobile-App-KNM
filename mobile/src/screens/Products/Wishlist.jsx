import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Header from "../../components/Layout/Header";

const WishlistCard = ({
    id,
    name,
    price,
    imgSrc,
    stock,
    removeWishlistHandler,
    addToCartHandler,
}) => {
    const renderRightActions = () => (
        <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeWishlistHandler(id)}
        >
            <Ionicons name="trash" size={24} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <View style={styles.card}>
                <Text style={styles.productName}>{name}</Text>
                <Text style={styles.productPrice}>₱{price ? price.toFixed(2) : '0.00'}</Text> 
                <TouchableOpacity
                    onPress={() => addToCartHandler(id, name, price, imgSrc, stock)}
                    style={styles.addToCartButton}
                >
                    <Text style={styles.addToCartText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </Swipeable>
    );
};

const Wishlist = () => {
    const navigate = useNavigation();
    const dispatch = useDispatch();

    const { wishlistItems } = useSelector((state) => state.wishlist);
    const cart = useSelector((state) => state.cart.cartItems);

    const removeWishlistHandler = (id) => {
        dispatch({ type: "removeFromWishlist", payload: id });
    };

    const addToCartHandler = (id, name, price, image, stock) => {
        if (stock === 0)
            return Toast.show({
                type: "error",
                text1: "Out Of Stock",
            });

        const cartItem = cart.find((item) => item.product === id);

        if (cartItem) {
            dispatch({ type: "removeFromWishlist", payload: id });

            return Toast.show({
                type: "info",
                text1: "Already in the cart.",
            });
        } else {
            dispatch({
                type: "addToCart",
                payload: {
                    product: id,
                    name,
                    price,
                    image,
                    stock,
                    quantity: 1,
                },
            });
            dispatch({ type: "removeFromWishlist", payload: id });

            Toast.show({
                type: "success",
                text1: "Added To Cart",
            });
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Header back={true} emptyWishlist={true} />

            <View style={styles.container}>
                <View style={styles.screenNameContainer}>
                    <Text style={styles.screenNameText}>My Wishlist</Text>
                    <Text style={styles.screenNameParagraph}>
                        View, add or remove products from wishlist for later purchase
                    </Text>
                </View>
                <ScrollView
                    style={{ flex: 1, width: "100%", padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {wishlistItems.length > 0 ? (
                        wishlistItems.map((i) => (
                            <WishlistCard
                                key={i.product}
                                id={i.product}
                                name={i.name}
                                price={i.price}
                                imgSrc={i.image}
                                stock={i.stock}
                                removeWishlistHandler={removeWishlistHandler}
                                addToCartHandler={addToCartHandler}
                            />
                        ))
                    ) : (
                        <View style={styles.listContainerEmpty}>
                            <Text style={styles.secondaryTextSmItalic}>
                                "There are no products in the wishlist yet."
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </GestureHandlerRootView>
    );
};

export default Wishlist;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    screenNameContainer: {
        padding: 20,
        paddingTop: 0,
        paddingBottom: 0,
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
    },
    screenNameText: {
        fontSize: 30,
        fontWeight: "800",
        color: "#000000",
    },
    screenNameParagraph: {
        marginTop: 5,
        fontSize: 15,
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    productName: {
        fontSize: 18,
        fontWeight: "600",
    },
    productPrice: {
        fontSize: 16,
        color: "#888",
        marginVertical: 5,
    },
    addToCartButton: {
        backgroundColor: "#ffb703",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    addToCartText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: "#bc430b",
        justifyContent: "center",
        alignItems: "center",
        width: 80,
        borderRadius: 10,
        height: "90%",
    },
    listContainerEmpty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryTextSmItalic: {
        fontStyle: "italic",
        fontSize: 15,
        color: "#707981",
    },
});