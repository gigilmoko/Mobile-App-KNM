import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  ActivityIndicator,
  Modal
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/userActions";
import { placeOrder } from "../../redux/actions/orderActions";
import { useNavigation } from "@react-navigation/native";
import { useMessageAndErrorOrder } from "../../../utils/hooks";
import { Ionicons } from "@expo/vector-icons";

const paymentMethods = [
  { 
    name: "Cash on Delivery", 
    value: "COD", 
    icon: "cash-outline",
    description: "Pay when your order arrives"
  },
  { 
    name: "GCash", 
    value: "GCash", 
    icon: "wallet-outline",
    description: "Pay using GCash e-wallet"
  },
];

const ConfirmOrder = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const [paymentInfo, setPaymentInfo] = useState("COD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const itemsPrice = cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
  const shippingCharges = 10; // Shipping charges in pesos
  const totalAmount = itemsPrice + shippingCharges;

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      navigation.navigate("login");
      return;
    }

    // Check if delivery address exists
    if (!user?.deliveryAddress || user.deliveryAddress.length === 0) {
      Alert.alert(
        "Missing Delivery Address",
        "Please add a delivery address before placing your order.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add Address", onPress: () => navigation.navigate("addressupdate") }
        ]
      );
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prepare order items according to the updated model
      const orderProducts = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await dispatch(placeOrder(
        orderProducts,
        paymentInfo,
        itemsPrice,
        shippingCharges,
        totalAmount
      ));

      if (response?.checkoutUrl && paymentInfo === "GCash") {
        Linking.openURL(response.checkoutUrl).catch((err) => 
          Alert.alert('Error', 'Failed to open payment page')
        );
      } else {
        Alert.alert('Order Placed Successfully');
        dispatch({ type: "clearCart" });
        navigation.navigate("home");
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const loading = useMessageAndErrorOrder(
    dispatch,
    navigation,
    "home",
    () => ({ type: "clearCart" })
  );

  // Check if cart is empty
  if (cartItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-5">
        <Ionicons name="cart-outline" size={100} color="#e0e0e0" />
        <Text className="text-xl font-bold text-gray-400 mt-5">Your cart is empty</Text>
        <Text className="text-gray-400 text-center mt-2 mb-6">Add some products to your cart to checkout</Text>
        <TouchableOpacity 
          className="bg-[#e01d47] py-3 px-8 rounded-full"
          onPress={() => navigation.navigate("home")}
        >
          <Text className="text-white font-bold">Shop Now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format address for display
  const formatAddress = (address) => {
    return (
      <>
        {address.houseNo !== "none" && <Text>{address.houseNo}, </Text>}
        {address.streetName !== "none" && <Text>{address.streetName}, </Text>}
        {address.barangay !== "none" && <Text>Brgy. {address.barangay}, </Text>}
        {address.city !== "none" && <Text>{address.city}</Text>}
      </>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-5 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-2">Checkout</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Delivery Address Section */}
        <View className="bg-white p-4 mt-2 mb-2">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#e01d47" />
              <Text className="text-base font-bold text-gray-800 ml-2">Delivery Address</Text>
            </View>
            
            <View className="flex-row">
              {user?.deliveryAddress && user.deliveryAddress.length > 1 && (
                <TouchableOpacity 
                  onPress={() => setShowAddressModal(true)}
                  className="bg-gray-100 p-1.5 rounded-full mr-2"
                >
                  <Ionicons name="swap-horizontal" size={16} color="#e01d47" />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={() => navigation.navigate("editaddress")}
                className="bg-gray-100 p-1.5 rounded-full"
              >
                <Ionicons name="pencil-outline" size={16} color="#e01d47" />
              </TouchableOpacity>
            </View>
          </View>
          
          {user?.deliveryAddress && user.deliveryAddress.length > 0 ? (
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-base font-medium text-gray-800">{user.fname} {user.lname}</Text>
              <Text className="text-sm text-gray-600 mt-1">{user.phone}</Text>
              <View className="flex-row flex-wrap items-center mt-2">
                <Text className="text-sm text-gray-600">
                  {formatAddress(user.deliveryAddress[selectedAddressIndex])}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              className="bg-gray-50 p-4 rounded-lg flex-row items-center justify-center"
              onPress={() => navigation.navigate("editaddress")}
            >
              <Ionicons name="add-circle-outline" size={20} color="#e01d47" />
              <Text className="text-[#e01d47] font-medium ml-2">Add Delivery Address</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items Section */}
        <View className="bg-white p-4 mb-2">
          <View className="flex-row items-center mb-3">
            <Ionicons name="cart-outline" size={20} color="#e01d47" />
            <Text className="text-base font-bold text-gray-800 ml-2">Order Items</Text>
          </View>

          {cartItems.map((item, index) => (
            <View 
              key={item.product}
              className={`flex-row items-center py-3 ${
                index < cartItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-lg bg-gray-100"
                resizeMode="contain"
              />
              
              <View className="flex-1 ml-3">
                <Text className="text-base font-medium text-gray-800" numberOfLines={1}>
                  {item.name}
                </Text>
                
                <View className="flex-row items-center justify-between mt-1">
                  <Text className="text-sm text-gray-500">
                    {item.quantity} × ₱{item.price.toFixed(2)}
                  </Text>
                  <Text className="text-base font-bold text-[#e01d47]">
                    ₱{(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method Section */}
        <View className="bg-white p-4 mb-2">
          <View className="flex-row items-center mb-3">
            <Ionicons name="wallet-outline" size={20} color="#e01d47" />
            <Text className="text-base font-bold text-gray-800 ml-2">Payment Method</Text>
          </View>

          {paymentMethods.map((method, index) => (
            <TouchableOpacity
              key={method.value}
              onPress={() => setPaymentInfo(method.value)}
              className={`flex-row items-center justify-between p-3 rounded-lg ${
                index === 0 ? "mb-2" : ""
              } ${
                paymentInfo === method.value 
                  ? "bg-[#e01d47]" 
                  : "bg-gray-50"
              }`}
            >
              <View className="flex-row items-center">
                <View className={`p-2 rounded-full ${
                  paymentInfo === method.value ? "bg-white bg-opacity-20" : "bg-gray-200"
                }`}>
                  <Ionicons 
                    name={method.icon} 
                    size={20} 
                    color={paymentInfo === method.value ? "#e01d47" : "#666"} 
                  />
                </View>
                <View className="ml-3">
                  <Text className={`font-medium ${
                    paymentInfo === method.value ? "text-white" : "text-gray-800"
                  }`}>
                    {method.name}
                  </Text>
                  <Text className={
                    paymentInfo === method.value ? "text-white text-opacity-80 text-xs" : "text-gray-500 text-xs"
                  }>
                    {method.description}
                  </Text>
                </View>
              </View>
              
              <Ionicons 
                name={paymentInfo === method.value ? "checkmark-circle" : "ellipse-outline"} 
                size={22} 
                color={paymentInfo === method.value ? "#ffff" : "#666"} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary Section */}
        <View className="bg-white p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="receipt-outline" size={20} color="#e01d47" />
            <Text className="text-base font-bold text-gray-800 ml-2">Order Summary</Text>
          </View>

          <View className="bg-gray-50 p-3 rounded-lg">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-800 font-medium">₱{itemsPrice.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Shipping Fee</Text>
              <Text className="text-gray-800 font-medium">₱{shippingCharges.toFixed(2)}</Text>
            </View>
            
            <View className="border-t border-gray-200 my-2" />
            
            <View className="flex-row justify-between">
              <Text className="text-base font-bold text-gray-800">Total</Text>
              <Text className="text-lg font-bold text-[#e01d47]">₱{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View className="px-4 py-3 bg-white shadow-inner">
        <TouchableOpacity
          className={`py-3 rounded-lg items-center ${
            (loading || isProcessing || !user?.deliveryAddress || user.deliveryAddress.length === 0) 
              ? "bg-gray-400" 
              : "bg-[#e01d47]"
          }`}
          onPress={handlePlaceOrder}
          disabled={loading || isProcessing || !user?.deliveryAddress || user.deliveryAddress.length === 0}
        >
          {(loading || isProcessing) ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Place Order • ₱{totalAmount.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {user?.deliveryAddress?.map((address, index) => (
                <TouchableOpacity
                  key={index}
                  className={`p-4 mb-2 rounded-lg border ${
                    selectedAddressIndex === index 
                      ? "border-[#e01d47] bg-red-50" 
                      : "border-gray-200 bg-white"
                  }`}
                  onPress={() => {
                    setSelectedAddressIndex(index);
                    setShowAddressModal(false);
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-800">
                        Address {index + 1}
                      </Text>
                      <Text className="text-sm text-gray-600 mt-1 flex-wrap">
                        {formatAddress(address)}
                      </Text>
                    </View>
                    
                    {selectedAddressIndex === index && (
                      <Ionicons name="checkmark-circle" size={24} color="#e01d47" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="mt-4 py-3 bg-[#e01d47] rounded-lg items-center"
              onPress={() => navigation.navigate("addressupdate")}
            >
              <Text className="text-white font-bold">Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ConfirmOrder;