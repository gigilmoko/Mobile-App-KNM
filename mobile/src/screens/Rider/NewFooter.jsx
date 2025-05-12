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
            <TouchableOpacity
                style={[
                    styles.tab,
                    route.name === 'leaflet' ? styles.activeTab : null,
                ]}
                onPress={() => navigationHandler('leaflet')}
            >
                <Icon
                    name="clipboard-text"
                    style={[
                        styles.icon,
                        route.name === 'leaflet' ? styles.activeIcon : null,
                    ]}
                />
                <Text
                    style={[
                        styles.label,
                        route.name === 'leaflet' ? styles.activeLabel : null,
                    ]}
                >
                    Task
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tab,
                    route.name === 'history' ? styles.activeTab : null,
                ]}
                onPress={() => navigationHandler('history')}
            >
                <Icon
                    name="history"
                    style={[
                        styles.icon,
                        route.name === 'history' ? styles.activeIcon : null,
                    ]}
                />
                <Text
                    style={[
                        styles.label,
                        route.name === 'history' ? styles.activeLabel : null,
                    ]}
                >
                    History
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.tab,
                    route.name === 'account' ? styles.activeTab : null,
                ]}
                onPress={() => navigationHandler('account')}
            >
                <Icon
                    name="account"
                    style={[
                        styles.icon,
                        route.name === 'account' ? styles.activeIcon : null,
                    ]}
                />
                <Text
                    style={[
                        styles.label,
                        route.name === 'account' ? styles.activeLabel : null,
                    ]}
                >
                    My Account
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    tab: {
        alignItems: 'center',
        paddingVertical: 5,
    },
    icon: {
        fontSize: 24,
        color: '#aaa',
    },
    label: {
        fontSize: 12,
        color: '#aaa',
    },
    activeTab: {
        borderTopWidth: 2,
        borderTopColor: '#e01d47',
    },
    activeIcon: {
        color: '#e01d47',
    },
    activeLabel: {
        color: '#e01d47',
    },
});

export default Footer;