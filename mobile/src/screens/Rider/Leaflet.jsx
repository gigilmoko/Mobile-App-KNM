import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  View,
  ActivityIndicator,
  ToastAndroid,
  Text,
  ScrollView,
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
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false); // New state for details modal
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null); // New state for order details
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showFullOrderId, setShowFullOrderId] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [completingDeliveries, setCompletingDeliveries] = useState({});

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

  // New function to show order details
  const handleShowOrderDetails = useCallback((order) => {
    setSelectedOrderForDetails(order);
    setShowDetailsModal(true);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedOrderForDetails(null);
  }, []);

  // Format date function
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Invalid date";
    }
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

  // Streamlined delivery completion function
  const handleCompleteDelivery = useCallback(
    async (sessionId, group, orderId) => {
      try {
        // Set loading state
        setCompletingDeliveries((prev) => ({ ...prev, [orderId]: true }));

        // Request camera permission
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
          Alert.alert("Permission required", "Camera permission is needed to capture proof of delivery.");
          setCompletingDeliveries((prev) => ({ ...prev, [orderId]: false }));
          return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (result.canceled) {
          setCompletingDeliveries((prev) => ({ ...prev, [orderId]: false }));
          return;
        }

        const imageUri = result.assets[0].uri;

        ToastAndroid.show("Photo captured! Uploading...", ToastAndroid.SHORT);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: mime.getType(imageUri),
          name: imageUri.split("/").pop(),
        });
        formData.append("upload_preset", "ml_default");

        const response = await axios.post("https://api.cloudinary.com/v1_1/dglawxazg/image/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const imageUrl = response.data.secure_url;

        // Submit proof of delivery
        const orderIds = group.orders.map((order) => order._id);
        await dispatch(submitProofDeliverySession(sessionId, orderIds, imageUrl));

        ToastAndroid.show("Delivery completed successfully!", ToastAndroid.LONG);

        // Refresh data
        if (rider?._id) {
          dispatch(getSessionsByRider(rider._id));
        }
      } catch (error) {
        console.error("Failed to complete delivery", error);
        Alert.alert("Error", "Failed to complete delivery. Please try again.");
      } finally {
        setCompletingDeliveries((prev) => ({ ...prev, [orderId]: false }));
      }
    },
    [dispatch, rider?._id]
  );

  // Alternative: Show confirmation first, then capture photo
  const handleCompleteDeliveryWithConfirmation = useCallback(
    (sessionId, group, orderId) => {
      const customerName = `${group.user.fname} ${group.user.lname}`;

      Alert.alert(
        "Complete Delivery",
        `Ready to complete delivery for ${customerName}? You'll take a photo as proof of delivery.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Take Photo & Complete",
            onPress: () => handleCompleteDelivery(sessionId, group, orderId),
          },
        ]
      );
    },
    [handleCompleteDelivery]
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
    ToastAndroid.show("Delivery session started!", ToastAndroid.SHORT);
  }, [dispatch, currentSessionId]);

  const confirmCompleteSession = useCallback(() => {
    dispatch(completeDeliverySession(currentSessionId));
    setShowCompleteModal(false);
    ToastAndroid.show("All deliveries completed!", ToastAndroid.SHORT);
    navigation.navigate("task");
  }, [dispatch, currentSessionId, navigation]);

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
                          <Ionicons name="cube-outline" size={16} color="#e01d47" />
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
                    <View className="mt-3 flex-row items-center">
                      <View
                        className={`rounded-full h-2 w-2 mr-2 ${
                          group.orders[0].proofOfDelivery ||
                          group.orders[0].status === "Delivered Pending" ||
                          group.orders[0].status === "Delivered"
                            ? "bg-green-500"
                            : group.orders[0].status === "Cancelled"
                            ? "bg-red-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <Text
                        className={`text-sm font-medium ${
                          group.orders[0].proofOfDelivery ||
                          group.orders[0].status === "Delivered Pending" ||
                          group.orders[0].status === "Delivered"
                            ? "text-green-600"
                            : group.orders[0].status === "Cancelled"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {group.orders[0].proofOfDelivery ||
                        group.orders[0].status === "Delivered Pending" ||
                        group.orders[0].status === "Delivered"
                          ? "Delivered"
                          : group.orders[0].status === "Cancelled"
                          ? "Cancelled"
                          : "Ready for delivery"}
                      </Text>
                    </View>

                    {/* Action Buttons Row 1 */}
                    <View className="flex-row mt-4 space-x-2">
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

                    {/* Action Buttons Row 2 - Details Button */}
                    <View className="flex-row mt-2">
                      <TouchableOpacity
                        className="flex-1 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg flex-row items-center justify-center"
                        onPress={() => handleShowOrderDetails(group.orders[0])}
                      >
                        <Ionicons name="information-circle-outline" size={16} color="#2563eb" />
                        <Text className="text-sm text-blue-700 ml-1 font-medium">View Details</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Complete Delivery Button - Updated Logic */}
                    {group.orders[0].proofOfDelivery ||
                    group.orders[0].status === "Delivered Pending" ||
                    group.orders[0].status === "Delivered" ? (
                      <TouchableOpacity
                        className="mt-3 px-4 py-3 rounded-lg bg-green-100 border border-green-200 flex-row items-center justify-center"
                        disabled={true}
                      >
                        <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
                        <Text className="text-sm text-green-700 font-medium ml-2">
                          {group.orders[0].status === "Delivered Pending" ? "Pending Confirmation" : "Delivered"}
                        </Text>
                      </TouchableOpacity>
                    ) : group.orders[0].status === "Cancelled" ? (
                      <TouchableOpacity
                        className="mt-3 px-4 py-3 rounded-lg bg-red-100 border border-red-200 flex-row items-center justify-center"
                        disabled={true}
                      >
                        <Ionicons name="close-circle" size={18} color="#dc2626" />
                        <Text className="text-sm text-red-700 font-medium ml-2">Cancelled</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className={`mt-3 px-4 py-3 rounded-lg flex-row items-center justify-center ${
                          completingDeliveries[group.orders[0]._id] ? "bg-gray-300" : "bg-[#e01d47]"
                        }`}
                        onPress={() => handleCompleteDeliveryWithConfirmation(session._id, group, group.orders[0]._id)}
                        disabled={completingDeliveries[group.orders[0]._id]}
                      >
                        {completingDeliveries[group.orders[0]._id] ? (
                          <>
                            <ActivityIndicator size="small" color="#666" />
                            <Text className="text-sm text-gray-600 font-medium ml-2">Processing...</Text>
                          </>
                        ) : (
                          <>
                            <Ionicons name="camera" size={18} color="white" />
                            <Text className="text-sm text-white font-medium ml-2">Complete Delivery</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Order Details Modal */}
      <Modal visible={showDetailsModal} animationType="slide" transparent={false}>
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="bg-white pt-5 pb-4 px-5 shadow-sm flex-row items-center">
            <TouchableOpacity onPress={handleCloseDetailsModal} className="p-1 mr-3">
              <Ionicons name="arrow-back" size={24} color="#e01d47" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-800 flex-1">Order Details</Text>
          </View>

          {selectedOrderForDetails && (
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
              {/* Order Header */}
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold text-gray-800">
                    {selectedOrderForDetails.KNMOrderId || `Order #${selectedOrderForDetails._id?.slice(0, 8)}`}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${
                    selectedOrderForDetails.status === "Delivered" ? "bg-green-100" :
                    selectedOrderForDetails.status === "Delivered Pending" ? "bg-yellow-100" :
                    selectedOrderForDetails.status === "Cancelled" ? "bg-red-100" : "bg-blue-100"
                  }`}>
                    <Text className={`text-xs font-medium ${
                      selectedOrderForDetails.status === "Delivered" ? "text-green-700" :
                      selectedOrderForDetails.status === "Delivered Pending" ? "text-yellow-700" :
                      selectedOrderForDetails.status === "Cancelled" ? "text-red-700" : "text-blue-700"
                    }`}>
                      {selectedOrderForDetails.status === "Delivered Pending" ? "Pending Confirmation" : 
                       selectedOrderForDetails.status || "Processing"}
                    </Text>
                  </View>
                </View>
                <Text className="text-sm text-gray-500">
                  Order Date: {formatDate(selectedOrderForDetails.createdAt)}
                </Text>
              </View>

              {/* Customer Information */}
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-base font-bold text-gray-800 mb-3">Customer Information</Text>
                <View className="space-y-2">
                  <View className="flex-row">
                    <Text className="text-sm text-gray-500 w-20">Name:</Text>
                    <Text className="text-sm text-gray-800 font-medium flex-1">
                      {selectedOrderForDetails.customer?.name || 
                       (selectedOrderForDetails.user ? `${selectedOrderForDetails.user.fname} ${selectedOrderForDetails.user.lname}` : "N/A")}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-gray-500 w-20">Email:</Text>
                    <Text className="text-sm text-gray-800 flex-1">
                      {selectedOrderForDetails.customer?.email || selectedOrderForDetails.user?.email || "N/A"}
                    </Text>
                  </View>
                  <View className="flex-row">
                    <Text className="text-sm text-gray-500 w-20">Phone:</Text>
                    <Text className="text-sm text-gray-800 flex-1">
                      {selectedOrderForDetails.customer?.phone || selectedOrderForDetails.user?.phone || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Delivery Address */}
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-base font-bold text-gray-800 mb-3">Delivery Address</Text>
                <View className="flex-row">
                  <Ionicons name="location-outline" size={18} color="#e01d47" />
                  <Text className="text-sm text-gray-700 ml-2 flex-1">
                    {selectedOrderForDetails.address ? 
                      [
                        selectedOrderForDetails.address.houseNo,
                        selectedOrderForDetails.address.streetName,
                        selectedOrderForDetails.address.barangay,
                        selectedOrderForDetails.address.city
                      ].filter(Boolean).join(', ') :
                      (selectedOrderForDetails.user?.deliveryAddress && selectedOrderForDetails.user.deliveryAddress[0]) ?
                      [
                        selectedOrderForDetails.user.deliveryAddress[0].houseNo,
                        selectedOrderForDetails.user.deliveryAddress[0].streetName,
                        selectedOrderForDetails.user.deliveryAddress[0].barangay,
                        selectedOrderForDetails.user.deliveryAddress[0].city
                      ].filter(Boolean).join(', ') :
                      "No address information available"
                    }
                  </Text>
                </View>
              </View>

              {/* Order Items */}
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-base font-bold text-gray-800 mb-3">Order Items</Text>
                {Array.isArray(selectedOrderForDetails.products || selectedOrderForDetails.orderProducts) && 
                 (selectedOrderForDetails.products || selectedOrderForDetails.orderProducts).length > 0 ? (
                  <View className="space-y-3">
                    {(selectedOrderForDetails.products || selectedOrderForDetails.orderProducts).map((product, idx) => (
                      <View key={idx} className="flex-row items-center p-3 bg-gray-50 rounded-lg">
                        {product.image ? (
                          <Image 
                            source={{ uri: product.image }} 
                            className="w-12 h-12 rounded bg-gray-200 mr-3"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-12 h-12 rounded bg-gray-200 mr-3 items-center justify-center">
                            <Ionicons name="cube-outline" size={20} color="#999" />
                          </View>
                        )}
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-800" numberOfLines={2}>
                            {product.name || 
                             (product.product && product.product.name) || 
                             `Product ${idx + 1}`}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-1">
                            Quantity: {product.quantity || 1}
                          </Text>
                        </View>
                        <Text className="text-sm font-bold text-gray-800">
                          ₱{parseFloat(product.price || 0).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="bg-gray-50 rounded-lg p-4 items-center justify-center">
                    <Text className="text-sm text-gray-500">No product information available</Text>
                  </View>
                )}
              </View>

              {/* Payment Information */}
              <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-base font-bold text-gray-800 mb-3">Payment Information</Text>
                <View className="flex-row items-center mb-3">
                  <Ionicons 
                    name={selectedOrderForDetails.paymentInfo === "COD" ? "cash-outline" : "card-outline"} 
                    size={18} 
                    color="#e01d47" 
                  />
                  <Text className="text-sm text-gray-700 ml-2">
                    {selectedOrderForDetails.paymentInfo === "COD" ? "Cash on Delivery" : 
                     selectedOrderForDetails.paymentInfo || "Payment method"}
                  </Text>
                </View>
                
                {/* Order Summary */}
                <View className="border-t border-gray-200 pt-3 space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Items Total:</Text>
                    <Text className="text-sm text-gray-800">
                      ₱{(parseFloat(selectedOrderForDetails.totalPrice || 0) - parseFloat(selectedOrderForDetails.shippingCharges || 0)).toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-600">Shipping:</Text>
                    <Text className="text-sm text-gray-800">
                      ₱{parseFloat(selectedOrderForDetails.shippingCharges || 0).toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between pt-2 border-t border-gray-200">
                    <Text className="text-base font-bold text-gray-800">Total:</Text>
                    <Text className="text-base font-bold text-[#e01d47]">
                      ₱{parseFloat(selectedOrderForDetails.totalPrice || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Proof of Delivery */}
              {selectedOrderForDetails.proofOfDelivery && (
                <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                  <Text className="text-base font-bold text-gray-800 mb-3">Proof of Delivery</Text>
                  <Image 
                    source={{ uri: selectedOrderForDetails.proofOfDelivery }} 
                    className="w-full h-48 rounded-lg bg-gray-100"
                    resizeMode="cover"
                  />
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>

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

      <NewFooter />
    </View>
  );
};

export default Leaflet;