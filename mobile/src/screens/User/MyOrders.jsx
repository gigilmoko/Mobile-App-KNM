import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  RefreshControl
} from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getUserOrdersMobile } from "../../redux/actions/orderActions";
import { getUserDetails } from "../../redux/actions/userActions";
import { Ionicons } from "@expo/vector-icons";
import Footer from "../../components/Layout/Footer";

const MyOrders = () => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { loading, orders } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const [selectedTab, setSelectedTab] = useState("Preparing");
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tabMapping = {
    "Preparing": "Preparing",
    "Shipping": "Shipped",
    "Pending": "Delivered Pending",
    "Delivered": "Delivered",
    "Cancelled": "Cancelled"
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getUserOrdersMobile());
    if (user) {
      await dispatch(getUserDetails(user._id));
    }
    setRefreshing(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await dispatch(getUserOrdersMobile());
      if (user) {
        await dispatch(getUserDetails(user._id));
      }
      setIsLoading(false);
    };
    
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, dispatch, user?._id]);

  const getStatusColor = (status) => {
    if (!status) return '#808080';
    
    switch (status.toLowerCase()) {
      case 'preparing':
        return '#e01d47';
      case 'shipped':
        return '#ff9800';
      case 'delivered pending':
        return '#2196f3';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#9e9e9e';
      default:
        return '#808080';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return "help-circle";
    
    switch (status.toLowerCase()) {
      case 'preparing':
        return "time";
      case 'shipped':
        return "cube";
      case 'delivered pending':
        return "alert-circle";
      case 'delivered':
        return "checkmark-circle";
      case 'cancelled':
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const filteredOrders = orders
    .filter(order => order.status && order.status === selectedTab)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const renderOrderCard = ({ item }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return (
      <View className="mb-4 bg-white rounded-xl shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.navigate("orderdetails", { id: item._id })}
          className="p-4"
        >
          {/* Order Header */}
          <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-gray-200">
            <View className="flex-row items-center">
              <Ionicons 
                name={getStatusIcon(item.status)} 
                size={20} 
                color={getStatusColor(item.status)} 
              />
              <Text className="text-base font-bold text-gray-800 ml-2">
                Order #{item.KNMOrderId || item._id.substring(0, 8)}
              </Text>
            </View>
            <View className={`py-1 px-2 rounded-full bg-opacity-20`} 
              style={{ backgroundColor: `${getStatusColor(item.status)}20` }}>
              <Text className="text-xs font-medium" style={{ color: getStatusColor(item.status) }}>
                {item.status}
              </Text>
            </View>
          </View>
          
          {/* Order Date and Amount */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-gray-500">{formattedDate}</Text>
            <Text className="text-base font-bold text-[#e01d47]">₱{item.totalPrice.toFixed(2)}</Text>
          </View>
          
          {/* Order Items */}
          <View className="bg-gray-50 p-3 rounded-lg mb-3">
            <Text className="font-medium text-gray-700 mb-2">Items:</Text>
            {item.orderProducts.slice(0, 2).map((product, index) => (
              <View key={index} className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center flex-1">
                  <View className="w-2 h-2 rounded-full bg-[#e01d47] mr-2"></View>
                  <Text className="text-sm text-gray-800 flex-1" numberOfLines={1}>
                    {product.product?.name || "Product"}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600">x{product.quantity}</Text>
              </View>
            ))}
            
            {item.orderProducts.length > 2 && (
              <Text className="text-xs text-gray-500 mt-1 italic">
                +{item.orderProducts.length - 2} more items
              </Text>
            )}
          </View>
          
          {/* Payment Method */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="card-outline" size={16} color="#666" />
              <Text className="text-sm text-gray-600 ml-1">
                {item.paymentInfo}
              </Text>
            </View>
            <TouchableOpacity 
              className="flex-row items-center bg-[#e01d47] px-3 py-1.5 rounded-full"
              onPress={() => navigation.navigate("orderdetails", { id: item._id })}
            >
              <Text className="text-white text-xs font-medium mr-1">Details</Text>
              <Ionicons name="arrow-forward" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-center p-5 pt-12 bg-white shadow-sm">
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          className="absolute left-5 top-12 z-10"
        >
          <Ionicons name="arrow-back" size={24} color="#e01d47" />
        </TouchableOpacity>
        
        <Text className="text-xl font-bold text-[#e01d47] text-center">
          My Orders
        </Text>
      </View>

      {/* Status Filter Tabs */}
      <View className="px-4 pt-3 bg-white">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-4"
        >
          {Object.keys(tabMapping).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tabMapping[tab])}
              className={`mr-2 py-2 px-4 rounded-full ${
                selectedTab === tabMapping[tab] 
                  ? "bg-[#e01d47]" 
                  : "bg-gray-100"
              }`}
            >
              <Text 
                className={`text-sm font-medium ${
                  selectedTab === tabMapping[tab] 
                    ? "text-white" 
                    : "text-gray-700"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pb-16 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#e01d47" />
            <Text className="mt-2 text-gray-500">Loading your orders...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 10 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#e01d47"]}
              />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Ionicons name="receipt-outline" size={70} color="#e0e0e0" />
            <Text className="text-lg font-medium text-gray-400 mt-4">
              No {selectedTab.toLowerCase()} orders
            </Text>
            <Text className="text-sm text-gray-400 text-center mt-2 px-10">
              Orders with status "{selectedTab}" will appear here
            </Text>
            <TouchableOpacity 
              className="mt-6 bg-[#e01d47] py-3 px-6 rounded-full"
              onPress={() => navigation.navigate("home")}
            >
              <Text className="text-white font-medium">Browse Products</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="absolute bottom-0 w-full">
        <Footer activeRoute={"profile"} />
      </View>
    </View>
  );
};

export default MyOrders;