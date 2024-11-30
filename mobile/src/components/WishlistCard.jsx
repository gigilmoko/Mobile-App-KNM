import { StyleSheet, Image, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants";

const WishListCard = ({
    name,
    price,
    amount,
    imgSrc,
    removeWishlistHandler,
    addToCartHandler,
    id,
    navigate,
    stock,
}) => {

    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imgSrc }}
                    style={styles.image}
                />
            </View>
            <View style={styles.detailsContainer}>
                <Text style={styles.name} onPress={() => navigate.navigate("productdetails", { id })}>
                    {name}
                </Text>
                
                <View style={styles.priceContainer}>
                    <Text style={styles.price}>    ${price}
                    </Text>
                    <TouchableOpacity style={styles.cartButton} onPress={() => addToCartHandler(id, name, price, imgSrc, stock)}>
                        <Text style={styles.cartButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeWishlistHandler(id, name, amount, imgSrc, stock)}
            >
                <Ionicons name="remove-circle-outline" size={25} color="#FF4848" />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

export default WishListCard;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        marginHorizontal: 5,
        marginBottom: 15,
        elevation: 5,
        position: "relative",
    },
    imageContainer: {
        margin: 10,
        padding: 10,
        elevation: 5,
        display: "flex",
        justifyContent: "center",
    
        backgroundColor: colors.light,
    },
    image: {
        width: 80,
        height: 80,
        resizeMode: "contain",
    },
    detailsContainer: {
        flex: 1,
        padding: 10,
    },
    name: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "left", // Center the text horizontally
        flexWrap: "wrap", 
        width: "80%",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    price: {
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 10,
        right: 15,
        color: '#e84219',
    },
    cartButton: {
        backgroundColor: "#FB6831",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        marginTop: 10,
        left: 4,
    },
    cartButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    removeButton: {
        position: "absolute", 
        top: 1, 
        right: 1,
        padding: 5,
    },
});
