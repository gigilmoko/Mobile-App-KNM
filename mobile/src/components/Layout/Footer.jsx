import { View, TouchableOpacity, Text } from "react-native";
import React, { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";

const Footer = () => {
    const navigate = useNavigation();
    const route = useRoute();
    const { isAuthenticated } = useSelector((state) => state.user);
    const activeRoute = route.name;

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

    return (
        <View
            style={{
                backgroundColor: "#ffffff", 
                position: "absolute",
                width: "100%",
                bottom: 0,
                justifyContent: "center",
                alignSelf: "center",
                height: 70,
                paddingVertical: 8,
                borderTopWidth: 1,
                borderTopColor: "#ddd",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    alignItems: "center",
                }}
            >
                {[
                    { key: 0, name: "home", label: "Home" },
                    { key: 1, name: "cart", label: "Cart" },
                    { key: 2, name: "calendar-month", label: "Events" },
                    { key: 3, name: "bell", label: "Notifications" },
                    { key: 4, name: "account", label: "Profile" },
                ].map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        activeOpacity={0.8}
                        onPress={() => navigationHandler(item.key)}
                        style={{ alignItems: "center" }}
                    >
                        <View
                            style={{
                                backgroundColor: activeRoute === item.name ? "#f5a8b8" : "transparent",
                                borderRadius: 25,
                                padding: 8,
                            }}
                        >
                            <Icon
                                name={activeRoute === item.name ? item.name : `${item.name}-outline`}
                                size={25}
                                color="#e01d47"
                            />
                        </View>
                        <Text style={{ fontSize: 12, color: "#e01d47" }}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

export default Footer;
