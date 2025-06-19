import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, confirmProofOfDelivery, notConfirmProofOfDelivery } from "../../redux/actions/orderActions";
import { getSessionByOrderId } from "../../redux/actions/deliverySessionActions";
import { getUserDetails } from "../../redux/actions/userActions";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get('window');

const OrderDetails = ({ route, navigation }) => {
  const { id } = route.params;
  const dispatch = useDispatch();
  const { loading, order } = useSelector((state) => state.order);
  const { sessionByOrderId } = useSelector((state) => state.deliverySession);
  const { user: currentUser } = useSelector((state) => state.user);
  const webViewRef = useRef(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [userDeliveryLocation, setUserDeliveryLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchOrderDetails = async () => {
      try {
        await dispatch(getOrderDetails(id));
        if (currentUser) {
          await dispatch(getUserDetails(currentUser._id));
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
        Toast.show({
          type: "error",
          text1: "Failed to load order details",
          text2: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [dispatch, id, currentUser?._id]);

  useEffect(() => {
    // Set up map when order is shipped and we have the user's delivery address
    if (order?.status === "Shipped" && currentUser?.deliveryAddress && currentUser.deliveryAddress.length > 0) {
      // For demo purposes, set a rider location near the delivery address
      // In a real app, this would come from the rider's actual location
      const userLocation = {
        latitude: currentUser.deliveryAddress[0].latitude || 14.5471833,
        longitude: currentUser.deliveryAddress[0].longitude || 121.0355163,
      };
      
      // For demo, set rider location slightly offset from user location
      const riderLocation = {
        latitude: (userLocation.latitude || 0) + 0.005, 
        longitude: (userLocation.longitude || 0) - 0.003
      };
      
      setLocation(riderLocation);
      setUserDeliveryLocation(userLocation);
      setIsMapReady(true);
    }
  }, [order, currentUser]);

  // Fetch and update rider location
  useEffect(() => {
    if (order?.status === "Shipped" || order?.status === "Delivered") {
      dispatch(getSessionByOrderId(id));
    }
  }, [dispatch, id, order?.status]);

  // Update rider location state when session data changes
  useEffect(() => {
    if (sessionByOrderId?.rider?.location) {
      setLocation({
        latitude: sessionByOrderId.rider.location.latitude,
        longitude: sessionByOrderId.rider.location.longitude,
      });
    }
  }, [sessionByOrderId]);

  // Set up live polling for rider location
  useEffect(() => {
    let interval;

    if (order?.status === "Shipped" || order?.status === "Delivered") {
      // Initial fetch
      dispatch(getSessionByOrderId(id));

      // Set up polling every 5 seconds
      interval = setInterval(async () => {
        try {
          console.log("Polling for rider location update...");
          await dispatch(getSessionByOrderId(id));
        } catch (error) {
          console.error("Failed to fetch session data:", error);
        }
      }, 5000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [dispatch, id, order?.status]);

  useEffect(() => {
  if (sessionByOrderId) {
    console.log("Rider Information:", sessionByOrderId.rider ? {
      _id: sessionByOrderId.rider._id,
      name: sessionByOrderId.rider.name,
      email: sessionByOrderId.rider.email,
      phone: sessionByOrderId.rider.phone,
      location: sessionByOrderId.rider.location
    } : "No rider assigned");
    
    // Log just the location for tracking debugging
    if (sessionByOrderId.rider?.location) {
      console.log("Current Rider Location:", {
        latitude: sessionByOrderId.rider.location.latitude,
        longitude: sessionByOrderId.rider.location.longitude,
        timestamp: new Date().toISOString()
      });
    }
  }
}, [sessionByOrderId]);

  // Inject updated location into WebView when rider location changes
  useEffect(() => {
    if (sessionByOrderId?.rider?.location && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof updateCurrentLocation === 'function') {
          updateCurrentLocation(${sessionByOrderId.rider.location.latitude}, ${sessionByOrderId.rider.location.longitude});
        }
        true;
      `);
    }
  }, [sessionByOrderId?.rider?.location]);

  const handleCancelOrder = async () => {
  setCancelLoading(true);
  try {
    // Replace with your API base URL if needed
    const response = await axios.post(
      `${process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"}/api/order/cancel/${order._id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`, // Adjust if you use a different auth method
        },
      }
    );
    Toast.show({
      type: "success",
      text1: "Order cancelled successfully",
    });
    handleRefresh(); // Refresh order details
  } catch (error) {
    Toast.show({
      type: "error",
      text1: "Failed to cancel order",
      text2: error?.response?.data?.message || "Please try again.",
    });
  } finally {
    setCancelLoading(false);
  }
};

  const handleRefresh = () => {
    setIsLoading(true);
    dispatch(getOrderDetails(id))
      .then(() => {
        if (currentUser) {
          return dispatch(getUserDetails(currentUser._id));
        }
      })
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error refreshing order:", error);
        setIsLoading(false);
      });
  };
//CONSOLE LOG ORDER DETAILS
console.log("Order Details:", order);
  const handleCallRider = (phone) => {
    if (!phone) {
      Toast.show({
        type: "error",
        text1: "No phone number available",
      });
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const handleConfirmDelivery = () => {
    dispatch(confirmProofOfDelivery(id));
  };

  const handleDeliveryDidntArrive = () => {
    dispatch(notConfirmProofOfDelivery(id));
  };

  const getStatusColor = (status) => {
    if (!status) return '#808080';
    
    switch (status.toLowerCase()) {
      case 'preparing':
        return '#e01d47';
      case 'shipped':
        return '#ff9800';
      case 'delivered pending':
        return '#2196f3';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#9e9e9e';
      default:
        return '#808080';
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return "help-circle";
    
    switch (status.toLowerCase()) {
      case 'preparing':
        return "time";
      case 'shipped':
        return "cube";
      case 'delivered pending':
        return "alert-circle";
      case 'delivered':
        return "checkmark-circle";
      case 'cancelled':
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  // HTML content for the map view
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

  if (isLoading || loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#e01d47" />
        <Text className="text-[#e01d47] mt-4 font-medium">Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Ionicons name="alert-circle-outline" size={70} color="#e0e0e0" />
        <Text className="text-lg font-medium text-gray-400 mt-4">Order not found</Text>
        <TouchableOpacity
          className="mt-6 bg-[#e01d47] py-3 px-6 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  const deliveryDate = order.deliveryAt
    ? new Date(order.deliveryAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Pending";

  // Calculate total
  const subtotal = order?.orderProducts 
  ? order.orderProducts.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    )
  : 0;
  const deliveryFee = order.shippingCharges || 0;
  const total = subtotal + deliveryFee;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm pt-12 pb-4 px-5">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800 ml-2">Order Details</Text>
          <View className="flex-1" />
          <TouchableOpacity
            onPress={handleRefresh}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Ionicons name="refresh" size={20} color="#e01d47" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Order Header Info */}
        <View className="bg-white p-4 mb-2">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-lg font-bold text-gray-800">
                #{order.KNMOrderId }
              </Text>
              <Text className="text-sm text-gray-500">{formattedDate}</Text>
            </View>
            <View
              className="py-1.5 px-3 rounded-full"
              style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={getStatusIcon(order.status)}
                  size={16}
                  color={getStatusColor(order.status)}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="text-sm font-medium"
                  style={{ color: getStatusColor(order.status) }}
                >
                  {order.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Estimated Delivery */}
          {order.status !== "Cancelled" && (
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <Text className="text-sm text-gray-500">
                {order.status === "Delivered"
                  ? "Delivered on"
                  : "Estimated Delivery"}
              </Text>
              <Text className="text-base font-medium text-gray-800">
                {deliveryDate}
              </Text>
            </View>
          )}
        </View>

        {/* Live Tracking */}
        {order.status === "Shipped" && isMapReady && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-base font-bold text-gray-800 mb-2">
              Live Order Tracking
            </Text>
            <View className="rounded-lg overflow-hidden" style={{ height: 300 }}>
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html: htmlContent }}
                onLoadEnd={() => setIsMapLoaded(true)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={{ borderRadius: 8 }}
                onError={(error) => {
                  console.error("WebView error:", error);
                }}
              />
              {!isMapLoaded && (
                <View
                  className="absolute inset-0 justify-center items-center bg-gray-100"
                  style={{ borderRadius: 12 }}
                >
                  <ActivityIndicator size="large" color="#e01d47" />
                  <Text className="text-sm text-gray-500 mt-2">
                    Loading tracking map...
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Rider Info */}
        {order.status === "Shipped" && sessionByOrderId?.rider && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-base font-bold text-gray-800 mb-2">
              Rider Information
            </Text>
            <View className="flex-row items-center">
              <View className="bg-gray-100 p-3 rounded-full">
                <Ionicons name="person" size={22} color="#e01d47" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-medium text-gray-800">
                  {sessionByOrderId.rider.fname} {sessionByOrderId.rider.lname}
                </Text>
                <Text className="text-sm text-gray-500">
                  {sessionByOrderId.rider.phone || "No phone available"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleCallRider(sessionByOrderId.rider?.phone)}
                className="bg-[#e01d47] p-2.5 rounded-full"
              >
                <Ionicons name="call" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View className="bg-white p-4 mb-2">
          <Text className="text-base font-bold text-gray-800 mb-2">
            Delivery Address
          </Text>
          {currentUser?.deliveryAddress && currentUser.deliveryAddress.length > 0 ? (
            <View className="flex-row">
              <View className="bg-gray-100 p-2.5 rounded-full">
                <Ionicons name="location" size={18} color="#e01d47" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-medium text-gray-800">
                  {currentUser.deliveryAddress[0].houseNo !== "none"
                    ? currentUser.deliveryAddress[0].houseNo + ", "
                    : ""}
                  {currentUser.deliveryAddress[0].streetName !== "none"
                    ? currentUser.deliveryAddress[0].streetName + ", "
                    : ""}
                </Text>
                <Text className="text-sm text-gray-600">
                  {currentUser.deliveryAddress[0].barangay !== "none"
                    ? "Brgy. " + currentUser.deliveryAddress[0].barangay + ", "
                    : ""}
                  {currentUser.deliveryAddress[0].city !== "none"
                    ? currentUser.deliveryAddress[0].city
                    : ""}
                </Text>
              </View>
            </View>
          ) : (
            <Text className="text-base text-gray-500">Address not available</Text>
          )}
        </View>

        {/* Order Items */}
        <View className="bg-white p-4 mb-2">
          <Text className="text-base font-bold text-gray-800 mb-3">
            Order Items
          </Text>
          {order.orderProducts.map((item, index) => (
            <View
              key={index}
              className={`flex-row py-3 ${
                index !== order.orderProducts.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <View className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  source={{
                    uri:
                      item.product?.images?.[0]?.url ||
                      "https://via.placeholder.com/100",
                  }}
                  className="w-full h-full"
                  style={{ resizeMode: "cover" }}
                />
              </View>
              <View className="ml-3 flex-1 justify-center">
                <Text className="text-base font-medium text-gray-800" numberOfLines={2}>
                  {item.product?.name || "Product"}
                </Text>
                <Text className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </Text>
              </View>
              <View className="justify-center">
                <Text className="text-base font-bold text-[#e01d47]">
                  ₱{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Information */}
        <View className="bg-white p-4 mb-2">
          <Text className="text-base font-bold text-gray-800 mb-2">
            Payment Information
          </Text>
          <View className="flex-row items-center mb-3">
            <View className="bg-gray-100 p-2.5 rounded-full">
              <Ionicons
                name={
                  order.paymentInfo === "Cash On Delivery" || order.paymentInfo === "COD"
                    ? "cash"
                    : "card"
                }
                size={18}
                color="#e01d47"
              />
            </View>
            <View className="ml-3">
              <Text className="text-base font-medium text-gray-800">
                {order.paymentInfo === "COD" ? "Cash On Delivery" : order.paymentInfo || "Payment method not specified"}
              </Text>
              <Text className="text-sm text-gray-500">
                {order.paymentStatus || "Pending payment on delivery"}
              </Text>
            </View>
          </View>

          {/* Price Summary */}
          <View className="bg-gray-50 rounded-lg p-3">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Subtotal</Text>
              <Text className="text-sm text-gray-800">₱{subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-600">Delivery Fee</Text>
              <Text className="text-sm text-gray-800">₱{deliveryFee.toFixed(2)}</Text>
            </View>
            <View className="border-t border-gray-200 my-1.5" />
            <View className="flex-row justify-between">
              <Text className="text-base font-bold text-gray-800">Total</Text>
              <Text className="text-base font-bold text-[#e01d47]">
                ₱{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Notes */}
        {order.orderNotes && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-base font-bold text-gray-800 mb-2">Order Notes</Text>
            <Text className="text-base text-gray-700">{order.orderNotes}</Text>
          </View>
        )}
        {order.status === "Preparing" && (
          <View className="bg-white p-4 mb-2">
            <TouchableOpacity
              className="bg-red-600 py-3 rounded-lg flex-row justify-center items-center"
              onPress={handleCancelOrder}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="close-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text className="text-white font-semibold text-center ml-2">
                Cancel Order
              </Text>
            </TouchableOpacity>
            <Text className="text-xs text-gray-500 mt-2 text-center">
              You can only cancel while the order is still being prepared.
            </Text>
          </View>
        )}
        {/* Proof of Delivery Section */}
        {(order?.status === "Delivered Pending" ||
          order?.status === "Delivered") && order.proofOfDelivery && (
          <View className="bg-white p-4 mb-2">
            <Text className="text-base font-bold text-gray-800 mb-2">
              Proof of Delivery
            </Text>
            <Image 
              source={{ uri: order.proofOfDelivery }}
              className="w-full h-48 rounded-lg"
              style={{ resizeMode: "cover" }}
            />
            
            {order?.status === "Delivered Pending" && (
              <View className="flex-row justify-between mt-3">
                <TouchableOpacity
                  className="bg-green-500 py-2 px-4 rounded-lg flex-1 mr-2"
                  onPress={handleConfirmDelivery}
                >
                  <Text className="text-white font-semibold text-center">Confirm Delivery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-500 py-2 px-4 rounded-lg flex-1 ml-2"
                  onPress={handleDeliveryDidntArrive}
                >
                  <Text className="text-white font-semibold text-center">Report Issue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default OrderDetails;