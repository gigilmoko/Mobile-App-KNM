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

  // useEffect(() => {
  //   if (sessionByOrderId) {
  //     console.log("Session by Order ID:", sessionByOrderId);
  //   }
  // }, [sessionByOrderId]);

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
      console.log("Rider Location Update:", {
        latitude: sessionByOrderId.rider.location.latitude,
        longitude: sessionByOrderId.rider.location.longitude,
        timestamp: new Date().toISOString(),
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
          console.log("Polling for rider location update...");
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

  const handleCall = (phoneNumber) => {
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
  };

  // ...existing code...

  // ...existing code...

  // const overallPrice = order?.orderProducts
  //     ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0)
  //     : 0;

  // const totalQuantity = order?.orderProducts
  //     ? order.orderProducts.reduce((acc, item) => acc + item.quantity, 0)
  //     : 0;

const htmlContent =
    location && userDeliveryLocation
      ? `
    <!DOCTYPE html>
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
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
                .car-marker {
                    transition: all 0.5s ease-in-out;
                    transform-origin: center;
                }
                /* Hide routing instructions panel */
                .leaflet-routing-container {
                    display: none !important;
                }
                /* Enhanced route line styling */
                .leaflet-routing-line {
                    stroke: #e01d47 !important;
                    stroke-width: 4px !important;
                    stroke-opacity: 1 !important;
                    stroke-linecap: round !important;
                    stroke-linejoin: round !important;
                }
                /* Force all polylines to be visible */
                .leaflet-overlay-pane path {
                    stroke: #e01d47 !important;
                    stroke-width: 4px !important;
                    stroke-opacity: 1 !important;
                    fill: none !important;
                    stroke-linecap: round !important;
                    stroke-linejoin: round !important;
                }
                /* Ensure all interactive elements are styled */
                .leaflet-interactive {
                    stroke: #e01d47 !important;
                    stroke-width: 4px !important;
                    stroke-opacity: 1 !important;
                    fill: none !important;
                }
                /* Fallback polyline styling */
                .route-line {
                    stroke: #e01d47 !important;
                    stroke-width: 4px !important;
                    stroke-opacity: 1 !important;
                    fill: none !important;
                }
            </style>
        </head>
        <body>
            <div id="status" class="status-indicator">Connecting...</div>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js"></script>
            <script>
                console.log('Map initializing...');
                
                // Set the initial view
                var map = L.map('map', {
                    maxZoom: 20,
                    minZoom: 1,
                    zoomControl: true
                }).setView([${location.latitude}, ${location.longitude}], 15);
                
                var userInteracting = false;
                var lastUserInteraction = 0;
                var AUTO_CENTER_DELAY = 10000;
                var lastUpdateTime = Date.now();
                var statusElement = document.getElementById('status');
                var previousLocation = null;
                var isFirstUpdate = true;
                var routingControl = null;
                var currentZoom = 15;
                var currentCenter = [${location.latitude}, ${location.longitude}];
                var fallbackLine = null;

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 20
                }).addTo(map);

                // Car icon SVG
                var carSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16h8"/><path d="M16 16v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2"/><path d="M8 16v2a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-2"/><rect width="18" height="12" x="3" y="6" rx="2"/><path d="M10 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/><path d="M18 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>';

                // Home icon SVG  
                var homeSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>';

                // Custom car icon for rider
                var carIcon = L.divIcon({
                    className: 'car-marker',
                    html: '<div style="background: #e01d47; width: 30px; height: 30px; border-radius: 6px; border: 2px solid white; box-shadow: 0 2px 8px rgba(224,29,71,0.6); display: flex; align-items: center; justify-content: center; color: white; transform: rotate(0deg);">' + carSvg + '</div>',
                    iconSize: [34, 34],
                    iconAnchor: [17, 17]
                });

                // Custom home icon for destination
                var homeIcon = L.divIcon({
                    className: 'home-marker',
                    html: '<div style="background: #28a745; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(40,167,69,0.6); display: flex; align-items: center; justify-content: center; color: white;">' + homeSvg + '</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 15]
                });

                // Add markers
                var riderLocationMarker = L.marker([${location.latitude}, ${location.longitude}], {
                    icon: carIcon,
                    zIndexOffset: 1000
                }).addTo(map).bindPopup('<b>Rider Location</b><br>Live tracking');

                var userLocationMarker = L.marker([${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude}], {
                    icon: homeIcon,
                    zIndexOffset: 999
                }).addTo(map).bindPopup('<b>Delivery Address</b><br>Your destination');

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

                // Create fallback polyline
                function createFallbackLine(startLat, startLng) {
                    if (fallbackLine) {
                        map.removeLayer(fallbackLine);
                    }
                    
                    var distance = calculateDistance(startLat, startLng, ${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude});
                    
                    fallbackLine = L.polyline([
                        [startLat, startLng],
                        [${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude}]
                    ], {
                        color: '#e01d47',
                        weight: 4,
                        opacity: 1,
                        dashArray: '10, 10', // Dashed line for fallback
                        className: 'route-line'
                    }).addTo(map);
                    
                    console.log('Fallback line created (dashed) - Distance:', distance.toFixed(2), 'km');
                }

                // Function to create routing with waypoints
                function createRoute(startLat, startLng) {
                    console.log('Creating route from:', startLat, startLng, 'to:', ${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude});
                    
                    // Store current map state
                    if (!userInteracting) {
                        currentZoom = map.getZoom();
                        currentCenter = map.getCenter();
                    }
                    
                    // Always create fallback line first
                    createFallbackLine(startLat, startLng);
                    
                    // Remove existing routing control
                    if (routingControl) {
                        try {
                            map.removeControl(routingControl);
                            routingControl = null;
                        } catch (e) {
                            console.log('Error removing previous route:', e);
                        }
                    }

                    try {
                        // Generate waypoints based on distance
                        var waypoints = generateWaypoints(startLat, startLng, ${userDeliveryLocation.latitude}, ${userDeliveryLocation.longitude});
                        
                        // Create routing control with waypoints
                        routingControl = L.Routing.control({
                            waypoints: waypoints,
                            routeWhileDragging: false,
                            createMarker: function() { return null; },
                            showAlternatives: false,
                            lineOptions: {
                                styles: [{
                                    color: '#e01d47',
                                    weight: 4,
                                    opacity: 1,
                                    lineCap: 'round',
                                    lineJoin: 'round'
                                }]
                            },
                            show: false,
                            addWaypoints: false,
                            draggableWaypoints: false,
                            fitSelectedRoutes: false,
                            autoRoute: true,
                            router: L.Routing.osrmv1({
                                serviceUrl: 'https://router.project-osrm.org/route/v1',
                                profile: 'driving',
                                timeout: 30000 // Increased timeout for long routes
                            })
                        });

                        var routeTimeout = setTimeout(function() {
                            console.log('Routing timeout - keeping fallback line');
                        }, 30000); // Increased timeout to 30 seconds

                        routingControl.on('routesfound', function(e) {
                            console.log('✅ Route found successfully!');
                            clearTimeout(routeTimeout);
                            
                            // Remove fallback line since we have a proper route
                            if (fallbackLine) {
                                map.removeLayer(fallbackLine);
                                fallbackLine = null;
                            }
                            
                            // Hide instruction panel
                            setTimeout(() => {
                                const containers = document.querySelectorAll('.leaflet-routing-container');
                                containers.forEach(container => {
                                    container.style.display = 'none';
                                });
                            }, 50);
                            
                            // Restore view
                            setTimeout(() => {
                                if (!userInteracting) {
                                    map.setView(currentCenter, currentZoom);
                                }
                            }, 100);
                        });

                        routingControl.on('routeselected', function(e) {
                            console.log('✅ Route selected successfully!');
                            
                            // Remove fallback line
                            if (fallbackLine) {
                                map.removeLayer(fallbackLine);
                                fallbackLine = null;
                            }
                        });

                        routingControl.on('routingerror', function(e) {
                            console.log('❌ Routing error - using fallback line:', e);
                            clearTimeout(routeTimeout);
                        });

                        routingControl.addTo(map);
                        
                    } catch (error) {
                        console.log('❌ Failed to create routing control - using fallback line:', error);
                    }
                }

                // Initialize route
                createRoute(${location.latitude}, ${location.longitude});

                // Track user interactions
                var interactionTimeout;
                
                function resetInteractionTimer() {
                    userInteracting = false;
                    lastUserInteraction = Date.now();
                }

                map.on('dragstart zoomstart', function() {
                    userInteracting = true;
                    currentZoom = map.getZoom();
                    currentCenter = map.getCenter();
                    if (interactionTimeout) clearTimeout(interactionTimeout);
                });

                map.on('dragend zoomend', function() {
                    currentZoom = map.getZoom();
                    currentCenter = map.getCenter();
                    if (interactionTimeout) clearTimeout(interactionTimeout);
                    interactionTimeout = setTimeout(resetInteractionTimer, 3000);
                });

                // Calculate bearing for car rotation
                function calculateBearing(startLat, startLng, endLat, endLng) {
                    var dLng = (endLng - startLng) * Math.PI / 180;
                    var startLatRad = startLat * Math.PI / 180;
                    var endLatRad = endLat * Math.PI / 180;
                    
                    var y = Math.sin(dLng) * Math.cos(endLatRad);
                    var x = Math.cos(startLatRad) * Math.sin(endLatRad) - Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(dLng);
                    
                    var bearing = Math.atan2(y, x) * 180 / Math.PI;
                    return (bearing + 360) % 360;
                }

                // Smooth marker animation with rotation
                function animateMarker(marker, newLatLng, duration = 1000) {
                    var startLatLng = marker.getLatLng();
                    var startTime = Date.now();
                    
                    var bearing = calculateBearing(startLatLng.lat, startLatLng.lng, newLatLng.lat, newLatLng.lng);

                    function animate() {
                        var elapsed = Date.now() - startTime;
                        var progress = Math.min(elapsed / duration, 1);
                        
                        var easeProgress = progress < 0.5 
                            ? 2 * progress * progress 
                            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                        var currentLat = startLatLng.lat + (newLatLng.lat - startLatLng.lat) * easeProgress;
                        var currentLng = startLatLng.lng + (newLatLng.lng - startLatLng.lng) * easeProgress;

                        marker.setLatLng([currentLat, currentLng]);
                        
                        // Rotate car icon
                        var iconElement = marker.getElement();
                        if (iconElement) {
                            var carDiv = iconElement.querySelector('div');
                            if (carDiv) {
                                carDiv.style.transform = 'rotate(' + bearing + 'deg)';
                            }
                        }

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    }

                    animate();
                }

                // Update current location function
                function updateCurrentLocation(lat, lng) {
                    console.log('📍 Updating rider location:', lat, lng);
                    
                    lastUpdateTime = Date.now();
                    statusElement.textContent = 'Live Tracking';
                    statusElement.className = 'status-indicator online';
                    
                    var newLatLng = L.latLng(lat, lng);
                    
                    if (previousLocation && 
                        Math.abs(previousLocation.lat - lat) < 0.0001 && 
                        Math.abs(previousLocation.lng - lng) < 0.0001) {
                        return;
                    }

                    if (!userInteracting) {
                        currentZoom = map.getZoom();
                        currentCenter = map.getCenter();
                    }

                    if (previousLocation && !isFirstUpdate) {
                        animateMarker(riderLocationMarker, newLatLng, 800);
                    } else {
                        riderLocationMarker.setLatLng(newLatLng);
                        isFirstUpdate = false;
                    }
                    
                    previousLocation = { lat: lat, lng: lng };
                    
                    // Update route with delay to allow marker animation
                    setTimeout(() => {
                        createRoute(lat, lng);
                    }, 500);
                    
                    // Auto-center
                    var timeSinceLastInteraction = Date.now() - lastUserInteraction;
                    if (!userInteracting && timeSinceLastInteraction > AUTO_CENTER_DELAY && !isFirstUpdate) {
                        map.flyTo([lat, lng], map.getZoom(), {
                            animate: true,
                            duration: 1.5
                        });
                    }
                }

                // Connection status checker
                setInterval(function() {
                    var timeSinceLastUpdate = Date.now() - lastUpdateTime;
                    if (timeSinceLastUpdate > 15000) {
                        statusElement.textContent = 'Connection Lost';
                        statusElement.className = 'status-indicator';
                    }
                }, 5000);

                // Initial status
                setTimeout(function() {
                    statusElement.textContent = 'Live Tracking';
                    statusElement.className = 'status-indicator online';
                }, 1000);

                console.log('Map initialization complete');
            </script>
        </body>
    </html>
`
      : "";
// ...existing code...
// ...existing code...



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
                      onPress={() => handleCall(sessionByOrderId.rider.phone)}
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
