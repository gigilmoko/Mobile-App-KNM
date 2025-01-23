import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { OneSignal } from "react-native-onesignal";
import Entypo from "react-native-vector-icons/Entypo";
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from "../../redux/actions/userActions";
import { riderLogin } from "../../redux/actions/riderActions"; // Import the riderLogin action
import { useMessageAndErrorUser } from "../../../utils/hooks";
import Toast from "react-native-toast-message"; // Import the toast message
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const loading = useMessageAndErrorUser(navigation, dispatch, "myaccount");
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const getPlayerId = async () => {
      try {
        const deviceState =
          await OneSignal.User.pushSubscription.getPushSubscriptionId();
        if (deviceState) {
          setPlayerId(deviceState);
        }
        console.log("Device State:", deviceState);
      } catch (error) {
        console.error("OneSignal Error:", error);
      }
    };

    // Initial fetch
    getPlayerId();

    // Subscription listener
    const subscription = OneSignal.User.pushSubscription.addEventListener(
      "change",
      getPlayerId
    );
    return () => subscription?.remove();
  }, []);
  // Handler for user login
  const userSubmitHandler = () => {
    dispatch(userLogin(email, password, playerId)) // Pass playerId as third parameter
      .then(() => {
        Toast.show({
          type: "success",
          text2: "Welcome back!",
        });
        navigation.navigate("myaccount");
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: error?.message || "Please try again later.",
        });
      });
  };

  // Handler for rider login
  const riderSubmitHandler = () => {
    console.log("Rider Login triggered");
    dispatch(riderLogin(email, password, playerId))
      .then(async () => {
        Toast.show({
          type: "success",
          text2: "Welcome back, Rider!",
        });
        navigation.navigate("loadingrider");
      })
      .catch((error) => {
        console.log("Rider login failed", error);
        Toast.show({
          type: "error",
          text1: "Rider Login Failed",
          text2: error?.message || "Please try again later.",
        });
      });
  };

  // Check if the email starts with "newrider"
  const isRiderLogin = email.startsWith("newrider");

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1" style={{ backgroundColor: "#ffb703" }}>
        <View className="flex">
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack("home")}>
              <Entypo
                name="chevron-left"
                style={{
                  fontSize: 30,
                  color: "#bc430b",
                  padding: 12,
                  borderRadius: 10,
                  marginTop: 30,
                }}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-center mt-[-40px]">
            <Image
              source={require("../../assets/images/logo.png")}
              style={{ width: 200, height: 200, marginTop: 50 }}
            />
          </View>
        </View>

        <View
          className="flex-1 bg-white px-8 pt-8"
          style={{
            elevation: 10,
            borderTopLeftRadius: 50,
            borderTopRightRadius: 50,
          }}
        >
          <View className="form space-y-2">
            <Text className="text-gray-700 ml-4">Email Address</Text>
            <TextInput
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
            />
            <Text className="text-gray-700 ml-4">Password</Text>
            <TextInput
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              className="p-4 bg-gray-100 text-gray-700 rounded-2xl"
            />
            <TouchableOpacity
              className="flex items-end mb-5"
              onPress={() => navigation.navigate("forgetpassword")}
            >
              <Text className="text-gray-700">Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: "#bc430b" }}
              className="py-2 rounded-xl"
              loading={loading}
              disabled={email === "" || password === ""}
              onPress={isRiderLogin ? riderSubmitHandler : userSubmitHandler} // Use the appropriate handler
            >
              <Text
                style={{ color: "#fff" }}
                className="text-white-700 font-bold text-center"
              >
                {isRiderLogin ? "Login as Rider" : "Login"}{" "}
                {/* Button text changes dynamically */}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xl text-gray-700 text-center font-bold py-2">
            Or
          </Text>
          <View className="flex-row justify-center py-2">
            <Text className="text-gray-500 font-semibold">
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("signup")}>
              <Text
                style={{ color: "#bc430b" }}
                className="text-yellow-400 font-semibold ml-2"
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
