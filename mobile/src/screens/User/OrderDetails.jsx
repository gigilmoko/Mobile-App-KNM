import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { getOrderDetails } from '../../redux/actions/orderActions';
import Header from "../../components/Layout/Header";
import StepIndicator from "react-native-step-indicator";
import { useNavigation } from "@react-navigation/native";

const OrderDetails = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();  
    const isFocused = useIsFocused();
    const route = useRoute();
    const { id } = route.params;

    useEffect(() => {
        dispatch(getOrderDetails(id));
    }, [dispatch, id]);

    const { order } = useSelector((state) => state.order);
    const [trackingState, setTrackingState] = useState(1);

    const labels = ["Preparing", "Shipping", "Delivery"];
    const customStyles = {
        stepIndicatorSize: 25,
        currentStepIndicatorSize: 30,
        separatorStrokeWidth: 2,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: "#FB6831",
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: "#FB6831",
        stepStrokeUnFinishedColor: "#aaaaaa",
        separatorFinishedColor: "#fe7013",
        separatorUnFinishedColor: "#aaaaaa",
        stepIndicatorFinishedColor: "#fe7013",
        stepIndicatorUnFinishedColor: "#ffffff",
        stepIndicatorCurrentColor: "#FFFFFF",
        stepIndicatorLabelFontSize: 13,
        currentStepIndicatorLabelFontSize: 13,
        stepIndicatorLabelCurrentColor: "#fe7013",
        stepIndicatorLabelFinishedColor: "#ffffff",
        stepIndicatorLabelUnFinishedColor: "#aaaaaa",
        labelColor: "#999999",
        labelSize: 13,
        currentStepLabelColor: "#fe7013",
    };

    useEffect(() => {
        if (order && order.orderStatus) {
            if (order.orderStatus === "Delivered") {
                setTrackingState(3);
            } else if (order.orderStatus === "Shipped") {
                setTrackingState(2);
            } else if (order.orderStatus === "Preparing") {
                setTrackingState(1);
            }
        }
    }, [order]);

    const overallPrice = order ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0) : 0;
    const totalQuantity = order ? order.orderProducts.reduce((acc, item) => acc + item.quantity, 0) : 0;

    return (
        <>
            <Header back={true} />
            <View className="flex-1 bg-gray-200 items-center justify-center px-5 pb-0">
                <View className="mt-2 w-full mb-1">
                    <Text className="text-3xl font-extrabold text-gray-600">Order Details</Text>
                    <Text className="mt-2 text-md">View all details about the order</Text>
                </View>
                <ScrollView className="flex-1 w-full px-1" showsVerticalScrollIndicator={false}>
                    <View className="mt-2 w-full">
                        <Text className="text-xl font-extrabold text-gray-600">Shipping Address</Text>
                    </View>
                    <View className="mt-1 bg-white p-3 rounded-lg shadow-md mb-2">
                        <Text className="text-sm text-gray-600">
                            {order?.deliveryAddress?.address}, {order?.deliveryAddress?.city}, {order?.deliveryAddress?.country} {order?.deliveryAddress?.pinCode}
                        </Text>
                    </View>

                    <View className="mt-2 w-full">
                        <Text className="text-xl font-extrabold text-gray-600">Order Info</Text>
                    </View>
                    <View className="mt-1 bg-white p-3 rounded-lg shadow-sm mb-2">
                        <Text className="text-sm font-bold text-orange-500">Order # {order?._id}</Text>
                        <Text className="text-sm text-gray-600">Ordered on {order?.createdAt?.split("T")[0]}</Text>
                        <View className="mt-4 w-full">
                            <StepIndicator
                                customStyles={customStyles}
                                currentPosition={trackingState}
                                stepCount={3}
                                labels={labels}
                            />
                        </View>
                    </View>

                    <View className="mt-2 w-full">
                        <Text className="text-xl font-extrabold text-gray-600">Package Details</Text>
                    </View>
                    <View className="mt-1 bg-white p-3 rounded-lg shadow-sm mb-2">
                        <View className="flex-row justify-between items-center w-full">
                            <Text className="text-sm text-gray-600">Total Quantity: {totalQuantity}</Text>
                        </View>
                        <View className="flex-row justify-between items-center w-full mt-2">
                            <Text className="text-sm text-gray-600">
                                Payment Method: {order?.paymentInfo } 
                            </Text>
                        </View>
                        <ScrollView className="bg-white rounded-lg p-3 max-h-[260px] w-full mb-1" nestedScrollEnabled={true}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                <Text style={{ fontWeight: 'bold' }}>Quantity</Text>
                                <Text style={{ fontWeight: 'bold' }}>Product Name</Text>
                                <Text style={{ fontWeight: 'bold' }}>Price</Text>
                            </View>
                            {order && order.orderProducts && order.orderProducts.map((i) => (
                                <View key={i.product} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text>{i.quantity}</Text>
                                    <Text>{i.product}</Text>
                                    <Text>₱{i.price.toFixed(2)}</Text>
                                </View>
                            ))}F
                        </ScrollView>
                        <View className="flex-row justify-between items-center w-full mt-3">
                            <Text className="text-l font-medium text-gray-600 opacity-50 max-w-[80%]">Total Price:</Text>
                            <Text className="text-l font-medium text-orange-600">₱{overallPrice.toFixed(2)}</Text>
                        </View>
                    </View>

                    <View className="h-4"></View>
                </ScrollView>
            </View>
        </>
    );
};

export default OrderDetails;