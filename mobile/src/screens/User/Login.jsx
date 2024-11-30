import { View, Text, Image, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import Entypo from 'react-native-vector-icons/Entypo';
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/actions/userActions";
import { useMessageAndErrorUser } from "../../../utils/hooks";
import Toast from 'react-native-toast-message';  // Import the toast message

const Login = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const loading = useMessageAndErrorUser(navigation, dispatch, "myaccount");

    const submitHandler = () => {
        console.log("Submitting login:", { email, password });
    
        dispatch(login(email, password))
            .then(() => {
                Toast.show({
                    type: 'success',
                    text1: 'Login Successful',
                    text2: 'Welcome back!',
                });
                console.log("Login was successful");
            })
            .catch((error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Login Failed',
                    text2: error?.message || 'Please try again later.',
                });
                console.log("Login failed with error:", error);
            });
    };

    return (
        <>
            <View className="flex-1" style={{ backgroundColor: "#9b0000" }}>
                <View className="flex">
                    <View
                        style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity onPress={() => navigation.goBack('home')}>
                            <Entypo
                                name="chevron-left"
                                style={{
                                    fontSize:30,
                                    color: '#bc430b',
                                    padding: 12,
                                    borderRadius: 10,
                                    marginTop: 30,
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-center mt-[-40px]">
                        <Image source={require("../../assets/images/logo.png")}
                            style={{ width: 200, height: 200, marginTop: 50 }}
                        />
                    </View>
                </View>

                <View className="flex-1 bg-white px-8 pt-8" style={{ elevation: 10, borderTopLeftRadius: 50, borderTopRightRadius: 50 }}>
                    <View className="form space-y-2">
                        <Text className="text-gray-700 ml-4">
                            Email Address
                        </Text>
                        <TextInput
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter email address"
                            className="p-4 bg-gray-100 text-gray-700 rounded-2xl mb-3"
                        />
                        <Text className="text-gray-700 ml-4">
                            Password
                        </Text>
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
                            <Text className="text-gray-700">
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ backgroundColor: '#bc430b' }}
                            className="py-2 rounded-xl"
                            loading={loading}
                            disabled={email === "" || password === ""}
                            onPress={submitHandler}
                        >
                            <Text style={{ color: '#fff' }} className="text-white-700 font-bold text-center">
                                Login
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xl text-gray-700 text-center font-bold py-2">
                        Or
                    </Text>
                    <View className="flex-row justify-center py-2">
                        <Text className="text-gray-500 font-semibold">Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                            <Text style={{ color: '#bc430b' }} className="text-yellow-400 font-semibold ml-2">Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

export default Login;
