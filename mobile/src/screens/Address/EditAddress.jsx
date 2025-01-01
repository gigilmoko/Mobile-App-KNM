import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";

const EditAddress = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const [houseNo, setHouseNo] = useState(user?.address?.houseNo || "");
    const [street, setStreet] = useState(user?.address?.streetName || "");
    const [barangay, setBarangay] = useState(user?.address?.barangay || "");
    const [city, setCity] = useState(user?.address?.city || "");

    const saveAddress = () => {
        const updatedAddress = {
        houseNo,
        streetName: street,
        barangay,
        city,
        };

        dispatch({
        type: "UPDATE_ADDRESS",
        payload: updatedAddress,
        });

        Toast.show({
        type: "success",
        text1: "Address updated successfully",
        });

        navigation.goBack();
    };

    return (
        <SafeAreaView style={{ flex: 1, paddingTop: 60, paddingBottom: 100 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Edit Address</Text>
                <TextInput
                style={styles.input}
                placeholder="House No"
                value={houseNo}
                onChangeText={setHouseNo}
                />
                <TextInput
                style={styles.input}
                placeholder="Street"
                value={street}
                onChangeText={setStreet}
                />
                <TextInput
                style={styles.input}
                placeholder="Barangay"
                value={barangay}
                onChangeText={setBarangay}
                />
                <TextInput
                style={styles.input}
                placeholder="City"
                value={city}
                onChangeText={setCity}
                />
                <View style={{ width: "100%", alignItems: "center" }}>
                <TouchableOpacity style={styles.saveButton} onPress={saveAddress}>
                    <Text style={styles.saveButtonText}>Save Address</Text>
                </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: "80%",
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    saveButton: {
        width: 300,
        height: 50,
        backgroundColor: "#bc430b",
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#ffffff",
        textTransform: "uppercase",
    },
});

export default EditAddress;