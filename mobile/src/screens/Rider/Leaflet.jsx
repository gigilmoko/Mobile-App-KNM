import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ActivityIndicator, ToastAndroid, Text, StyleSheet, ScrollView, Button, Modal, TouchableOpacity, Image, Alert, RefreshControl, Linking } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import axios from 'axios';
import { getRiderProfile, updateRiderLocation } from "../../redux/actions/riderActions";
import { getSessionsByRider, submitProofDeliverySession, completeDeliverySession, startDeliverySession, cancelOrder } from "../../redux/actions/deliverySessionActions";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";
import NewFooter from "./NewFooter";

const Leaflet= () => {
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
  const [showFullOrderId, setShowFullOrderId] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false); // Add state for loader
  useEffect(() => {
    dispatch(getRiderProfile());
  }, [dispatch]);
  useEffect(() => {
    if (rider?._id) {
      dispatch(getSessionsByRider(rider._id));
    }
  }, [dispatch, rider]);

  const navigationHandler = (screen) => {
    navigation.navigate(screen);
};
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
    setUploading(true); // Show loader
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
    } finally {
      setUploading(false); // Hide loader
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
  const handleCancelOrder = (sessionId, orderId) => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to cancel this order?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => {
            dispatch(cancelOrder(sessionId, orderId));
            Alert.alert("Success", "Order has been cancelled.");
          },
        },
      ],
      { cancelable: false }
    );
  };
  const handleViewDetails = (group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  };
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedGroup(null);
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (rider?._id) {
        await dispatch(getSessionsByRider(rider._id));
      }
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      setRefreshing(false);
    }
  };
   useEffect(() => {
    dispatch(getRiderProfile());
  }, [dispatch]);

  useEffect(() => {
    if (rider?._id) {
      dispatch(getSessionsByRider(rider._id));
    }
  }, [dispatch, rider]);

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      const phoneUrl = `tel:${phoneNumber}`;
      Linking.canOpenURL(phoneUrl)
        .then((supported) => {
          if (!supported) {
            Alert.alert('Error', 'Phone calls are not supported on this device');
          } else {
            return Linking.openURL(phoneUrl);
          }
        })
        .catch((error) => {
          console.error('Error opening phone app:', error);
          Alert.alert('Error', 'Failed to open phone app');
        });
    } else {
      Alert.alert('Error', 'No phone number available');
    }
  };

  // Remove the existing location tracking useEffect since it's now handled globally
  // Keep only the location state for map display
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
  }, []);

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
      const key = `${order.user.email}-${JSON.stringify(order.user.deliveryAddress)}`;
      if (!groupedOrders[key]) {
        groupedOrders[key] = {
          user: order.user,
          deliveryAddress: order.user.deliveryAddress,
          orders: [],
        };
      }
      groupedOrders[key].orders.push(order);
    });
    return Object.values(groupedOrders);
  };

  return (
    <View className="flex-1 bg-white">
      
      <ScrollView
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
            <Text className="text-xl font-bold text-red-500 mb-2 p-5">My Tasks</Text>
        {ongoingSessions.map((session) => (
         <View key={session._id} className="px-5 mb-2 bg-white rounded">
         {groupOrdersByUserAndLocation(session.orders).map((group, idx) => (
           <View key={idx} className="p-4 mb-4 bg-[#fafafa] rounded border border-[#d9d9d9] shadow">
             
             {/* Order ID */}
             <Text className="text-xs font-semibold text-gray-700">
               Order ID:{" "}
               {group.orders[0].KNMOrderId || (showFullOrderId[group.orders[0]._id]
                 ? group.orders[0]._id
                 : `${group.orders[0]._id.slice(0, 6)}...`)}
               {!group.orders[0].KNMOrderId && (
                 <TouchableOpacity
                   onPress={() =>
                     setShowFullOrderId((prev) => ({
                       ...prev,
                       [group.orders[0]._id]: !prev[group.orders[0]._id],
                     }))
                   }
                 >
                   <Ionicons name="eye" size={14} color="#000" />
                 </TouchableOpacity>
               )}
             </Text>
       
             {/* Customer Name */}
             <Text className="text-base font-bold mt-1">
               {group.user.fname} {group.user.lname}
             </Text>
       
             {/* Address */}
             <Text className="text-sm text-gray-600 mt-1 flex-row items-center">
               <Ionicons name="location" size={14} color="#000" />{" "}
               {group.deliveryAddress
                 .map(
                   (address) =>
                     `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`
                 )
                 .join(", ")}
             </Text>
       
             {/* Item Count */}
             <Text className="text-sm text-gray-600 mt-1 flex-row items-center">
               <Ionicons name="cart" size={14} color="#000" /> {group.orders.length} items
             </Text>
       
             {/* View Details */}
             <TouchableOpacity
               className="mt-3 px-4 py-2 border border-gray-300 rounded bg-white"
               onPress={() => handleViewDetails(group)}
             >
               <Text className="text-sm text-center text-gray-800">View Details</Text>
             </TouchableOpacity>
             <View className="flex-row justify-between mt-3 space-x-2">
               <TouchableOpacity
                 className="flex-1 px-4 py-2 bg-[#e01d47] rounded"
                 onPress={() => handleCall(group.user.phone)} // assuming `group.user.phone` is available
               >
                 <Text className="text-sm text-white text-center">Call</Text>
               </TouchableOpacity>
               <TouchableOpacity
                 className="flex-1 px-4 py-2 bg-[#e01d47] rounded"
                 onPress={() => handleShowRoute(group.orders[0])}
               >
                 <Text className="text-sm text-white text-center">Navigate</Text>
               </TouchableOpacity>
             </View>
             {/* Complete Delivery */}
             <TouchableOpacity
               className={`mt-3 px-4 py-2 rounded ${
                 !session.startTime || group.orders[0].proofOfDelivery || group.orders[0].status === "Cancelled"
                   ? "bg-gray-300"
                   : "bg-[#e01d47]"
               }`}
               onPress={() =>
                 session.startTime &&
                 !group.orders[0].proofOfDelivery &&
                 group.orders[0].status !== "Cancelled" &&
                 handleDelivered(session._id, group, group.orders[0]._id)
               }
               disabled={!session.startTime || !!group.orders[0].proofOfDelivery || group.orders[0].status === "Cancelled"}
             >
               <Text className="text-sm text-white text-center">
                 {group.orders[0].proofOfDelivery
                   ? "Delivery Completed"
                   : group.orders[0].status === "Cancelled"
                   ? "Order Cancelled"
                   : "Complete Delivery"}
               </Text>
             </TouchableOpacity>
       
             {/* Cancel Order */}
             <TouchableOpacity
               className={`mt-3 px-4 py-2 rounded ${
                 !session.startTime || group.orders[0].status === "Cancelled" || group.orders[0].proofOfDelivery
                   ? "bg-gray-300"
                   : "bg-gray-500"
               }`}
               onPress={() =>
                 session.startTime &&
                 group.orders[0].status !== "Cancelled" &&
                 !group.orders[0].proofOfDelivery &&
                 handleCancelOrder(session._id, group.orders[0]._id)
               }
               disabled={!session.startTime || group.orders[0].status === "Cancelled" || !!group.orders[0].proofOfDelivery}
             >
               <Text className="text-sm text-white text-center">
                 {group.orders[0].status === "Cancelled"
                   ? "Order Cancelled"
                   : group.orders[0].proofOfDelivery
                   ? "Delivery Completed"
                   : "Cancel Order"}
               </Text>
             </TouchableOpacity>
       
             {/* Call & Navigate Buttons at Bottom */}
           
           </View>
         ))}
       
         {/* Session Buttons */}
         {!session.startTime ? (
           <TouchableOpacity
             className="mt-3 px-4 py-2 rounded bg-[#e01d47]"
             onPress={() => handleStartSession(session._id)}
           >
             <Text className="text-sm text-white text-center">Start Session</Text>
           </TouchableOpacity>
         ) : (
           <TouchableOpacity
             className="mt-3 px-4 py-2 rounded bg-[#e01d47]"
             onPress={() => handleCompleteSession(session._id)}
           >
             <Text className="text-sm text-white text-center">Complete Session</Text>
           </TouchableOpacity>
         )}
       </View>
       
        ))}
      </ScrollView>
      <Modal visible={showMapModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View className="w-11/12 h-5/6 bg-white rounded-lg overflow-hidden">
            <View className="flex-1">
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
              />
            </View>
            <View className="p-4 bg-white">
              <Text className="text-sm text-gray-800 flex-row items-center">
                <Ionicons name="location" size={16} color="#e01d47" />{" "}
                {selectedOrder?.user?.deliveryAddress
                  ?.map(
                    (address) =>
                      `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`
                  )
                  .join(", ")}
              </Text>
            </View>
            <TouchableOpacity
              className="absolute top-2 right-2"
              onPress={handleCloseModal}
            >
              <Ionicons name="close-circle" size={24} color="#e01d47" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={showStartModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center style={{ backgroundColor: 'rgba(191, 191, 191, 0.5)' }}">
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
        <View className="flex-1 justify-center items-center style={{ backgroundColor: 'rgba(191, 191, 191, 0.5)' }}">
          <View className="w-72 p-5 bg-white rounded items-center">
            <Text className="text-lg mb-5">Are you sure you want to complete this session?</Text>
            <View className="flex-row justify-between w-full">
              <Button title="Yes" onPress={confirmCompleteSession} />
              <Button title="No" onPress={() => setShowCompleteModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={showDetailsModal} animationType="slide" transparent={true}>
  <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(191, 191, 191, 0.5)' }}>
    <View className="w-80 p-5 bg-white rounded-lg border border-[#d9d9d9] shadow">
      {selectedGroup && (
        <>
          <Text className="text-xl font-bold mb-4">Order Details</Text>


          <Text className="text-sm">Customer</Text>
          <Text className="text-lg font-bold mb-1">
            {selectedGroup.user.fname} {selectedGroup.user.lname}
          </Text>
          <Text className="text-sm text-gray-600 mb-2">{selectedGroup.user.phone}</Text>


          <Text className="text-base font-semibold">Delivery Location</Text>
          <Text className="text-sm text-gray-700 mb-2">
            📍 {selectedGroup.deliveryAddress
              .map((address) => `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`)
              .join(", ")}
          </Text>


          <Text className="text-base font-semibold mb-1">Order Items</Text>
          {selectedGroup.orders.map((order, idx) =>
            order.orderProducts.map((product, pIdx) => (
              <View key={`${idx}-${pIdx}`} className="flex-row justify-between mb-1">
                <Text className="text-sm">
                  {product.quantity}x {product.product ? product.product.name : "Unknown Product"}
                </Text>
                <Text className="text-sm" style={{ color: '#e01d47' }}>
                  ₱{parseFloat(product.price).toFixed(2)}
                </Text>
              </View>
            ))
          )}


          <View className="border-b border-gray-300 my-2" />


          <View className="flex-row justify-between">
            <Text className="text-sm font-semibold">Delivery Fee</Text>
            <Text className="text-sm text-gray-700">
              ₱{parseFloat(selectedGroup.orders[0].shippingCharges).toFixed(2)}
            </Text>
          </View>


          <View className="flex-row justify-between mb-1">
            <Text className="text-sm font-semibold">Payment Method</Text>
            <Text className="text-sm text-gray-700">{selectedGroup.orders[0].paymentInfo}</Text>
          </View>


          <View className="border-b border-gray-300 my-2" />


          <View className="flex-row justify-between items-center">
            <Text className="text-base font-bold">Total</Text>
            <Text className="text-base font-bold" style={{ color: '#e01d47' }}>
              ₱{parseFloat(selectedGroup.orders[0].totalPrice).toFixed(2)}
            </Text>
          </View>


          <View className="border-b border-gray-300 my-2" />


          {uploading ? (
            <ActivityIndicator size="large" color="#e01d47" className="mt-3" />
          ) : selectedGroup.orders[0].proofOfDelivery ? (
            <View className="mt-3 items-center">
              <Image
                source={{ uri: selectedGroup.orders[0].proofOfDelivery }}
                style={{ width: 200, height: 200, borderRadius: 10 }}
              />
              <TouchableOpacity
                className="absolute top-2 right-2"
                onPress={() => removeCapturedImage(selectedGroup.orders[0]._id)}
              >
                <Ionicons name="close-circle" size={24} color="#e01d47" />
              </TouchableOpacity>
            </View>
          ) : capturedImages[selectedGroup.orders[0]._id] ? (
            <View className="mt-3 items-center">
              <Image
                source={{ uri: capturedImages[selectedGroup.orders[0]._id] }}
                style={{ width: 200, height: 200, borderRadius: 10 }}
              />
              <TouchableOpacity
                className="absolute top-2 right-2"
                onPress={() => removeCapturedImage(selectedGroup.orders[0]._id)}
              >
                <Ionicons name="close-circle" size={24} color="#e01d47" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center mt-3"
              onPress={() => handleCaptureProof(selectedGroup.orders[0]._id)}
            >
              <Ionicons name="camera" size={20} color="#000" />
              <Text className="ml-2 text-sm text-gray-800">Capture Proof of Delivery</Text>
            </TouchableOpacity>
          )}


          <TouchableOpacity
            className="mt-5 px-4 py-2 rounded-full"
            style={{ backgroundColor: '#e01d47' }}
            onPress={closeDetailsModal}
          >
            <Text className="text-sm text-white text-center font-semibold">Close</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>



      <NewFooter/>

    </View>
  );
};


export default Leaflet;



