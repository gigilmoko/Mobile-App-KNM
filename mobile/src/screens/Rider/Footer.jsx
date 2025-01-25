import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

const Footer = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const navigationHandler = (screen) => {
        navigation.navigate(screen);
    };

    return (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.tab} onPress={() => navigationHandler('task')}>
                <Icon name="clipboard-text" style={styles.icon} />
                <Text style={styles.label}>Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => navigationHandler('history')}>
                <Icon name="history" style={styles.icon} />
                <Text style={styles.label}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => navigationHandler('account')}>
                <Icon name="account" style={styles.icon} />
                <Text style={styles.label}>My Account</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#ffb703',
        paddingVertical: 10,
        borderRadius: 10,
        width: '100%',
    },
    tab: {
        alignItems: 'center',
    },
    icon: {
        fontSize: 24,
        color: '#000',
    },
    label: {
        fontSize: 12,
        color: '#000',
    },
});

export default Footer;