import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { useSelector } from "react-redux";
import WebView from 'react-native-webview';

const CurrentAddress = ({ navigation }) => {
    const { user } = useSelector((state) => state.user);

    const [houseNo, setHouseNo] = useState("");
    const [streetName, setStreetName] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city, setCity] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    if (user?.deliveryAddress?.length > 0) {
        // Select the most recent address (last one in the array)
        const latestAddress = user.deliveryAddress[user.deliveryAddress.length - 1];

        setHouseNo(latestAddress?.houseNo?.toString() || "");
        setStreetName(latestAddress?.streetName?.toString() || "");
        setBarangay(latestAddress?.barangay?.toString() || "");
        setCity(latestAddress?.city?.toString() || "");
        setLatitude(latestAddress?.latitude?.toString() || "14.5995");
        setLongitude(latestAddress?.longitude?.toString() || "120.9842");
    }
    setLoading(false);
}, [user]);

    const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${latitude || 14.5995}, ${longitude || 120.9842}], 15);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          L.marker([${latitude || 14.5995}, ${longitude || 120.9842}]).addTo(map);
        </script>
      </body>
    </html>
  `;

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffb703" />
                <Text style={styles.loaderText}>Loading Address...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
            <Header back={true} />
            <ScrollView keyboardShouldPersistTaps="handled">
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: -40 }}>
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={{ width: 100, height: 100, marginTop: 30 }}
                        />
                    </View>
                    <View style={styles.container}>
                        <Text style={styles.title}>Current Address</Text>

                        <View style={styles.form}>
                            <Text style={styles.label}>House Number</Text>
                            <TextInput value={houseNo} editable={false} style={styles.input} />
                            <Text style={styles.label}>Street Name</Text>
                            <TextInput value={streetName} editable={false} style={styles.input} />
                            <Text style={styles.label}>Barangay</Text>
                            <TextInput value={barangay} editable={false} style={styles.input} />
                            <Text style={styles.label}>City</Text>
                            <TextInput value={city} editable={false} style={styles.input} />
                            <Text style={styles.label}>Latitude</Text>
                            <TextInput value={latitude} editable={false} style={styles.input} />
                            <Text style={styles.label}>Longitude</Text>
                            <TextInput value={longitude} editable={false} style={styles.input} />
                        </View>

                        <View style={styles.mapContainer}>
                            <WebView
                                source={{ html: mapHtml }}
                                style={styles.map}
                                scrollEnabled={false}
                                javaScriptEnabled={true}
                            />
                        </View>

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={styles.button}
                                onPress={() => navigation.navigate("addressupdate")}
                            >
                                <Text style={styles.buttonText}>Change Address</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffb703",
    },
    loaderText: {
        marginTop: 10,
        fontSize: 18,
        color: "#fff",
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 20,
    },
    form: {
        flex: 1,
        paddingVertical: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
        color: "#333",
    },
    input: {
        width: "100%",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
    },
    mapContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 15,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: "#bc430b",
        width: '100%',
        height: 50,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default CurrentAddress;