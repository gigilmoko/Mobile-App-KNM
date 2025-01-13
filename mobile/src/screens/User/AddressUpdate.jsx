import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { TextInput } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { updateAddress, loadUser } from "../../redux/actions/userActions";
import { useIsFocused } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

const AddressUpdate = ({ navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const { user } = useSelector((state) => state.user);

  const [houseNo, setHouseNo] = useState(user?.deliveryAddress?.houseNo || "");
  const [streetName, setStreetName] = useState(user?.deliveryAddress?.streetName || "");
  const [barangay, setBarangay] = useState(user?.deliveryAddress?.barangay || "");
  const [city, setCity] = useState(user?.deliveryAddress?.city || "");
  const [latitude, setLatitude] = useState(user?.deliveryAddress?.latitude || "");
  const [longitude, setLongitude] = useState(user?.deliveryAddress?.longitude || "");
  const [isProfileChanged, setIsProfileChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const [showMapAndSearch, setShowMapAndSearch] = useState(false); // State for toggling map and search visibility

  const submitHandler = async () => {
    setLoading(true);
    try {
      const updatedAddressData = {
        deliveryAddress: {
          houseNo,
          streetName,
          barangay,
          city,
          latitude,
          longitude,
        },
      };

      await dispatch(updateAddress(updatedAddressData));
      setIsProfileChanged(true);

      Toast.show({
        type: "success",
        text1: "Address updated successfully!",
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Failed to update address. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      dispatch(loadUser());
    }
  }, [dispatch, isFocused]);

  useEffect(() => {
    if (isProfileChanged) {
      navigation.replace("myaccount");
    }
  }, [isProfileChanged, navigation]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log("Fetched location:", latitude, longitude);

      setCurrentLocation({ latitude, longitude });
      setLatitude(latitude.toString());
      setLongitude(longitude.toString());

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    };

    requestLocationPermission();
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
      <Header back={true} />
      <View className="flex-1">
        <View className="flex-row justify-center mt-[-40px]">
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 100, height: 100, marginTop: 30 }}
          />
        </View>
        <View className="flex-1 bg-white px-8 pt-8 rounded-t-[20px] shadow-lg justify-center">
          <Text className="text-gray-700 text-2xl font-bold text-center mb-4">
            Update Address
          </Text>

          {/* Change Pin Location Button */}
          <TouchableOpacity
            style={{
              backgroundColor: "#bc430b",
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
              marginBottom: 20,
              alignSelf: "center",
            }}
            onPress={() => setShowMapAndSearch(!showMapAndSearch)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {showMapAndSearch ? "Hide Map" : "Change Pin Location"}
            </Text>
          </TouchableOpacity>

          {showMapAndSearch && (
            <>
              {/* Google Places Autocomplete Search */}
              <GooglePlacesAutocomplete
                placeholder="Search for a place"
                onPress={(data, details = null) => {
                  const { lat, lng } = details.geometry.location;
                  setRegion({
                    latitude: lat,
                    longitude: lng,
                    latitudeDelta: 0.0005,
                    longitudeDelta: 0.0005,
                  });
                  setLatitude(lat.toString());
                  setLongitude(lng.toString());
                }}
                query={{
                  key: "AIzaSyCFO_T55JEAoSenMwDInPSiOqnKnReovWQ",
                  language: "en",
                }}
                fetchDetails={true}
                debounce={200}
                styles={{
                  container: {
                    flex: 0,
                    width: "100%",
                    paddingTop: 20,
                  },
                  textInputContainer: {
                    width: "100%",
                    backgroundColor: "transparent",
                    borderBottomWidth: 0,
                  },
                  textInput: {
                    width: "100%",
                    height: 40,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 12,
                    paddingLeft: 10,
                  },
                }}
              />
              {/* Map View */}
              <View style={{ height: 200, marginTop: 10 }}>
  <MapView
    style={{ flex: 1 }}
    region={region}
    showsUserLocation={true}
    showsMyLocationButton={true}
    onPress={(event) => {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      setLatitude(latitude.toString());
      setLongitude(longitude.toString());
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setCurrentLocation({ latitude, longitude });
    }}
  >
    {currentLocation && (
      <Marker
        coordinate={currentLocation}
        draggable
        onDragEnd={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setLatitude(latitude.toString());
          setLongitude(longitude.toString());
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
          setCurrentLocation({ latitude, longitude });
        }}
      />
    )}
  </MapView>
</View>
            </>
          )}

          {/* Address Form */}
          <ScrollView keyboardShouldPersistTaps="handled">
            {[
              { label: "House Number", value: houseNo, setter: setHouseNo },
              { label: "Street Name", value: streetName, setter: setStreetName },
              { label: "Barangay", value: barangay, setter: setBarangay },
              { label: "City", value: city, setter: setCity },
              { label: "Latitude", value: latitude, setter: setLatitude, keyboardType: "numeric" },
              { label: "Longitude", value: longitude, setter: setLongitude, keyboardType: "numeric" },
            ].map(({ label, value, setter, keyboardType }, index) => (
              <View key={uuidv4()} style={styles.form}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  placeholder={`Enter ${label.toLowerCase()}`}
                  value={value}
                  onChangeText={setter}
                  keyboardType={keyboardType || "default"}
                  style={styles.input}
                />
              </View>
            ))}

            {/* Update Button */}
            <View className="flex items-center mb-5">
              <TouchableOpacity
                style={{
                  backgroundColor: "#bc430b",
                  width: 350,
                  height: 50,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={submitHandler}
                disabled={loading}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                  Update
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default AddressUpdate;
