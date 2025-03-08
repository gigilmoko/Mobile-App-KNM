import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const Header = ({ title }) => {
    const navigation = useNavigation();

    return (
        <View className="flex-row items-center py-3">
            {/* Back Button */}
            <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                className="p-2 bg-[#ff7895] rounded-full items-center justify-center w-9 h-9"
            >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
            </TouchableOpacity>

            {/* Title */}
            <View className="flex-1">
                <Text className="text-2xl font-bold text-[#e01d47] text-center">
                    {title}
                </Text>
            </View>

            {/* Spacer */}
            <View className="w-10" />
        </View>
    );
};

export default Header;
