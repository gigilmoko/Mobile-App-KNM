import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  ActivityIndicator,
  ToastAndroid,
  Text,
  ScrollView,
  Button,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import mime from "mime";
import axios from "axios";
import { getRiderProfile, updateRiderLocation } from "../../redux/actions/riderActions";
import {
  getSessionsByRider,
  submitProofDeliverySession,
  completeDeliverySession,
  startDeliverySession,
} from "../../redux/actions/deliverySessionActions";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import NewFooter from "./NewFooter";

const Leaflet = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { rider } = useSelector((state) => state.rider);
  const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions || []);

  // State management
  const [location, setLocation] = useState(null);
  const [initialRiderLocation, setInitialRiderLocation] = useState(null);
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
  const [uploading, setUploading] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Initialize rider profile only once when component mounts
  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        try {
          await dispatch(getRiderProfile());
        } catch (error) {
          console.error("Failed to load rider profile:", error);
        }
      };

      initializeData();
    }, [dispatch])
  );

  // Load sessions when rider is available
  useEffect(() => {
    if (rider?._id && !refreshing) {
      dispatch(getSessionsByRider(rider._id));
    }
  }, [dispatch, rider?._id]);

  // Get current location only once
  useEffect(() => {
    let mounted = true;

    const getCurrentLocation = async () => {
      if (locationLoaded) return;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          ToastAndroid.show("Location permission denied", ToastAndroid.LONG);
          return;
        }

        const locationResult = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (mounted) {
          const newLocation = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
          };

          setLocation(newLocation);

          // Store initial location for routing (only set once)
          if (!initialRiderLocation) {
            setInitialRiderLocation(newLocation);
            console.log("Initial rider location set:", newLocation);
          }

          setLocationLoaded(true);
        }
      } catch (error) {
        ToastAndroid.show("Failed to get current location", ToastAndroid.LONG);
        console.error(error);
      }
    };

    getCurrentLocation();

    return () => {
      mounted = false;
    };
  }, [locationLoaded, initialRiderLocation]);

  // Memoized functions to prevent unnecessary re-renders
  const handleShowRoute = useCallback((order) => {
    setSelectedOrder(order);
    setShowMapModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowMapModal(false);
    setSelectedOrder(null);
  }, []);

  useEffect(() => {
    if (ongoingSessions && ongoingSessions.length > 0) {
      console.log("All Ongoing Sessions:", ongoingSessions.length);

      // Log each session's orders with their delivery addresses
      ongoingSessions.forEach((session, index) => {
        console.log(`Session ${index + 1} ID: ${session._id}`);

        if (session.orders && session.orders.length > 0) {
          console.log(`Orders in Session ${index + 1}:`, session.orders.length);

          session.orders.forEach((order, orderIndex) => {
            console.log(`Order ${orderIndex + 1} Information:`, {
              orderId: order._id,
              KNMOrderId: order.KNMOrderId || "N/A",
              status: order.status,
              customer: order.customer,
              address: order.address,
              totalAmount: order.payment?.totalAmount || "N/A",
            });
          });
        } else {
          console.log(`No orders in Session ${index + 1}`);
        }
      });
    } else {
      console.log("No ongoing sessions found");
    }
  }, [ongoingSessions]);

  const handleNavigateToMaps = useCallback(
    (order) => {
      if (!location || !order?.address) {
        Alert.alert("Error", "Location data not available");
        return;
      }

      const dest = order.address;
      const currentLat = location.latitude;
      const currentLng = location.longitude;
      const destLat = dest.latitude || 0;
      const destLng = dest.longitude || 0;

      // Create URLs for different map apps
      const googleMapsUrl = `https://www.google.com/maps/dir/${currentLat},${currentLng}/${destLat},${destLng}`;
      const appleMapsUrl = `http://maps.apple.com/?saddr=${currentLat},${currentLng}&daddr=${destLat},${destLng}&dirflg=d`;
      const wazeUrl = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`;

      Alert.alert("Open in Maps", "Choose your preferred navigation app:", [
        {
          text: "Google Maps",
          onPress: () => Linking.openURL(googleMapsUrl).catch(() => Alert.alert("Error", "Could not open Google Maps")),
        },
        {
          text: "Apple Maps",
          onPress: () => Linking.openURL(appleMapsUrl).catch(() => Alert.alert("Error", "Could not open Apple Maps")),
        },
        {
          text: "Waze",
          onPress: () => Linking.openURL(wazeUrl).catch(() => Alert.alert("Error", "Could not open Waze")),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    },
    [location]
  );

  const handleCaptureProof = useCallback(async (orderId) => {
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
  }, []);

  const uploadToCloudinary = useCallback(async (imageUri, orderId) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: mime.getType(imageUri),
      name: imageUri.split("/").pop(),
    });
    formData.append("upload_preset", "ml_default");

    setUploading(true);
    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dglawxazg/image/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const url = response.data.secure_url;
      setImageUrls((prev) => ({ ...prev, [orderId]: url }));
      Alert.alert("Success", "Image uploaded successfully");
    } catch (error) {
      console.error("Failed to upload image", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDelivered = useCallback(
    (sessionId, group, orderId) => {
      // Check if we have an image URL
      if (!imageUrls[orderId]) {
        Alert.alert("Error", "Please capture a proof of delivery image first");
        return;
      }

      const orderIds = group.orders.map((order) => order._id);
      dispatch(submitProofDeliverySession(sessionId, orderIds, imageUrls[orderId]));
      setCapturedImages((prev) => ({ ...prev, [orderId]: null }));
      setImageUrls((prev) => ({ ...prev, [orderId]: null }));
      Alert.alert("Success", "Proof of delivery submitted.");
    },
    [dispatch, imageUrls]
  );

  const handleCompleteSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
    setShowCompleteModal(true);
  }, []);

  const handleStartSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
    setShowStartModal(true);
  }, []);

  const confirmStartSession = useCallback(() => {
    dispatch(startDeliverySession(currentSessionId));
    setShowStartModal(false);
  }, [dispatch, currentSessionId]);

  const confirmCompleteSession = useCallback(() => {
    dispatch(completeDeliverySession(currentSessionId));
    setShowCompleteModal(false);
    navigation.navigate("task");
  }, [dispatch, currentSessionId, navigation]);

  const removeCapturedImage = useCallback((orderId) => {
    setCapturedImages((prev) => ({ ...prev, [orderId]: null }));
    setImageUrls((prev) => ({ ...prev, [orderId]: null }));
  }, []);

  const handleViewDetails = useCallback((group) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedGroup(null);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (rider?._id) {
        await dispatch(getSessionsByRider(rider._id));
      }
      console.log("================================================FETCHED DATA:", ongoingSessions);
    } catch (error) {
      console.error("Failed to refresh data", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, rider?._id]);

  const handleCall = useCallback((phoneNumber) => {
    if (phoneNumber) {
      const phoneUrl = `tel:${phoneNumber}`;
      Linking.canOpenURL(phoneUrl)
        .then((supported) => {
          if (!supported) {
            Alert.alert("Error", "Phone calls are not supported on this device");
          } else {
            return Linking.openURL(phoneUrl);
          }
        })
        .catch((error) => {
          console.error("Error opening phone app:", error);
          Alert.alert("Error", "Failed to open phone app");
        });
    } else {
      Alert.alert("Error", "No phone number available");
    }
  }, []);

  // Memoized group orders function updated to handle new data structure
  const groupOrdersByUserAndLocation = useMemo(() => {
    return (orders) => {
      const groupedOrders = {};

      orders.forEach((order) => {
        try {
          // Check if the order has customer or user data
          const hasCustomer = order.customer && (order.customer.name || order.customer.email);
          const hasUser = order.user && (order.user.fname || order.user.email);

          // Handle different data structures
          let userKey, userData, addressData;

          if (hasCustomer) {
            // New data structure with customer object
            userKey = `${order.customer?.email || "unknown"}-${JSON.stringify(order.address || {})}`;

            // Split customer name into first and last name
            const nameParts = (order.customer?.name || "").split(" ");
            const firstName = nameParts[0] || "Unknown";
            const lastName = nameParts.slice(1).join(" ") || "Customer";

            userData = {
              fname: firstName,
              lname: lastName,
              email: order.customer?.email || "",
              phone: order.customer?.phone || "",
            };

            addressData = order.address ? [order.address] : [];
          } else if (hasUser) {
            // Original data structure with user object
            userKey = `${order.user?.email || "unknown"}-${JSON.stringify(order.user?.deliveryAddress || {})}`;
            userData = order.user;
            addressData = order.user?.deliveryAddress || [];
          } else {
            // Fallback if neither exists
            userKey = `unknown-${order._id}`;
            userData = {
              fname: "Unknown",
              lname: "Customer",
              email: "",
              phone: "",
            };
            addressData = [];
          }

          if (!groupedOrders[userKey]) {
            groupedOrders[userKey] = {
              user: userData,
              deliveryAddress: addressData,
              orders: [],
            };
          }

          groupedOrders[userKey].orders.push(order);
        } catch (error) {
          console.error("Error processing order for grouping:", error);
        }
      });

      return Object.values(groupedOrders);
    };
  }, []);

  const htmlContent = useMemo(() => {
    if (!selectedOrder || !location) return "";

    try {
      // Handle different data structures
      const address = selectedOrder.address ||
        (selectedOrder.user?.deliveryAddress && selectedOrder.user.deliveryAddress[0]) || {
          houseNo: "",
          streetName: "",
          barangay: "",
          city: "",
        };

      const latitude = parseFloat(address.latitude) || 0;
      const longitude = parseFloat(address.longitude) || 0;

      // Get customer name from appropriate location
      const customerName =
        selectedOrder.customer?.name ||
        (selectedOrder.user ? `${selectedOrder.user.fname} ${selectedOrder.user.lname}` : "Customer");

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
            <style>
              html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
              #map { width: 100%; height: 100%; }
              .custom-marker {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              }
              .start-marker {
                background-color: #22c55e;
                width: 24px;
                height: 24px;
              }
              .end-marker {
                background-color: #ef4444;
                width: 24px;
                height: 24px;
              }
              .leaflet-routing-container {
                display: none !important;
              }
              .leaflet-routing-alternatives-container {
                display: none;
              }
              .leaflet-routing-collapsible {
                cursor: pointer;
              }
            </style>
          </head>
          <body>
            <div id="map"></div>

            <script>
              let map, routingControl, routeLine;

              // Custom SVG icons
              const startIcon = \`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              \`;

              const endIcon = \`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              \`;

              // Calculate distance between two points (Haversine formula)
              function calculateDistance(lat1, lng1, lat2, lng2) {
                var R = 6371; // Radius of the Earth in kilometers
                var dLat = (lat2 - lat1) * Math.PI / 180;
                var dLng = (lng2 - lng1) * Math.PI / 180;
                var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                        Math.sin(dLng/2) * Math.sin(dLng/2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                var distance = R * c; // Distance in kilometers
                return distance;
              }

              // Generate intermediate waypoints for long distances
              function generateWaypoints(startLat, startLng, endLat, endLng) {
                var distance = calculateDistance(startLat, startLng, endLat, endLng);
                var waypoints = [L.latLng(startLat, startLng)];
                
                console.log('Distance between points:', distance.toFixed(2), 'km');
                
                // If distance > 50km, add intermediate waypoints
                if (distance > 50) {
                  var numSegments = Math.min(Math.ceil(distance / 50), 5); // Max 5 segments
                  console.log('Adding', numSegments - 1, 'intermediate waypoints for long distance');
                  
                  for (var i = 1; i < numSegments; i++) {
                    var ratio = i / numSegments;
                    var intermediateLat = startLat + (endLat - startLat) * ratio;
                    var intermediateLng = startLng + (endLng - startLng) * ratio;
                    waypoints.push(L.latLng(intermediateLat, intermediateLng));
                  }
                }
                
                waypoints.push(L.latLng(endLat, endLng));
                return waypoints;
              }

              function createFallbackRoute(startLat, startLng, endLat, endLng) {
                console.log('Creating fallback route...');
                
                // Remove existing route line if any
                if (routeLine) {
                  map.removeLayer(routeLine);
                }
                
                // Create a simple straight line with dashed style
                routeLine = L.polyline([
                  [startLat, startLng],
                  [endLat, endLng]
                ], {
                  color: '#ff6b6b',
                  weight: 4,
                  opacity: 0.8,
                  dashArray: '10, 10'
                }).addTo(map);
                
                // Calculate approximate distance
                const distance = calculateDistance(startLat, startLng, endLat, endLng);
                
                // Fit bounds to show both points
                const bounds = L.latLngBounds([
                  [startLat, startLng],
                  [endLat, endLng]
                ]);
                map.fitBounds(bounds, { padding: [50, 50] });

                // Send fallback info to React Native
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'FALLBACK_ROUTE',
                    message: 'Showing direct path - routing service unavailable',
                    distance: distance.toFixed(2) + ' km (direct)',
                    time: 'Estimated'
                  }));
                }
              }

              function initializeMap() {
                try {
                  const currentLat = ${location.latitude || 0};
                  const currentLng = ${location.longitude || 0};
                  const destLat = ${latitude};
                  const destLng = ${longitude};
                  
                  if (isNaN(destLat) || isNaN(destLng) || isNaN(currentLat) || isNaN(currentLng)) {
                    console.error('Invalid coordinates');
                    return;
                  }
                  
                  console.log('Initializing map with coordinates:', {
                    start: [currentLat, currentLng],
                    end: [destLat, destLng]
                  });
                  
                  // Initialize map
                  map = L.map('map').setView([currentLat, currentLng], 13);
                  
                  // Add tile layer
                  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                  }).addTo(map);

                  // Custom markers
                  const startMarker = L.divIcon({
                    html: '<div class="custom-marker start-marker">' + startIcon + '</div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    className: 'custom-div-icon'
                  });

                  const endMarker = L.divIcon({
                    html: '<div class="custom-marker end-marker">' + endIcon + '</div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    className: 'custom-div-icon'
                  });

                  // Add markers to map
                  L.marker([currentLat, currentLng], { icon: startMarker })
                    .addTo(map)
                    .bindPopup('<strong>Your Location</strong><br>Rider starting point');

                  L.marker([destLat, destLng], { icon: endMarker })
                    .addTo(map)
                    .bindPopup('<strong>Customer Location</strong><br>${address.houseNo || ""} ${
        address.streetName || ""
      }<br>${address.barangay || ""}, ${address.city || ""}');

                  // Generate waypoints based on distance
                  var waypoints = generateWaypoints(currentLat, currentLng, destLat, destLng);

                  // Configure routing control with waypoints
                  routingControl = L.Routing.control({
                    waypoints: waypoints,
                    routeWhileDragging: false,
                    addWaypoints: false,
                    createMarker: function() { 
                      return null; // Don't create default markers
                    },
                    lineOptions: {
                      styles: [
                        { color: '#4285f4', weight: 8, opacity: 0.3 },
                        { color: '#1a73e8', weight: 5, opacity: 0.9 }
                      ]
                    },
                    router: L.Routing.osrmv1({
                      serviceUrl: 'https://router.project-osrm.org/route/v1',
                      profile: 'driving',
                      timeout: 30000, // Increased timeout for long routes
                      polylinePrecision: 5
                    }),
                    formatter: new L.Routing.Formatter({
                      language: 'en',
                      units: 'metric'
                    }),
                    summaryTemplate: '<div class="route-summary">{distance}, {time}</div>',
                    collapsible: true,
                    show: false,
                    fitSelectedRoutes: 'smart',
                    showAlternatives: false
                  });

                  // Handle successful routing
                  routingControl.on('routesfound', function(e) {
                    console.log('Route found successfully:', e.routes);
                    const route = e.routes[0];
                    
                    // Fit map to show the entire route
                    if (route.bounds) {
                      map.fitBounds(route.bounds, {
                        padding: [30, 30]
                      });
                    }

                    // Send route info to React Native
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'ROUTE_FOUND',
                        distance: (route.summary.totalDistance / 1000).toFixed(2) + ' km',
                        time: Math.round(route.summary.totalTime / 60) + ' min',
                        coordinates: route.coordinates || []
                      }));
                    }
                  });

                  // Handle routing errors
                  routingControl.on('routingerror', function(e) {
                    console.error('Routing error occurred:', e);
                    
                    // Try fallback routing service or create manual route
                    setTimeout(() => {
                      createFallbackRoute(currentLat, currentLng, destLat, destLng);
                    }, 1000);
                  });

                  // Handle routing start
                  routingControl.on('routingstart', function(e) {
                    console.log('Routing started...');
                    
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'ROUTING_STARTED',
                        message: 'Calculating route...'
                      }));
                    }
                  });

                  // Add routing control to map
                  try {
                    routingControl.addTo(map);
                    console.log('Routing control added to map');
                  } catch (routingError) {
                    console.error('Failed to add routing control:', routingError);
                    // Create fallback route immediately if routing control fails
                    createFallbackRoute(currentLat, currentLng, destLat, destLng);
                  }

                  // Fallback timer - if no route is found within 30 seconds, show fallback
                  setTimeout(() => {
                    if (!routeLine) {
                      console.log('Routing timeout - creating fallback route');
                      createFallbackRoute(currentLat, currentLng, destLat, destLng);
                    }
                  }, 30000); // Increased timeout to 30 seconds

                  // Send map loaded message
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'MAP_LOADED',
                      message: 'Map initialized successfully'
                    }));
                  }

                } catch (e) {
                  console.error('Map initialization error:', e);
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'ERROR',
                      message: 'Failed to initialize map: ' + e.message
                    }));
                  }
                }
              }

              // Initialize map when DOM is ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeMap);
              } else {
                initializeMap();
              }
            </script>
          </body>
        </html>
      `;
    } catch (error) {
      console.error("Error generating HTML content:", error);
      return "";
    }
  }, [selectedOrder, location]);

  // Update the loading condition
  if (!initialRiderLocation) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#e01d47" />
        <Text className="mt-4 text-gray-600 font-medium">Getting your location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#e01d47" />
        <Text className="mt-4 text-gray-600 font-medium">Preparing delivery map...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-5 pb-4 px-5 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">My Tasks</Text>
        <Text className="text-gray-500">Active delivery assignments</Text>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#e01d47"]} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {ongoingSessions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="checkmark-done-circle-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 mt-4 text-lg font-medium">No active tasks</Text>
            <Text className="text-gray-400 text-center px-10 mt-2">
              You don't have any ongoing delivery tasks at the moment
            </Text>
          </View>
        ) : (
          ongoingSessions.map((session) => (
            <View key={session._id} className="px-5 pt-4">
              {groupOrdersByUserAndLocation(session.orders).map((group, idx) => (
                <View key={idx} className="mb-4 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  {/* Order Header */}
                  <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center">
                        <View className="bg-[#e01d47] bg-opacity-10 rounded-full p-2 mr-2">
                          <Ionicons name="cube-outline" size={16} color="#ffff" />
                        </View>
                        <Text className="text-xs font-semibold text-gray-500">
                          Order ID:{" "}
                          {group.orders[0].KNMOrderId ||
                            (showFullOrderId[group.orders[0]._id]
                              ? group.orders[0]._id
                              : `${group.orders[0]._id.slice(0, 6)}...`)}
                        </Text>
                      </View>

                      {!group.orders[0].KNMOrderId && (
                        <TouchableOpacity
                          onPress={() =>
                            setShowFullOrderId((prev) => ({
                              ...prev,
                              [group.orders[0]._id]: !prev[group.orders[0]._id],
                            }))
                          }
                          className="p-1"
                        >
                          <Ionicons name="eye-outline" size={16} color="#6b7280" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Order Content */}
                  <View className="p-4">
                    {/* Customer Name */}
                    <Text className="text-base font-bold text-gray-800">
                      {group.user.fname} {group.user.lname}
                    </Text>
                    {/* Address */}
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="location-outline" size={16} color="#e01d47" />
                      <Text className="text-sm text-gray-600 ml-2 flex-1">
                        {group.deliveryAddress
                          .map((address) =>
                            `${address.houseNo !== "none" ? address.houseNo : ""} ${
                              address.streetName !== "none" ? address.streetName : ""
                            }, ${address.barangay !== "none" ? address.barangay : ""}, ${
                              address.city !== "none" ? address.city : ""
                            }`
                              .trim()
                              .replace(/^,\s*|,\s*$|,\s*,/g, "")
                          )
                          .join(", ")}
                      </Text>
                    </View>
                    {/* Item Count */}
                    <View className="flex-row items-center mt-2">
                      <Ionicons name="cart-outline" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        {group.orders[0].products
                          ? group.orders[0].products.length
                          : group.orders[0].orderProducts
                          ? group.orders[0].orderProducts.length
                          : group.orders.length}{" "}
                        {(group.orders[0].products && group.orders[0].products.length === 1) ||
                        (group.orders[0].orderProducts && group.orders[0].orderProducts.length === 1) ||
                        group.orders.length === 1
                          ? "item"
                          : "items"}
                      </Text>
                    </View>
                    {/* Order Status */}
                    <View className="mt-4 flex-row items-center">
                      <View
                        className={`rounded-full h-2 w-2 mr-2 ${
                          group.orders[0].proofOfDelivery
                            ? "bg-green-500"
                            : group.orders[0].status === "Cancelled"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <Text
                        className={`text-sm ${
                          group.orders[0].proofOfDelivery
                            ? "text-green-600"
                            : group.orders[0].status === "Cancelled"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {group.orders[0].proofOfDelivery
                          ? "Delivered"
                          : group.orders[0].status === "Cancelled"
                          ? "Cancelled"
                          : "Pending delivery"}
                      </Text>
                    </View>
                    {/* Action Buttons */}
                    <View className="flex-row justify-between mt-4 space-x-2">
                      <TouchableOpacity
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg flex-row items-center justify-center"
                        onPress={() => handleCall(group.user.phone)}
                      >
                        <Ionicons name="call-outline" size={16} color="#e01d47" />
                        <Text className="text-sm text-gray-800 ml-1 font-medium">Call</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg flex-row items-center justify-center"
                        onPress={() => handleShowRoute(group.orders[0])}
                      >
                        <Ionicons name="map-outline" size={16} color="#1e40af" />
                        <Text className="text-sm text-gray-800 ml-1 font-medium">Map</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-200 rounded-lg flex-row items-center justify-center"
                        onPress={() => handleNavigateToMaps(group.orders[0])}
                      >
                        <MaterialIcons name="navigation" size={16} color="#3b82f6" />
                        <Text className="text-sm text-gray-800 ml-1 font-medium">Navigate</Text>
                      </TouchableOpacity>
                    </View>
                    {/* View Details Button */}
                    <TouchableOpacity
                      className="mt-3 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex-row items-center justify-center"
                      onPress={() => handleViewDetails(group)}
                    >
                      <Ionicons name="list-outline" size={16} color="#4b5563" />
                      <Text className="text-sm text-gray-800 ml-2 font-medium">Order Details</Text>
                    </TouchableOpacity>
                    {/* Complete Delivery Button */}
                    // Around line 914, modify the disabled property to also check if there's a captured image:
                    <TouchableOpacity
                      className={`mt-3 px-4 py-3 rounded-lg ${
                        group.orders[0].status === "Cancelled" ? "bg-gray-200" : "bg-[#e01d47]"
                      } flex-row items-center justify-center`}
                      onPress={() => handleDelivered(session._id, group, group.orders[0]._id)}
                    >
                      {group.orders[0].proofOfDelivery ? (
                        <>
                          <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                          <Text className="text-sm text-gray-700 font-medium ml-2">Delivered</Text>
                        </>
                      ) : capturedImages[group.orders[0]._id] || imageUrls[group.orders[0]._id] ? (
                        <>
                          <Ionicons name="checkmark-outline" size={18} color="white" />
                          <Text className="text-sm text-white font-medium ml-2">Complete Delivery</Text>
                        </>
                      ) : group.orders[0].status === "Cancelled" ? (
                        <>
                          <Ionicons name="close-circle" size={18} color="#dc2626" />
                          <Text className="text-sm text-gray-700 font-medium ml-2">Cancelled</Text>
                        </>
                      ) : (
                        <>
                          <Ionicons name="camera-outline" size={18} color="white" />
                          <Text className="text-sm text-white font-medium ml-2">Complete Delivery</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Map Modal */}
      <Modal visible={showMapModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-11/12 h-5/6 bg-white rounded-2xl overflow-hidden shadow-lg">
            <View className="flex-1 relative">
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                onMessage={(event) => {
                  console.log("WebView message:", event.nativeEvent.data);
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === "ROUTE_INFO") {
                      // Handle route information if needed
                    }
                  } catch (e) {
                    console.log("Regular message:", event.nativeEvent.data);
                  }
                }}
              />

              <TouchableOpacity
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md"
                onPress={handleCloseModal}
              >
                <Ionicons name="close" size={22} color="#e01d47" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <View className="p-4 bg-white border-t border-gray-200">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="person-outline" size={18} color="#4b5563" />
                  <Text className="text-base font-medium text-gray-800 ml-2">
                    {selectedOrder.customer?.name ||
                      (selectedOrder.user ? `${selectedOrder.user.fname} ${selectedOrder.user.lname}` : "Customer")}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={18} color="#e01d47" />
                  <Text className="text-sm text-gray-600 ml-2 flex-1">
                    {selectedOrder.address
                      ? `${selectedOrder.address.houseNo !== "none" ? selectedOrder.address.houseNo : ""} ${
                          selectedOrder.address.streetName !== "none" ? selectedOrder.address.streetName : ""
                        }, ${selectedOrder.address.barangay !== "none" ? selectedOrder.address.barangay : ""}, ${
                          selectedOrder.address.city !== "none" ? selectedOrder.address.city : ""
                        }`
                          .trim()
                          .replace(/^,\s*|,\s*$|,\s*,/g, "")
                      : selectedOrder.user?.deliveryAddress
                      ? selectedOrder.user.deliveryAddress
                          .map((address) =>
                            `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`
                              .trim()
                              .replace(/^,\s*|,\s*$|,\s*,/g, "")
                          )
                          .join(", ")
                      : "No address available"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Start Session Modal */}
      <Modal visible={showStartModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-10/12 p-6 bg-white rounded-2xl items-center shadow-lg">
            <Ionicons name="help-circle-outline" size={48} color="#e01d47" className="mb-4" />
            <Text className="text-lg text-center font-medium mb-4">Start Delivery Session?</Text>
            <Text className="text-sm text-gray-600 text-center mb-6">
              This will mark the delivery session as started and notify the customers.
            </Text>
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                className="flex-1 mr-2 py-3 bg-gray-200 rounded-lg items-center"
                onPress={() => setShowStartModal(false)}
              >
                <Text className="font-medium text-gray-800">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 ml-2 py-3 bg-[#e01d47] rounded-lg items-center"
                onPress={confirmStartSession}
              >
                <Text className="font-medium text-white">Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Complete Session Modal */}
      <Modal visible={showCompleteModal} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <View className="w-10/12 p-6 bg-white rounded-2xl items-center shadow-lg">
            <Ionicons name="checkmark-circle-outline" size={48} color="#16a34a" className="mb-4" />
            <Text className="text-lg text-center font-medium mb-4">Complete Delivery Session?</Text>
            <Text className="text-sm text-gray-600 text-center mb-6">
              This will mark all deliveries as completed. Make sure all orders have been delivered.
            </Text>
            <View className="flex-row justify-between w-full">
              <TouchableOpacity
                className="flex-1 mr-2 py-3 bg-gray-200 rounded-lg items-center"
                onPress={() => setShowCompleteModal(false)}
              >
                <Text className="font-medium text-gray-800">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 ml-2 py-3 bg-green-600 rounded-lg items-center"
                onPress={confirmCompleteSession}
              >
                <Text className="font-medium text-white">Complete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            <View className="items-center pt-2 pb-4">
              <View className="w-10 h-1 bg-gray-300 rounded-full mb-4" />
              {selectedGroup && (
                <ScrollView className="w-full px-6" showsVerticalScrollIndicator={false}>
                  <View className="pb-6">
                    <Text className="text-xl font-bold mb-4 text-gray-800">Order Details</Text>
                    <View className="bg-gray-50 p-4 rounded-xl mb-4">
                      <Text className="text-gray-500 text-xs mb-1">Customer</Text>
                      <Text className="text-lg font-bold mb-1 text-gray-800">
                        {selectedGroup.user.fname} {selectedGroup.user.lname}
                      </Text>

                      <View className="flex-row items-center mt-2">
                        <TouchableOpacity
                          onPress={() => handleCall(selectedGroup.user.phone)}
                          className="bg-gray-100 px-3 py-1.5 rounded-full flex-row items-center"
                        >
                          <Ionicons name="call-outline" size={14} color="#4b5563" />
                          <Text className="text-sm text-gray-700 ml-1">{selectedGroup.user.phone}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View className="bg-gray-50 p-4 rounded-xl mb-4">
                      <Text className="text-gray-500 text-xs mb-1">Delivery Location</Text>
                      <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={16} color="#e01d47" />
                        <Text className="text-sm text-gray-800 ml-2 flex-1">
                          {selectedGroup.deliveryAddress
                            .map((address) =>
                              `${address.houseNo !== "none" ? address.houseNo : ""} ${
                                address.streetName !== "none" ? address.streetName : ""
                              }, ${address.barangay !== "none" ? address.barangay : ""}, ${
                                address.city !== "none" ? address.city : ""
                              }`
                                .trim()
                                .replace(/^,\s*|,\s*$|,\s*,/g, "")
                            )
                            .join(", ")}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-base font-bold mb-2 text-gray-800">Order Items</Text>
                    <View className="bg-gray-50 rounded-xl p-4 mb-4">
                      {selectedGroup.orders[0].products ? (
                        // Handle new structure with products array
                        selectedGroup.orders[0].products.map((product, pIdx) => (
                          <View key={`product-${pIdx}`} className="flex-row justify-between mb-3">
                            <View className="flex-row items-center flex-1">
                              <View className="bg-white p-1 rounded-md border border-gray-200 mr-3">
                                <Text className="text-xs font-bold text-gray-700">{product.quantity || 1}x</Text>
                              </View>
                              <Text className="text-sm flex-1">{product.name || "Unknown Product"}</Text>
                            </View>
                            <Text className="text-sm font-medium text-gray-800">
                              ₱{parseFloat(product.price || 0).toFixed(2)}
                            </Text>
                          </View>
                        ))
                      ) : selectedGroup.orders[0].orderProducts ? (
                        // Handle original structure with orderProducts array
                        selectedGroup.orders[0].orderProducts.map((productItem, pIdx) => {
                          const productPrice = productItem.product?.price || productItem.price || 0;
                          const quantity = productItem.quantity || 1;

                          return (
                            <View key={`orderProduct-${pIdx}`} className="flex-row justify-between mb-3">
                              <View className="flex-row items-center flex-1">
                                <View className="bg-white p-1 rounded-md border border-gray-200 mr-3">
                                  <Text className="text-xs font-bold text-gray-700">{quantity}x</Text>
                                </View>
                                <Text className="text-sm flex-1">{productItem.product?.name || "Unknown Product"}</Text>
                              </View>
                              <Text className="text-sm font-medium text-gray-800">
                                ₱{parseFloat(productPrice).toFixed(2)}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text className="text-sm text-gray-500">No items found</Text>
                      )}

                      <View className="border-t border-gray-200 my-3" />

                      <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Delivery Fee</Text>
                        <Text className="text-sm text-gray-700">
                          ₱
                          {parseFloat(
                            selectedGroup.orders[0].payment?.shippingCharges ||
                              selectedGroup.orders[0].shippingCharges ||
                              0
                          ).toFixed(2)}
                        </Text>
                      </View>

                      <View className="flex-row justify-between mt-1">
                        <Text className="text-sm text-gray-600">Payment Method</Text>
                        <Text className="text-sm text-gray-700">
                          {selectedGroup.orders[0].payment?.method ||
                            selectedGroup.orders[0].paymentInfo ||
                            "Cash on Delivery"}
                        </Text>
                      </View>

                      <View className="border-t border-gray-200 my-3" />

                      <View className="flex-row justify-between items-center">
                        <Text className="text-base font-bold">Total</Text>
                        <Text className="text-base font-bold text-[#e01d47]">
                          ₱
                          {(() => {
                            try {
                              // First try to get the total from the payment object (new structure)
                              if (selectedGroup.orders[0].payment?.totalAmount) {
                                return parseFloat(selectedGroup.orders[0].payment.totalAmount).toFixed(2);
                              }

                              // Next try totalPrice (old structure)
                              if (selectedGroup.orders[0].totalPrice) {
                                return parseFloat(selectedGroup.orders[0].totalPrice).toFixed(2);
                              }

                              // If no direct total, calculate from products
                              let total = 0;

                              if (selectedGroup.orders[0].products) {
                                // Calculate from products array (new structure)
                                selectedGroup.orders[0].products.forEach((product) => {
                                  const price = parseFloat(product.price || 0);
                                  const quantity = parseInt(product.quantity || 1);
                                  total += price * quantity;
                                });

                                // Add shipping
                                const shipping = parseFloat(selectedGroup.orders[0].payment?.shippingCharges || 0);
                                total += shipping;

                                return total.toFixed(2);
                              } else if (selectedGroup.orders[0].orderProducts) {
                                // Calculate from orderProducts array (old structure)
                                selectedGroup.orders[0].orderProducts.forEach((item) => {
                                  const price = parseFloat(item.product?.price || item.price || 0);
                                  const quantity = parseInt(item.quantity || 1);
                                  total += price * quantity;
                                });

                                // Add shipping
                                const shipping = parseFloat(selectedGroup.orders[0].shippingCharges || 0);
                                total += shipping;

                                return total.toFixed(2);
                              }

                              return "0.00";
                            } catch (err) {
                              console.error("Error calculating total:", err);
                              return "0.00";
                            }
                          })()}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-base font-bold mb-2 text-gray-800">Proof of Delivery</Text>
                    {uploading ? (
                      <View className="items-center justify-center bg-gray-50 rounded-xl p-8">
                        <ActivityIndicator size="large" color="#e01d47" />
                        <Text className="mt-4 text-gray-600">Uploading image...</Text>
                      </View>
                    ) : selectedGroup.orders[0].proofOfDelivery ? (
                      <View className="relative">
                        <Image
                          source={{ uri: selectedGroup.orders[0].proofOfDelivery }}
                          className="w-full h-56 rounded-xl"
                          resizeMode="cover"
                        />
                        <View className="absolute top-2 right-2 bg-green-500 px-3 py-1 rounded-full">
                          <Text className="text-white text-xs font-medium">Delivered</Text>
                        </View>
                      </View>
                    ) : capturedImages[selectedGroup.orders[0]._id] ? (
                      <View className="relative">
                        <Image
                          source={{ uri: capturedImages[selectedGroup.orders[0]._id] }}
                          className="w-full h-56 rounded-xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                          onPress={() => removeCapturedImage(selectedGroup.orders[0]._id)}
                        >
                          <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        className="flex-row items-center justify-center bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300"
                        onPress={() => handleCaptureProof(selectedGroup.orders[0]._id)}
                      >
                        <Ionicons name="camera-outline" size={24} color="#6b7280" />
                        <Text className="ml-2 text-gray-600 font-medium">Capture Proof of Delivery</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity className="mt-6 px-4 py-3 rounded-lg bg-[#e01d47]" onPress={closeDetailsModal}>
                      <Text className="text-white text-center font-medium">Close</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <NewFooter />
    </View>
  );
};

export default Leaflet;
