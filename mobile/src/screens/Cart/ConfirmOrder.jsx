import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/userActions";
import { placeOrder } from "../../redux/actions/orderActions";
import ConfirmOrderItem from "../../components/Cart/ConfirmOrderItem";
import Header from "../../components/Layout/Header";
import { useNavigation } from "@react-navigation/native";
import { useMessageAndErrorOrder } from "../../../utils/hooks";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { server } from "../../redux/store";

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
  const shippingCharges = itemsPrice > 1000 ? 0 : 75;
  const totalAmount = itemsPrice + shippingCharges;

  useEffect(() => {
    dispatch(loadUser());

    const fetchData = async () => {
      try {
        const jwt = await AsyncStorage.getItem("jwt");
        setToken(jwt);
        const response = await axios.get(`${server}me`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        setUserProfile(response.data.user);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      navigation.navigate("login");
      return;
    }

    const shippingInfo = {
      address: user?.address,
    };

    const order = {
      userId: user._id,
      shippingInfo,
      orderItems: cartItems,
      paymentMethod,
      itemsPrice,
      shippingCharges,
      totalAmount,
    };

    axios
      .post(`${server}/neworder`, order, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
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
      })
      .catch((err) => {
        console.error('Error placing order:', err);
        Alert.alert('Error', 'Failed to place order');
      });
  };

  const loading = useMessageAndErrorOrder(
    dispatch,
    navigation,
    "home",
    () => ({ type: "clearCart" })
  );

  return (
    <ScrollView>
      <View style={styles.container}>
        <Header back={true} />
        <View style={styles.header}>
          <Image
            style={styles.logo}
            source={require("../../assets/images/logo.png")}
            resizeMode="contain"
            alt="logo"
          />
          <Text style={styles.headerText}>Order Summary</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.subheading}>Customer Details</Text>
          <Text style={styles.text}>Name: {user?.fname} {user?.lname}</Text>
          <Text style={styles.text}>Phone: {user?.phone}</Text>
          <Text style={styles.text}>Address: {user?.address}</Text>
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
            <Text>${itemsPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Shipping:</Text>
            <Text>${shippingCharges.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text>Total:</Text>
            <Text>${totalAmount.toFixed(2)}</Text>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
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
    margin: 16,
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