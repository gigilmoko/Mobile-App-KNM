import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Button } from "react-native-paper";
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const ProductCard = ({
    stock,
    name,
    price,
    image,
    id,
    addToCardHandler,
    addToWishlistHandler,
    navigate,
    isLastItemInRow,
}) => {
    const isOutOfStock = stock === 0;

    const truncateName = (name, maxLength) => {
        if (name.length > maxLength) {
            return name.substring(0, maxLength) + '...';
        }
        return name;
    };

    return (
        <TouchableOpacity
            onPress={() => navigate.navigate("productdetail", { id })}
            style={{
                width: '45%',
                marginVertical: 10,
                marginRight: isLastItemInRow ? 0 : '4%',
                borderColor: '#ffb703',
                borderWidth: 1, 
                borderRadius: 10, 
                backgroundColor: '#ffffff', 
                alignSelf: 'center', // Center the product card
            }}
        >
            {/* Product Image Box */}
            <View
                style={{
                    width: '100%',
                    height: 90,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    backgroundColor: '#F0F0F3',
                    position: 'relative',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Image
                    source={{
                        uri: image,
                    }}
                    style={{
                        width: '80%',
                        height: '90%',
                        resizeMode: 'contain',
                    }}
                />
            </View>

            {/* Product Name */}
            <Text
                style={{
                    fontSize: 14,
                    color: '#000000',
                    fontWeight: '600',
                    marginBottom: 2,
                    paddingHorizontal: 8, // Optional: add horizontal padding
                }}
            >
                {truncateName(name, 50)}
            </Text>

            {/* Availability Status */}
            {isOutOfStock ? (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 8, // Optional: add horizontal padding
                    }}
                >
                    <FontAwesome
                        name="circle"
                        style={{
                            fontSize: 6,
                            marginRight: 6,
                            color: '#C04345',
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 8,
                            color: '#C04345',
                        }}
                    >
                        Unavailable
                    </Text>
                </View>
            ) : (
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 8, // Optional: add horizontal padding
                    }}
                >
                    <FontAwesome
                        name="circle"
                        style={{
                            fontSize: 10,
                            marginRight: 6,
                            color: '#00AC76',
                        }}
                    />
                    <Text
                        style={{
                            fontSize: 10,
                            color: '#00AC76',
                        }}
                    >
                        Available
                    </Text>
                </View>
            )}

            {/* Product Price */}
            <Text
                style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#e84219',
                    marginBottom: 4,
                    paddingHorizontal: 8, // Optional: add horizontal padding
                }}
            >
                ₱ {price}
            </Text>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "#ffb703",
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                    width: "100%",
                    paddingVertical: 2, // Minimized vertical padding
                }}
            >
                <Button
                    onPress={() => addToCardHandler(id, name, price, image, stock)}
                    textColor="#000"
                    style={{ flex: 2, paddingVertical: 0 }}
                    disabled={isOutOfStock}
                    labelStyle={{ fontSize: 12 }} // Smaller text size
                >
                    {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
                </Button>

                <TouchableOpacity
                    onPress={() => addToWishlistHandler(id, name, price, image, stock)}
                    style={{ flex: 4, padding: 4 }}
                >
                    <FontAwesome
                        name="heart"
                        size={12} // Smaller icon size
                        color="#ffffff"
                    />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;