import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, deleteNotification, deleteAllNotifications, toggleNotificationReadStatus } from '../../redux/actions/notificationActions';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../../components/Layout/Footer';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Header from '../../components/Layout/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const notifications = useSelector(state => state.notifications.notifications || []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                navigation.navigate('login');
                return false;
            }
            return true;
        };

        const fetchNotifications = async () => {
            const isLoggedIn = await checkLoginStatus();
            if (isLoggedIn) {
                await dispatch(getNotifications());
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [dispatch, navigation]);

    const handleToggleUnread = async (notifId) => {
        try {
            await dispatch(toggleNotificationReadStatus(notifId));
            dispatch(getNotifications());
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to toggle read status',
                text2: error?.message || 'Please try again',
            });
        }
    };

    const handleNotificationPress = async (notifId, eventId) => {
        await dispatch(toggleNotificationReadStatus(notifId));
        navigation.navigate("eventinfo", { eventId });
    };

    const handleDeleteNotification = async (notifId) => {
        await dispatch(deleteNotification(notifId));
        Toast.show({
            type: 'success',
            text1: 'Notification deleted successfully',
        });
        dispatch(getNotifications());
    };

    const renderRightActions = (item) => (
        <View className="flex-row">
            <TouchableOpacity
                className="p-2 rounded border border-yellow-500 justify-center items-center m-1"
                onPress={() => handleToggleUnread(item._id)}
            >
                <Icon name={item.read ? "eye-off" : "eye"} size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
                className="p-2 rounded border border-yellow-500 justify-center items-center m-1"
                onPress={() => handleDeleteNotification(item._id)}
            >
                <Icon name="trash-can" size={24} color="red" />
            </TouchableOpacity>
        </View>
    );

    const formatDate = (date) => {
        const now = moment().tz("Asia/Manila");
        const notificationDate = moment(date).tz("Asia/Manila");
        const diff = now.diff(notificationDate, 'minutes');

        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff} min ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
        if (diff < 10080) return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? 's' : ''} ago`;
        if (diff < 40320) return `${Math.floor(diff / 10080)} week${Math.floor(diff / 10080) > 1 ? 's' : ''} ago`;
        return notificationDate.format('MM/DD');
    };

    const today = moment().tz("Asia/Manila").format("YYYY-MM-DD");
    const todayNotifications = notifications.filter(notif =>
        moment(notif.createdAt).tz("Asia/Manila").format("YYYY-MM-DD") === today
    );
    const otherNotifications = notifications.filter(notif =>
        moment(notif.createdAt).tz("Asia/Manila").format("YYYY-MM-DD") !== today
    );

    return (
        <GestureHandlerRootView className="flex-1 bg-white">
            <View className="px-5 py-5">
                <View className="flex items-center">
                    <Header title="Notification" />
                </View>
            </View>

            {loading ? (
                <Text className="flex-1 justify-center items-center">Loading...</Text>
            ) : (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    {/* Today’s Notifications */}
                    <View>
                        <Text className="text-lg font-bold text-[#e01d47] mb-2">Today</Text>
                        {todayNotifications.length === 0 ? (
                            <Text className="text-center text-gray-500 mb-4">No notifications for today.</Text>
                        ) : (
                            todayNotifications.map((item) => (
                                <Swipeable key={item._id} renderRightActions={() => renderRightActions(item)}>
                                    <TouchableOpacity
                                            onPress={() => handleNotificationPress(item._id, item.event?._id)}
                                            className={`flex-row items-center p-2 mb-2 rounded`}
                                            style={{ backgroundColor: item.read ? '#fafaff' : '#fce8ec' }} // Color based on read status
                                        >
                                            <Image
                                                source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741731158/image_2025-03-12_061207062-removebg-preview_hsp3wa.png" }}
                                                className="w-10 h-10 mr-3" // Adjust width & height as needed
                                                resizeMode="contain"
                                            />
                                            {item.event && (
                                                <View className="flex-1">
                                                    <Text className="text-[#e01d47] font-bold">
                                                        {`New event: ${item.event.title}`}
                                                    </Text>
                                                    <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                                        {item.event.description}
                                                    </Text>
                                                </View>
                                            )}
                                            <Text className="text-gray-500 text-xs pl-2">{formatDate(item.createdAt)}</Text>
                                        </TouchableOpacity>
                                                                        </Swipeable>
                            ))
                        )}
                    </View>

                    {/* Other Notifications */}
                    {otherNotifications.length > 0 && (
                        <View className="mt-4">
                            <Text className="text-lg font-bold text-[#e01d47] mb-2">Other Notifications</Text>
                            {otherNotifications.map((item) => (
                                <Swipeable key={item._id} renderRightActions={() => renderRightActions(item)}>
                                    <TouchableOpacity
                                        onPress={() => handleNotificationPress(item._id, item.event?._id)}
                                        className={`flex-row items-center p-2 mb-2 rounded`}
                                        style={{ backgroundColor: item.read ? '#fafaff' : '#fce8ec' }} // Color based on read status
                                    >
                                        <Image
                                            source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741731158/image_2025-03-12_061207062-removebg-preview_hsp3wa.png" }}
                                            className="w-14 h-14 mr-3" // Adjust width & height as needed
                                            resizeMode="contain"
                                        />
                                        {item.event && (
                                            <View className="flex-1">
                                                <Text className="text-[#e01d47] font-bold">
                                                    {`New event: ${item.event.title}`}
                                                </Text>
                                                <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                                    {item.event.description}
                                                </Text>
                                            </View>
                                        )}
                                        <Text className="text-gray-500 text-xs pl-2">{formatDate(item.createdAt)}</Text>
                                    </TouchableOpacity>
                                </Swipeable>
                            ))}
                        </View>
                    )}
                </ScrollView>
            )}
            <Footer activeRoute={"notifications"} />
        </GestureHandlerRootView>
    );
};


export default NotificationScreen;