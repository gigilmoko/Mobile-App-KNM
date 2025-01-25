import React, { useState, useEffect } from "react";
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { userLogin } from "../../redux/actions/userActions";
import { riderLogin } from "../../redux/actions/riderActions";
import { useMessageAndErrorUser } from "../../../utils/hooks";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OneSignal from "react-native-onesignal";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const loading = useMessageAndErrorUser(navigation, dispatch, "myaccount");
  const [playerId, setPlayerId] = useState(null);

  useEffect(() => {
    const getPlayerId = async () => {
      try {
        const deviceState = await OneSignal.getDeviceState();
        if (deviceState) {
          setPlayerId(deviceState.userId);
        }
        console.log("Device State:", deviceState);
      } catch (error) {
        console.error("OneSignal Error:", error);
      }
    };

    getPlayerId();
  }, []);

  const userSubmitHandler = () => {
    dispatch(userLogin(email, password, playerId))
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

  const riderSubmitHandler = () => {
    dispatch(riderLogin(email, password, playerId))
      .then(async () => {
        Toast.show({
          type: "success",
          text2: "Welcome back, Rider!",
        });
        navigation.navigate("loadingrider");
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Rider Login Failed",
          text2: error?.message || "Please try again later.",
        });
      });
  };

  const isRiderLogin = email.startsWith("newrider");

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={styles.box}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Login</Text>
          <TextInput
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            style={styles.input}
          />
          <TextInput
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => navigation.navigate("forgetpassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.loginButton}
            loading={loading}
            disabled={email === "" || password === ""}
            onPress={isRiderLogin ? riderSubmitHandler : userSubmitHandler}
          >
            <Text style={styles.loginButtonText}>
              {isRiderLogin ? "Login as Rider" : "Login"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.orText}>Or</Text>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("signup")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  box: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    width: "100%",
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 20,
    width: "100%",
  },
  forgotPasswordText: {
    color: "#bc430b",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#bc430b",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  orText: {
    textAlign: "center",
    margin: 15,
    fontSize: 16,
    color: "#888",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: "#888",
    fontSize: 16,
  },
  signupLink: {
    color: "#bc430b",
    fontWeight: "bold",
    marginLeft: 5,
  },
});

export default Login;