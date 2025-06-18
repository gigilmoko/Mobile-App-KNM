import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getAdminOrders } from "../../../redux/actions/orderActions";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../../components/Layout/Header";

const AdminOrders = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { adminOrders, loading, error, success } = useSelector((state) => state.order);
  
  const [selectedTab, setSelectedTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modified tabs without Pending and Cancelled
  const tabs = [
    { key: "All", label: "All" },
    { key: "Preparing", label: "Preparing" },
    { key: "Shipped", label: "Shipping" },
    { key: "Delivered", label: "Delivered" },
  ];

  useEffect(() => {
    dispatch({ type: "clearAdminOrders" });
    dispatch(getAdminOrders()).then(() => setIsLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error,
      });
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Order updated successfully!",
      });
      dispatch({ type: "clearAdminOrders" });
      dispatch(getAdminOrders());
    }
  }, [success, dispatch]);

  // Calculate order stats
  const orderStats = {
    preparing: adminOrders.filter(order => order.status === "Preparing").length,
    shipping: adminOrders.filter(order => order.status === "Shipped").length,
    delivered: adminOrders.filter(order => order.status === "Delivered").length,
    total: adminOrders.length
  };

  // Filter orders based on selected tab and search query
  const filteredOrders = adminOrders
    .filter(order => 
      (selectedTab === "All" || order.status === selectedTab) && 
      (order._id.toLowerCase().includes(searchQuery.toLowerCase()) || 
       order.KNMOrderId?.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    // Sort by creation date (newest first)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusBadge = (status) => {
    if (!status) return styles.statusUnknown;
    
    switch (status.toLowerCase()) {
      case "preparing": return styles.statusPreparing;
      case "shipped": return styles.statusShipped;
      case "delivered": return styles.statusDelivered;
      default: return styles.statusUnknown;
    }
  };

  const getStatusIcon = (status) => {
    if (!status) return "help-circle-outline";
    
    switch (status.toLowerCase()) {
      case "preparing": return "time-outline";
      case "shipped": return "cube-outline";
      case "delivered": return "checkmark-circle-outline";
      default: return "help-circle-outline";
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e01d47" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Header title="Order Management" />
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.preparingCard]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.statCount}>{orderStats.preparing}</Text>
          <Text style={styles.statLabel}>Preparing</Text>
        </View>
        
        <View style={[styles.statCard, styles.shippingCard]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cube-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.statCount}>{orderStats.shipping}</Text>
          <Text style={styles.statLabel}>Shipping</Text>
        </View>
        
        <View style={[styles.statCard, styles.deliveredCard]}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          </View>
          <Text style={styles.statCount}>{orderStats.delivered}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="#e01d47" />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsScrollView}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                selectedTab === tab.key && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.key)}
            >
              <Text 
                style={[
                  styles.tabText,
                  selectedTab === tab.key && styles.activeTabText
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Order count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredOrders.length} Orders
          </Text>
        </View>
      </View>

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator style={styles.listLoading} size="large" color="#e01d47" />
      ) : (
        <ScrollView style={styles.ordersList}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order._id}
                style={styles.orderCard}
                onPress={() => navigation.navigate("adminordersdetails", { orderId: order._id })}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderStatus}>
                    <View style={[styles.statusDot, getStatusBadge(order.status)]} />
                    <Text style={[styles.statusText, getStatusBadge(order.status)]}>
                      {order.status}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.orderContent}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>{order.KNMOrderId}</Text>
                    <Text style={styles.userName}>
                      {order.user ? `${order.user.fname} ${order.user.lname}` : "Unknown User"}
                    </Text>
                    <Text style={styles.itemCount}>
                      {order.orderProducts?.length || 0} items
                    </Text>
                  </View>
                  
                  <View style={styles.orderPrice}>
                    <Text style={styles.priceLabel}>Total</Text>
                    <Text style={styles.priceValue}>₱{order.totalPrice?.toFixed(2)}</Text>
                  </View>
                </View>
                
                <View style={styles.actionRow}>
                  <View style={styles.viewDetails}>
                    <Ionicons name="eye-outline" size={16} color="#666" />
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#aaa" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>No orders found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search or filters
              </Text>
            </View>
          )}
          
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  // New stats styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  statCard: {
    width: '31%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    opacity: 0.9,
  },
  preparingCard: {
    backgroundColor: '#ff9800',
  },
  shippingCard: {
    backgroundColor: '#2196f3',
  },
  deliveredCard: {
    backgroundColor: '#4caf50',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    marginRight: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
  },
  tabsScrollView: {
    paddingBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  activeTab: {
    backgroundColor: "#e01d47",
    borderColor: "#e01d47",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  activeTabText: {
    color: "#fff",
  },
  countContainer: {
    alignItems: "flex-end",
    paddingVertical: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  listLoading: {
    marginTop: 20,
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    padding: 12,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 13,
    color: "#777",
  },
  orderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  orderInfo: {
    flex: 1,
    paddingRight: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 13,
    color: "#777",
  },
  orderPrice: {
    alignItems: "flex-end",
  },
  priceLabel: {
    fontSize: 12,
    color: "#777",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e01d47",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
  },
  bottomSpacing: {
    height: 80,
  },
  statusPreparing: {
    backgroundColor: "#ff9800",
    color: "#fff",
    padding: 4,
    borderRadius: 4,
  },
  statusShipped: {
    backgroundColor: "#2196f3",
    color: "#fff",
  },
  statusDelivered: {
    backgroundColor: "#4caf50",
    color: "#fff",
  },
  statusUnknown: {
    backgroundColor: "#9e9e9e",
    color: "#fff",
  },
});

export default AdminOrders;