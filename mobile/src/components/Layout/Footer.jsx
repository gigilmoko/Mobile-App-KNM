import { View, TouchableOpacity, Text } from "react-native";
import React, { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const Footer = ({ activeRoute }) => {
    const navigate = useNavigation();
    const route = useRoute();
    const { isAuthenticated } = useSelector((state) => state.user);
    const { cartItems } = useSelector((state) => state.cart);
    
    // Use passed activeRoute prop, or fallback to route.name
    const currentRoute = activeRoute || route.name;

    // Calculate total items in cart
    const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        // console.log("isAuthenticated state:", isAuthenticated);
    }, [isAuthenticated]);

    const navigationHandler = (key) => {
        switch (key) {
            case 0:
                navigate.navigate("home");
                break;
            case 1:
                navigate.navigate("cart");
                break;
            case 2:
                navigate.navigate("eventlist");
                break;
            case 3:
                navigate.navigate("notification");
                break;
            case 4:
                if (isAuthenticated) {
                    navigate.navigate("myaccount");
                } else {
                    navigate.navigate("login");
                }
                break;
            default:
                navigate.navigate("home");
                break;
        }
    };

    const menuItems = [
        { key: 0, name: "home", label: "Home", routeName: "home" },
        { key: 1, name: "cart", label: "Cart", routeName: "cart" },
        { key: 2, name: "calendar-month", label: "Events", routeName: "eventlist" },
        { key: 3, name: "bell", label: "Notifications", routeName: "notification" },
        { key: 4, name: "account", label: "Profile", routeName: "profile" }
    ];

    return (
        <View
            className="bg-white w-full bottom-0 justify-center items-center h-[70px] shadow-md border-t border-gray-100"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 5
            }}
        >
            <View className="flex-row justify-evenly items-center w-full">
                {menuItems.map((item) => {
                    const isActive = 
                        currentRoute === item.routeName || 
                        (item.routeName === "profile" && currentRoute === "myaccount");
                    
                    return (
                        <TouchableOpacity
                            key={item.key}
                            className="items-center justify-center px-2 py-1"
                            onPress={() => navigationHandler(item.key)}
                        >
                            <View className="relative">
                                {isActive ? (
                                    // Active state with more prominent background
                                    <View className="items-center justify-center p-2 rounded-full bg-[#ffecf0]">
                                        <Icon name={item.name} size={24} color="#e01d47" />
                                    </View>
                                ) : (
                                    // Inactive state
                                    <View className="items-center justify-center p-2">
                                        <Icon name={item.name} size={24} color="#777" />
                                    </View>
                                )}
                                
                                {/* Cart badge - only show for cart icon when items exist */}
                                {item.key === 1 && cartItemCount > 0 && (
                                    <View className="absolute -top-1 -right-1 bg-[#e01d47] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                        <Text className="text-white text-[10px] font-bold">
                                            {cartItemCount > 99 ? '99+' : cartItemCount}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            <Text
                                className={`text-[10px] mt-1 font-medium ${
                                    isActive ? "text-[#e01d47]" : "text-gray-500"
                                }`}
                            >
                                {item.label}
                            </Text>
                            
                            {/* Active indicator dot */}
                            {isActive && (
                                <View className="absolute bottom-[-6px] h-1 w-4 rounded-full bg-[#e01d47]" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default Footer;