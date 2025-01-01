import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, deleteNotification, deleteAllNotifications, toggleNotificationReadStatus } from '../../redux/actions/notificationActions';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import { useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

const NotificationScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const notifications = useSelector(state => state.notifications.notifications || []);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            await dispatch(getNotifications());
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to load notifications',
                text2: error?.message || 'Please check your connection',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleToggleUnread = async (notifId) => {
        try {
            await dispatch(toggleNotificationReadStatus(notifId));
            fetchNotifications();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to toggle read status',
                text2: error?.message || 'Please try again',
            });
        }
    };

    const handleNotificationPress = async (notifId, eventId) => {
        try {
            await dispatch(toggleNotificationReadStatus(notifId));
            navigation.navigate("eventinfo", { eventId });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to mark as read and navigate',
                text2: error?.message || 'Please try again',
            });
        }
    };

    const handleDeleteNotification = async (notifId) => {
        try {
            await dispatch(deleteNotification(notifId));
            Toast.show({
                type: 'success',
                text1: 'Notification deleted successfully',
            });
            fetchNotifications();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to delete notification',
                text2: error?.message || 'Please try again',
            });
        }
    };

    const handleDeleteAllNotifications = async () => {
        try {
            await dispatch(deleteAllNotifications());
            Toast.show({
                type: 'success',
                text1: 'All notifications deleted successfully',
            });
            fetchNotifications();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to delete all notifications',
                text2: error?.message || 'Please try again',
            });
        }
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

    const unreadCount = notifications.filter(notification => !notification.read).length;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Header back={true} />
            {loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Unread Messages: {unreadCount}</Text>
                    </View>
                    {notifications.length === 0 ? (
                        <Text style={styles.noNotificationsText}>No notifications available.</Text>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.flatListContent}
                            renderItem={({ item }) => (
                                <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}>
                                    <TouchableOpacity
                                        onPress={() => handleNotificationPress(item._id, item.event._id)}
                                        style={[
                                            styles.notificationItem,
                                            item.read ? styles.readNotification : styles.unreadNotification
                                        ]}
                                    >
                                        <Text style={styles.notificationTitle}>{item.title}</Text>
                                        <Text style={styles.notificationDescription}>{item.description}</Text>
                                    </TouchableOpacity>
                                </Swipeable>
                            )}
                            ListFooterComponent={
                                <TouchableOpacity onPress={handleDeleteAllNotifications}>
                                    <Text style={styles.deleteAllText}>Delete All Notifications</Text>
                                </TouchableOpacity>
                            }
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
        backgroundColor: "#f0f0f0",
    },
    loadingText: {
        textAlign: "center",
        color: "#888",
        marginTop: 20,
    },
    header: {
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
    },
    noNotificationsText: {
        textAlign: "center",
        color: "#888",
        marginTop: 20,
    },
    flatListContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    notificationItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        paddingVertical: 16,
        paddingHorizontal: 8,
        position: "relative",
        paddingBottom: 5,
    },
    readNotification: {
        backgroundColor: "#fff",
    },
    unreadNotification: {
        backgroundColor: "#FEEE91",
    },
    notificationTitle: {
        color: "#333",
        fontWeight: "bold",
    },
    notificationDescription: {
        color: "#666",
        fontSize: 14,
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
        marginRight: 10,
    },
    swipeActionDelete: {
        padding: 10,
        borderRadius: 5,
        borderColor: "#ffb703",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    deleteAllText: {
        color: "red",
        textAlign: "center",
        marginVertical: 16,
        fontSize: 14,
    },
});

export default NotificationScreen;