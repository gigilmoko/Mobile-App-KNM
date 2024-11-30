import { TouchableOpacity, View } from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import Entypo from 'react-native-vector-icons/Entypo';
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

const Header = ({ back }) => {
    const navigate = useNavigation();
    const dispatch = useDispatch();
    const route = useRoute();

    return (
        <View
            style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 20,
                paddingLeft: 0,
            }}>
            {back && (
                <TouchableOpacity
                    onPress={() => navigate.goBack()}
                    className="p-2 rounded-tr-2xl rounded-bl-2xl mt-2"
                >
                    <Entypo
                        name="chevron-left"
                        style={{
                            fontSize: 25,
                            color: '#bc430b',
                        }}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default Header;