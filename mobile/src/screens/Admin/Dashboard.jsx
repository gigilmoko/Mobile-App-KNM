import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { loadUser } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import {
  calculateTotalPrice,
  getMonthlyOrderTotal,
  getTotalCustomer,
  getTotalProducts,
  getNextThreeEvents,
  getLatestOrders,
} from "../../redux/actions/dashboardActions";
import { toggleNotificationReadStatus } from "../../redux/actions/notificationActions";

const Dashboard = ({ navigation, route }) => {
  const { user } = useSelector((state) => state.user);
  const { totalPrice, monthlyOrderTotal, totalCustomers, totalProducts, nextThreeEvents, latestOrders } = useSelector(
    (state) => state.dashboard
  );
  const defaultAvatar = require("../../assets/images/default-user-icon.jpg");
  const [avatar, setAvatar] = useState(user?.avatar || defaultAvatar);

  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  useEffect(() => {
    dispatch(loadUser());
  }, [route.params, dispatch, isFocused]);

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    dispatch(calculateTotalPrice());
    dispatch(getMonthlyOrderTotal());
    dispatch(getTotalCustomer());
    dispatch(getTotalProducts());
    dispatch(getNextThreeEvents());
    dispatch(getLatestOrders());
  }, [dispatch]);

  const handleNotificationPress = async (notifId, eventId) => {
    await dispatch(toggleNotificationReadStatus(notifId));
    navigation.navigate("eventinfo", { eventId });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar backgroundColor="#e01d47" barStyle="light-content" />

      {/* Header */}
      <View className="pt-2 pb-6 px-5 bg-[#e01d47]">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 bg-white bg-opacity-20 rounded-full items-center justify-center w-9 h-9"
          >
            <Ionicons name="arrow-back" size={20} color="#e01d47" />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-white">Dashboard</Text>

          <View className="w-9" />
        </View>

        <View className="mt-4 flex-row items-center">
          <Image
            source={{ uri: avatar || "https://via.placeholder.com/100" }}
            className="w-12 h-12 rounded-full border-2 border-white"
          />
          <View className="ml-3">
            <Text className="text-white text-opacity-80 text-sm">Welcome back,</Text>
            <Text className="text-white font-bold text-lg">{user?.fname || "Admin"}!</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>

        <View className="flex-row flex-wrap justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate("adminorders")}
            className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100"
          >
            <View className="bg-pink-100 p-2 rounded-lg w-12 h-12 items-center justify-center mb-2">
              <Ionicons name="bag-check-outline" size={24} color="#e01d47" />
            </View>
            <Text className="font-bold text-gray-800">Orders</Text>
            <Text className="text-gray-500 text-xs mt-1">Manage orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("adminproducts")}
            className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100"
          >
            <View className="bg-blue-100 p-2 rounded-lg w-12 h-12 items-center justify-center mb-2">
              <Ionicons name="bag-outline" size={24} color="#3b82f6" />
            </View>
            <Text className="font-bold text-gray-800">Products</Text>
            <Text className="text-gray-500 text-xs mt-1">Manage products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("admincategory")}
            className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100"
          >
            <View className="bg-purple-100 p-2 rounded-lg w-12 h-12 items-center justify-center mb-2">
              <Ionicons name="file-tray-full-outline" size={24} color="#8b5cf6" />
            </View>
            <Text className="font-bold text-gray-800">Categories</Text>
            <Text className="text-gray-500 text-xs mt-1">Manage categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("adminevents")}
            className="w-[48%] bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100"
          >
            <View className="bg-amber-100 p-2 rounded-lg w-12 h-12 items-center justify-center mb-2">
              <Ionicons name="calendar-outline" size={24} color="#f59e0b" />
            </View>
            <Text className="font-bold text-gray-800">Events</Text>
            <Text className="text-gray-500 text-xs mt-1">Manage events</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Business Overview</Text>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 overflow-hidden">
          {/* Background decoration */}
          <View className="absolute top-0 right-0">
            <Ionicons name="analytics-outline" size={100} color="#f9f9f9" />
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between">
            {/* Total Sales */}
            <View className="w-[48%] bg-gray-50 rounded-xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <View className="bg-[#ffa4b8] bg-opacity-20 rounded-full p-2 mr-2">
                  <Ionicons name="cash-outline" size={20} color="#e01d47" />
                </View>
                <Text className="text-gray-500 text-xs">Total Sales</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800">₱{totalPrice.toLocaleString()}</Text>
            </View>

            {/* Monthly Revenue */}
            <View className="w-[48%] bg-gray-50 rounded-xl p-4 mb-3">
              <View className="flex-row items-center mb-2">
                <View className="bg-green-100 rounded-full p-2 mr-2">
                  <Ionicons name="trending-up" size={20} color="#10b981" />
                </View>
                <Text className="text-gray-500 text-xs">Monthly</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800">
                ₱{monthlyOrderTotal.reduce((sum, order) => sum + order.totalPrice, 0).toLocaleString()}
              </Text>
            </View>

            {/* Customers */}
            {/* <View className="w-[48%] bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-blue-100 rounded-full p-2 mr-2">
                  <Ionicons name="people-outline" size={20} color="#3b82f6" />
                </View>
                <Text className="text-gray-500 text-xs">Customers</Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-gray-800">{totalCustomers}</Text>
                <View className="bg-green-100 rounded-full px-2 py-1 ml-2">
                  <Text className="text-xs text-green-700">+5%</Text>
                </View>
              </View>
            </View> */}

            {/* Products */}
            {/* <View className="w-[48%] bg-gray-50 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="bg-purple-100 rounded-full p-2 mr-2">
                  <Ionicons name="cube-outline" size={20} color="#8b5cf6" />
                </View>
                <Text className="text-gray-500 text-xs">Products</Text>
              </View>
              <Text className="text-xl font-bold text-gray-800">{totalProducts}</Text>
            </View> */}
          </View>
        </View>

        {/* Upcoming Events */}
        {/* <Text className="text-lg font-bold text-gray-800 mb-3">Upcoming Events</Text>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {nextThreeEvents.length > 0 ? (
            nextThreeEvents.map((event, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNotificationPress(event._id, event._id)}
                className={`flex-row items-center p-3 ${
                  index < nextThreeEvents.length - 1 ? "border-b border-gray-100 mb-2" : ""
                }`}
              >
                <View className="bg-pink-50 rounded-lg p-2 mr-3">
                  <Ionicons name="calendar" size={24} color="#e01d47" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold" numberOfLines={1}>
                    {event.title}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">{formatDate(event.startDate)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cccccc" />
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">No upcoming events</Text>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("adminevents")} className="mt-3 items-center">
            <Text className="text-[#e01d47] font-medium text-sm">View All Events</Text>
          </TouchableOpacity>
        </View> */}

        {/* Latest Orders */}
        {/* <Text className="text-lg font-bold text-gray-800 mb-3">Latest Orders</Text>

        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {latestOrders.length > 0 ? (
            latestOrders.map((order, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })}
                className={`flex-row items-center p-3 ${
                  index < latestOrders.length - 1 ? "border-b border-gray-100 mb-2" : ""
                }`}
              >
                <View className="bg-blue-50 rounded-lg p-2 mr-3">
                  <Ionicons name="receipt" size={24} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-800 font-bold" numberOfLines={1}>
                    {order.KNMOrderId}
                  </Text>
                  <Text className="text-gray-500 text-xs mt-1">
                    {order.user ? `${order.user.fname} ${order.user.lname}` : "Unknown User"}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#e01d47] font-bold">₱{order.totalPrice}</Text>
                  <Text className="text-gray-400 text-xs mt-1">{formatDate(order.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text className="text-gray-500 text-center py-4">No recent orders</Text>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("adminorders")} className="mt-3 items-center">
            <Text className="text-[#e01d47] font-medium text-sm">View All Orders</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </View>
  );
};

export default Dashboard;
