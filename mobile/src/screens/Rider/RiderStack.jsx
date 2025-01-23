import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RiderDashboard from "./RiderDashboard";
import { NavigationContainer } from "@react-navigation/native";
import OngoingSession from "./OngoingSession";
const Stack = createNativeStackNavigator();

const RiderStack = () => {
    return (
        // <NavigationContainer>
        <Stack.Navigator
            initialRouteName="riderdashboard"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="riderdashboard" component={RiderDashboard} />
            <Stack.Screen name="ongoingsession" component={OngoingSession} />
            
           
        </Stack.Navigator>
        // </NavigationContainer>
    );
};

export default RiderStack;