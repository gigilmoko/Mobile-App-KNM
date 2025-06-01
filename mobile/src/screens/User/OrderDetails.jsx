import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  ScrollView,
  Modal,
  TouchableOpacity,
  Button,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { getOrderDetails, confirmProofOfDelivery, notConfirmProofOfDelivery } from "../../redux/actions/orderActions";
import { getSessionByOrderId } from "../../redux/actions/deliverySessionActions";
import Header from "../../components/Layout/Header";
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { loadUser } from "../../redux/actions/userActions";
import { Ionicons } from "@expo/vector-icons";

const OrderDetails = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const { id } = route.params;
  const { order } = useSelector((state) => state.order);
  const { sessionByOrderId } = useSelector((state) => state.deliverySession);
  const { user } = useSelector((state) => state.user);

  const [location, setLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const webViewRef = useRef(null);
  const [userDeliveryLocation, setUserDeliveryLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      await dispatch(getOrderDetails(id));
      setLoading(false);
    };
    fetchOrderDetails();
  }, [dispatch, id]);

  useEffect(() => {
    if (order?.status === "Shipped" || order?.status === "Delivered") {
      dispatch(getSessionByOrderId(id));
    }
  }, [dispatch, id, order?.status]);

  useEffect(() => {
    if (sessionByOrderId?.rider?.location) {
      setLocation({
        latitude: sessionByOrderId.rider.location.latitude,
        longitude: sessionByOrderId.rider.location.longitude,
      });
    }
  }, [sessionByOrderId]);

  useEffect(() => {
    if (sessionByOrderId) {
      console.log("Session by Order ID:", sessionByOrderId);
    }
  }, [sessionByOrderId]);

  useEffect(() => {
    if (user?.deliveryAddress?.[0]) {
      setUserDeliveryLocation({
        latitude: user.deliveryAddress[0].latitude,
        longitude: user.deliveryAddress[0].longitude,
      });
    }
  }, [user]);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch, isFocused]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (order?.status === "Shipped" || order?.status === "Delivered") {
        await dispatch(getSessionByOrderId(id));
        if (sessionByOrderId?.rider?.location && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
                        if (typeof updateCurrentLocation === 'function') {
                            updateCurrentLocation(${sessionByOrderId.rider.location.latitude}, ${sessionByOrderId.rider.location.longitude});
                        }
                    `);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch, id, order?.status, sessionByOrderId]);

  const handleShowRoute = () => {
    setShowMapModal(true);
  };

  const handleCloseModal = () => {
    setShowMapModal(false);
  };

//   const handleRefreshLocation = async () => {
//     try {
//       const location = await Location.getCurrentPositionAsync({});
//       setLocation({
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       });
//       if (webViewRef.current) {
//         webViewRef.current.injectJavaScript(`
//                     if (typeof updateCurrentLocation === 'function') {
//                         updateCurrentLocation(${location.coords.latitude}, ${location.coords.longitude});
//                     }
//                 `);
//       }
//     } catch (error) {
//       console.error("Failed to refresh location", error);
//     }
//   };

  const handleConfirmDelivery = () => {
    dispatch(confirmProofOfDelivery(id));
  };

  const handleDeliveryDidntArrive = () => {
    dispatch(notConfirmProofOfDelivery(id));
  };

 useEffect(() => {
    if (sessionByOrderId?.rider?.location) {
      console.log('Rider Location Update:', {
        latitude: sessionByOrderId.rider.location.latitude,
        longitude: sessionByOrderId.rider.location.longitude,
        timestamp: new Date().toISOString()
      });
      
      setLocation({
        latitude: sessionByOrderId.rider.location.latitude,
        longitude: sessionByOrderId.rider.location.longitude,
      });
    }
  }, [sessionByOrderId]);
  // ...existing code...
  useEffect(() => {
    let interval;
    
    if (order?.status === "Shipped" || order?.status === "Delivered") {
      // Initial fetch
      dispatch(getSessionByOrderId(id));
      
      // Set up polling every 5 seconds for better performance
      interval = setInterval(async () => {
        try {
            console.log('Polling for rider location update...');
          await dispatch(getSessionByOrderId(id));
        } catch (error) {
          console.error("Failed to fetch session data:", error);
        }
      }, 5000); // 5 seconds instead of 1 second
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch, id, order?.status]);

  // Separate useEffect for updating the map when sessionByOrderId changes
  useEffect(() => {
    if (sessionByOrderId?.rider?.location && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof updateCurrentLocation === 'function') {
          updateCurrentLocation(${sessionByOrderId.rider.location.latitude}, ${sessionByOrderId.rider.location.longitude});
        }
      `);
    }
  }, [sessionByOrderId?.rider?.location]);

  const htmlContent =
    location && userDeliveryLocation
      ? `
    <!DOCTYPE html>
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
            <style>
                #map { height: 100vh; width: 100%; }
                .status-indicator {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    z-index: 1000;
                }
                .status-indicator.online {
                    background: rgba(0,128,0,0.7);
                }
            </style>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            <script src="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.js"></script>
        </head>
        <body>
            <div id="status" class="status-indicator">Connecting...</div>
            <div id="map"></div>
            <script>
                // Set the initial view to the rider's current location
                var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 16);
                var userInteracting = false;
                var lastUserInteraction = 0;
                var AUTO_CENTER_DELAY = 5000; // 5 seconds after user stops interacting
                var lastUpdateTime = Date.now();
                var statusElement = document.getElementById('status');

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                // Custom rider icon for better visibility
                var riderIcon = L.divIcon({
                    className: 'rider-marker',
                    html: '<div style="background: #e01d47; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(224,29,71,0.5);"></div>',
                    iconSize: [26, 26],
                    iconAnchor: [13, 13]
                });

                var riderLocationMarker = L.marker([${location.latitude}, ${location.longitude}], {icon: riderIcon})
                    .addTo(map)
                    .bindPopup('Rider Current Location')
                    .openPopup();

                var userLocationMarker = L.marker([${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude}])
                    .addTo(map)
                    .bindPopup('Your Delivery Location');

                var routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(${location.latitude}, ${location.longitude}),
                        L.latLng(${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude})
                    ],
                    routeWhileDragging: false,
                    createMarker: () => null,
                    showAlternatives: false,
                    lineOptions: { styles: [{ color: '#e01d47', weight: 4, opacity: 0.8 }] },
                    itinerary: {
                        show: false
                    }
                }).addTo(map);

                // Hide the directions panel
                routingControl.on('routeselected', function() {
                    const container = document.querySelector('.leaflet-routing-container');
                    if (container) container.style.display = 'none';
                });

                // Track user interactions
                map.on('dragstart', function() {
                    userInteracting = true;
                    lastUserInteraction = Date.now();
                });

                map.on('dragend', function() {
                    userInteracting = false;
                    lastUserInteraction = Date.now();
                });

                map.on('zoomstart', function() {
                    userInteracting = true;
                    lastUserInteraction = Date.now();
                });

                map.on('zoomend', function() {
                    userInteracting = false;
                    lastUserInteraction = Date.now();
                });

                function updateCurrentLocation(lat, lng) {
                    console.log('Updating rider location:', lat, lng);
                    
                    // Update status indicator
                    lastUpdateTime = Date.now();
                    statusElement.textContent = 'Live Tracking';
                    statusElement.className = 'status-indicator online';
                    
                    // Always update the marker position with smooth animation
                    riderLocationMarker.setLatLng([lat, lng]).update();
                    
                    // Update routing waypoints
                    routingControl.setWaypoints([
                        L.latLng(lat, lng),
                        L.latLng(${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude})
                    ]);
                    
                    // Only center the map if user is not interacting and hasn't interacted recently
                    var timeSinceLastInteraction = Date.now() - lastUserInteraction;
                    if (!userInteracting && timeSinceLastInteraction > AUTO_CENTER_DELAY) {
                        map.setView([lat, lng], map.getZoom(), {animate: true, duration: 1});
                    }
                }

                // Check connection status
                setInterval(function() {
                    var timeSinceLastUpdate = Date.now() - lastUpdateTime;
                    if (timeSinceLastUpdate > 10000) { // No update for 10 seconds
                        statusElement.textContent = 'Connection Lost';
                        statusElement.className = 'status-indicator';
                    }
                }, 2000);

                // Initial status
                setTimeout(function() {
                    statusElement.textContent = 'Live Tracking';
                    statusElement.className = 'status-indicator online';
                }, 1000);
            </script>
        </body>
    </html>
`
      : "";
// ...existing code...

  // const overallPrice = order?.orderProducts
  //     ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0)
  //     : 0;

  // const totalQuantity = order?.orderProducts
  //     ? order.orderProducts.reduce((acc, item) => acc + item.quantity, 0)
  //     : 0;

  const subtotal = order?.orderProducts
    ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;

  const shipping = order?.shippingCharges || 0; // Use order.shippingCharges

  const overallPrice = subtotal + shipping; // Total price includes subtotal + shipping

  // Ensure order status exists before rendering the UI
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-200">
        <ActivityIndicator size="large" color="#FB6831" />
      </View>
    );
  }

  return (
    <>
      <>
        <View className="flex-1 bg-white items-center justify-center px-5 pb-0">
          <ScrollView className="flex-1 w-full px-5 py-5" showsVerticalScrollIndicator={false}>
            <Header title="Order Details" />

            {/* Order Products */}
            <View className="border border-gray-500 rounded-lg px-1 pt-1 bg-white">
              {order.orderProducts.map((i, index) => (
                <View
                  key={i.product?._id || index}
                  className="flex-row items-center justify-between mb-3 border-gray-200"
                >
                  {i.product?.images?.length > 0 && (
                    <Image source={{ uri: i.product.images[0].url }} className="w-12 h-12 rounded-md" />
                  )}

                  <View className="flex-1 ml-2">
                    <Text className="text-sm font-medium text-gray-800">{i.product?.name || "Unknown Product"}</Text>
                    <Text className="text-xs text-gray-500 ml-1">Qty: {i.quantity || 1}</Text>
                  </View>

                  <Text className="text-base font-semibold text-red-500">₱{i.price?.toFixed(2) || "0.00"}</Text>
                </View>
              ))}
            </View>

            {/* Shipping Information */}
            {user?.deliveryAddress?.length > 0 && (
              <View className="bg-white border border-gray-500 p-4 mt-7 rounded-lg shadow-sm">
                <Text className="text-lg font-extrabold text-gray-700">Shipping Information</Text>

                <View className="mt-2 flex-row items-center">
                  <Ionicons name="location-outline" size={20} color="red" />
                  <Text className="text-base font-bold text-gray-800 ml-2">Delivery Address</Text>
                </View>

                <Text className="text-sm text-gray-600 mt-1">
                  {user.deliveryAddress[0]?.houseNo || ""} {user.deliveryAddress[0]?.streetName || ""},{" "}
                  {user.deliveryAddress[0]?.barangay || ""}, {user.deliveryAddress[0]?.city || ""}
                </Text>
              </View>
            )}

            {/* Payment Information */}
            {order?.orderProducts?.length > 0 && (
              <View className="mt-2 w-full ">
                <View className="bg-white p-4 mt-5 rounded-lg shadow-sm border border-gray-500">
                  <Text className="text-lg font-bold text-gray-800 mb-2">Payment Information</Text>

                  <View className="flex-row items-center mb-2">
                    <Ionicons name="card-outline" size={40} color="red" />
                    <View className="ml-2">
                      <Text className="text-sm font-semibold text-gray-800">Payment Method</Text>
                      <Text className="text-sm text-gray-500">{order?.paymentInfo || "N/A"}</Text>
                    </View>
                  </View>

                  <View className="border-b border-gray-200 my-2" />

                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-600">Subtotal</Text>
                    <Text className="text-sm text-gray-800">₱{subtotal.toFixed(2)}</Text>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-gray-600">Shipping</Text>
                    <Text className="text-sm text-gray-800">₱{shipping.toFixed(2)}</Text>
                  </View>

                  <View className="border-b border-gray-200 my-2" />

                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-base font-bold text-gray-800">Total</Text>
                    <Text className="text-lg font-bold text-red-500">₱{overallPrice.toFixed(2)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Rider & Truck Details */}
            {(order?.status === "Shipped" ||
              order?.status === "Delivered" ||
              order?.status === "Delivered Pending" ||
              order?.status === "Cancelled") && (
              <View className="bg-white p-5 mt-5 rounded-lg shadow-sm border border-gray-500">
                <Text className="text-xl font-bold text-gray-800 mb-4">Delivery Details</Text>

                {sessionByOrderId?.rider && (
                  <View className="mb-1">
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={22} color="#e01d47" />
                      <Text className="text-base text-gray-700 ml-3">
                        {sessionByOrderId.rider.fname} {sessionByOrderId.rider.lname}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(`tel:${sessionByOrderId.rider.phone}`)}
                      className="bg-[#e01d47] py-3 rounded-lg items-center mt-4"
                    >
                      <Text className="text-white font-semibold">Call Rider: {sessionByOrderId.rider.phone}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {sessionByOrderId?.truck && (
                  <View>
                    <View className="flex-row items-center">
                      <Ionicons name="car" size={22} color="#e01d47" />
                      <Text className="text-base text-gray-700 ml-3">{sessionByOrderId.truck.model}</Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="pricetag" size={22} color="#e01d47" />
                      <Text className="text-base text-gray-700 ml-3">{sessionByOrderId.truck.plateNo}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Show Rider Route Button */}
            {order?.status === "Shipped" && (
              <TouchableOpacity
                className="bg-[#e01d47] py-3 rounded-lg items-center w-full mt-4 mb-5"
                onPress={handleShowRoute}
              >
                <Text className="text-white font-semibold">Show Rider Route</Text>
              </TouchableOpacity>
            )}

            {/* Proof of Delivery */}
            {(order?.status === "Delivered Pending" ||
              order?.status === "Delivered" ||
              order?.status === "Cancelled") && (
              <View className="mt-5 w-full mb-5">
                <Text className="text-xl font-extrabold text-gray-600">Proof of Delivery</Text>
                <Image source={{ uri: order.proofOfDelivery }} style={{ width: "100%", height: 200, marginTop: 10 }} />

                {order?.status === "Delivered Pending" && (
                  <>
                    <TouchableOpacity
                      className="bg-[#e01d47] py-3 rounded-lg items-center w-full mt-4"
                      onPress={handleConfirmDelivery}
                    >
                      <Text className="text-white font-semibold">Confirm Delivery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="bg-[#e01d47] py-3 rounded-lg items-center w-full mt-3"
                      onPress={handleDeliveryDidntArrive}
                    >
                      <Text className="text-white font-semibold">Delivery Didn't Arrive</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Map Modal */}
            <Modal visible={showMapModal} animationType="slide">
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={handleCloseModal}>
                  <Text style={{ padding: 10, fontSize: 16, color: "blue" }}>Close Map</Text>
                  {/* <Button title="Refresh Location" onPress={handleRefreshLocation} /> */}
                </TouchableOpacity>
                <WebView ref={webViewRef} originWhitelist={["*"]} source={{ html: htmlContent }} style={{ flex: 1 }} />
              </View>
            </Modal>

            <View className="h-4"></View>
          </ScrollView>
        </View>
      </>
    </>
  );
};

export default OrderDetails;
