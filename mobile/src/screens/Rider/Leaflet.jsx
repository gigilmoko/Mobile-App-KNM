import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ActivityIndicator, ToastAndroid, Text, ScrollView, Button, Modal, TouchableOpacity, Image, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import axios from 'axios';
import { getRiderProfile, updateRiderLocation } from "../../redux/actions/riderActions";
import { getSessionsByRider, submitProofDeliverySession, completeDeliverySession, startDeliverySession, cancelOrder } from "../../redux/actions/deliverySessionActions";
import { useNavigation } from '@react-navigation/native';

const LeafletTry = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { rider } = useSelector((state) => state.rider);
  const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions || []);
  const [location, setLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const webViewRef = useRef(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [capturedImages, setCapturedImages] = useState({});
  const [imageUrls, setImageUrls] = useState({});
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  useEffect(() => {
    dispatch(getRiderProfile());
  }, [dispatch]);
  useEffect(() => {
    if (rider?._id) {
      dispatch(getSessionsByRider(rider._id));
    }
  }, [dispatch, rider]);
  const handleShowRoute = (order) => {
    setSelectedOrder(order);
    setShowMapModal(true);
  };
  const handleCloseModal = () => {
    setShowMapModal(false);
    setSelectedOrder(null);
  };
  const handleCaptureProof = async (orderId) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      return Alert.alert("Permission required", "Camera permission is needed to capture an image.");
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets) {
      const imageUri = result.assets[0].uri;
      setCapturedImages((prev) => ({ ...prev, [orderId]: imageUri }));
      uploadToCloudinary(imageUri, orderId);
    }
  };
  const uploadToCloudinary = async (imageUri, orderId) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: mime.getType(imageUri),
      name: imageUri.split("/").pop(),
    });
    formData.append('upload_preset', 'ml_default');
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const url = response.data.secure_url;
      setImageUrls((prev) => ({ ...prev, [orderId]: url }));
      Alert.alert("Success", `Image uploaded successfully: ${url}`);
    } catch (error) {
      console.error('Failed to upload image', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };
  const handleDelivered = (sessionId, group, orderId) => {
    const orderIds = group.orders.map(order => order._id);
    dispatch(submitProofDeliverySession(sessionId, orderIds, imageUrls[orderId]));
    setCapturedImages((prev) => ({ ...prev, [orderId]: null }));
    setImageUrls((prev) => ({ ...prev, [orderId]: null }));
    Alert.alert("Success", "Proof of delivery submitted.");
    navigation.navigate("leaflet");
  };
  const handleCompleteSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowCompleteModal(true);
  };
  const handleStartSession = (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowStartModal(true);
  };
  const confirmStartSession = () => {
    dispatch(startDeliverySession(currentSessionId));
    setShowStartModal(false);
    navigation.navigate("leaflet");
  };
  const confirmCompleteSession = () => {
    dispatch(completeDeliverySession(currentSessionId));
    setShowCompleteModal(false);
    navigation.navigate("task");
  };
  const removeCapturedImage = (orderId) => {
    setCapturedImages((prev) => ({ ...prev, [orderId]: null }));
    setImageUrls((prev) => ({ ...prev, [orderId]: null }));
  };
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          ToastAndroid.show("Location permission denied", ToastAndroid.LONG);
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (rider?._id) {
          dispatch(updateRiderLocation(rider._id, location.coords.latitude, location.coords.longitude));
        }
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (typeof updateCurrentLocation === 'function') {
              if (!window.initialLocationSet) {
                updateCurrentLocation(${location.coords.latitude}, ${location.coords.longitude}, true);
                window.initialLocationSet = true;
              } else {
                updateCurrentLocation(${location.coords.latitude}, ${location.coords.longitude}, false);
              }
            }
          `);
        }
      } catch (error) {
        ToastAndroid.show("Failed to get current location", ToastAndroid.LONG);
        console.error(error);
      }
    };
    getCurrentLocation();
  }, [dispatch, rider]);

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const htmlContent = selectedOrder ? `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>#map { height: 100vh; width: 100%; }</style>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 20);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        var currentLocationMarker = L.marker([${location.latitude}, ${location.longitude}])
          .addTo(map)
          .bindPopup('Your Current Location')
          .openPopup();
  
        ${selectedOrder.user.deliveryAddress.map(point => `
          L.Routing.control({
            waypoints: [
              L.latLng(${location.latitude}, ${location.longitude}),
              L.latLng(${point.latitude}, ${point.longitude})
            ],
            routeWhileDragging: false,
            createMarker: () => null,
            showAlternatives: false,
            lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
            itinerary: {
              show: false,
            }
          })
          .addTo(map)
          .on('routeselected', function(e) {
            const container = document.querySelector('.leaflet-routing-container');
            if (container) container.style.display = 'none';
          });
        `).join("\n")}
        function updateCurrentLocation(lat, lng, centerMap) {
          currentLocationMarker.setLatLng([lat, lng]).update();
          if (centerMap) {
            map.setView([lat, lng], 20);
          }
        }
      </script>
    </body>
  </html>
  ` : '';
  const groupOrdersByUserAndLocation = (orders) => {
    const groupedOrders = {};
    orders.forEach(order => {
      if (order.proofOfDelivery === null) {
        const key = `${order.user.email}-${JSON.stringify(order.user.deliveryAddress)}`;
        if (!groupedOrders[key]) {
          groupedOrders[key] = {
            user: order.user,
            deliveryAddress: order.user.deliveryAddress,
            orders: [],
          };
        }
        groupedOrders[key].orders.push(order);
      }
    });
    return Object.values(groupedOrders);
  };
  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-gray-100">
        {ongoingSessions.map((session) => (
          <View key={session._id} className="p-2 mb-1 bg-gray-300 rounded">
            <Text className="text-sm">Session ID: {session._id}</Text>
            <Text className="text-sm">Status: {session.status}</Text>
            <Text className="text-sm">
              Start Time: {session.startTime ? new Date(session.startTime).toLocaleString() : "Not Started"}
            </Text>
            <Text className="text-sm">Rider Status: {session.riderAccepted}</Text>
            {session.truck && (
              <Text className="text-sm">
                Truck Model: {session.truck.model}, Plate No: {session.truck.plateNo}
              </Text>
            )}
            <View className="mt-1 bg-white rounded p-1">
              <Text className="text-sm">Orders:</Text>
              {session.orders.length > 0 ? (
                groupOrdersByUserAndLocation(session.orders).map((group, idx) => (
                  <View key={idx} className="mb-2">
                    <Text className="text-sm">
                      User: {group.user.fname} {group.user.lname}
                    </Text>
                    <Text className="text-sm">Email: {group.user.email}</Text>
                    {group.deliveryAddress.map((address, i) => (
                      <Text key={i} className="text-sm">
                        Delivery Address: {address.houseNo} {address.streetName}, {address.barangay}, {address.city}, {address.latitude}, {address.longitude}
                      </Text>
                    ))}
                    {group.orders.map((order, index) => (
                      <View key={index} className="p-1 bg-gray-200 my-1 rounded">
                        <Text className="text-sm">Order Status: {order.status}</Text>
                        <Text className="text-sm">Payment Method: {order.paymentInfo}</Text>
                        <Text className="text-sm">Total Price: ₱{order.totalPrice}</Text>
                        {session.startTime && order.status !== 'Cancelled' && order.status !== 'Delivered' && !capturedImages[order._id] && (
                          <Button title="Capture Proof" onPress={() => handleCaptureProof(order._id)} />
                        )}
                        {capturedImages[order._id] && (
                          <View className="relative items-center">
                            <TouchableOpacity className="absolute top-0 right-0 bg-red-500 rounded-full w-7 h-7 justify-center items-center z-10" onPress={() => removeCapturedImage(order._id)}>
                              <Text className="text-white font-bold">X</Text>
                            </TouchableOpacity>
                            <Image source={{ uri: capturedImages[order._id] }} className="w-24 h-24 mt-2 mb-2" />
                            {imageUrls[order._id] && (
                              <Button title="Delivered" onPress={() => handleDelivered(session._id, group, order._id)} />
                            )}
                          </View>
                        )}
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <Button title="Cancel Order" onPress={() => handleCancelOrder(session._id, order._id)} />
                        )}
                      </View>
                    ))}
                    {group.orders.some(order => order.status !== 'Cancelled' && order.status !== 'Delivered') && (
                      <View className="mt-2">
                        <Button title="Show Route" onPress={() => handleShowRoute(group.orders[0])} />
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text className="text-sm text-gray-500">No Orders Available</Text>
              )}
            </View>
            {!session.startTime && <Button title="Start Session" onPress={() => handleStartSession(session._id)} />}
            {session.startTime && <Button title="Complete Session" onPress={() => handleCompleteSession(session._id)} />}
          </View>
        ))}
      </ScrollView>
      <Modal visible={showMapModal} animationType="slide">
        <View className="flex-1">
          <TouchableOpacity onPress={handleCloseModal}>
            <Text className="p-2 text-lg text-blue-500">Close Map</Text>
          </TouchableOpacity>
          <WebView ref={webViewRef} originWhitelist={["*"]} source={{ html: htmlContent }} className="flex-1" />
        </View>
      </Modal>
      <Modal visible={showStartModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-72 p-5 bg-white rounded items-center">
            <Text className="text-lg mb-5">Are you sure you want to start this session?</Text>
            <View className="flex-row justify-between w-full">
              <Button title="Yes" onPress={confirmStartSession} />
              <Button title="No" onPress={() => setShowStartModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showCompleteModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-72 p-5 bg-white rounded items-center">
            <Text className="text-lg mb-5">Are you sure you want to complete this session?</Text>
            <View className="flex-row justify-between w-full">
              <Button title="Yes" onPress={confirmCompleteSession} />
              <Button title="No" onPress={() => setShowCompleteModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LeafletTry;