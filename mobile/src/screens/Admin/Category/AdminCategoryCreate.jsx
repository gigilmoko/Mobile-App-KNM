import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message"; // Import Toast



const AdminCategoryCreate = () => {
  return (
    <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
    <Header back={true} />

    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.boxContainer}>
            <View style={styles.boxboxContainer}>
                <Text style={styles.headerText}>
                    Events
                </Text>
            </View>

           

           
        </View>
   

        <View style={styles.footer}>
            <Footer activeRoute={"home"} />
        </View>
    </ScrollView>
</View>
  )
}

export default AdminCategoryCreate

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    screenNameContainer: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    screenNameText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    boxContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        paddingTop: 0,
        marginTop: 20,
        height: '100%',
        paddingHorizontal: 16,
        elevation: 5, // For shadow (Android)
        shadowColor: "#000", // For shadow (iOS)
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    boxboxContainer: {
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 10,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        paddingTop: 0,
    },
});
