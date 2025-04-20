import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const Footer = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const isActive = (tabName) => route.name === tabName;

    return (
        <View className="absolute bottom-0 left-0 right-0 flex-row justify-around items-center bg-white py-3 border-t border-gray-300">
            <TouchableOpacity
                className="flex items-center"
                onPress={() => navigation.navigate("task")}
            >
                <View
                    className={`p-2 rounded-full ${
                        isActive("task") ? "bg-[#e01d47]" : ""
                    }`}
                >
                    <FontAwesome5
                        name="tasks"
                        size={24}
                        color={isActive("task") ? "white" : "#e01d47"}
                    />
                </View>
                <Text
                    className={`text-sm mt-1 ${
                        isActive("task") ? "text-[#e01d47]" : "text-[#e01d47]"
                    }`}
                >
                    Task
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex items-center"
                onPress={() => navigation.navigate("history")}
            >
                <View
                    className={`p-2 rounded-full ${
                        isActive("history") ? "bg-[#e01d47]" : ""
                    }`}
                >
                    <FontAwesome5
                        name="history"
                        size={24}
                        color={isActive("history") ? "white" : "#e01d47"}
                    />
                </View>
                <Text
                    className={`text-sm mt-1 ${
                        isActive("history") ? "text-[#e01d47]" : "text-[#e01d47]"
                    }`}
                >
                    History
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                className="flex items-center"
                onPress={() => navigation.navigate("account")}
            >
                <View
                    className={`p-2 rounded-full ${
                        isActive("account") ? "bg-[#e01d47]" : ""
                    }`}
                >
                    <FontAwesome5
                        name="user"
                        size={24}
                        color={isActive("account") ? "white" : "#e01d47"}
                    />
                </View>
                <Text
                    className={`text-sm mt-1 ${
                        isActive("account") ? "text-[#e01d47]" : "text-[#e01d47]"
                    }`}
                >
                    My Account
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Footer;
