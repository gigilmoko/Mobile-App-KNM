import { Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const OrderList = ({
  id,
  price,
  address,
  orderedOn,
  status,
  statusColor,
  paymentInfo,
  products,
}) => {
  const navigation = useNavigation();
  const primaryColor = "#e01d47"; // Define primary color

  return (
    <View className="flex flex-col justify-start items-center w-full bg-white rounded-lg p-3 shadow-sm border border-gray-500">

     
      <View className="flex flex-row justify-between items-center w-full">
        <Text className="text-base font-bold text-gray-900">Order # {id}</Text>
        <Text className="text-base font-bold" style={{ color: primaryColor }}>₱{price}</Text>
      </View>

      
      <Text className="text-xs font-semibold text-gray-500 w-full">{orderedOn}</Text>

      
      <View className="w-full my-2 border-b border-gray-300"></View>

      
      <View className="w-full mt-1">
        {products.map((productItem, index) => (
          <View key={index} className="flex flex-row justify-between items-center w-full">
            <Text className="text-sm font-medium text-gray-800">
              {productItem.product.name}
            </Text>
            <Text className="text-sm font-medium" style={{ color: primaryColor }}>
              x{productItem.quantity}
            </Text>
          </View>
        ))}
      </View>


      <TouchableOpacity
        className="mt-2 flex justify-center items-center rounded-lg w-full py-2"
        style={{ backgroundColor: primaryColor }}
        onPress={() => navigation.navigate("orderdetails", { id })}
      >
        <Text className="text-white font-medium">View Details</Text>
      </TouchableOpacity>

    </View>
  );
};

export default OrderList;
