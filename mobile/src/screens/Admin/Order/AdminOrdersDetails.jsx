import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  ToastAndroid,
  StyleSheet
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native"; 
import { useDispatch, useSelector } from "react-redux";
import { getOrderDetails, processOrderAny } from "../../../redux/actions/orderActions"; 
import { getUserDetails } from "../../../redux/actions/userActions"; 
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../components/Layout/Header";

const AdminOrdersDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showStatusOptions, setShowStatusOptions] = useState(false);

  const { order, error, success } = useSelector((state) => state.order);
  const { userDetails } = useSelector((state) => state.user);

  // Calculate order totals
  const subtotal = order?.orderProducts 
    ? order.orderProducts.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;
  const shipping = order?.shippingCharges || 0;
  const totalAmount = subtotal + shipping;

  useEffect(() => {
    dispatch({ type: 'CLEAR_ORDER_DETAILS' });
    dispatch(getOrderDetails(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order && order.user) {
      dispatch(getUserDetails(order.user._id));
    }
  }, [dispatch, order]);

  useEffect(() => {
    if (success) {
      ToastAndroid.show("Order updated successfully!", ToastAndroid.SHORT);
      dispatch(getOrderDetails(orderId));
      navigation.navigate("adminorders");
    }
  }, [success, dispatch, orderId, navigation]);

  useEffect(() => {
    if (order && order._id) {
      setSelectedStatus(order.status);
      setLoading(false);
    }
  }, [order]);

  const handleStatusChange = (newStatus) => {
    if (newStatus !== selectedStatus) {
      setSelectedStatus(newStatus);
      setShowStatusOptions(false);
    }
  };

  const handleSubmit = () => {
    if (selectedStatus !== order.status) {
      dispatch(processOrderAny(order._id, selectedStatus, navigation));
    }
  };

  const getStatusColor = (status) => {
    if (!status) return styles.statusUnknown;
    
    switch (status.toLowerCase()) {
      case "preparing": return styles.statusPreparing;
      case "shipped": return styles.statusShipped;
      case "delivered": return styles.statusDelivered;
      case "delivered pending": return styles.statusPending;
      case "cancelled": return styles.statusCancelled;
      default: return styles.statusUnknown;
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return "help-circle-outline";
    
    switch (status.toLowerCase()) {
      case "preparing": return "time-outline";
      case "shipped": return "cube-outline"; 
      case "delivered": return "checkmark-circle-outline";
      case "delivered pending": return "alert-circle-outline";
      case "cancelled": return "close-circle-outline";
      default: return "help-circle-outline";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e01d47" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Header title="Order Details" />
        
        {/* Order Summary Card */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>{order?.KNMOrderId}</Text>
              <Text style={styles.orderDate}>
                {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.statusBadge, getStatusColor(selectedStatus)]}
              onPress={() => setShowStatusOptions(!showStatusOptions)}
            >
              <Ionicons name={getStatusIcon(selectedStatus)} size={18} color="#fff" />
              <Text style={styles.statusText}>{selectedStatus || "Unknown"}</Text>
            </TouchableOpacity>
          </View>

          {/* Status Options Dropdown */}
          {showStatusOptions && (
            <View style={styles.statusDropdown}>
              {["Preparing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={styles.statusOption}
                  onPress={() => handleStatusChange(status)}
                >
                  <Ionicons name={getStatusIcon(status)} size={16} color="#444" style={styles.statusOptionIcon} />
                  <Text style={styles.statusOptionText}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Customer Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Information</Text>
          
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>
              {userDetails?.fname || ""} {userDetails?.lname || ""}
            </Text>
            <Text style={styles.customerEmail}>{userDetails?.email || ""}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.addressSection}>
            <Text style={styles.sectionLabel}>Shipping Address</Text>
            <Text style={styles.addressText}>
              {order?.address?.houseNo || ""} {order?.address?.streetName || ""},{" "}
              {order?.address?.barangay || ""}, {order?.address?.city || ""}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.paymentSection}>
            <Text style={styles.sectionLabel}>Payment Method</Text>
            <Text style={styles.paymentText}>{order?.paymentInfo || "N/A"}</Text>
          </View>
        </View>

        {/* Order Items Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          
          {order?.orderProducts?.map((item, index) => (
            <View key={item.product?._id || index} style={styles.orderItem}>
              {item.product?.images?.length > 0 && (
                <Image 
                  source={{ uri: item.product.images[0].url }} 
                  style={styles.productImage} 
                />
              )}
              
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.product?.name || "Unknown Product"}</Text>
                <Text style={styles.productQuantity}>Qty: {item.quantity || 1}</Text>
              </View>
              
              <Text style={styles.productPrice}>
                ₱{item.price?.toFixed(2) || "0.00"}
              </Text>
            </View>
          ))}
        </View>

        {/* Payment Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₱{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>₱{shipping.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>₱{totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Update Order Button */}
        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleSubmit}
          disabled={selectedStatus === order.status}
        >
          <Text style={styles.updateButtonText}>Update Order</Text>
        </TouchableOpacity>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  orderSummaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e01d47",
  },
  orderDate: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 4,
  },
  statusDropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#eaeaea",
    overflow: "hidden",
  },
  statusOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusOptionIcon: {
    marginRight: 8,
  },
  statusOptionText: {
    fontSize: 14,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  customerDetails: {
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e01d47",
  },
  customerEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#eaeaea",
    marginVertical: 12,
  },
  addressSection: {
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  paymentSection: {
    marginBottom: 4,
  },
  paymentText: {
    fontSize: 14,
    color: "#666",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  productQuantity: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: "#e01d47",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e01d47",
  },
  updateButton: {
    backgroundColor: "#e01d47",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomSpacing: {
    height: 24,
  },
  statusPreparing: {
    backgroundColor: "#ff9800",
  },
  statusShipped: {
    backgroundColor: "#2196f3",
  },
  statusDelivered: {
    backgroundColor: "#4caf50",
  },
  statusPending: {
    backgroundColor: "#ff5722",
  },
  statusCancelled: {
    backgroundColor: "#f44336",
  },
  statusUnknown: {
    backgroundColor: "#9e9e9e",
  }
});

export default AdminOrdersDetails;