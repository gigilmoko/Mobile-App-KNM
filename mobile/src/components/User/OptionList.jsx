import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";

const OptionList = ({
    Icon,
    iconName,
    text,
    onPress,
    type,
    onPressSecondary,
}) => {
    return (
        <>
            <TouchableOpacity style={styles.container} onPress={onPress}>
                <View style={styles.IconContainer}>
                    <Ionicons name={iconName} size={24} color="#e01d47" />
                    <Text style={styles.listText}>{text}</Text>
                </View>
                <View>
                    <MaterialIcons
                        name="arrow-forward-ios"
                        size={24}
                        color="#023047"
                    />
                </View>
            </TouchableOpacity>
        </>
    );
};

export default OptionList;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 5,
        height: 50,
        paddingLeft: 10,
        paddingRight: 10,
        elevation: 5,
        marginBottom: 15,
    },
    IconContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    listText: {
        marginLeft: 10,
        fontSize: 15,
        fontWeight: "bold",
        color: "#023047",
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "row",
    },
    actionButton: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5,
        height: 30,
        width: 30,
        backgroundColor: "#FB6831",
        borderRadius: 5,
        elevation: 2,
    },
});