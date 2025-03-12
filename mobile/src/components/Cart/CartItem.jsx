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
    addToWishlistHandler, // Ensure this prop is received
}) => {
    return (
        <TouchableOpacity
        onPress={() => navigate.navigate('productdetail', { id })}
        style={{
            width: '100%',
            marginVertical: 6,
            // borderColor: '#F4B546',
            // borderWidth: 1,
            // borderRadius: 10,
            backgroundColor: '#f9f9f9',
            padding: 10,
            height: 120, // Adjusted height for better spacing
            position: 'relative',
        }}
    >
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            {/* Product Image */}
            <View
                style={{
                    width: 80, // Fixed width for 1:1 aspect ratio
                    height: 80, // Fixed height for 1:1 aspect ratio
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#ff7895', // Border applied to image
                    overflow: 'hidden',
                }}
            >
                <Image
                    source={{
                        uri: imgSrc,
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'cover',
                    }}
                />
            </View>
    
            {/* Product Details */}
            <View style={{ flex: 1, paddingLeft: 12, justifyContent: 'center' }}>
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
    
                {/* Category */}
                <Text
                    style={{
                        fontSize: 12,
                        color: '#777',
                        marginTop: 2,
                    }}
                >
                    {/* Category: {category} */}
                </Text>
    
                {/* Price */}
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#9b0000',
                        marginTop: 4,
                    }}
                >
                    ₱{amount}
                </Text>
            </View>
    
            {/* Heart Icon (Wishlist) */}
            <TouchableOpacity
                onPress={() => addToWishlistHandler(id, name, price, imgSrc, stock)} // Use the handler
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    padding: 6,
                }}
            >
                <MaterialCommunityIcons
                    name="heart-outline" // Change to "heart" if added to wishlist
                    style={{ fontSize: 20, color: '#ff5252' }}
                />
            </TouchableOpacity>
        </View>
    
        {/* Quantity Selector (Lower Right) */}
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#B9B9B9',
                borderRadius: 25, // Rounded edges
                paddingHorizontal: 10,
                paddingVertical: 4,
                position: 'absolute',
                bottom: 10,
                right: 10,
            }}
        >
            {/* Minus Button */}
            <TouchableOpacity
                onPress={() => decrementHandler(id, name, amount, imgSrc, stock, qty)}
                style={{ padding: 6 }}
            >
                <MaterialCommunityIcons name="minus" style={{ fontSize: 16, color: '#777' }} />
            </TouchableOpacity>
    
            {/* Quantity Display */}
            <Text style={{ color: '#000', fontSize: 16, fontWeight: '600', marginHorizontal: 12 }}>
                {qty}
            </Text>
    
            {/* Plus Button */}
            <TouchableOpacity
                onPress={() => incrementHandler(id, name, amount, imgSrc, stock, qty)}
                style={{ padding: 6 }}
            >
                <MaterialCommunityIcons name="plus" style={{ fontSize: 16, color: '#777' }} />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
    
    
    );
};

export default CartItem;