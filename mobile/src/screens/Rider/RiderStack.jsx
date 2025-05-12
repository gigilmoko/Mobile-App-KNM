import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import History from './History';
import MyAccount from './MyAccountRider';
import ChangePassword from "./ChangePassword";
import Leaflet from "./Leaflet";

const Stack = createNativeStackNavigator();

const RiderStack = () => {
    return (
        // <NavigationContainer>
        <Stack.Navigator
            initialRouteName="leaflet"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="leaflet" component={Leaflet} />
            <Stack.Screen name="history" component={History} />
            <Stack.Screen name="account" component={MyAccount} />
            <Stack.Screen name="changepassword" component={ChangePassword} />
            {/* <Stack.Screen name="ongoingsession" component={OngoingSession} /> */}
           
        
            
           
        </Stack.Navigator>
    );
};

export default RiderStack;