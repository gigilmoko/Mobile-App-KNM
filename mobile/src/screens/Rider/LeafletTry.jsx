import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StyleSheet, View, ActivityIndicator, ToastAndroid, Text, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { getRiderProfile } from "../../redux/actions/riderActions";
import { getSessionsByRider } from "../../redux/actions/deliverySessionActions";

const LeafletTry = () => {
  const dispatch = useDispatch();
  const { rider } = useSelector((state) => state.rider);
  const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions || []);
  const [location, setLocation] = useState(null);
  const webviewRef = useRef(null);

  useEffect(() => {
    dispatch(getRiderProfile());
  }, [dispatch]);

  useEffect(() => {
    if (rider?._id) {
      dispatch(getSessionsByRider(rider._id));
    }
  }, [dispatch, rider]);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          ToastAndroid.show("Location permission denied", ToastAndroid.LONG);
          return;
        }

        // Start watching the location for real-time updates
        await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            setLocation({ latitude, longitude });
            updateMapLocation(latitude, longitude);
          }
        );
      } catch (error) {
        ToastAndroid.show("Failed to get current location", ToastAndroid.LONG);
        console.error(error);
      }
    };

    getCurrentLocation();
  }, []);

  const updateMapLocation = (latitude, longitude) => {
    if (webviewRef.current) {
      const jsCode = `
        if (window.currentMarker) {
          map.removeLayer(window.currentMarker);
        }
        window.currentMarker = L.marker([${latitude}, ${longitude}])
          .addTo(map)
          .bindPopup('Your Current Location')
          .openPopup();
      `;
      webviewRef.current.injectJavaScript(jsCode);
    }
  };

  const deliveryPoints = ongoingSessions.flatMap(session =>
    session.orders.flatMap(order => order.user.deliveryAddress)
  );

  const htmlContent = `
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
        var map = L.map('map').setView([0, 0], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        window.currentMarker = null;

        ${deliveryPoints
          .map(
            (point) => `
              L.Routing.control({
                waypoints: [
                  L.latLng(0, 0),
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
            `
          )
          .join("\n")}
      </script>
    </body>
  </html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        ref={webviewRef}
      />
      <ScrollView style={styles.sessionsContainer}>
        {ongoingSessions.map((session) => (
          <View key={session._id} style={styles.sessionItem}>
            <Text style={styles.sessionText}>Session ID: {session._id}</Text>
            <Text style={styles.sessionText}>Status: {session.status}</Text>
            <Text style={styles.sessionText}>Start Time: {new Date(session.startTime).toLocaleString()}</Text>
            <Text style={styles.sessionText}>Rider Status: {session.riderAccepted}</Text>
            {session.truck && (
              <Text style={styles.sessionText}>Truck Model: {session.truck.model}, Plate No: {session.truck.plateNo}</Text>
            )}
            <View style={styles.ordersContainer}>
              <Text style={styles.sessionText}>Orders:</Text>
              {session.orders.length > 0 ? (
                session.orders.map((order, index) => (
                  <View key={index} style={styles.orderItem}>
                    <Text style={styles.orderText}>Order Status: {order.status}</Text>
                    <Text style={styles.orderText}>Payment Method: {order.paymentInfo}</Text>
                    <Text style={styles.orderText}>Total Price: ₱{order.totalPrice}</Text>
                    <Text style={styles.orderText}>User: {order.user.fname} {order.user.lname}</Text>
                    <Text style={styles.orderText}>Email: {order.user.email}</Text>
                    {order.user.deliveryAddress.map((address, idx) => (
                      <Text key={idx} style={styles.orderText}>
                        Delivery Address: {address.houseNo} {address.streetName}, {address.barangay}, {address.city}, {address.latitude}, {address.longitude}
                      </Text>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noOrdersText}>No Orders Available</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
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
});

export default LeafletTry;
