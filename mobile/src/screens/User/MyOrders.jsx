import React, { useEffect, useState, useRef} from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Header from "../../components/Layout/Header";
import OrderList from "../../components/OrderList";
import { getUserOrdersMobile } from "../../redux/actions/orderActions";
import { getUserDetails } from "../../redux/actions/userActions"; // Import getUserDetails action

const MyOrders = () => {
    const isFocused = useIsFocused();
    const dispatch = useDispatch();
    const navigate = useNavigation();
    const { loading, orders } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.user); // Assuming user details are in the 'user' slice
    const [selectedTab, setSelectedTab] = useState("Preparing");

    const scrollRef = useRef();

  useEffect(() => {
    // Automatically scroll to center when component mounts
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 75, animated: true });
    }
  }, []);

    useEffect(() => {
        if (isFocused) {
            dispatch(getUserOrdersMobile());
            if (user) {
                dispatch(getUserDetails(user._id)); // Fetch user details including address
                // console.log("User details fetched:", user);
            }
        }
    }, [isFocused, dispatch, user]);

    useEffect(() => {
        console.log("Fetched Orders:", orders); // Log fetched orders
    }, [orders]);

    const getStatusColor = (status) => {
        if (!status) return 'gray';
        switch (status.toLowerCase()) {
            case 'preparing':
                return 'red';
            case 'shipped':
                return 'yellow';
            case 'delivered pending':
                return 'orange';
            case 'delivered':
                return 'green';
            case 'cancelled':
                return 'gray';
            default:
                return 'gray';
        }
    };

    const filteredOrders = orders
        .filter(order => order.status && order.status === selectedTab)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const tabMapping = {
          "Preparing": "Preparing",
          "Shipping": "Shipped",
          "Pending": "Delivered Pending",
          "Delivered": "Delivered",
          "Cancelled": "Cancelled"
        };
           
    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View className="px-5 py-5">
        <Header title ="My Orders" />
        <View className="flex-1 justify-center items-center bg-white py-5 px-2">
        <View className="w-full flex flex-col bg-gray-100 items-center justify-start flex-1">
          
    
        <ScrollView
  horizontal
  ref={scrollRef}
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ alignItems: "center", justifyContent: "center" }}
  className="w-full"
>
  <View className="flex-row py-1 px-1 bg-red-100 rounded-lg">
    {Object.keys(tabMapping).map((tab) => (
      <TouchableOpacity
        key={tab}
        onPress={() => setSelectedTab(tabMapping[tab])} // Set the actual status value
        className={`px-3 py-1 mx-1 rounded-md ${selectedTab === tabMapping[tab] ? "bg-red-600" : "text-red-500"}`}
      >
        <Text className={`text-base font-medium ${selectedTab === tabMapping[tab] ? "text-white" : "text-red-500"}`}>
          {tab} {/* Display the UI-friendly name */}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</ScrollView>
  
          
          {loading ? (
            <Text>Loading...</Text>
          ) : filteredOrders.length > 0 ? (
            <ScrollView className="flex-1 w-full  py-5 bg-white" showsVerticalScrollIndicator={false}>
              {filteredOrders.map((item, index) => (
  <View key={item._id}>
    <OrderList
      id={item._id}
      i={index}
      price={item.totalPrice}
      status={item.status}
      statusColor={getStatusColor(item.status)}
      paymentInfo={item.paymentInfo}
      orderedOn={item.createdAt.split("T")[0]}
      address={
        item.user?.deliveryAddress?.[0]
          ? `${item.user.deliveryAddress[0].houseNo}, ${item.user.deliveryAddress[0].streetName}, ${item.user.deliveryAddress[0].barangay}, ${item.user.deliveryAddress[0].city}`
          : "Address not available"
      }
      products={item.orderProducts} 
    />
    <View className="h-5"></View> 
  </View>
))}

            </ScrollView>
          ) : (
            <View className="w-full flex items-center justify-center flex-1">
              <Text className="italic text-base text-gray-500">"There are no orders placed yet."</Text>
            </View>
          )}
        </View>
        </View>
        </View>
        </ScrollView>
      </View>
    );
};

export default MyOrders;


