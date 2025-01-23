import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RiderDashboard from "./RiderDashboard";

const Stack = createNativeStackNavigator();

const RiderStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="riderdashboard"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="riderdashboard" component={RiderDashboard} />
            
           
        </Stack.Navigator>
    );
};

export default RiderStack;