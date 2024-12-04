import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications, deleteNotification, deleteAllNotifications, toggleNotificationReadStatus } from '../../redux/actions/notificationActions';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import tw from 'twrnc';
import Footer from '../../components/Layout/Footer';
import Header from '../../components/Layout/Header';
import { useNavigation } from '@react-navigation/native';


const NotificationScreen = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const notifications = useSelector(state => state.notifications.notifications || []);
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(null);


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
        
        }
    };
    
    
    const handleNotificationPress = async (notifId, eventId) => {
        try {
            // Attempt to toggle the notification read status
            await dispatch(toggleNotificationReadStatus(notifId));
            // Navigate to the event information screen, passing eventId as a parameter
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
            setMenuOpen(null);
            // Refresh notifications after deletion
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
            // Refresh notifications after deleting all
            fetchNotifications();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to delete all notifications',
                text2: error?.message || 'Please try again',
            });
        }
    };


    return (
        <View style={tw`flex-1 bg-gray-100`}>
            <Header back={true} />
            {loading ? (
                <Text style={tw`text-center text-gray-500 mt-6`}>Loading...</Text>
            ) : (
                <>
                    {notifications.length === 0 ? (
                        <Text style={tw`text-center text-gray-500 mt-6`}>No notifications available.</Text>
                    ) : (
                        <FlatList
                            data={notifications}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={tw`px-4 pt-4`}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleNotificationPress(item._id, item.event._id)}
                                    style={[
                                        tw`border-b border-gray-300 py-4`,
                                        item.read ? tw`bg-white` : tw`bg-blue-100`
                                    ]}
                                >
                                    <Text style={tw`text-gray-800 font-medium`}>{item.title}</Text>
                                    <Text style={tw`text-gray-600 text-sm`}>{item.description}</Text>


                                    <View style={tw`absolute top-2 right-2 flex-row`}>
                                        <TouchableOpacity
                                            onPress={() => setMenuOpen(menuOpen === item._id ? null : item._id)}
                                            style={tw`p-2`}
                                        >
                                            <Icon name="dots-vertical" size={24} color="black" />
                                        </TouchableOpacity>
                                    </View>


                                    {menuOpen === item._id && (
                                        <View style={tw`absolute right-2 top-8 bg-white shadow-lg p-2 rounded flex-row`}>
                                            <TouchableOpacity
                                                onPress={() => handleDeleteNotification(item._id)}
                                                style={tw`p-2`}
                                            >
                                                <Icon name="trash-can" size={24} color="red" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleToggleUnread(item._id)}
                                                style={tw`p-2`}
                                            >
                                                <Icon name={item.read ? "eye-off" : "eye"} size={24} color="black" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => setMenuOpen(null)}
                                                style={tw`p-2`}
                                            >
                                                <Icon name="close" size={24} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            )}
                            ListFooterComponent={
                                <TouchableOpacity onPress={handleDeleteAllNotifications}>
                                    <Text style={tw`text-red-500 text-center mt-4 mb-4 text-sm`}>Delete All Notifications</Text>
                                </TouchableOpacity>
                            }
                        />
                    )}
                </>
            )}
            <Footer activeRoute={"notifications"} />
        </View>
    );
};


export default NotificationScreen;



