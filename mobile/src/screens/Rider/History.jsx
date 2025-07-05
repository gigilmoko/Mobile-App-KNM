import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView,
  ActivityIndicator, 
  TouchableOpacity, 
  Image,
  RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getHistoryByRider } from '../../redux/actions/deliverySessionActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewFooter from './NewFooter';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

const History = () => {
  const dispatch = useDispatch();
  const historySessions = useSelector((state) => state.deliverySession?.historySessions || []);
  const error = useSelector((state) => state.deliverySession?.error);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState({});

  const fetchHistory = async () => {
    try {
      const id = await AsyncStorage.getItem('riderId');
      if (!id) {
        console.log('No rider ID found in storage');
        return;
      }
      
      console.log("Fetching delivery history for rider ID:", id);
      await dispatch(getHistoryByRider(id));
    } catch (err) {
      console.error("Error fetching rider history:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchHistory();
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchHistory();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#e01d47" />
        <Text style={tw`mt-3 text-base text-[#e01d47]`}>Loading delivery history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <Ionicons name="alert-circle-outline" size={60} color="#e0e0e0" />
        <Text style={tw`mt-4 text-lg font-medium text-gray-500`}>Could not load history</Text>
        <Text style={tw`mt-2 text-center text-gray-400 px-10`}>{error}</Text>
      </View>
    );
  }

  // Handle empty history case
  const isHistoryEmpty = !historySessions || historySessions.length === 0;

  return (
    <View style={tw`flex-1 bg-gray-50`}>
      {/* Header */}
      <View style={tw`bg-white pt-5 pb-4 px-5 shadow-sm`}>
        <Text style={tw`text-2xl font-bold text-gray-800`}>Delivery History</Text>
        <Text style={tw`text-gray-500`}>
          {historySessions.length} completed {historySessions.length === 1 ? 'session' : 'sessions'}
        </Text>
      </View>

      {isHistoryEmpty ? (
        <View style={tw`flex-1 justify-center items-center p-5`}>
          <Ionicons name="document-outline" size={60} color="#e0e0e0" />
          <Text style={tw`mt-4 text-lg font-medium text-gray-400`}>No delivery history found</Text>
          <Text style={tw`mt-2 text-center text-gray-400`}>
            Completed deliveries will appear here
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={tw`p-4 pb-20`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#e01d47"]}
            />
          }
        >
          {historySessions.map((session) => (
            <View key={session._id} style={tw`mb-5 bg-white rounded-xl shadow overflow-hidden`}>
              {/* Session Header */}
              <View style={tw`p-4 flex-row justify-between items-center border-b border-gray-100`}>
                <View style={tw`flex-row items-center bg-green-500 px-3 py-1 rounded-full`}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={tw`text-white text-xs font-medium ml-1`}>
                    {session.status || "Completed"}
                  </Text>
                </View>
                <Text style={tw`text-gray-500 text-xs`}>
                 Delivered date: {formatDate(session.endTime || session.UpdatedAt)}
                </Text>
              </View>
              
              {/* Session Info */}
              <View style={tw`p-4 bg-gray-50`}>
                <View style={tw`flex-row items-center mb-2`}>
                  <Ionicons name="calendar-outline" size={18} color="#666" />
                  <Text style={tw`text-gray-500 text-sm ml-2 w-24`}>Session ID:</Text>
                  <Text style={tw`text-gray-700 text-sm font-medium`}>
  KNM-SESSION-{session._id?.slice(0, 8)}
</Text>


                </View>
                
                {session.rider && (
                  <View style={tw`flex-row items-center mb-2`}>
                    <Ionicons name="person-outline" size={18} color="#666" />
                    <Text style={tw`text-gray-500 text-sm ml-2 w-24`}>Rider:</Text>
                    <Text style={tw`text-gray-700 text-sm font-medium`}>
                      {session.rider.name || `${session.rider.fname || ''} ${session.rider.lname || ''}`}
                    </Text>
                  </View>
                )}
                
                {session.truck && (
                  <View style={tw`flex-row items-center mb-2`}>
                    <Ionicons name="car-outline" size={18} color="#666" />
                    <Text style={tw`text-gray-500 text-sm ml-2 w-24`}>Vehicle:</Text>
                    <Text style={tw`text-gray-700 text-sm font-medium`}>
                      {session.truck.plateNo ? 
                        `${session.truck.model || ''} (${session.truck.plateNo})` : 
                        session.truck.model || 'N/A'}
                    </Text>
                  </View>
                )}
                
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="cube-outline" size={18} color="#666" />
                  <Text style={tw`text-gray-500 text-sm ml-2 w-24`}>Orders:</Text>
                  <Text style={tw`text-gray-700 text-sm font-medium`}>
                    {session.orders?.length || 0}
                  </Text>
                </View>
              </View>
              
              {/* Orders List */}
              <View style={tw`p-4`}>
                <Text style={tw`text-base font-semibold text-gray-800 mb-3`}>
                  Delivered Orders
                </Text>
                
                {Array.isArray(session.orders) && session.orders.length > 0 ? session.orders.map((order) => (
                  <View key={order._id} style={tw`mb-3 border border-gray-200 rounded-lg overflow-hidden`}>
                    {/* Order Header */}
                    <TouchableOpacity 
                      style={tw`p-3 flex-row justify-between items-center bg-gray-50`} 
                      onPress={() => toggleExpandOrder(order._id)}
                      activeOpacity={0.7}
                    >
                      <View style={tw`flex-row items-center`}>
                        <View style={tw`w-9 h-9 rounded-full bg-[#e01d47]/10 items-center justify-center mr-3`}>
                          <Ionicons name="document-text-outline" size={18} color="#e01d47" />
                        </View>
                        <View>
                          <Text style={tw`text-sm font-semibold text-gray-800`}>
                            {order.KNMOrderId || `Order #${order._id?.slice(0, 8)}`}
                          </Text>
                          <Text style={tw`text-xs text-gray-500`}>
                            {(order.customer && order.customer.name) || 
                             (order.user && `${order.user.fname || ''} ${order.user.lname || ''}`) || 
                             "Customer"}
                          </Text>
                        </View>
                      </View>
                      <View style={tw`items-end`}>
                        <Text style={tw`text-[#e01d47] font-bold text-sm mb-1`}>
                          ₱{(order.payment && parseFloat(order.payment.totalAmount || 0) || 
                             parseFloat(order.totalPrice || 0)).toFixed(2)}
                        </Text>
                        <Ionicons 
                          name={expandedOrder[order._id] ? "chevron-up" : "chevron-down"} 
                          size={18} 
                          color="#777" 
                        />
                      </View>
                    </TouchableOpacity>
                    
                    {/* Order Details (expandable) */}
                    {expandedOrder[order._id] && (
                      <View style={tw`p-4 border-t border-gray-200`}>
                        {/* Customer Information */}
                        <View style={tw`mb-4`}>
                          <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                            Customer Information
                          </Text>
                          <View style={tw`bg-gray-50 rounded-lg p-3`}>
                            <View style={tw`flex-row mb-1`}>
                              <Text style={tw`text-xs text-gray-500 w-16`}>Name:</Text>
                              <Text style={tw`text-xs text-gray-700 font-medium flex-1`}>
                                {(order.customer && order.customer.name) || 
                                 (order.user && `${order.user.fname || ''} ${order.user.lname || ''}`) || 
                                 "N/A"}
                              </Text>
                            </View>
                            <View style={tw`flex-row mb-1`}>
                              <Text style={tw`text-xs text-gray-500 w-16`}>Phone:</Text>
                              <Text style={tw`text-xs text-gray-700 font-medium flex-1`}>
                                {(order.customer && order.customer.phone) || 
                                 (order.user && (order.user.contactNo || order.user.phone)) || 
                                 "N/A"}
                              </Text>
                            </View>
                            <View style={tw`flex-row`}>
                              <Text style={tw`text-xs text-gray-500 w-16`}>Email:</Text>
                              <Text style={tw`text-xs text-gray-700 font-medium flex-1`}>
                                {(order.customer && order.customer.email) || 
                                 (order.user && order.user.email) || 
                                 "N/A"}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        {/* Delivery Address */}
                        {(order.address || (order.user && order.user.deliveryAddress && order.user.deliveryAddress[0])) && (
                          <View style={tw`mb-4`}>
                            <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                              Delivery Address
                            </Text>
                            <View style={tw`bg-gray-50 rounded-lg p-3`}>
                              <Text style={tw`text-xs text-gray-700`}>
                                {order.address ? 
                                  [
                                    order.address.houseNo, 
                                    order.address.streetName,
                                    order.address.barangay,
                                    order.address.city
                                  ].filter(Boolean).join(', ') :
                                  (order.user && order.user.deliveryAddress && order.user.deliveryAddress[0]) ?
                                  [
                                    order.user.deliveryAddress[0].houseNo,
                                    order.user.deliveryAddress[0].streetName,
                                    order.user.deliveryAddress[0].barangay,
                                    order.user.deliveryAddress[0].city
                                  ].filter(Boolean).join(', ') :
                                  "No address information available"
                                }
                              </Text>
                            </View>
                          </View>
                        )}

                        {/* Proof of Delivery */}
                        {order.proofOfDelivery && (
                          <View style={tw`mb-4`}>
                            <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                              Proof of Delivery
                            </Text>
                            <Image 
                              source={{ uri: order.proofOfDelivery }} 
                              style={tw`h-40 w-full rounded-lg bg-gray-100`}
                              resizeMode="cover"
                            />
                          </View>
                        )}
                        
                        {/* Payment Information */}
                        <View style={tw`flex-row justify-between items-center mb-4 bg-gray-50 p-3 rounded-lg`}>
                          <View style={tw`flex-row items-center`}>
                            <Ionicons 
                              name={(order.payment && order.payment.method === "COD") || 
                                   (order.paymentInfo === "COD") || 
                                   (!order.payment && !order.paymentInfo) ? 
                                   "cash-outline" : "card-outline"} 
                              size={16} 
                              color="#666" 
                            />
                            <Text style={tw`text-xs text-gray-700 ml-2`}>
                              {(order.payment && order.payment.method === "COD") || (order.paymentInfo === "COD") ? 
                                "Cash on Delivery" : 
                                (order.payment && order.payment.method) || 
                                order.paymentInfo || 
                                "Payment method"}
                            </Text>
                          </View>
                          <View style={tw`${order.status === "Delivered" ? "bg-green-100" : "bg-blue-100"} px-2 py-1 rounded`}>
                            <Text style={tw`text-xs ${order.status === "Delivered" ? "text-green-700" : "text-blue-700"} font-medium`}>
                              {order.status || "Delivered"}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Order Items */}
                        <Text style={tw`text-sm font-semibold text-gray-700 mb-2`}>
                          Order Items
                        </Text>
                        {Array.isArray(order.products || order.orderProducts) && 
                         (order.products || order.orderProducts).length > 0 ? (
                          <View style={tw`mb-4 bg-gray-50 rounded-lg overflow-hidden`}>
                            {(order.products || order.orderProducts).map((product, idx) => (
                              <View key={idx} style={tw`flex-row items-center p-3 ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                {product.image ? (
                                  <Image 
                                    source={{ uri: product.image }} 
                                    style={tw`w-10 h-10 rounded bg-gray-200 mr-3`}
                                    resizeMode="cover"
                                  />
                                ) : (
                                  <View style={tw`w-10 h-10 rounded bg-gray-200 mr-3 items-center justify-center`}>
                                    <Ionicons name="cube-outline" size={16} color="#999" />
                                  </View>
                                )}
                                <Text style={tw`text-xs text-gray-800 flex-1`} numberOfLines={1}>
                                  {product.name || 
                                   (product.product && product.product.name) || 
                                   `Product ${idx + 1}`}
                                </Text>
                                <Text style={tw`text-xs text-gray-500 mr-3`}>
                                  x{product.quantity || 1}
                                </Text>
                                <Text style={tw`text-xs font-semibold text-gray-800`}>
                                  ₱{parseFloat(product.price || 0).toFixed(2)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : (
                          <View style={tw`mb-4 bg-gray-50 rounded-lg p-4 items-center justify-center`}>
                            <Text style={tw`text-xs text-gray-500`}>
                              No product information available
                            </Text>
                          </View>
                        )}

                        {/* Order Summary */}
                        <View style={tw`mb-4 border-t border-gray-200 pt-3`}>
                          <View style={tw`flex-row justify-between mb-1`}>
                            <Text style={tw`text-xs text-gray-500`}>
                              Items Total:
                            </Text>
                            <Text style={tw`text-xs text-gray-700`}>
                              ₱{((order.payment && parseFloat(order.payment.totalAmount || 0) - parseFloat(order.payment.shippingCharges || 0)) ||
                                 (parseFloat(order.itemsPrice || 0))).toFixed(2)}
                            </Text>
                          </View>
                          <View style={tw`flex-row justify-between mb-1`}>
                            <Text style={tw`text-xs text-gray-500`}>
                              Shipping:
                            </Text>
                            <Text style={tw`text-xs text-gray-700`}>
                              ₱{(order.payment && parseFloat(order.payment.shippingCharges || 0) ||
                                 parseFloat(order.shippingCharges || 0)).toFixed(2)}
                            </Text>
                          </View>
                          <View style={tw`flex-row justify-between pt-2 border-t border-gray-200 mt-2`}>
                            <Text style={tw`text-sm font-semibold text-gray-800`}>
                              Total:
                            </Text>
                            <Text style={tw`text-sm font-bold text-[#e01d47]`}>
                              ₱{(order.payment && parseFloat(order.payment.totalAmount || 0) ||
                                 parseFloat(order.totalPrice || 0)).toFixed(2)}
                            </Text>
                          </View>
                        </View>

                        {/* Delivery Date */}
                        <View style={tw`bg-gray-50 p-3 rounded-lg`}>
                          <View style={tw`flex-row justify-between`}>
                            <Text style={tw`text-xs text-gray-500`}>
                              Order Date:
                            </Text>
                            <Text style={tw`text-xs text-gray-700 font-medium`}>
                              {formatDate(order.createdAt)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )) : (
                  <View style={tw`items-center justify-center p-6 bg-gray-50 rounded-lg`}>
                    <Ionicons name="information-circle-outline" size={24} color="#999" />
                    <Text style={tw`mt-2 text-gray-500 text-center`}>
                      No order details available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      
      <NewFooter />
    </View>
  );
};

export default History;