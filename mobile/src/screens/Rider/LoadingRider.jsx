import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { getSingleRider } from '../../redux/actions/riderActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

const LoadingRider = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    useEffect(() => {
        const checkRider = async () => {
            const riderId = await AsyncStorage.getItem('riderId'); // Get the actual rider ID from AsyncStorage
            console.log('Retrieved riderId:', riderId); // Log the riderId to confirm
        
            if (riderId) {
                try {
                    await dispatch(getSingleRider(riderId)); // Fetch rider details using the correct ID
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'RiderStack' }],
                    });
                    Toast.show({
                        type: 'success',
                        text2: 'Welcome back, Rider!',
                    });
                } catch (error) {
                    console.error(error);
                    Toast.show({
                        type: 'error',
                        text1: 'Rider Check Failed',
                        text2: 'Please try again later.',
                    });
                    navigation.navigate('Login');
                }
            } else {
                navigation.navigate('Login');
            }
        };

        checkRider();
    }, [dispatch, navigation]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

export default LoadingRider;