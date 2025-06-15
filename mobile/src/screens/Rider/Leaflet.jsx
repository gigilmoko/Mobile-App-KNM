import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ActivityIndicator, ToastAndroid, Text, StyleSheet, ScrollView, Button, Modal, TouchableOpacity, Image, Alert, RefreshControl, Linking } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import axios from 'axios';
import { getRiderProfile, updateRiderLocation } from "../../redux/actions/riderActions";
import { getSessionsByRider, submitProofDeliverySession, completeDeliverySession, startDeliverySession, cancelOrder } from "../../redux/actions/deliverySessionActions";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import NewFooter from "./NewFooter";

const Leaflet = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { rider } = useSelector((state) => state.rider);
  const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions || []);
  
  // State management
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
  const [uploading, setUploading] = useState(false);
  const [locationLoaded, setLocationLoaded] = useState(false);

  // Initialize rider profile only once when component mounts
  useFocusEffect(
    useCallback(() => {
      const initializeData = async () => {
        try {
          await dispatch(getRiderProfile());
        } catch (error) {
          console.error('Failed to load rider profile:', error);
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
          setLocation({
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
          });
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
  }, [locationLoaded]);

  // Memoized functions to prevent unnecessary re-renders
  const handleShowRoute = useCallback((order) => {
    setSelectedOrder(order);
    setShowMapModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowMapModal(false);
    setSelectedOrder(null);
  }, []);

  const handleNavigateToMaps = useCallback((order) => {
    if (!location || !order.user.deliveryAddress[0]) {
      Alert.alert('Error', 'Location data not available');
      return;
    }

    const dest = order.user.deliveryAddress[0];
    const currentLat = location.latitude;
    const currentLng = location.longitude;
    const destLat = dest.latitude;
    const destLng = dest.longitude;

    // Create URLs for different map apps
    const googleMapsUrl = `https://www.google.com/maps/dir/${currentLat},${currentLng}/${destLat},${destLng}`;
    const appleMapsUrl = `http://maps.apple.com/?saddr=${currentLat},${currentLng}&daddr=${destLat},${destLng}&dirflg=d`;
    const wazeUrl = `https://waze.com/ul?ll=${destLat},${destLng}&navigate=yes`;

    Alert.alert(
      'Open in Maps',
      'Choose your preferred navigation app:',
      [
        {
          text: 'Google Maps',
          onPress: () => Linking.openURL(googleMapsUrl).catch(() => 
            Alert.alert('Error', 'Could not open Google Maps')
          ),
        },
        {
          text: 'Apple Maps',
          onPress: () => Linking.openURL(appleMapsUrl).catch(() => 
            Alert.alert('Error', 'Could not open Apple Maps')
          ),
        },
        {
          text: 'Waze',
          onPress: () => Linking.openURL(wazeUrl).catch(() => 
            Alert.alert('Error', 'Could not open Waze')
          ),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  }, [location]);

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
    formData.append('file', {
      uri: imageUri,
      type: mime.getType(imageUri),
      name: imageUri.split("/").pop(),
    });
    formData.append('upload_preset', 'ml_default');
    
    setUploading(true);
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
      Alert.alert("Success", "Image uploaded successfully");
    } catch (error) {
      console.error('Failed to upload image', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDelivered = useCallback((sessionId, group, orderId) => {
    const orderIds = group.orders.map(order => order._id);
    dispatch(submitProofDeliverySession(sessionId, orderIds, imageUrls[orderId]));
    setCapturedImages((prev) => ({ ...prev, [orderId]: null }));
    setImageUrls((prev) => ({ ...prev, [orderId]: null }));
    Alert.alert("Success", "Proof of delivery submitted.");
  }, [dispatch, imageUrls]);

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

  const handleCancelOrder = useCallback((sessionId, orderId) => {
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
  }, [dispatch]);

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
  }, []);

  // Memoized group orders function
  const groupOrdersByUserAndLocation = useMemo(() => {
    return (orders) => {
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
  }, []);

 
// Add these state variables at the top of your component
const [initialRiderLocation, setInitialRiderLocation] = useState(null);
// const [locationLoaded, setLocationLoaded] = useState(false);

// Modify the location effect to store initial location
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
          console.log('Initial rider location set:', newLocation);
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

const htmlContent = useMemo(() => {
  if (!selectedOrder || !location) return '';

  const delivery = selectedOrder.user.deliveryAddress[0];

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
              const currentLat = ${location.latitude};
              const currentLng = ${location.longitude};
              
              const deliveryAddresses = ${JSON.stringify(selectedOrder.user.deliveryAddress)};
              const firstAddress = deliveryAddresses[0];
              
              if (!firstAddress || !firstAddress.latitude || !firstAddress.longitude) {
                console.error('Invalid delivery address');
                return;
              }
              
              const destLat = parseFloat(firstAddress.latitude);
              const destLng = parseFloat(firstAddress.longitude);
              
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
                .bindPopup('<strong>Customer Location</strong><br>' + firstAddress.houseNo + ' ' + firstAddress.streetName + '<br>' + firstAddress.barangay + ', ' + firstAddress.city);

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
}, [selectedOrder, location]);
// Update the loading condition
if (!initialRiderLocation) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#e01d47" />
      <Text className="mt-2 text-gray-600">Getting your location...</Text>
    </View>
  );
}

  if (!location) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#e01d47" />
        <Text className="mt-2 text-gray-600">Getting your location...</Text>
      </View>
    );
  }

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
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location" size={14} color="#000" />
                  <Text className="text-sm text-gray-600 ml-1">
                    {group.deliveryAddress
                      .map(
                        (address) =>
                          `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`
                      )
                      .join(", ")}
                  </Text>
                </View>
          
                {/* Item Count */}
                <Text className="text-sm text-gray-600 mt-1">
                  🛒 {group.orders.length} items
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
                    className="flex-1 px-4 py-2 bg-[#e01d47] rounded flex-row items-center justify-center"
                    onPress={() => handleCall(group.user.phone)}
                  >
                    <Ionicons name="call" size={16} color="white" />
                    <Text className="text-sm text-white ml-1">Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 px-4 py-2 bg-[#e01d47] rounded flex-row items-center justify-center"
                    onPress={() => handleShowRoute(group.orders[0])}
                  >
                    <Ionicons name="map" size={16} color="white" />
                    <Text className="text-sm text-white ml-1">Map</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 px-4 py-2 bg-blue-500 rounded flex-row items-center justify-center"
                    onPress={() => handleNavigateToMaps(group.orders[0])}
                  >
                    <MaterialIcons name="navigation" size={16} color="white" />
                    <Text className="text-sm text-white ml-1">Navigate</Text>
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
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Map Modal */}
      <Modal visible={showMapModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View className="w-11/12 h-5/6 bg-white rounded-lg overflow-hidden">
            <View className="flex-1">
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                onMessage={(event) => {
                  console.log('WebView message:', event.nativeEvent.data);
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    if (data.type === 'ROUTE_INFO') {
                      // Handle route information if needed
                    }
                  } catch (e) {
                    console.log('Regular message:', event.nativeEvent.data);
                  }
                }}
              />
            </View>
            <View className="p-4 bg-white">
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#e01d47" />
                <Text className="text-sm text-gray-800 ml-2">
                  {selectedOrder?.user?.deliveryAddress
                    ?.map(
                      (address) =>
                        `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`
                    )
                    .join(", ")}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="absolute top-2 right-2 bg-white rounded-full p-1"
              onPress={handleCloseModal}
            >
              <Ionicons name="close-circle" size={24} color="#e01d47" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Start Session Modal */}
      <Modal visible={showStartModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(191, 191, 191, 0.5)' }}>
          <View className="w-72 p-5 bg-white rounded items-center">
            <Text className="text-lg mb-5">Are you sure you want to start this session?</Text>
            <View className="flex-row justify-between w-full">
              <Button title="Yes" onPress={confirmStartSession} />
              <Button title="No" onPress={() => setShowStartModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Complete Session Modal */}
      <Modal visible={showCompleteModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(191, 191, 191, 0.5)' }}>
          <View className="w-72 p-5 bg-white rounded items-center">
            <Text className="text-lg mb-5">Are you sure you want to complete this session?</Text>
            <View className="flex-row justify-between w-full">
              <Button title="Yes" onPress={confirmCompleteSession} />
              <Button title="No" onPress={() => setShowCompleteModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Details Modal */}
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
                <View className="flex-row items-center mb-2">
                  <Ionicons name="location" size={16} color="#e01d47" />
                  <Text className="text-sm text-gray-700 ml-1">
                    {selectedGroup.deliveryAddress
                      .map((address) => `${address.houseNo} ${address.streetName}, ${address.barangay}, ${address.city}`)
                      .join(", ")}
                  </Text>
                </View>

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

      <NewFooter />
    </View>
  );
};

export default Leaflet;