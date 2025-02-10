import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, View, ActivityIndicator, ToastAndroid, Text, ScrollView, Button, Modal, TouchableOpacity, Image, Alert } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import axios from 'axios';
import { getRiderProfile } from "../../redux/actions/riderActions";
import { getSessionsByRider, submitProofDeliverySession, completeDeliverySession, startDeliverySession } from "../../redux/actions/deliverySessionActions";
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
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
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

  const handleCaptureProof = async () => {
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
      setCapturedImage(imageUri);
      uploadToCloudinary(imageUri);
    }
  };

  const uploadToCloudinary = async (imageUri) => {
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
      setImageUrl(url);
      Alert.alert("Success", `Image uploaded successfully: ${url}`);
    } catch (error) {
      console.error('Failed to upload image', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleDelivered = (sessionId, group) => {
    const orderIds = group.orders.map(order => order._id);
    dispatch(submitProofDeliverySession(sessionId, orderIds, imageUrl));
    setCapturedImage(null);
    setImageUrl(null);
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

  const removeCapturedImage = () => {
    setCapturedImage(null);
    setImageUrl(null);
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
      } catch (error) {
        ToastAndroid.show("Failed to get current location", ToastAndroid.LONG);
        console.error(error);
      }
    };

    getCurrentLocation();

    const locationSubscription = Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (newLocation) => {
        setLocation({
          latitude: newLocation.coords.latitude,
          longitude: newLocation.coords.longitude,
        });
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (typeof updateCurrentLocation === 'function') {
              updateCurrentLocation(${newLocation.coords.latitude}, ${newLocation.coords.longitude});
            }
          `);
        }
      }
    );

    return () => {
      locationSubscription.then((sub) => sub.remove());
    };
  }, []);

  if (!location) {
    return (
      <View style={styles.loader}>
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
              show: false
            }
          })
          .addTo(map)
          .on('routeselected', function(e) {
            const container = document.querySelector('.leaflet-routing-container');
            if (container) container.style.display = 'none';
          });
        `).join("\n")}
        
        function updateCurrentLocation(lat, lng) {
          currentLocationMarker.setLatLng([lat, lng]).update();
          map.setView([lat, lng], 20);
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
    <View style={styles.container}>
      <ScrollView style={styles.fullContainer}>
        {ongoingSessions.map((session) => (
          <View key={session._id} style={styles.sessionItem}>
            <Text style={styles.sessionText}>Session ID: {session._id}</Text>
            <Text style={styles.sessionText}>Status: {session.status}</Text>
            <Text style={styles.sessionText}>Start Time: {session.startTime ? new Date(session.startTime).toLocaleString() : "Not Started"}</Text>
            <Text style={styles.sessionText}>Rider Status: {session.riderAccepted}</Text>
            {session.truck && (
              <Text style={styles.sessionText}>Truck Model: {session.truck.model}, Plate No: {session.truck.plateNo}</Text>
            )}
            <View style={styles.ordersContainer}>
              <Text style={styles.sessionText}>Orders:</Text>
              {session.orders.length > 0 ? (
                groupOrdersByUserAndLocation(session.orders).map((group, idx) => (
                  <View key={idx} style={styles.orderGroup}>
                    <Text style={styles.orderText}>User: {group.user.fname} {group.user.lname}</Text>
                    <Text style={styles.orderText}>Email: {group.user.email}</Text>
                    {group.deliveryAddress.map((address, i) => (
                      <Text key={i} style={styles.orderText}>
                        Delivery Address: {address.houseNo} {address.streetName}, {address.barangay}, {address.city}, {address.latitude}, {address.longitude}
                      </Text>
                    ))}
                    
                    {group.orders.map((order, index) => (
                      <View key={index} style={styles.orderItem}>
                        <Text style={styles.orderText}>Order Status: {order.status}</Text>
                        <Text style={styles.orderText}>Payment Method: {order.paymentInfo}</Text>
                        <Text style={styles.orderText}>Total Price: ₱{order.totalPrice}</Text>
                      </View>
                    ))}
                    {session.startTime && !capturedImage && <Button title="Capture Proof" onPress={handleCaptureProof} style={styles.captureButton} />}
                    {capturedImage && (
                      <View style={styles.imageContainer}>
                        <TouchableOpacity style={styles.removeImageButton} onPress={removeCapturedImage}>
                          <Text style={styles.removeImageText}>X</Text>
                        </TouchableOpacity>
                        <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
                        {imageUrl && (
                        <Button 
                          title="Delivered" 
                          onPress={() => handleDelivered(session._id, group)} 
                          style={{ marginBottom: 10 }}
                        />
                      )}
                      </View>
                    )}
                    <View style={{ marginTop: 10 }}>
              <Button title="Show Route" onPress={() => handleShowRoute(group.orders[0])} />
            </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noOrdersText}>No Orders Available</Text>
              )}
            </View>
            {!session.startTime && <Button title="Start Session" onPress={() => handleStartSession(session._id)} />}
            {session.startTime && <Button title="Complete Session" onPress={() => handleCompleteSession(session._id)} />}
          </View>
          
        ))}
          
      </ScrollView>

      {/* Map Modal */}
      <Modal visible={showMapModal} animationType="slide">
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={handleCloseModal}>
            <Text style={{ padding: 10, fontSize: 16, color: "blue" }}>Close Map</Text>
          </TouchableOpacity>
          <WebView ref={webViewRef} originWhitelist={["*"]} source={{ html: htmlContent }} style={styles.webview} />
        </View>
      </Modal>

      {/* Start Session Modal */}
      <Modal visible={showStartModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to start this session?</Text>
            <View style={styles.modalButtonContainer}>
              <Button title="Yes" onPress={confirmStartSession} />
              <Button title="No" onPress={() => setShowStartModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Complete Session Modal */}
      <Modal visible={showCompleteModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to complete this session?</Text>
            <View style={styles.modalButtonContainer}>
              <Button title="Yes" onPress={confirmCompleteSession} />
              <Button title="No" onPress={() => setShowCompleteModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  sessionsContainer: {
    maxHeight: 250,
    backgroundColor: "#f9f9f9",
  },
  sessionItem: {
    padding: 8,
    marginBottom: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  sessionText: {
    fontSize: 14,
  },
  ordersContainer: {
    marginTop: 5,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    padding: 5,
  },
  orderGroup: {
    marginBottom: 10,
  },
  orderItem: {
    padding: 5,
    backgroundColor: "#f0f0f0",
    marginVertical: 3,
    borderRadius: 5,
  },
  orderText: {
    fontSize: 13,
  },
  noOrdersText: {
    fontSize: 13,
    color: "#999",
  },
  capturedImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    marginBottom: 10,
  },
  captureButton: {
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeImageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default LeafletTry;