import React, { useState, useEffect, useRef } from "react";
import { Text, View, ScrollView, Modal, TouchableOpacity, Button } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { getOrderDetails } from '../../redux/actions/orderActions';
import { getSessionByOrderId } from '../../redux/actions/deliverySessionActions';
import Header from "../../components/Layout/Header";
import StepIndicator from "react-native-step-indicator";
import { useNavigation } from "@react-navigation/native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { loadUser } from "../../redux/actions/userActions";

const OrderDetails = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();  
    const isFocused = useIsFocused();
    const route = useRoute();
    const { id } = route.params;
    const customStyles = {
        stepIndicatorSize: 25,
        currentStepIndicatorSize: 30,
        separatorStrokeWidth: 2,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: "#FB6831",
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: "#FB6831",
        stepStrokeUnFinishedColor: "#aaaaaa",
        separatorFinishedColor: "#fe7013",
        separatorUnFinishedColor: "#aaaaaa",
        stepIndicatorFinishedColor: "#fe7013",
        stepIndicatorUnFinishedColor: "#ffffff",
        stepIndicatorCurrentColor: "#FFFFFF",
        stepIndicatorLabelFontSize: 13,
        currentStepIndicatorLabelFontSize: 13,
        stepIndicatorLabelCurrentColor: "#fe7013",
        stepIndicatorLabelFinishedColor: "#ffffff",
        stepIndicatorLabelUnFinishedColor: "#aaaaaa",
        labelColor: "#999999",
        labelSize: 13,
        currentStepLabelColor: "#fe7013",
    };
    const { order } = useSelector((state) => state.order);
    const { sessionByOrderId } = useSelector((state) => state.deliverySession);
    const { user } = useSelector((state) => state.user);

    const [location, setLocation] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const webViewRef = useRef(null);
    const [userDeliveryLocation, setUserDeliveryLocation] = useState(null);

    useEffect(() => {
        dispatch(getOrderDetails(id));
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

    const handleShowRoute = () => {
        setShowMapModal(true);
    };

    const handleCloseModal = () => {
        setShowMapModal(false);
    };

    const handleRefreshLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                    if (typeof updateCurrentLocation === 'function') {
                        updateCurrentLocation(${location.coords.latitude}, ${location.coords.longitude});
                    }
                `);
            }
        } catch (error) {
            console.error("Failed to refresh location", error);
        }
    };

    const htmlContent = location && userDeliveryLocation ? `
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
                // Set the initial view to the rider's current location
                var map = L.map('map').setView([${location.latitude}, ${location.longitude}], 20);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }).addTo(map);

                var riderLocationMarker = L.marker([${location.latitude}, ${location.longitude}])
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
                    lineOptions: { styles: [{ color: 'blue', weight: 4 }] },
                    itinerary: {
                        show: false
                    }
                }).addTo(map);

                // Hide the directions panel
                routingControl.on('routeselected', function() {
                    const container = document.querySelector('.leaflet-routing-container');
                    if (container) container.style.display = 'none';
                });

                function updateCurrentLocation(lat, lng) {
                    riderLocationMarker.setLatLng([lat, lng]).update();
                    map.setView([lat, lng], 20);
                }
            </script>
        </body>
    </html>
