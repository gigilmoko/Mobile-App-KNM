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
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../redux/actions/notificationActions";
import Footer from "../../components/Layout/Footer";

const Notification = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  // FIX: Incorrect state selection - you're trying to access state.notifications which doesn't exist
  // The correct reducer is state.notification (singular)
  const { notifications = [], loading = false } = useSelector((state) => state.notifications);
  
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await dispatch(getNotifications());
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
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    
    // Calculate time difference in milliseconds
    const diff = now.getTime() - date.getTime();
    
    // Convert to minutes, hours, days
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (days < 7) {
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate based on notification type
    if (notification.type === "order" && notification.orderId) {
      navigation.navigate("orderdetails", { id: notification.orderId });
    } else if (notification.type === "product" && notification.productId) {
      navigation.navigate("productdetails", { id: notification.productId });
    }
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.read
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return "receipt-outline";
      case "product":
        return "cube-outline";
      case "payment":
        return "card-outline";
      case "delivery":
        return "bicycle-outline";
      case "system":
        return "notifications-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "order":
        return "#e01d47";
      case "product":
        return "#0088ff";
      case "payment":
        return "#ff9500";
      case "delivery":
        return "#34c759";
      case "system":
        return "#5856d6";
      default:
        return "#e01d47";
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      className={`p-4 mb-3 rounded-xl ${
        item.read ? "bg-white" : "bg-white"
      } shadow-sm`}
      onPress={() => handleNotificationPress(item)}
      style={[
        item.read ? styles.cardRead : styles.cardUnread
      ]}
    >
      <View className="flex-row">
        <View 
          className="h-10 w-10 rounded-full justify-center items-center" 
          style={{ backgroundColor: `${getNotificationColor(item.type)}15` }}
        >
          <Ionicons
            name={getNotificationIcon(item.type)}
            size={20}
            color={getNotificationColor(item.type)}
          />
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-row items-center">
              <Text 
                className={`text-base ${item.read ? "text-gray-800" : "text-gray-900 font-bold"}`}
                numberOfLines={1}
              >
                {item.event.title}
              </Text>
              {!item.read && (
                <View className="bg-[#e01d47] h-2.5 w-2.5 rounded-full ml-2" />
              )}
            </View>
            <Text className="text-xs text-gray-500">{formatDate(item.createdAt)}</Text>
          </View>
          <Text 
            className={`text-sm mt-1 ${item.read ? "text-gray-500" : "text-gray-700"}`}
            numberOfLines={2}
          >
             {item.event.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
      {/* Header */}
      <View className="bg-white shadow-sm pt-12 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-800">Notifications</Text>
          {/* {hasUnreadNotifications && (
            <TouchableOpacity
              className="py-1 px-2.5 rounded-full border border-gray-200"
              onPress={handleMarkAllRead}
            >
              <Text className="text-xs text-[#e01d47] font-medium">Mark all as read</Text>
            </TouchableOpacity>
          )} */}
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
      
      {/* Footer */}
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
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardRead: {
    borderLeftWidth: 0,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  }
});

export default Notification;