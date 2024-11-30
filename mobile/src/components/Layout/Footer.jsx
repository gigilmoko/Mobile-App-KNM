import { View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from "react-redux";

const Footer = () => {
    const navigate = useNavigation();
    const route = useRoute(); // Get the current route
    const { isAuthenticated } = useSelector((state) => state.user);

    // Determine the current active route
    const activeRoute = route.name;

    useEffect(() => {
        console.log("isAuthenticated state:", isAuthenticated);
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

    const iconStyle = {
        color: "#000000",
        fontSize: 25,
    };

    return (
        <View
            style={{
                backgroundColor: "#ffb703", 
                position: "absolute",
                width: "100%",
                bottom: 0,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                justifyContent: "center",
                alignSelf: "center",
                height: 50,
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                }}
            >
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigationHandler(0)}>
                    <Icon
                        name={activeRoute === "home" ? "home" : "home-outline"}
                        style={iconStyle}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigationHandler(1)}>
                    <Icon
                        name={activeRoute === "cart" ? "cart" : "cart-outline"}
                        style={iconStyle}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigationHandler(2)}>
                    <Icon
                        name={activeRoute === "eventlist" ? "clipboard-list" : "clipboard-list-outline"}
                        style={iconStyle}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigationHandler(3)}>
                    <Icon
                        name={activeRoute === "notification" ? "bell" : "bell-outline"}
                        style={iconStyle}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} onPress={() => navigationHandler(4)}>
                    <Icon
                        name={activeRoute === "myaccount" ? "account" : "account-outline"}
                        style={iconStyle}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Footer;
