import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, toggleNotificationReadStatus } from "../../redux/actions/notificationActions";
import { getAdminOrders } from "../../redux/actions/orderActions";
import Footer from "../../components/Layout/Footer";
import { format } from 'date-fns';
import Toast from "react-native-toast-message";

const Notification = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const { notifications = [], loading = false } = useSelector((state) => state.notifications || {});
  const { adminOrders = [] } = useSelector((state) => state.order || {});
  
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await dispatch(getNotifications());
        await dispatch(getAdminOrders()); // Load orders to map KNM IDs to MongoDB IDs
      } catch (error) {
        console.error("Error loading notifications:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (isFocused) {
      loadNotifications();
    }
  }, [dispatch, isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getNotifications());
    await dispatch(getAdminOrders());
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" })
      });
    }
  };
  
  const formatEventTime = (startDate, endDate) => {
    if (!startDate || !endDate) return "";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${format(start, 'MMM dd, h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const handleMarkAllRead = () => {
    dispatch(toggleNotificationReadStatus());
  };

  const getNotificationTypeAndTitle = (notification) => {
    if (notification.event) {
      return {
        type: 'event',
        title: notification.event.title,
        icon: 'calendar-outline',
        color: '#34c759'
      };
    }
    
    const description = notification.description || '';
    
    if (description.toLowerCase().includes('task') || 
        description.toLowerCase().includes('delivery') ||
        description.toLowerCase().includes('rider') ||
        description.toLowerCase().includes('session')) {
      return {
        type: 'task',
        title: 'New Task Assignment',
        icon: 'briefcase-outline',
        color: '#ff9800'
      };
    }
    
    if (description.toLowerCase().includes('order')) {
      return {
        type: 'order',
        title: 'Order Update',
        icon: 'receipt-outline',
        color: '#e01d47'
      };
    }
    
    return {
      type: 'general',
      title: 'New Notification',
      icon: 'notifications-outline',
      color: '#5856d6'
    };
  };

  const getFriendlyDescription = (notification) => {
    const description = notification.description || '';
    const { type } = getNotificationTypeAndTitle(notification);
    
    if (type === 'task') {
      if (description.toLowerCase().includes('delivery')) {
        return `🚚 You've been assigned to a delivery task! Check the details and get ready to serve our customers.`;
      } else if (description.toLowerCase().includes('session')) {
        return `📋 You've been assigned to a new delivery session! Tap to view task details and get started.`;
      } else if (description.toLowerCase().includes('task')) {
        return `✨ You have a new task assignment! Tap here to view the details and begin your work.`;
      } else {
        return `🎯 You've been assigned to handle this task. Your contribution makes a difference!`;
      }
    }
    
    if (notification.event) {
      return notification.event.description;
    }
    
    return description || "Tap to view details";
  };

  const findOrderByKNMId = (knmOrderId) => {
    return adminOrders.find(order => order.KNMOrderId === knmOrderId);
  };

  const extractOrderIdFromNotification = (notification) => {
    // First check if there's a direct order reference
    if (notification.order) {
      return notification.order._id || notification.order.id || notification.order;
    }
    
    // Check for orderId field
    if (notification.orderId) {
      return notification.orderId;
    }
    
    // Extract from description - look for KNM-XXXXX pattern
    const description = notification.description || '';
    const knmOrderMatch = description.match(/KNM-[A-Z0-9]+/i);
    
    if (knmOrderMatch) {
      const knmOrderId = knmOrderMatch[0];
      // Find the actual MongoDB ObjectId for this KNM order ID
      const order = findOrderByKNMId(knmOrderId);
      if (order) {
        console.log(`Found MongoDB ID ${order._id} for KNM ID ${knmOrderId}`);
        return order._id;
      } else {
        console.log(`No order found for KNM ID: ${knmOrderId}`);
        return null;
      }
    }
    
    // Try to extract MongoDB ObjectId pattern from description
    const objectIdMatch = description.match(/[a-f\d]{24}/i);
    if (objectIdMatch) {
      return objectIdMatch[0];
    }
    
    return null;
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      dispatch(toggleNotificationReadStatus(notification._id));
    }

    const { type } = getNotificationTypeAndTitle(notification);
    
    if (notification.event) {
      navigation.navigate("eventinfo", { eventId: notification.event._id });
    } else if (type === 'task') {
      navigation.navigate("tasklist");
    } else if (type === 'order') {
      const orderId = extractOrderIdFromNotification(notification);
      
      if (orderId) {
        console.log("Navigating to order details with MongoDB ID:", orderId);
        navigation.navigate("orderdetails", { id: orderId });
      } else {
        console.log("No order ID found in notification object:", notification);
        Toast.show({
          type: "error",
          text1: "Could not find order details",
          text2: "Order ID not available in notification",
        });
      }
    }
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.read
  );

  const getNotificationIcon = (notification) => {
    const { icon } = getNotificationTypeAndTitle(notification);
    return icon;
  };

  const getNotificationColor = (notification) => {
    const { color } = getNotificationTypeAndTitle(notification);
    return color;
  };

  const renderNotificationItem = ({ item }) => {
    const { title, type } = getNotificationTypeAndTitle(item);
    const description = getFriendlyDescription(item);
    const isEvent = !!item.event;
    
    return (
      <TouchableOpacity
        className={`p-4 mb-3 rounded-xl shadow-sm`}
        onPress={() => handleNotificationPress(item)}
        style={[
          item.read ? styles.cardRead : styles.cardUnread
        ]}
      >
        <View className="flex-row">
          <View 
            className="h-12 w-12 rounded-full justify-center items-center" 
            style={{ backgroundColor: `${getNotificationColor(item)}15` }}
          >
            <Ionicons
              name={getNotificationIcon(item)}
              size={22}
              color={getNotificationColor(item)}
            />
          </View>
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center flex-1">
                <Text 
                  className={`text-base ${item.read ? "text-gray-800" : "text-gray-900 font-bold"}`}
                  numberOfLines={1}
                >
                  {title}
                </Text>
                {!item.read && (
                  <View className="bg-[#e01d47] h-2.5 w-2.5 rounded-full ml-2" />
                )}
              </View>
              <Text className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <Text 
              className={`text-sm mt-1 leading-5 ${item.read ? "text-gray-500" : "text-gray-700"}`}
              numberOfLines={3}
            >
              {description}
            </Text>
            
            {isEvent && item.event.startDate && item.event.endDate && (
              <View className="bg-blue-50 rounded-lg p-2 mt-2">
                <Text className="text-xs text-blue-600 font-medium">
                  📅 {formatEventTime(item.event.startDate, item.event.endDate)}
                </Text>
              </View>
            )}
            
            {type === 'task' && (
              <View className="bg-orange-50 rounded-lg p-2 mt-2">
                <Text className="text-xs text-orange-600 font-medium">
                  💼 Tap to view task details
                </Text>
              </View>
            )}

            {type === 'order' && (
              <View className="bg-red-50 rounded-lg p-2 mt-2">
                <Text className="text-xs text-red-600 font-medium">
                  📦 Tap to view order details
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View className="flex-1 justify-center items-center mt-24">
      <Ionicons name="notifications-off-outline" size={70} color="#e0e0e0" />
      <Text className="text-lg font-medium text-gray-400 mt-4">No notifications yet</Text>
      <Text className="text-sm text-gray-400 text-center mt-2 px-10">
        We'll notify you when there's something important
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white shadow-sm pt-2 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">Notifications</Text>
          {hasUnreadNotifications && (
            <TouchableOpacity
              className="py-1 px-2.5 rounded-full border border-gray-200"
              onPress={handleMarkAllRead}
            >
              <Text className="text-xs text-[#e01d47] font-medium">Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {initialLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#e01d47" />
          <Text className="text-gray-500 mt-3">Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#e01d47"]}
              tintColor="#e01d47"
            />
          }
        />
      )}
      
      <View className="absolute bottom-0 w-full">
        <Footer activeRoute="notification" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: "#e01d47",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardRead: {
    borderLeftWidth: 0,
    backgroundColor: "#fff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  }
});

export default Notification;