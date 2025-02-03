import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "./src/redux/actions/userActions";
import Toast from 'react-native-toast-message';

//ONE SIGNAL
import { LogLevel, OneSignal } from 'react-native-onesignal';
import Constants from "expo-constants";



// Import Screens
import Home from "./src/screens/Home";
import Login from "./src/screens/User/Login";
import SignUp from "./src/screens/User/SignUp";
import MyAccount from "./src/screens/User/MyAccount";
import ChangePassword from "./src/screens/User/ChangePassword";
import UpdateProfile from "./src/screens/User/UpdateProfile";
import Cart from "./src/screens/Cart/Cart";
import Wishlist from "./src/screens/Products/Wishlist";
import ConfirmOrder from "./src/screens/Cart/ConfirmOrder";
import MyOrders from "./src/screens/User/MyOrders";
import ProductDetails from "./src/screens/Products/ProductDetails";
import NotificationScreen from "./src/screens/Notification/Notification";
import EventInfo from "./src/screens/Calendar/EventInfo";
import EventList from "./src/screens/Calendar/EventList";
import Feedback from "./src/screens/User/Feedback";
import Dashboard from "./src/screens/Admin/Dashboard";
import AdminCategory from "./src/screens/Admin/Category/AdminCategory";
import AdminEvents from "./src/screens/Admin/Events/AdminEvents";
import AdminOrders from "./src/screens/Admin/Order/AdminOrders";
import AdminProducts from "./src/screens/Admin/Product/AdminProducts";
import AdminOrdersDetails from "./src/screens/Admin/Order/AdminOrdersDetails";
import AdminProductsUpdate from "./src/screens/Admin/Product/AdminProductsUpdate";
import AdminProductsCreate from "./src/screens/Admin/Product/AdminProductsCreate";
import AdminCategoryUpdate from "./src/screens/Admin/Category/AdminCategoryUpdate";
import AdminCategoryCreate from "./src/screens/Admin/Category/AdminCategoryCreate";
import OrderDetails from "./src/screens/User/OrderDetails";
import ProductFeedback from "./src/screens/User/ProductFeedback";
import AdminCreateEvent from "./src/screens/Admin/Events/AdminEventCreate";
import AdminEventUpdate from "./src/screens/Admin/Events/AdminEventUpdate";
import EventFeedback from "./src/screens/User/EventFeedback";
import AddressUpdate from "./src/screens/Address/AddressUpdate";
import EditAddress from "./src/screens/Address/EditAddress";
import LoadingRider from "./src/screens/Rider/LoadingRider";
import RiderStack from "./src/screens/Rider/RiderStack";
import ForgetPassword from "./src/screens/User/ForgetPassword";

const Stack = createNativeStackNavigator();

// OneSignal.Debug.setLogLevel(LogLevel.Verbose);
// OneSignal.initialize(Constants.expoConfig.extra.oneSignalAppId);

// // Also need enable notifications to complete OneSignal setup
// OneSignal.Notifications.requestPermission(true);

const HomeStack = () => {
    return (
        <Stack.Navigator
            initialRouteName="home"
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="home" component={Home} />
            <Stack.Screen name="cart" component={Cart} />
            <Stack.Screen name="notification" component={NotificationScreen} />
            <Stack.Screen name="eventinfo" component={EventInfo} />
            <Stack.Screen name="eventlist" component={EventList} />
            <Stack.Screen name="feedback" component={Feedback} />
            <Stack.Screen name="productfeedback" component={ProductFeedback} />
            <Stack.Screen name="eventfeedback" component={EventFeedback} />
            <Stack.Screen name="wishlist" component={Wishlist} />
            <Stack.Screen name="confirmorder" component={ConfirmOrder} />
            <Stack.Screen name="myorders" component={MyOrders} />
            <Stack.Screen name="orderdetails" component={OrderDetails} />
            <Stack.Screen name="productdetail" component={ProductDetails} />
            <Stack.Screen name="signup" component={SignUp} />
            <Stack.Screen name="login" component={Login} />
            <Stack.Screen name="myaccount" component={MyAccount} />
            <Stack.Screen name="changepassword" component={ChangePassword} />
            <Stack.Screen name="updateprofile" component={UpdateProfile} />
            <Stack.Screen name="addressupdate" component={AddressUpdate} />
            
            <Stack.Screen name="editaddress" component={EditAddress} />
            <Stack.Screen name="forgetpassword" component={ForgetPassword} />
            {/* Admin Screens */}
            <Stack.Screen name="dashboard" component={Dashboard} />
            <Stack.Screen name="adminproducts" component={AdminProducts} />
            <Stack.Screen name="adminproductsupdate" component={AdminProductsUpdate} />
            <Stack.Screen name="adminproductscreate" component={AdminProductsCreate} />
            <Stack.Screen name="admincategory" component={AdminCategory} />
            <Stack.Screen name="admincategoryupdate" component={AdminCategoryUpdate} />
            <Stack.Screen name="admincategorycreate" component={AdminCategoryCreate} />
            <Stack.Screen name="adminorders" component={AdminOrders} />
            <Stack.Screen name="adminordersdetails" component={AdminOrdersDetails} />
            <Stack.Screen name="adminevents" component={AdminEvents} />
            <Stack.Screen name="admineventcreate" component={AdminCreateEvent} />
            <Stack.Screen name="admineventupdate" component={AdminEventUpdate} />

            <Stack.Screen name="loadingrider" component={LoadingRider} />

            {/* Rider Stack */}
            <Stack.Screen name="RiderStack" component={RiderStack} />
        </Stack.Navigator>
    );
};

const Main = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        if (!user || Object.keys(user).length === 0) {
            dispatch(loadUser());
        }
    }, [dispatch]);

    return (
        <NavigationContainer>
            <HomeStack />
            <Toast />
        </NavigationContainer>
    );
};

export default Main;
