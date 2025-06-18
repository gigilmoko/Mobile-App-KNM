import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { addressService } from "../../../services/addressService";
import { updateAddress, createAddress, loadUser } from "../../redux/actions/userActions";
import WebView from "react-native-webview";
import * as Location from "expo-location";
import Header from "../../components/Layout/Header";
import { Ionicons } from "@expo/vector-icons";

const EditAddress = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMap, setShowMap] = useState(true);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editAddressIndex, setEditAddressIndex] = useState(-1);

    // Form states for new/edited address
    const [houseNo, setHouseNo] = useState("");
    const [street, setStreet] = useState("");
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedBarangay, setSelectedBarangay] = useState(null);
    const [addressName, setAddressName] = useState(""); // For naming addresses like "Home", "Work", etc.

    // City and barangay data
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [citySearch, setCitySearch] = useState("");
    
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
        dispatch(loadUser());
    }, [dispatch]);

    const loadCities = async () => {
        setIsLoadingCities(true);
        try {
            const citiesData = await addressService.getCities();
            setCities(citiesData);
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

    const handleEditAddress = (address, index) => {
        setEditAddressIndex(index);
        setHouseNo(address.houseNo?.toString() || "");
        setStreet(address.streetName?.toString() || "");
        setAddressName(address.name || "");
        
        // Find city in the list
        if (address.city && cities.length > 0) {
            const city = cities.find(c => c.label === address.city);
            if (city) {
                setSelectedCity(city);
                handleCitySelect(city);
            }
        }
        
        // Set coordinates
        setCoordinates({
            latitude: address.latitude || 14.5995,
            longitude: address.longitude || 120.9842,
            zoom: 15,
        });
        
        setShowAddressForm(true);
    };

    const handleAddNewAddress = () => {
        // Reset form fields
        setEditAddressIndex(-1);
        setHouseNo("");
        setStreet("");
        setAddressName("");
        setSelectedCity(null);
        setSelectedBarangay(null);
        getCurrentLocation();
        setShowAddressForm(true);
    };

    const handleCancelAddressForm = () => {
        setShowAddressForm(false);
        setEditAddressIndex(-1);
    };
    
// In the saveAddress function in EditAddress.jsx

const saveAddress = async () => {
    try {
        setIsSubmitting(true);

        if (!houseNo || !street || !selectedCity || !selectedBarangay) {
            Toast.show({
                type: "error",
                text1: "Please fill all required address fields",
            });
            setIsSubmitting(false);
            return;
        }

        const addressData = {
            houseNo,
            streetName: street,
            barangay: selectedBarangay.label,
            city: selectedCity.label,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
        };

        if (addressName) {
            addressData.name = addressName;
        }

        if (editAddressIndex >= 0) {
            // Update existing address in the array
            const updatedAddresses = [...(user.deliveryAddress || [])];
            updatedAddresses[editAddressIndex] = {
                ...updatedAddresses[editAddressIndex],
                ...addressData
            };
            
            await dispatch(updateAddress({
                deliveryAddress: updatedAddresses
            }));
            
            Toast.show({
                type: "success",
                text1: "Address updated successfully",
            });
        } else {
            // Create a new address - making sure to include userId
            // The error message explicitly says "User ID is required"
            if (!user || !user._id) {
                Toast.show({
                    type: "error",
                    text1: "User ID not found. Please log in again.",
                });
                return;
            }
            
            console.log("Creating address with user ID:", user._id);
            
            await dispatch(createAddress({
                userId: user._id, // Make sure to include the userId
                address: addressData
            }));
            
            Toast.show({
                type: "success",
                text1: "New address added successfully",
            });
        }
        
        // Refresh user data and reset form
        dispatch(loadUser());
        setShowAddressForm(false);
    } catch (error) {
        console.error("Error saving address:", error);
        Toast.show({
            type: "error",
            text1: error.response?.data?.message || `Failed to ${editAddressIndex >= 0 ? "update" : "add"} address`,
        });
    } finally {
        setIsSubmitting(false);
    }
};

    const renderAddressItem = ({ item, index }) => (
        <TouchableOpacity
            onPress={() => handleEditAddress(item, index)}
            className="mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
        >
            <View className="p-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-semibold text-gray-800">
                        {item.name || `Address ${index + 1}`}
                    </Text>
                    <TouchableOpacity
                        onPress={() => handleEditAddress(item, index)}
                        className="p-2"
                    >
                        <Ionicons name="pencil-outline" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row mb-2">
                    <Ionicons name="location-outline" size={18} color="#666" style={{ marginTop: 2 }} />
                    <Text className="text-gray-700 ml-2 flex-1">
                        {[
                            item.houseNo,
                            item.streetName,
                            item.barangay, 
                            item.city
                        ].filter(Boolean).join(', ')}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 bg-gray-50">
                <View className="bg-white pt-12 px-5 pb-4 shadow-sm">
                    <Header title="Manage Addresses" />
                    <Text className="text-gray-500">Add or edit your delivery addresses</Text>
                </View>
                
                {showAddressForm ? (
                    <ScrollView
                        className="flex-1 bg-white"
                        contentContainerStyle={{ padding: 20 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <Text className="text-xl font-bold text-gray-800 mb-4">
                            {editAddressIndex >= 0 ? "Edit Address" : "Add New Address"}
                        </Text>
                        
                        {showMap && (
                            <View style={styles.mapContainer}>
                                <WebView
                                    source={{ html: mapHtml }}
                                    style={styles.map}
                                    onMessage={handleMapMessage}
                                />
                                
                                <TouchableOpacity
                                    className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow"
                                    onPress={getCurrentLocation}
                                >
                                    <Ionicons name="locate" size={24} color="#e01d47" />
                                </TouchableOpacity>
                            </View>
                        )}

                        <Text className="text-gray-700 mb-1 font-medium">Address Name (Optional)</Text>
                        <TextInput
                            className="border border-gray-300 rounded-md px-2.5 mb-2.5"
                            placeholder="Home, Work, etc."
                            value={addressName}
                            onChangeText={setAddressName}
                            style={styles.input}
                        />

                        <Text className="text-gray-700 mb-1 font-medium">House No <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className="border border-gray-300 rounded-md px-2.5 mb-2.5"
                            placeholder="House No"
                            value={houseNo}
                            onChangeText={setHouseNo}
                            style={styles.input}
                        />

                        <Text className="text-gray-700 mb-1 font-medium">Street <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className="border border-gray-300 rounded-md px-2.5 mb-2.5"
                            placeholder="Street"
                            value={street}
                            onChangeText={setStreet}
                            style={styles.input}
                        />

                        <Text className="text-gray-700 mb-1 font-medium">City <Text className="text-red-500">*</Text></Text>
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

                        <Text className="text-gray-700 mb-1 font-medium">Barangay <Text className="text-red-500">*</Text></Text>
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

                        <View className="flex-row justify-between mt-6">
                            <TouchableOpacity
                                className="bg-gray-200 p-3 rounded-md items-center flex-1 mr-2"
                                onPress={handleCancelAddressForm}
                            >
                                <Text className="text-gray-800 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                className={`bg-[#e01d47] p-3 rounded-md items-center flex-1 ml-2 ${isSubmitting ? "opacity-70" : ""}`}
                                onPress={saveAddress}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text className="text-white font-medium">
                                        {editAddressIndex >= 0 ? "Update" : "Save Address"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                ) : (
                    <View className="flex-1 px-4 pt-4">
                        {!user || !user.deliveryAddress || user.deliveryAddress.length === 0 ? (
                            <View className="flex-1 items-center justify-center">
                                <Ionicons name="location-outline" size={60} color="#e0e0e0" />
                                <Text className="text-lg font-medium text-gray-500 mt-4">No addresses found</Text>
                                <Text className="text-center text-gray-400 mt-2">Add your first delivery address</Text>
                                
                                <TouchableOpacity
                                    className="mt-6 bg-[#e01d47] px-6 py-3 rounded-full flex-row items-center"
                                    onPress={handleAddNewAddress}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text className="text-white font-medium ml-1">Add New Address</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <FlatList
                                    data={user.deliveryAddress}
                                    renderItem={renderAddressItem}
                                    keyExtractor={(item, index) => `address-${index}`}
                                    contentContainerStyle={{ paddingBottom: 100 }}
                                />
                                
                                <TouchableOpacity
                                    className="absolute bottom-6 right-6 bg-[#e01d47] w-14 h-14 rounded-full shadow-lg items-center justify-center"
                                    onPress={handleAddNewAddress}
                                >
                                    <Ionicons name="add" size={28} color="#fff" />
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        height: 300,
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    input: {
        height: 50,
        paddingHorizontal: 10,
    },
    pickerContainer: {
        height: 50,
    },
    picker: {
        height: '100%',
    },
});

export default EditAddress;