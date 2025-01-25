import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import History from './History';
// import MyAccount from './MyAccount';
import Task from './Task';

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
            {/* <Stack.Screen name="account" component={MyAccount} /> */}
            {/* <Stack.Screen name="ongoingsession" component={OngoingSession} /> */}
            
           
        </Stack.Navigator>
    );
};

export default RiderStack;