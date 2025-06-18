import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getHistoryByRider } from '../../redux/actions/deliverySessionActions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NewFooter from './NewFooter';
import { Ionicons } from '@expo/vector-icons';

const History = () => {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.deliverySession.historySessions);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState({});

  useEffect(() => {
    const fetchRiderId = async () => {
      try {
        const id = await AsyncStorage.getItem('riderId');
        if (!id) {
          return;
        }
        await dispatch(getHistoryByRider(id));
      } catch (err) {
        console.error("Error fetching rider ID:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRiderId();
  }, [dispatch]);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrder(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (order) => {
    try {
      let total = 0;
      
      if (!order.orderProducts) return "₱0.00";
      
      // Calculate subtotal from products
      order.orderProducts.forEach(product => {
        const price = parseFloat(product.price || 0);
        const quantity = parseInt(product.quantity || 1);
        total += price * quantity;
      });
      
      // Add shipping if available
      const shipping = parseFloat(order.shippingCharges || 0);
      total += shipping;
      
      return `₱${total.toFixed(2)}`;
    } catch (err) {
      console.error("Error calculating total:", err);
      return "₱0.00";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e01d47" />
        <Text style={styles.loadingText}>Loading delivery history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Delivery History</Text>
        <Text style={styles.subtitle}>
          {history?.length || 0} completed {history?.length === 1 ? 'session' : 'sessions'}
        </Text>
      </View>

      {history && history.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {history.map((session) => (
            <View key={session._id} style={styles.sessionCard}>
              {/* Session Header */}
              <View style={styles.sessionHeader}>
                <View style={styles.sessionBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.sessionBadgeText}>Completed</Text>
                </View>
                <Text style={styles.sessionDate}>{formatDate(session.endTime)}</Text>
              </View>
              
              {/* Session Details */}
              <View style={styles.sessionInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="compass-outline" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Session ID:</Text>
                  <Text style={styles.infoValue}>{session._id.slice(0, 10)}...</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="car-outline" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Vehicle:</Text>
                  <Text style={styles.infoValue}>{session.truck?.plateNo || "N/A"}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="cube-outline" size={18} color="#666" />
                  <Text style={styles.infoLabel}>Orders:</Text>
                  <Text style={styles.infoValue}>{session.orders?.length || 0}</Text>
                </View>
              </View>
              
              {/* Orders List */}
              <View style={styles.ordersContainer}>
                <Text style={styles.sectionTitle}>Delivered Orders</Text>
                
                {session.orders.map((order) => (
                  <View key={order._id} style={styles.orderCard}>
                    {/* Order Header */}
                    <TouchableOpacity 
                      style={styles.orderHeader} 
                      onPress={() => toggleExpandOrder(order._id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.orderHeaderLeft}>
                        <View style={styles.orderIcon}>
                          <Ionicons name="document-text-outline" size={20} color="#e01d47" />
                        </View>
                        <View>
                          <Text style={styles.orderNumber}>
                            Order #{order.KNMOrderId || order._id.slice(0, 8)}
                          </Text>
                          <Text style={styles.orderCustomer}>
                            {order.user ? `${order.user.fname} ${order.user.lname}` : "Customer"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.orderHeaderRight}>
                        <Text style={styles.orderTotal}>{calculateTotal(order)}</Text>
                        <Ionicons 
                          name={expandedOrder[order._id] ? "chevron-up" : "chevron-down"} 
                          size={18} 
                          color="#777" 
                        />
                      </View>
                    </TouchableOpacity>
                    
                    {/* Order Details (expandable) */}
                    {expandedOrder[order._id] && (
                      <View style={styles.orderDetails}>
                        {order.proofOfDelivery && (
                          <View style={styles.proofContainer}>
                            <Text style={styles.detailsLabel}>Proof of Delivery:</Text>
                            <Image 
                              source={{ uri: order.proofOfDelivery }} 
                              style={styles.proofImage} 
                              resizeMode="cover"
                            />
                          </View>
                        )}
                        
                        <View style={styles.paymentInfo}>
                          <View style={styles.paymentMethod}>
                            <Ionicons 
                              name={order.paymentInfo === "COD" ? "cash-outline" : "card-outline"} 
                              size={16} 
                              color="#666" 
                            />
                            <Text style={styles.paymentMethodText}>
                              {order.paymentInfo === "COD" ? "Cash on Delivery" : order.paymentInfo}
                            </Text>
                          </View>
                          <Text style={styles.paymentStatus}>
                            {order.paymentStatus || "Paid"}
                          </Text>
                        </View>
                        
                        <Text style={styles.detailsLabel}>Order Items:</Text>
                        <View style={styles.productsList}>
                          {order.orderProducts?.map((product, idx) => (
                            <View key={idx} style={styles.productItem}>
                              <View style={styles.productDot} />
                              <Text style={styles.productName} numberOfLines={1}>
                                {product.product?.name || `Product ${idx + 1}`}
                              </Text>
                              <Text style={styles.productQty}>x{product.quantity || 1}</Text>
                              <Text style={styles.productPrice}>₱{(product.price || 0).toFixed(2)}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color="#e0e0e0" />
          <Text style={styles.emptyText}>No delivery history found</Text>
          <Text style={styles.emptySubtext}>Completed deliveries will appear here</Text>
        </View>
      )}
      
      <NewFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 12,
    color: '#e01d47',
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  sessionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  sessionDate: {
    fontSize: 13,
    color: '#777',
  },
  sessionInfo: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },
  ordersContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(224, 29, 71, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  orderCustomer: {
    fontSize: 12,
    color: '#777',
  },
  orderHeaderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e01d47',
    marginBottom: 4,
  },
  orderDetails: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  proofContainer: {
    marginBottom: 12,
  },
  proofImage: {
    height: 120,
    borderRadius: 8,
    marginTop: 4,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
  },
  paymentStatus: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  productsList: {
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  productDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e01d47',
    marginRight: 8,
  },
  productName: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  productQty: {
    fontSize: 13,
    color: '#666',
    width: 30,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    width: 70,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});

export default History;