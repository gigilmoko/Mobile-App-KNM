import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventsBeforeCurrentDay, fetchEventsAfterCurrentDay } from '../../redux/actions/calendarActions';
import Header from '../../components/Layout/Header';
import Footer from '../../components/Layout/Footer';


const EventList = ({ navigation }) => {  // Add navigation as a prop to this component
    const dispatch = useDispatch();
    const { beforeCurrentDayEvents, afterCurrentDayEvents, loading, error } = useSelector(state => state.calendar);

    useEffect(() => {
        dispatch(fetchEventsBeforeCurrentDay());
        dispatch(fetchEventsAfterCurrentDay());
    }, [dispatch]);

    const [menuOpen, setMenuOpen] = useState(null);

    const handleEventPress = async (eventId) => {
        try {
        navigation.navigate("eventinfo", { eventId });
        } catch (error) {
        Toast.show({
            type: 'error',
            text1: 'Failed to navigate to event details',
            text2: error?.message || 'Please try again',
        });
        }
    };

    const renderEventItem = (item, isUpcoming) => (
        <TouchableOpacity
        onPress={() => handleEventPress(item._id)}
        style={{
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            paddingVertical: 20,
            paddingHorizontal: 16,
            backgroundColor: isUpcoming ? '#e0f7fa' : 'white',
        }}
        >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>{item.title}</Text>
        </View>
        <Text style={{
            fontSize: 12,
            color: '#777',
            position: 'absolute',
            bottom: 8,
            right: 16,
        }}>
            {new Date(item.startDate).toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' })}
        </Text>
        </TouchableOpacity>
    );
    return (
        <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
        <Header back={true} />
        {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>Loading...</Text>
        ) : error ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: 'red' }}>{error}</Text>
        ) : (
            <>
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 40, marginLeft: 16 }}>Upcoming Events</Text>
                {afterCurrentDayEvents.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No upcoming events available.</Text>
                ) : (
                <FlatList
                    data={afterCurrentDayEvents}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 20,
                    }}
                    renderItem={({ item }) => renderEventItem(item, true)}
                />
                )}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 40, marginLeft: 16 }}>Finished Events</Text>
                {beforeCurrentDayEvents.length === 0 ? (
                <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No finished events available.</Text>
                ) : (
                <FlatList
                    data={beforeCurrentDayEvents}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 12,
                    paddingBottom: 40,
                    }}
                    renderItem={({ item }) => renderEventItem(item, false)}
                />
                )}
            </View>
            </>
        )}


        <View style={styles.footerContainer}>
            <Footer activeRoute="events" />
        </View>
        </View>
    );
};


const styles = StyleSheet.create({
    footerContainer: {
        flex: 0.15, // Occupy 20% of the screen height
        justifyContent: 'flex-end', // Align footer to the bottom
    },
});


export default EventList;



