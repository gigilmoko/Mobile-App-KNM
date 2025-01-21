import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";

const ConfirmOrderItem = ({ price, quantity, image, name}) => {
    return (
        <TouchableOpacity style={{
            width: '100%',
            marginVertical: 6,
            borderColor: '#F4B546',
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: '#fff',
            padding: 10,
            height: 100,
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                    width: '30%',
                    height: '100%',
                    // padding: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 10,
                    marginRight: 22,
                }}>
                    <Image
                        source={{ uri: image }}
                        style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'contain',
                        }}
                    />
                </View>

                <View style={{ flex: 1, height: '100%', justifyContent: 'space-around' }}>
                    <Text style={{
                        fontSize: 20,
                        color: '#000',
                        fontWeight: '600',
                        letterSpacing: 1,
                    }}>
                        {name}
                    </Text>

                    {/* Price and Quantity */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ marginHorizontal: 0 }}>{quantity}</Text>
                            <Text style={{ marginHorizontal: 5 }}>x</Text>
                            <Text style={{ marginHorizontal: 5 }}>${price}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ConfirmOrderItem;
