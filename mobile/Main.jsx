import React, { useEffect } from "react";
import {
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import 'react-native-gesture-handler';
import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Text,
    ImageBackground,
    Image,
    TouchableOpacity,
} from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Home from "./src/screens/Home";
import Login from "./src/screens/User/Login";
import { useDispatch, useSelector } from "react-redux";
import { loadUser, logout } from "./src/redux/actions/userActions";
import Toast from 'react-native-toast-message';
import { useMessageAndErrorUser } from "./utils/hooks";
import SignUp from "./src/screens/User/SignUp";
import Profile from "./src/screens/User/Profile";
import MyAccount from "./src/screens/User/MyAccount";
import ChangePassword from "./src/screens/User/ChangePassword";
import UpdateProfile from "./src/screens/User/UpdateProfile";
import Cart from "./src/screens/Cart/Cart";
import Wishlist from "./src/screens/Wishlist";
import ConfirmOrder from "./src/screens/Cart/ConfirmOrder";
import MyOrders from "./src/screens/User/MyOrders";
import ProductDetails from "./src/screens/ProductDetails";
import NotificationScreen from "./src/screens/Notification/Notification";
import EventInfo from "./src/screens/Calendar/EventInfo";
import EventList from "./src/screens/Calendar/EventList";
import Feedback from "./src/screens/User/Feedback";


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
    const { user, isAuthenticated } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { navigation } = props;
    const loading = useMessageAndErrorUser(navigation, dispatch, "myaccount");
    const loadingSignOut = useMessageAndErrorUser(navigation, dispatch, "myaccount");

    const logoutHandler = () => {
        dispatch(logout());
        dispatch({ type: "resetContacts" });
    };

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <ImageBackground
                    source={require('./src/assets/images/bg5.png')}
                    style={{ flex: 1, alignItems: 'center', padding: 20 }}
                >
                    {!loading && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                if (isAuthenticated) navigation.navigate("profile");
                                else navigation.navigate("login");
                            }}
                        >
                            <Image
                                source={user?.avatar && user.avatar.url ? { uri: user.avatar.url } : require("./src/assets/images/default-user-icon.jpg")}
                                style={{ height: 100, width: 100, borderRadius: 50, marginBottom: 10 }}
                            />
                        </TouchableOpacity>
                    )}
                    {!loading && (
                        <>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    if (isAuthenticated) navigation.navigate("profile");
                                    else navigation.navigate("login");
                                }}
                            >
                                <Text style={{ color: 'white', fontSize: 20, fontWeight: '500', textShadowRadius: 3 }}>
                                    {user?.name || 'Login'}
                                </Text>
                            </TouchableOpacity>
                            <Text style={{ color: 'white', fontSize: 16, marginBottom: 10, textShadowRadius: 3 }}>
                                {user?.email}
                            </Text>
                        </>
                    )}
                </ImageBackground>
                <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
                    <DrawerItemList {...props} />
                </View>
            </DrawerContentScrollView>
            <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#cccccc' }}>
                <TouchableOpacity style={{ paddingVertical: 15 }} onPress={() => { }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="share-social-outline" size={22} />
                        <Text style={{ fontSize: 16, fontWeight: '500', marginLeft: 10 }}>Tell a Friend</Text>
                    </View>
                </TouchableOpacity>
                {user && !loadingSignOut && (
                    <TouchableOpacity onPress={logoutHandler} style={{ paddingVertical: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="exit-outline" size={22} />
                            <Text style={{ fontSize: 16, fontWeight: '500', marginLeft: 10 }}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const HomeStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="home"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Group>
                <Stack.Screen name="home" component={Home} />
                <Stack.Screen name="cart" component={Cart} />
                <Stack.Screen name="notification" component={NotificationScreen} />
                <Stack.Screen name="eventinfo" component={EventInfo} />
                <Stack.Screen name="eventlist" component={EventList} />
                <Stack.Screen name="feedback" component={Feedback} />


                <Stack.Screen name="wishlist" component={Wishlist} />
                <Stack.Screen name="confirmorder" component={ConfirmOrder} />
                <Stack.Screen name="myorders" component={MyOrders} />
                <Stack.Screen name="productdetail" component={ProductDetails} />


                <Stack.Screen name="signup" component={SignUp} />
                <Stack.Screen name="login" component={Login} />
                <Stack.Screen name="profile" component={Profile} />
                <Stack.Screen name="myaccount" component={MyAccount} />
                <Stack.Screen name="changepassword" component={ChangePassword} />
                <Stack.Screen name="updateprofile" component={UpdateProfile} />
            </Stack.Group>
        </Stack.Navigator>
    );
};

const Main = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        console.log("Loading user data...");
        dispatch(loadUser(user));
    }, [dispatch]);

    return (    
        <NavigationContainer>
            <Drawer.Navigator
                initialRouteName="Home"
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    headerShown: false,
                    drawerActiveBackgroundColor: '#bc430b',
                    drawerActiveTintColor: '#fff',
                    drawerInactiveTintColor: '#333',
                    drawerLabelStyle: {
                        marginLeft: -20,
                        fontSize: 15,
                    },
                }}
            >
                <Drawer.Screen
                    name="Home"
                    component={HomeStack}
                    options={{
                        drawerIcon: ({ color }) => (
                            <Ionicons name="home-outline" size={22} color={color} />
                        ),
                    }}
                />
            </Drawer.Navigator>
            <Toast />
        </NavigationContainer>
    );
};

export default Main;
