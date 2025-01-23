import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { addressService } from "../../../services/addressService";
import { updateAddress } from "../../redux/actions/userActions";
import WebView from "react-native-webview";
import * as Location from "expo-location";

const EditAddress = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMap, setShowMap] = useState(false);

    // Current Address
    const currentAddress = {
        houseNo: user?.deliveryAddress?.houseNo || "",
        streetName: user?.deliveryAddress?.streetName || "",
        barangay: user?.deliveryAddress?.barangay || "",
        city: user?.deliveryAddress?.city || "",
    };

  // Form states
    const [houseNo, setHouseNo] = useState(currentAddress.houseNo);
    const [street, setStreet] = useState(currentAddress.streetName);

    // City states
    const [cities, setCities] = useState([]);
    const [citySearch, setCitySearch] = useState(currentAddress.city);
    const [selectedCity, setSelectedCity] = useState(null);

    // Barangay states
    const [barangays, setBarangays] = useState([]);
    const [selectedBarangay, setSelectedBarangay] = useState(null);

    // Location states
    const [coordinates, setCoordinates] = useState({
        latitude: 14.5995,
        longitude: 120.9842,
        zoom: 15,
    });

  // Loading states
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

    useEffect(() => {
        loadCities();
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            Toast.show({
            type: "error",
            text1: "Location permission denied",
            });
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setCoordinates({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            zoom: 15,
        });
        } catch (error) {
        Toast.show({
            type: "error",
            text1: "Failed to get current location",
        });
        }
    };

    const loadCities = async () => {
        setIsLoadingCities(true);
        try {
        const citiesData = await addressService.getCities();
        setCities(citiesData);

        if (currentAddress.city) {
            const currentCity = citiesData.find(
            (city) => city.label === currentAddress.city
            );
            if (currentCity) {
            handleCitySelect(currentCity);
            }
        }
        } catch (error) {
        Toast.show({
            type: "error",
            text1: "Failed to load cities",
        });
        } finally {
        setIsLoadingCities(false);
        }
    };

    const handleCitySelect = async (city) => {
        setSelectedCity(city);
        setCitySearch(city.label);

        setIsLoadingBarangays(true);
        try {
        const barangaysData = await addressService.getBarangays(city.value);
        setBarangays(barangaysData);

        if (currentAddress.barangay) {
            const currentBarangay = barangaysData.find(
            (b) => b.label === currentAddress.barangay
            );
            if (currentBarangay) {
            setSelectedBarangay(currentBarangay);
            }
        }
        } catch (error) {
        Toast.show({
            type: "error",
            text1: "Failed to load barangays",
        });
        } finally {
        setIsLoadingBarangays(false);
        }
    };

    const handleMapMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "markerDrag" || data.type === "mapClick") {
        setCoordinates((prev) => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
        }));
        }
    };

    const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
            body { margin: 0; }
            #map { height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
            const map = L.map('map').setView([${coordinates.latitude}, ${coordinates.longitude}], ${coordinates.zoom});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            let marker = L.marker([${coordinates.latitude}, ${coordinates.longitude}], {
                draggable: true
            }).addTo(map);

            marker.on('dragend', function(e) {
                const pos = marker.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerDrag',
                latitude: pos.lat,
                longitude: pos.lng
                }));
            });

            map.on('click', function(e) {
                marker.setLatLng(e.latlng);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
                }));
            });
            </script>
        </body>
        </html>
    `;

    const saveAddress = async () => {
        try {
        setIsSubmitting(true);
        if (!houseNo || !street || !selectedCity || !selectedBarangay) {
            Toast.show({
            type: "error",
            text1: "Please fill all address fields",
            });
            return;
        }

        const addressData = {
            deliveryAddress: {
            houseNo,
            streetName: street,
            barangay: selectedBarangay.label,
            city: selectedCity.label,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            },
        };

        const response = await dispatch(updateAddress(addressData));

        if (response === "success") {
            Toast.show({
            type: "success",
            text1: "Address updated successfully",
            });
            navigation.goBack();
        }
        } catch (error) {
        Toast.show({
            type: "error",
            text1: error.message || "Failed to update address",
        });
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.container}>
            <View style={styles.currentAddressContainer}>
                <Text style={styles.sectionTitle}>Current Address</Text>
                <View style={styles.currentAddressBox}>
                <Text style={styles.currentAddressText}>
                    House No: {currentAddress.houseNo}
                </Text>
                <Text style={styles.currentAddressText}>
                    Street: {currentAddress.streetName}
                </Text>
                <Text style={styles.currentAddressText}>
                    Barangay: {currentAddress.barangay}
                </Text>
                <Text style={styles.currentAddressText}>
                    City: {currentAddress.city}
                </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.mapToggleButton}
                onPress={() => setShowMap(!showMap)}
            >
                <Text style={styles.mapToggleText}>
                {showMap ? "Hide Map" : "Choose Location on Map"}
                </Text>
            </TouchableOpacity>

            {showMap && (
                <View style={styles.mapContainer}>
                <WebView
                    source={{ html: mapHtml }}
                    style={styles.map}
                    onMessage={handleMapMessage}
                />
                </View>
            )}

            <View style={styles.coordinatesContainer}>
                <Text style={styles.coordinatesText}>
                Latitude: {coordinates.latitude.toFixed(6)}
                </Text>
                <Text style={styles.coordinatesText}>
                Longitude: {coordinates.longitude.toFixed(6)}
                </Text>
            </View>

            <Text style={styles.sectionTitle}>New Address</Text>

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

            <View style={styles.pickerContainer}>
                <Picker
                selectedValue={selectedCity?.value}
                onValueChange={(itemValue) => {
                    const selected = cities.find((c) => c.value === itemValue);
                    setSelectedCity(selected);
                    if (selected) {
                    handleCitySelect(selected);
                    }
                }}
                enabled={!isLoadingCities}
                >
                <Picker.Item
                    label={isLoadingCities ? "Loading Cities..." : "Select City"}
                    value=""
                />
                {cities.map((city) => (
                    <Picker.Item
                    key={city.value}
                    label={city.label}
                    value={city.value}
                    />
                ))}
                </Picker>
            </View>

            <View style={styles.pickerContainer}>
                <Picker
                selectedValue={selectedBarangay?.value}
                onValueChange={async (itemValue) => {
                    const selected = barangays.find((b) => b.value === itemValue);
                    setSelectedBarangay(selected);

                    if (selected && selectedCity) {
                    try {
                        const addressData = {
                        streetName: street,
                        barangay: selected.label,
                        city: selectedCity.label,
                        };

                        console.log(addressData)

                        const location = await addressService.getGeoLocation(
                        addressData
                        );
                        setCoordinates((prev) => ({
                        ...prev,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        }));
                    } catch (error) {
                        Toast.show({
                        type: "error",
                        text1: "Failed to get location for selected barangay",
                        });
                    }
                    }
                }}
                enabled={!!selectedCity && !isLoadingBarangays}
                >
                <Picker.Item
                    label={
                    isLoadingBarangays
                        ? "Loading Barangays..."
                        : !selectedCity
                        ? "Select a city first"
                        : "Select Barangay"
                    }
                    value=""
                />
                {barangays.map((barangay) => (
                    <Picker.Item
                    key={barangay.value}
                    label={barangay.label}
                    value={barangay.value}
                    />
                ))}
                </Picker>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                onPress={saveAddress}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                <ActivityIndicator color="#fff" />
                ) : (
                <Text style={styles.saveButtonText}>Save Address</Text>
                )}
            </TouchableOpacity>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    currentAddressContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: "#f8f8f8",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    currentAddressBox: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#eee",
    },
    currentAddressText: {
        fontSize: 16,
        marginBottom: 8,
        color: "#666",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        color: "#333",
    },
    mapToggleButton: {
        backgroundColor: "#bc430b",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    mapToggleText: {
        color: "#fff",
        fontWeight: "600",
    },
    mapContainer: {
        height: 300,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 10,
    },
    map: {
        flex: 1,
    },
    coordinatesContainer: {
        backgroundColor: "#f8f8f8",
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
    },
    coordinatesText: {
        fontSize: 14,
        color: "#666",
    },
    input: {
        height: 40,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
    pickerContainer: {
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    saveButton: {
        backgroundColor: "#bc430b",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 20,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    disabledButton: {
        opacity: 0.7,
    },
    scrollView: {
        flex: 1,
        backgroundColor: "#fff",
        paddingBottom: 30,
        paddingTop: 20,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    container: {
        padding: 20,
    },
    dropdownContainer: {
        marginTop: -10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        maxHeight: 150,
        backgroundColor: "#fff",
        zIndex: 1000,
    },
    citiesList: {
        flex: 1,
    },
    cityItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    cityItemText: {
        fontSize: 14,
        color: "#333",
    },
});

export default EditAddress;