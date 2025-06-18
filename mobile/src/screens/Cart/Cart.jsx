import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const Cart = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);

  const incrementHandler = (id, name, price, image, stock, quantity) => {
    const newQty = quantity + 1;
    if (stock <= quantity) {
      return Toast.show({
        type: "error",
        text1: "Maximum quantity reached",
        text2: "Cannot add more items than available in stock"
      });
    }
    
    dispatch({
      type: "addToCart",
      payload: { product: id, name, price, image, stock, quantity: newQty },
    });
  };

  const decrementHandler = (id, name, price, image, stock, quantity) => {
    const newQty = quantity - 1;
    if (1 >= quantity) {
      return dispatch({ type: "removeFromCart", payload: id });
    }
    
    dispatch({
      type: "addToCart",
      payload: { product: id, name, price, image, stock, quantity: newQty },
    });
  };

  const addToWishlistHandler = (id, name, price, image, stock) => {
    dispatch({
      type: "addToWishlist",
      payload: {
        product: id,
        name,
        price,
        image,
        stock,
      },
    });

    Toast.show({
      type: "success",
      text1: "Added To Wishlist",
    });

    handleDelete(id);
  };

  const handleDelete = (id) => {
    dispatch({ type: "removeFromCart", payload: id });
    Toast.show({
      type: "info",
      text1: "Product removed from cart",
    });
  };

  const renderRightActions = (id, name, price, image, stock) => (
    <View className="flex-row my-1 ml-2">
      <TouchableOpacity
        className="bg-amber-500 justify-center items-center w-16 rounded-l-lg"
        onPress={() => addToWishlistHandler(id, name, price, image, stock)}
      >
        <Ionicons name="heart-outline" size={22} color="#fff" />
      </TouchableOpacity>
      
      <TouchableOpacity
        className="bg-[#e01d47] justify-center items-center w-16 rounded-r-lg"
        onPress={() => handleDelete(id)}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const CartItemCard = ({ item, index }) => {
    return (
      <Swipeable
        renderRightActions={() => renderRightActions(
          item.product, 
          item.name, 
          item.price, 
          item.image, 
          item.stock
        )}
      >
        <View 
          animation="fadeIn" 
          duration={300} 
          delay={index * 100}
          className="bg-white rounded-lg shadow-sm mb-3 p-3 flex-row"
        >
          {/* Product Image */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('productdetail', { id: item.product })}
            className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden"
          >
            <Image
              source={{ uri: item.image || "https://via.placeholder.com/80" }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {item.stock <= 0 && (
              <View className="absolute inset-0 bg-black bg-opacity-60 items-center justify-center">
                <Text className="text-white text-xs font-bold">Out of Stock</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Product Details */}
          <View className="flex-1 ml-3 justify-between">
            <View>
              <Text 
                numberOfLines={1} 
                className="text-gray-800 font-medium text-base"
                onPress={() => navigation.navigate('productdetail', { id: item.product })}
              >
                {item.name}
              </Text>
              <Text className="text-[#e01d47] font-bold mt-1">₱{item.price.toFixed(2)}</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-500">
                {item.stock > 0 ? `${item.stock} available` : "Out of stock"}
              </Text>
              
              {/* Quantity Controls */}
              <View className="flex-row items-center bg-gray-100 rounded-full overflow-hidden">
                <TouchableOpacity
                  className="w-8 h-8 items-center justify-center"
                  onPress={() => decrementHandler(
                    item.product, 
                    item.name, 
                    item.price, 
                    item.image, 
                    item.stock, 
                    item.quantity
                  )}
                >
                  <Ionicons name="remove" size={18} color="#333" />
                </TouchableOpacity>
                
                <Text className="w-8 text-center font-medium">
                  {item.quantity}
                </Text>
                
                <TouchableOpacity
                  className="w-8 h-8 items-center justify-center"
                  onPress={() => incrementHandler(
                    item.product, 
                    item.name, 
                    item.price, 
                    item.image, 
                    item.stock, 
                    item.quantity
                  )}
                  disabled={item.stock <= item.quantity}
                >
                  <Ionicons 
                    name="add" 
                    size={18} 
                    color={item.stock <= item.quantity ? "#aaa" : "#333"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  const EmptyCart = () => (
    <View className="flex-1 justify-center items-center px-5">
      <Ionicons name="cart-outline" size={80} color="#e0e0e0" />
      <Text className="text-lg font-medium text-gray-500 mt-4">Your cart is empty</Text>
      <Text className="text-sm text-gray-400 text-center mt-2 mb-6">
        Looks like you haven't added any products to your cart yet
      </Text>
      <TouchableOpacity
        className="bg-[#e01d47] py-3 px-8 rounded-full"
        onPress={() => navigation.navigate("home")}
      >
        <Text className="text-white font-medium">Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Calculate cart totals
  const subtotal = cartItems.reduce((prev, curr) => prev + curr.quantity * curr.price, 0);
  const itemsCount = cartItems.reduce((prev, curr) => prev + curr.quantity, 0);
  const shipping = cartItems.length > 0 ? 10 : 0; // Example shipping cost
  const total = subtotal + shipping;

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-white pt-2 pb-4 px-5 shadow-sm">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="p-2"
            >
              <Ionicons name="arrow-back" size={24} color="#e01d47" />
            </TouchableOpacity>
            
            <Text className="text-xl font-bold text-gray-800">
              My Cart {cartItems.length > 0 && `(${cartItems.length})`}
            </Text>
            
            <View className="w-8" />
          </View>
        </View>

        {/* Cart Items */}
        {cartItems.length > 0 ? (
          <>
            <FlatList
              data={cartItems}
              renderItem={({ item, index }) => <CartItemCard item={item} index={index} />}
              keyExtractor={(item) => item.product}
              contentContainerStyle={{ padding: 15 }}
              showsVerticalScrollIndicator={false}
            />
            
            {/* Order Summary */}
            <View className="bg-white p-4 shadow-inner">
              <Text className="text-lg font-bold text-gray-800 mb-3">Order Summary</Text>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Subtotal ({itemsCount} items)</Text>
                <Text className="text-gray-800 font-medium">₱{subtotal.toFixed(2)}</Text>
              </View>
              
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Shipping Fee</Text>
                <Text className="text-gray-800 font-medium">₱{shipping.toFixed(2)}</Text>
              </View>
              
              <View className="border-t border-gray-200 my-2" />
              
              <View className="flex-row justify-between items-center">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-lg font-bold text-[#e01d47]">₱{total.toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity
                className="bg-[#e01d47] py-3 rounded-lg items-center mt-4"
                onPress={() => navigation.navigate("confirmorder")}
              >
                <Text className="text-white font-bold text-base">Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <EmptyCart />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

export default Cart;