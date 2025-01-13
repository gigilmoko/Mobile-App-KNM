import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { useSelector } from "react-redux";
import MapView, { Marker } from "react-native-maps";

const CurrentAddress = ({ navigation }) => {
    const { user } = useSelector((state) => state.user);

    const [houseNo, setHouseNo] = useState("");
    const [streetName, setStreetName] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city, setCity] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [region, setRegion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data fetching
        if (user?.deliveryAddress) {
            const { houseNo, streetName, barangay, city, latitude, longitude } = user.deliveryAddress;
            setHouseNo(houseNo || "");
            setStreetName(streetName || "");
            setBarangay(barangay || "");
            setCity(city || "");
            setLatitude(latitude?.toString() || "");
            setLongitude(longitude?.toString() || "");

            setRegion({
                latitude: parseFloat(latitude) || 37.78825,
                longitude: parseFloat(longitude) || -122.4324,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        }
        setLoading(false); // Set loading to false once data is loaded
    }, [user]);

    if (loading) {
        // Show a loading spinner until data is fetched
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffb703" />
                <Text style={styles.loaderText}>Loading Address...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
            <Header back={true} />
            <ScrollView keyboardShouldPersistTaps="handled">
                <View className="flex-1">
                    <View className="flex-row justify-center mt-[-40px]">
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={{ width: 100, height: 100, marginTop: 30 }}
                        />
                    </View>
                    <View className="flex-1 bg-white px-8 pt-8 rounded-t-[20px] shadow-lg justify-center">
                        <Text className="text-gray-700 text-2xl font-bold text-center mb-4">
                            Current Address
                        </Text>

                        {/* Address Form */}
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

                        {/* Map View */}
                        <View style={{ height: 200, marginTop: 10 }}>
                            <MapView
                                style={{ flex: 1 }}
                                region={region}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: parseFloat(latitude) || region.latitude,
                                        longitude: parseFloat(longitude) || region.longitude,
                                    }}
                                />
                            </MapView>
                        </View>

                        {/* Change Address Button */}
                        <View className="flex items-center mt-5 pb-5">
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "#bc430b",
                                    width: 350,
                                    height: 50,
                                    borderRadius: 10,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                onPress={() => navigation.navigate("addressupdate")}
                            >
                                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                                    Change Address
                                </Text>
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
    form: {
        flex: 1,
        paddingVertical: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    input: {
        width: "100%",
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
    },
});

export default CurrentAddress;
