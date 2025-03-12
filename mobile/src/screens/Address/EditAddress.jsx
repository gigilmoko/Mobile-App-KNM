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
import Header from "../../components/Layout/Header";

const EditAddress = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMap, setShowMap] = useState(true); // Always show the map

    console.log("User:", user); 
    // Current Address
    const currentAddress = user?.deliveryAddress?.[0] || {};

    // Form states
    const [houseNo, setHouseNo] = useState(currentAddress.houseNo?.toString() || "");
    const [street, setStreet] = useState(currentAddress.streetName?.toString() || "");

    // City states
    const [cities, setCities] = useState([]);
    const [citySearch, setCitySearch] = useState(currentAddress.city?.toString() || "");
    const [selectedCity, setSelectedCity] = useState(null);

    // Barangay states
    const [barangays, setBarangays] = useState([]);
    const [selectedBarangay, setSelectedBarangay] = useState(null);

    // Location states
    const [coordinates, setCoordinates] = useState({
        latitude: currentAddress.latitude || 14.5995,
        longitude: currentAddress.longitude || 120.9842,
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
        <SafeAreaView className="flex-1">
        <ScrollView
            className="flex-1 bg-white pb-7.5 pt-5"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
        >
            <View className="px-5 pt-15">
                        {/* My Account Section */}
                        <View className="flex items-center">
                            <Header title="Edit Address"></Header>
                        </View>
                        </View>
            <View className="flex-1 p-5 bg-white">
                {showMap && (
                            <View style={styles.mapContainer}>
                            <WebView
                                source={{ html: mapHtml }}
                                style={styles.map}
                                onMessage={handleMapMessage}
                            />
                            </View>
                        )}
    
                <Text className="text-gray-700 mb-1">House No</Text>
                <TextInput
                    className="border border-gray-300 rounded-md px-2.5 mb-2.5"
                    placeholder="House No"
                    value={houseNo}
                    onChangeText={setHouseNo}
                    style={styles.input}
                />
    
                <Text className="text-gray-700 mb-1">Street</Text>
                <TextInput
                    className="border border-gray-300 rounded-md px-2.5 mb-2.5"
                    placeholder="Street"
                    value={street}
                    onChangeText={setStreet}
                    style={styles.input}
                />
    
                <Text className="text-gray-700 mb-1">City</Text>
                <View className="border border-gray-300 rounded-md mb-2.5" style={styles.pickerContainer}>
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
                        style={styles.picker}
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
    
                <Text className="text-gray-700 mb-1">Barangay</Text>
                <View className="border border-gray-300 rounded-md mb-2.5" style={styles.pickerContainer}>
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
    
                                    console.log(addressData);
    
                                    const location = await addressService.getGeoLocation(addressData);
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
                        style={styles.picker}
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
                    className={`bg-[#e01d47] p-3 rounded-md items-center mt-5 ${isSubmitting ? "opacity-70" : ""}`}
                    onPress={saveAddress}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-base font-medium">Save Address</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    
    mapContainer: {
        height: 300,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 10,
    },
    input: {
        height: 50, // Match the height of the picker
    },
    pickerContainer: {
        height: 50, // Match the height of the input boxes
    },
    picker: {
        height: '100%',
    },
   
});

export default EditAddress;