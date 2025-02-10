import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import History from './History';
import MyAccount from './MyAccountRider';
import Task from './Task';
import ChangePassword from "./ChangePassword";
import LeafletTry from "./LeafletTry";
import CameraCapture from "./CameraCapture";
const Stack = createNativeStackNavigator();

const RiderStack = () => {
    return (
        // <NavigationContainer>
        <Stack.Navigator
            initialRouteName="task"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="task" component={Task} />
            <Stack.Screen name="history" component={History} />
            <Stack.Screen name="account" component={MyAccount} />
            <Stack.Screen name="changepassword" component={ChangePassword} />
            {/* <Stack.Screen name="ongoingsession" component={OngoingSession} /> */}
            <Stack.Screen name="leaflet" component={LeafletTry} />
            <Stack.Screen name="cameracomponent" component={CameraCapture} />
            
           
        </Stack.Navigator>
    );
};

export default RiderStack;