import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CartItem = ({
    name,
    amount,
    qty,
    stock,
    index,
    imgSrc,
    id,
    price,
    decrementHandler,
    incrementHandler,
    navigate,
}) => {
    return (
        <TouchableOpacity
            onPress={() => navigate.navigate('productdetail', { id })}
            style={{
                width: '100%',
                marginVertical: 6,
                borderColor: '#F4B546',
                borderWidth: 1,
                borderRadius: 10, 
                backgroundColor: '#f9f9f9',
                padding: 10,
                height: 100, // Fixed height to ensure consistent size
            }}
        >
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                }}
            >
                {/* Product Image */}
                <View
                    style={{
                        width: '30%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                        marginRight: 22,
                    }}
                >
                    <Image
                        source={{
                            uri: imgSrc,
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'contain',
                        }}
                    />
                </View>

                {/* Product Details */}
                <View
                    style={{
                        flex: 1,
                        height: '100%',
                        justifyContent: 'space-around',
                    }}
                >
                    {/* Product Name */}
                    <Text
                        style={{
                            fontSize: 14,
                            color: '#000',
                            fontWeight: '600',
                            letterSpacing: 1,
                        }}
                    >
                        {name}
                    </Text>

                    {/* Price */}
                    <View
                        style={{
                            marginTop: 4,
                            flexDirection: 'row',
                            alignItems: 'center',
                            opacity: 0.6,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 14,
                                fontWeight: '400',
                                marginRight: 4,
                                color: '#000000',
                            }}
                        >
                            ${amount}
                        </Text>
                    </View>

                    {/* Quantity Controls */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            {/* Decrement Button */}
                            <TouchableOpacity
                                onPress={() => decrementHandler(id, name, amount, imgSrc, stock, qty)}
                            >
                                <View
                                    style={{
                                        borderRadius: 100,
                                        marginRight: 20,
                                        padding: 4,
                                        borderWidth: 1,
                                        borderColor: '#B9B9B9',
                                        opacity: 0.5,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="minus"
                                        style={{
                                            fontSize: 16,
                                            color: '#777777',
                                        }}
                                    />
                                </View>
                            </TouchableOpacity>

                            {/* Quantity Text */}
                            <Text style={{ color: '#9b0000' }}>{qty}</Text>

                            {/* Increment Button */}
                            <TouchableOpacity
                                onPress={() => incrementHandler(id, name, amount, imgSrc, stock, qty)}
                            >
                                <View
                                    style={{
                                        borderRadius: 50,
                                        marginLeft: 20,
                                        padding: 4,
                                        borderColor: '#B9B9B9',
                                        borderWidth: 1,
                                        opacity: 0.5,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="plus"
                                        style={{
                                            fontSize: 16,
                                            color: '#777777',
                                        }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default CartItem;