` : '';

    const [trackingState, setTrackingState] = useState(1);

    useEffect(() => {
        if (order?.status) {
            setTrackingState(
                order.status === "Delivered" ? 3 :
                order.status === "Shipped" ? 2 :
                order.status === "Preparing" ? 1 : 0
            );
        }
    }, [order]);

    const overallPrice = order?.orderProducts 
        ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0)
        : 0;
    
    const totalQuantity = order?.orderProducts 
        ? order.orderProducts.reduce((acc, item) => acc + item.quantity, 0)
        : 0;

    // Ensure order status exists before rendering the UI
    if (!order?.status) {
        return (
            <>
                <View className="flex-1 items-center justify-center bg-gray-200">
                    <Text className="text-lg font-bold text-gray-600">Loading order details...</Text>
                </View>
            </>
        );
    }
    

    return (
        <>
            <Header back={true} />
            <View className="flex-1 bg-gray-200 items-center justify-center px-5 pb-0">
                <View className="mt-2 w-full mb-1">
                    <Text className="text-3xl font-extrabold text-gray-600">Order Details</Text>
                    <Text className="mt-2 text-md">View all details about the order</Text>
                </View>

                <ScrollView className="flex-1 w-full px-1" showsVerticalScrollIndicator={false}>
                    
                    {/* Shipping Address */}
                    {order?.user?.address?.[0] && (
                        <View className="mt-2 w-full">
                            <Text className="text-xl font-extrabold text-gray-600">Shipping Address</Text>
                            <View className="mt-1 bg-white p-3 rounded-lg shadow-md mb-2">
                                <Text className="text-sm text-gray-600">
                                    {order.user.address[0].houseNo || ""} {order.user.address[0].streetName || ""},
                                    {order.user.address[0].barangay || ""}, {order.user.address[0].city || ""}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Order Info */}
                    <View className="mt-2 w-full">
                        <Text className="text-xl font-extrabold text-gray-600">Order Info</Text>
                        <View className="mt-1 bg-white p-3 rounded-lg shadow-sm mb-2">
                            <Text className="text-sm font-bold text-orange-500">Order # {order?._id || ""}</Text>
                            <Text className="text-sm text-gray-600">Ordered on {order?.createdAt?.split("T")[0] || ""}</Text>
                            <View className="mt-4 w-full">
                                <StepIndicator
                                    customStyles={customStyles}
                                    currentPosition={trackingState}
                                    stepCount={3}
                                    labels={["Preparing", "Shipping", "Delivery"]}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Package Details */}
                    {order?.orderProducts?.length > 0 && (
                        <View className="mt-2 w-full">
                            <Text className="text-xl font-extrabold text-gray-600">Package Details</Text>
                            <View className="mt-1 bg-white p-3 rounded-lg shadow-sm mb-2">
                                <Text className="text-sm text-gray-600">Total Quantity: {totalQuantity || ""}</Text>
                                <Text className="text-sm text-gray-600">Payment Method: {order?.paymentInfo || ""}</Text>
                                <ScrollView className="bg-white rounded-lg p-3 max-h-[260px] w-full mb-1" nestedScrollEnabled={true}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                        <Text style={{ fontWeight: 'bold' }}>Quantity</Text>
                                        <Text style={{ fontWeight: 'bold' }}>Product Name</Text>
                                        <Text style={{ fontWeight: 'bold' }}>Price</Text>
                                    </View>
                                    {order.orderProducts.map((i, index) => (
                                        <View key={i.product?._id || index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <Text>{i.quantity || ""}</Text>
                                            <Text>{i.product?.name || ""}</Text>
                                            <Text>₱{i.price?.toFixed(2) || "0.00"}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <View className="flex-row justify-between items-center w-full mt-3">
                                    <Text className="text-l font-medium text-gray-600 opacity-50 max-w-[80%]">Total Price:</Text>
                                    <Text className="text-l font-medium text-orange-600">₱{overallPrice.toFixed(2) || "0.00"}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Rider & Truck Details */}
                    {(order?.status === "Shipped" || order?.status === "Delivered") && (
                        <>
                            {sessionByOrderId?.rider && (
                                <View className="mt-2 w-full">
                                    <Text className="text-xl font-extrabold text-gray-600">Rider Details</Text>
                                    <View className="mt-1 bg-white p-3 rounded-lg shadow-md mb-2">
                                        <Text className="text-sm text-gray-600">Rider: {sessionByOrderId.rider.fname} {sessionByOrderId.rider.lname}</Text>
                                        <Text className="text-sm text-gray-600">Phone: {sessionByOrderId.rider.phone}</Text>
                                    </View>
                                </View>
                            )}
                            {sessionByOrderId?.truck && (
                                <View className="mt-2 w-full">
                                    <Text className="text-xl font-extrabold text-gray-600">Truck Details</Text>
                                    <View className="mt-1 bg-white p-3 rounded-lg shadow-md mb-2">
                                        <Text className="text-sm text-gray-600">Model: {sessionByOrderId.truck.model}</Text>
                                        <Text className="text-sm text-gray-600">Plate No: {sessionByOrderId.truck.plateNo}</Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )}

                    <View className="mt-2 w-full">
                        <Button title="Show Rider Route" onPress={handleShowRoute} />
                    </View>

                    {/* Map Modal */}
                    <Modal visible={showMapModal} animationType="slide">
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity onPress={handleCloseModal}>
                                <Text style={{ padding: 10, fontSize: 16, color: "blue" }}>Close Map</Text>
                                <Button title="Refresh Location" onPress={handleRefreshLocation} />
                            </TouchableOpacity>
                            <WebView ref={webViewRef} originWhitelist={["*"]} source={{ html: htmlContent }} style={{ flex: 1 }} />
                        </View>
                    </Modal>

                    <View className="h-4"></View>
                </ScrollView>
            </View>
        </>
    );
};


export default OrderDetails;
