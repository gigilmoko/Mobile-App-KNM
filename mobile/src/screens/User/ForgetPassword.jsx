import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import Header from "../../components/Layout/Header";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../redux/actions/userActions";
import Toast from "react-native-toast-message";

const ForgetPassword = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const submitHandler = async () => {
        setLoading(true);
        try {
            await dispatch(forgotPassword(email));
            Toast.show({
                type: 'success',
                text1: 'Password reset email sent!',
                text2: 'Please check your email for further instructions.',
            });
            setEmail("");
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Failed to send reset password email',
                text2: error.message || 'Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
            <Header back={true} />
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "center", marginTop: -40 }}>
                    <Image source={require("../../assets/images/logo.png")}
                        style={{ width: 200, height: 200, marginTop: 50 }}
                    />
                </View>
                <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 20, borderTopLeftRadius: 40, borderTopRightRadius: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, justifyContent: "center" }}>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Forgot Password</Text>
                        <Text style={{ fontSize: 16, color: "#666", textAlign: "center", marginBottom: 20 }}>Enter your email address to reset your password</Text>
                        <TextInput
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            style={{ backgroundColor: "#f5f5f5", borderRadius: 10, borderWidth: 1, borderColor: "#ddd", marginBottom: 20 }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={{ backgroundColor: '#bc430b', padding: 15, borderRadius: 10, alignItems: 'center' }}
                            onPress={submitHandler}
                            disabled={loading}
                        >
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: "bold" }}>
                                {loading ? "Sending..." : "Send Reset Email"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ForgetPassword;
