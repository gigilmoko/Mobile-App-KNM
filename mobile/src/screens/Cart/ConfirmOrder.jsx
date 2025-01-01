import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/userActions";
import { placeOrder } from "../../redux/actions/orderActions";
import ConfirmOrderItem from "../../components/Cart/ConfirmOrderItem";
import { useNavigation } from "@react-navigation/native";
import { useMessageAndErrorOrder } from "../../../utils/hooks";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { server } from "../../redux/store";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const methods = [
  { name: "Cash on Delivery", value: "COD" },
  { name: "GCash", value: "GCash" },
  { name: "Maya", value: "Maya" },
];

const ConfirmOrder = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [userProfile, setUserProfile] = useState("");
  const [token, setToken] = useState("");

  const itemsPrice = cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
  const shippingCharges = 10; // Updated shipping charges to 10 pesos
  const totalAmount = itemsPrice + shippingCharges;

  useEffect(() => {
    dispatch(loadUser());

    const fetchData = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt");
        if (!jwt) {
          console.log("No token found");
          return;
        }
        setToken(jwt);
        const response = await axios.get(`${server}me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        setUserProfile(response.data.user);
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handlePlaceOrder = async () => {
    const shippingInfo = {
      address: user?.address,
    };

    const order = {
      userId: user._id,
      shippingInfo,
      orderProducts: cartItems,
      paymentMethod,
      itemsPrice,
      shippingCharges,
      totalAmount,
    };

    try {
      const response = await axios.post(`${server}/neworder`, order, {
      });

      if (response.data.success && paymentMethod === "GCash") {
        const { checkoutUrl } = response.data;
        Linking.canOpenURL(checkoutUrl).then((supported) => {
          if (supported) {
            Linking.openURL(checkoutUrl);
          } else {
            Alert.alert(
              'GCash app is not installed on your device.',
              'Please install the GCash app from the App Store or Google Play Store.',
              [
                { text: 'OK' },
                { text: 'Open Store', onPress: () => Linking.openURL('https://play.google.com/store/apps/details?id=com.globe.gcash.android') }
              ]
            );
          }
        }).catch((err) => console.error('An error occurred', err));
      } else {
        Alert.alert('Order Placed Successfully');
        dispatch({ type: "clearCart" });
        navigation.navigate("My Cart");
      }
    } catch (err) {
      console.error('Error placing order:', err);
      Alert.alert('Error', 'Failed to place order');
    }
  };

  const loading = useMessageAndErrorOrder(
    dispatch,
    navigation,
    "home",
    () => ({ type: "clearCart" })
  );

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Order Summary</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.customerDetailsHeader}>
            <Text style={styles.subheading}>Customer Details</Text>
            <TouchableOpacity onPress={() => navigation.navigate("editaddress")}>
              <MaterialCommunityIcons name="pencil" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.text}>Name: {user?.fname} {user?.lname}</Text>
          <Text style={styles.text}>Phone: {user?.phone}</Text>
          <Text style={styles.text}>Address: {user?.address?.houseNo}, {user?.address?.streetName}, {user?.address?.barangay}, {user?.address?.city}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.subheading}>Products</Text>
          {cartItems.map((i) => (
            <ConfirmOrderItem key={i.product} price={i.price} image={i.image} name={i.name} quantity={i.quantity} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.subheading}>Order Summary</Text>
          <View style={styles.row}>
            <Text>Subtotal:</Text>
            <Text>₱{itemsPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Shipping:</Text>
            <Text>₱{shippingCharges.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text>Total:</Text>
            <Text>₱{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.subheading}>Payment Method</Text>
          {methods.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.radioContainer}
              onPress={() => setPaymentMethod(item.value)}
            >
              <View style={styles.radioCircle}>
                {paymentMethod === item.value && <View style={styles.selectedRb} />}
              </View>
              <Text style={styles.radioText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ width: "100%", alignItems: "center", paddingTop: 30 }}>
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Place Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  customerDetailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c70049",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#c70049",
  },
  radioText: {
    fontSize: 16,
  },
  button: {
    width: 300,
    backgroundColor: "#bc430b",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ConfirmOrder;