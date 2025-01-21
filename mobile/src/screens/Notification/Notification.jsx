import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, deleteNotification, deleteAllNotifications, toggleNotificationReadStatus } from '../../redux/actions/notificationActions';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../../components/Layout/Footer';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';  
import moment from 'moment';

const NotificationScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const notifications = useSelector(state => state.notifications.notifications || []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            await dispatch(getNotifications());
            setLoading(false);
        };
        fetchNotifications();
    }, [dispatch]);

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

    const renderRightActions = (item) => {
        return (
            <View style={styles.swipeActionsContainer}>
                <TouchableOpacity
                    style={styles.swipeActionToggle}
                    onPress={() => handleToggleUnread(item._id)}
                >
                    <Icon name={item.read ? "eye-off" : "eye"} size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.swipeActionDelete}
                    onPress={() => handleDeleteNotification(item._id)}
                >
                    <Icon name="trash-can" size={24} color="red" />
                </TouchableOpacity>
            </View>
        );
    };

    const formatDate = (date) => {
        const now = moment();
        const notificationDate = moment(date);
        const diff = now.diff(notificationDate, 'minutes');

        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff} min ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
        if (diff < 10080) return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? 's' : ''} ago`;
        if (diff < 40320) return `${Math.floor(diff / 10080)} week${Math.floor(diff / 10080) > 1 ? 's' : ''} ago`;
        return notificationDate.format('MM/DD');
    };

    const unreadCount = notifications.filter(notification => !notification.read).length;

    const renderItem = useCallback(({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item)}>
            <TouchableOpacity
                onPress={() => handleNotificationPress(item._id, item.event?._id)}
                style={[styles.notificationItem, { backgroundColor: item.read ? '#ffffff' : '#f0f0f0', borderRadius: 5 }]}
            >
                {item.event && (
                    <View style={styles.notificationTextContainer}>
                        <Text style={styles.notificationTitle}>
                            {`New event: ${item.event.title}`}
                        </Text>
                        <Text style={styles.notificationDescription} numberOfLines={2}>
                            {item.event.description}
                        </Text>
                    </View>
                )}
                <Text style={styles.notificationDate}>{formatDate(item.createdAt)}</Text>
            </TouchableOpacity>
        </Swipeable>
    ), []);

    const keyExtractor = useCallback((item) => item._id, []);

    const getItemLayout = useCallback((data, index) => ({
        length: 100,
        offset: 100 * index,
        index,
    }), []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Events</Text>
            </View>
            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : (
                <>
                    <View style={styles.unreadCountContainer}>
                        <Text style={styles.unreadCountText}>Unread Messages: {unreadCount}</Text>
                    </View>
                    {notifications.length === 0 ? (
                        <Text style={styles.noNotificationsText}>No notifications available.</Text>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={keyExtractor}
                            contentContainerStyle={styles.flatListContent}
                            renderItem={renderItem}
                            getItemLayout={getItemLayout}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={21}
                        />
                    )}
                </>
            )}
            <Footer activeRoute={"notifications"} />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    loadingText: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    backButton: {
        position: "absolute",
        left: 10,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "bold",
    },
    unreadCountContainer: {
        padding: 10,
    },
    unreadCountText: {
        fontSize: 14,
    },
    noNotificationsText: {
        textAlign: "center",
        color: "#888",
    },
    flatListContent: {
        marginHorizontal: 10,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: "#ffb703",
        paddingVertical: 8,
        paddingHorizontal: 8,
    },
    notificationTextContainer: {
        flex: 1,
    },
    notificationTitle: {
        color: "#333",
        fontWeight: "bold",
    },
    notificationDescription: {
        color: "#666",
        fontSize: 14,
    },
    notificationDate: {
        color: "#888",
        fontSize: 12,
        paddingLeft: 10, 
    },
    swipeActionsContainer: {
        flexDirection: 'row',
    },
    swipeActionToggle: {
        padding: 10,
        borderRadius: 5,
        borderColor: "#ffb703",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
    },
    swipeActionDelete: {
        padding: 10,
        borderRadius: 5,
        borderColor: "#ffb703",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
    },
    deleteAllText: {
        color: "red",
        textAlign: "center",
        marginVertical: 16,
        fontSize: 14,
    },
});

export default NotificationScreen;