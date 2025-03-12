import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/userActions";
import { placeOrder } from "../../redux/actions/orderActions";
import ConfirmOrderItem from "../../components/Cart/ConfirmOrderItem";
import { useNavigation } from "@react-navigation/native";
import { useMessageAndErrorOrder } from "../../../utils/hooks";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";
const methods = [
  { name: "Cash on Delivery", value: "COD" },
  { name: "GCash", value: "GCash" },
  { name: "Maya", value: "Maya" },
];

const ConfirmOrder = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const [paymentInfo, setPaymentInfo] = useState("COD");

  const itemsPrice = cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
  const shippingCharges = 10; // Updated shipping charges to 10 pesos
  const totalAmount = itemsPrice + shippingCharges;

  useEffect(() => {
    dispatch(loadUser());
    console.log("User loaded:", user);
  }, [dispatch]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login...");
      navigation.navigate("login");
      return;
    }

    const shippingInfo = {
      houseNo: user?.deliveryAddress?.houseNo,
      streetName: user?.deliveryAddress?.streetName,
      barangay: user?.deliveryAddress?.barangay,
      city: user?.deliveryAddress?.city,
      latitude: user?.deliveryAddress?.latitude,
      longitude: user?.deliveryAddress?.longitude,
    };

    const order = {
      user: user._id,
      orderProducts: cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
      shippingInfo,
      paymentInfo,
      itemsPrice,
      shippingCharges,
      totalAmount,
    };

    console.log("Placing order with details:", order);

    try {
      const response = await dispatch(placeOrder(
        order.orderProducts,
        order.paymentInfo,
        order.itemsPrice,
        order.shippingCharges,
        order.totalAmount,
        navigation
      ));

      console.log("Order response:", response);

      if (response.checkoutUrl && paymentInfo === "GCash") {
        const { checkoutUrl } = response;
        console.log("GCash checkout URL:", checkoutUrl);
        Linking.openURL(checkoutUrl).catch((err) => console.error('An error occurred', err));
      } else {
        Alert.alert('Order Placed Successfully');
        dispatch({ type: "clearCart" });
        navigation.navigate("home");
      }
    } catch (err) {
      console.error('Error placing order:', err);
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const loading = useMessageAndErrorOrder(
    dispatch,
    navigation,
    "home",
    () => ({ type: "clearCart" })
  );

  return (
    <ScrollView className="bg-white">
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
          Check Out
        </Text>
      </View>
    </View>
  
    <View className="flex-1 bg-white p-5 pt-50">
      {/* Customer Details */}
      <View className="p-4 rounded-lg bg-[#f9fafb] mb-4 mt-16">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold">Customer Details</Text>
          <TouchableOpacity onPress={() => navigation.navigate("addressupdate")}>
            <MaterialCommunityIcons name="pencil" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <Text className="text-base mb-1">Name: {user?.fname} {user?.lname}</Text>
        <Text className="text-base mb-1">Phone: {user?.phone}</Text>
        <Text className="text-base mb-1">
          Address: {user?.deliveryAddress?.[0]?.houseNo}, {user?.deliveryAddress?.[0]?.streetName}, {user?.deliveryAddress?.[0]?.barangay}, {user?.deliveryAddress?.[0]?.city}
        </Text>
      </View>
  
      {/* Products */}
      <View className="p-4 border border-gray-300 rounded-lg bg-[#f9fafb] mb-4">
        <Text className="text-lg font-semibold mb-2">Products</Text>
        {cartItems.map((i) => (
          <ConfirmOrderItem key={i.product} price={i.price} image={i.image} name={i.name} quantity={i.quantity} />
        ))}
      </View>
  
      {/* Payment Method */}
      <View className="p-4 border border-gray-300 rounded-lg bg-[#f9fafb] mb-4">
        <Text className="text-lg font-semibold mb-2">Payment Method</Text>
        {methods.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="flex-row items-center mb-2"
            onPress={() => setPaymentInfo(item.value)}
          >
            <View className="h-5 w-5 border border-[#ff7895] rounded-full items-center justify-center mr-2">
              {paymentInfo === item.value && <View className="h-3 w-3 bg-[#ff7895] rounded-full" />}
            </View>
            <Text className="text-base">{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
  
      {/* Order Summary (Full Width) */}
      <View className="border-t border-gray-300 my-2 w-full ">
        <Text className="text-lg font-semibold mb-2">Order Summary</Text>
  
        <View className="flex-row justify-between mb-1">
          <Text className="text-base">Subtotal</Text>
          <Text className="text-base">₱{itemsPrice.toFixed(2)}</Text>
        </View>
        
        <View className="flex-row justify-between mb-1">
          <Text className="text-base">Shipping</Text>
          <Text className="text-base">₱{shippingCharges.toFixed(2)}</Text>
        </View>
  
        {/* Divider */}
        <View className="border-t border-gray-300 my-2" />
  
        {/* Total (Left-Right Alignment) */}
        <View className="flex-row justify-between">
          <Text className="text-xl font-medium">Total</Text>
          <Text className="text-xl text-[#e01d47] font-medium">₱{totalAmount.toFixed(2)}</Text>
        </View>
      </View>
  
      {/* Button Outside the Box */}
      <View className="w-full items-center pt-2">
        <TouchableOpacity
          className={`w-full bg-[#e01d47] rounded-lg items-center justify-center ${loading && 'opacity-50'}`}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold p-2">Place Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
  
  );
};

export default ConfirmOrder;