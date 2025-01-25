import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import WebView from 'react-native-webview';
import Header from "../../components/Layout/Header";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress, loadUser } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import * as Location from "expo-location";
import { addressService } from "../../../services/addressService";

const AddressUpdate = ({ navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { user } = useSelector((state) => state.user);

    // Form States
    const [houseNo, setHouseNo] = useState("");
    const [streetName, setStreetName] = useState("");
    const [barangay, setBarangay] = useState("");
    const [city, setCity] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    
    // City and Barangay States
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [barangays, setBarangays] = useState([]);
    const [selectedBarangay, setSelectedBarangay] = useState(null);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = useState(false);

    // Location States
    const [currentLocation, setCurrentLocation] = useState(null);
    const [region, setRegion] = useState({
        latitude: 14.5995,
        longitude: 120.9842,
        zoom: 15
    });

    // UI States
    const [isProfileChanged, setIsProfileChanged] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isFocused) {
            dispatch(loadUser());
            loadCities();
            getCurrentLocation();
        }
    }, [dispatch, isFocused]);

    useEffect(() => {
        if (user?.deliveryAddress?.length > 0) {
            const latestAddress = user.deliveryAddress[0];
            setHouseNo(latestAddress?.houseNo?.toString() || "");
            setStreetName(latestAddress?.streetName?.toString() || "");
            setBarangay(latestAddress?.barangay?.toString() || "");
            setCity(latestAddress?.city?.toString() || "");
            setLatitude(latestAddress?.latitude?.toString() || "14.5995");
            setLongitude(latestAddress?.longitude?.toString() || "");
        }
    }, [user]);

    useEffect(() => {
        if (isProfileChanged) {
            navigation.replace("confirmorder");
        }
    }, [isProfileChanged, navigation]);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: "Location permission denied"
                });
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            
            setCurrentLocation({ latitude, longitude });
            setLatitude(latitude.toString());
            setLongitude(longitude.toString());
            setRegion({
                latitude,
                longitude,
                zoom: 15
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to get current location"
            });
        }
    };

    const loadCities = async () => {
        setIsLoadingCities(true);
        try {
            const citiesData = await addressService.getCities();
            setCities(citiesData);

            if (user?.deliveryAddress?.city) {
                const currentCity = citiesData.find(
                    city => city.label === user.deliveryAddress.city
                );
                if (currentCity) {
                    setSelectedCity(currentCity);
                    await handleCitySelect(currentCity);
                }
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to load cities"
            });
        } finally {
            setIsLoadingCities(false);
        }
    };

    const handleCitySelect = async (city) => {
        setSelectedCity(city);
        setIsLoadingBarangays(true);
        try {
            const barangaysData = await addressService.getBarangays(city.value);
            setBarangays(barangaysData);

            if (user?.deliveryAddress?.barangay) {
                const currentBarangay = barangaysData.find(
                    b => b.label === user.deliveryAddress.barangay
                );
                if (currentBarangay) {
                    setSelectedBarangay(currentBarangay);
                }
            }
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Failed to load barangays"
            });
        } finally {
            setIsLoadingBarangays(false);
        }
    };

    const handleMapMessage = (event) => {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'markerDrag' || data.type === 'mapClick') {
            setLatitude(data.latitude.toString());
            setLongitude(data.longitude.toString());
            setCurrentLocation({
                latitude: data.latitude,
                longitude: data.longitude
            });
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
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
            const map = L.map('map', {
                zoomControl: true,
                dragging: true,
                scrollWheelZoom: true
            }).setView([${region.latitude}, ${region.longitude}], ${region.zoom});
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            let marker = L.marker([${region.latitude}, ${region.longitude}], {
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

    const submitHandler = async () => {
        setLoading(true);
        try {
            if (!houseNo || !streetName || !selectedCity || !selectedBarangay) {
                Toast.show({
                    type: "error",
                    text1: "Please fill all required fields"
                });
                return;
            }

            const addressData = {
                deliveryAddress: {
                    houseNo,
                    streetName,
                    barangay: selectedBarangay.label,
                    city: selectedCity.label,
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude)
                }
            };

            await dispatch(updateAddress(addressData));
            setIsProfileChanged(true);
            Toast.show({
                type: "success",
                text1: "Address updated successfully!"
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: error.message || "Failed to update address"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Update Address</Text>
            </View>
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.formContainer}>
                    <View style={styles.addressBox}>
                        <Text style={styles.label}>House Number: {houseNo}</Text>
                        <Text style={styles.label}>Street Name: {streetName}</Text>
                        <Text style={styles.label}>Barangay: {barangay}</Text>
                        <Text style={styles.label}>City: {city}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>House Number</Text>
                        <TextInput
                            placeholder="Enter house number"
                            value={houseNo}
                            onChangeText={setHouseNo}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Street Name</Text>
                        <TextInput
                            placeholder="Enter street name"
                            value={streetName}
                            onChangeText={setStreetName}
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>City</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedCity?.value}
                                onValueChange={(itemValue) => {
                                    const city = cities.find(c => c.value === itemValue);
                                    if (city) handleCitySelect(city);
                                }}
                                enabled={!isLoadingCities}
                            >
                                <Picker.Item 
                                    label={isLoadingCities ? "Loading Cities..." : "Select City"} 
                                    value="" 
                                />
                                {cities.map(city => (
                                    <Picker.Item
                                        key={city.value}
                                        label={city.label}
                                        value={city.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Barangay</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedBarangay?.value}
                                onValueChange={async (itemValue) => {
                                    const barangay = barangays.find(b => b.value === itemValue);
                                    setSelectedBarangay(barangay);
                                    
                                    if (barangay && selectedCity) {
                                        try {
                                            const addressData = {
                                                streetName,
                                                barangay: barangay.label,
                                                city: selectedCity.label
                                            };
                                            
                                            const location = await addressService.getGeoLocation(addressData);
                                            setLatitude(location.latitude.toString());
                                            setLongitude(location.longitude.toString());
                                            setRegion({
                                                latitude: location.latitude,
                                                longitude: location.longitude,
                                                zoom: 15
                                            });
                                        } catch (error) {
                                            Toast.show({
                                                type: "error",
                                                text1: "Failed to get location for selected barangay"
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
                                {barangays.map(barangay => (
                                    <Picker.Item
                                        key={barangay.value}
                                        label={barangay.label}
                                        value={barangay.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.mapContainer}>
                        <WebView
                            source={{ html: mapHtml }}
                            style={styles.map}
                            onMessage={handleMapMessage}
                            scrollEnabled={false}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            geolocationEnabled={true}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.disabledButton]}
                        onPress={submitHandler}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Update Address</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    backButton: {
        position: "absolute",
        left: 10,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
    },
    formContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
        // marginTop: 20,
    },
    addressBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        // marginBottom: 15,
    },
    mapContainer: {
        height: 200,
        borderRadius: 8,
        overflow: 'hidden',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    map: {
        flex: 1,
    },
    submitButton: {
        backgroundColor: '#bc430b',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    disabledButton: {
        opacity: 0.7,
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 14,
        marginTop: 5,
    },
    successText: {
        color: '#34c759',
        fontSize: 14,
        marginTop: 5,
    }
});

export default AddressUpdate;