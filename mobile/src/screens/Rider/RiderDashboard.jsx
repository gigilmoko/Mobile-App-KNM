import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  getPendingSessionsByRider,
  acceptWork,
  declineWork,
  getSessionsByRider,
  completeDeliverySession,
  startDeliverySession,
} from "../../redux/actions/deliverySessionActions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import axios from "axios";
import mime from "mime";

const { width } = Dimensions.get("window");

const RiderDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [riderId, setRiderId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("TaskToday");
  const [taskTab, setTaskTab] = useState("Pending");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [deliveryStep, setDeliveryStep] = useState(1);
  const [proofPhoto, setProofPhoto] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingDeliveries, setCompletingDeliveries] = useState({});

  // Redux selectors
  const pendingSessions = useSelector((state) => state.deliverySession.pendingSessions);
  const ongoingSessions = useSelector((state) => state.deliverySession.ongoingSessions);
  const completedSessions = useSelector((state) => state.deliverySession.completedSessions);
  const error = useSelector((state) => state.deliverySession.error);
  const rider = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchRiderId = async () => {
      try {
        const id = await AsyncStorage.getItem("riderId");
        if (!id) {
          Alert.alert("Error", "Rider ID not found.");
          return;
        }
        setRiderId(id);
        
        // Add better error handling for these dispatch calls
        try {
          await dispatch(getPendingSessionsByRider(id));
        } catch (error) {
          console.error("Error fetching pending sessions:", error);
          // Don't block the UI, just log the error
        }
        
        try {
          await dispatch(getSessionsByRider(id));
        } catch (error) {
          console.error("Error fetching ongoing sessions:", error);
          // Don't block the UI, just log the error
        }
      } catch (err) {
        console.error("Error in fetchRiderId:", err);
        Alert.alert("Error", "Failed to load rider data");
      } finally {
        setLoading(false);
      }
    };

    fetchRiderId();
  }, [dispatch]);

  // Request camera permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required to take delivery photos.");
      }
    };
    requestPermissions();
  }, []);

  const handleAccept = (sessionId) => {
    Alert.alert(
      "Accept Delivery",
      "Are you sure you want to accept this delivery task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => {
            dispatch(acceptWork(sessionId));
            Toast.show({
              type: "success",
              text1: "Task Accepted!",
              text2: "You can now start the delivery process.",
            });
            setTaskTab("Ongoing");
          },
        },
      ]
    );
  };

  const handleDecline = (sessionId, truckId) => {
    Alert.alert(
      "Decline Delivery",
      "Are you sure you want to decline this delivery task?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => {
            dispatch(declineWork(sessionId, riderId, truckId));
            Toast.show({
              type: "info",
              text1: "Task Declined",
              text2: "The task has been returned to the pool.",
            });
          },
        },
      ]
    );
  };

  const handleStartDelivery = (session) => {
    setSelectedSession(session);
    setShowDeliveryModal(true);
  };

  const startDeliveryProcess = () => {
    dispatch(startDeliverySession(selectedSession._id));
    setShowDeliveryModal(false);
    Toast.show({
      type: "success",
      text1: "Delivery Started!",
      text2: "Navigate to the delivery address and complete delivery when arrived.",
    });
  };

  // New streamlined complete delivery function
  const handleCompleteDelivery = async (session) => {
    try {
      // Show loading state for this specific session
      setCompletingDeliveries(prev => ({ ...prev, [session._id]: true }));

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        setCompletingDeliveries(prev => ({ ...prev, [session._id]: false }));
        return;
      }

      const photo = result.assets[0];
      
      Toast.show({
        type: "success",
        text1: "Photo Captured!",
        text2: "Uploading proof of delivery...",
      });

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", {
        uri: photo.uri,
        type: mime.getType(photo.uri),
        name: photo.uri.split("/").pop(),
      });
      formData.append("upload_preset", "ml_default");

      const uploadResponse = await axios.post(
        "https://api.cloudinary.com/v1_1/dglawxazg/image/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = uploadResponse.data.secure_url;

      // Complete the delivery with the uploaded image
      await dispatch(completeDeliverySession(session._id, imageUrl));
      
      Toast.show({
        type: "success",
        text1: "Delivery Completed!",
        text2: "Great job! The delivery has been marked as complete.",
      });
      
      setTaskTab("History");
      
      // Refresh the data
      dispatch(getSessionsByRider(riderId));
    } catch (error) {
      console.error("Error completing delivery:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to complete delivery. Please try again.",
      });
    } finally {
      setCompletingDeliveries(prev => ({ ...prev, [session._id]: false }));
    }
  };

  // Alternative: Show confirmation first, then capture photo
  const handleCompleteDeliveryWithConfirmation = (session) => {
    Alert.alert(
      "Complete Delivery",
      "Ready to complete this delivery? You'll be asked to take a photo as proof of delivery.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Take Photo & Complete",
          onPress: () => handleCompleteDelivery(session),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e01d47" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rider Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={() => {
          dispatch(getPendingSessionsByRider(riderId));
          dispatch(getSessionsByRider(riderId));
        }}>
          <Ionicons name="refresh" size={24} color="#e01d47" />
        </TouchableOpacity>
      </View>

      {/* Main Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "TaskToday" && styles.activeTab]}
          onPress={() => setSelectedTab("TaskToday")}
        >
          <Ionicons name="today" size={20} color={selectedTab === "TaskToday" ? "#fff" : "#666"} />
          <Text style={[styles.tabText, selectedTab === "TaskToday" && styles.activeTabText]}>
            Today's Tasks
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "History" && styles.activeTab]}
          onPress={() => setSelectedTab("History")}
        >
          <Ionicons name="time" size={20} color={selectedTab === "History" ? "#fff" : "#666"} />
          <Text style={[styles.tabText, selectedTab === "History" && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "MyAccount" && styles.activeTab]}
          onPress={() => setSelectedTab("MyAccount")}
        >
          <Ionicons name="person" size={20} color={selectedTab === "MyAccount" ? "#fff" : "#666"} />
          <Text style={[styles.tabText, selectedTab === "MyAccount" && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Today Content */}
      {selectedTab === "TaskToday" && (
        <>
          {/* Sub Tabs */}
          <View style={styles.subTabContainer}>
            <TouchableOpacity
              style={[styles.subTab, taskTab === "Pending" && styles.activeSubTab]}
              onPress={() => setTaskTab("Pending")}
            >
              <Text style={[styles.subTabText, taskTab === "Pending" && styles.activeSubTabText]}>
                Pending ({pendingSessions?.length || 0})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.subTab, taskTab === "Ongoing" && styles.activeSubTab]}
              onPress={() => setTaskTab("Ongoing")}
            >
              <Text style={[styles.subTabText, taskTab === "Ongoing" && styles.activeSubTabText]}>
                Ongoing ({ongoingSessions?.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Pending Tasks */}
          {taskTab === "Pending" && (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={48} color="#ef4444" />
                  <Text style={styles.errorText}>Unable to load tasks</Text>
                  <Text style={styles.errorSubText}>Please check your connection and try again</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => {
                      setLoading(true);
                      dispatch(getPendingSessionsByRider(riderId))
                        .finally(() => setLoading(false));
                    }}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : pendingSessions?.length > 0 ? (
                pendingSessions.map((session) => (
                  <View key={session?._id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskIdContainer}>
                        <Ionicons name="document-text" size={16} color="#e01d47" />
                        <Text style={styles.taskId}>
                          #{session?._id?.slice(-6).toUpperCase() || 'Unknown'}
                        </Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{session?.status || 'Unknown'}</Text>
                      </View>
                    </View>

                    <View style={styles.taskDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="bag" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          Orders: {session?.orders?.length || 0} item(s)
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="car" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {session?.truck?.model} - {session?.truck?.plateNo}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAccept(session._id)}
                      >
                        <Ionicons name="checkmark" size={20} color="#fff" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDecline(session._id, session?.truck?._id)}
                      >
                        <Ionicons name="close" size={20} color="#fff" />
                        <Text style={styles.declineButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="checkmark-done" size={64} color="#94a3b8" />
                  <Text style={styles.emptyText}>No pending tasks</Text>
                  <Text style={styles.emptySubText}>All caught up! Check back later for new deliveries.</Text>
                </View>
              )}
            </ScrollView>
          )}

          {/* Ongoing Tasks */}
          {taskTab === "Ongoing" && (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {ongoingSessions?.length > 0 ? (
                ongoingSessions.map((session) => (
                  <View key={session?._id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskIdContainer}>
                        <Ionicons name="document-text" size={16} color="#e01d47" />
                        <Text style={styles.taskId}>#{session?._id?.slice(-6).toUpperCase()}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: "#3b82f6" }]}>
                        <Text style={styles.statusText}>{session?.status}</Text>
                      </View>
                    </View>

                    <View style={styles.taskDetails}>
                      <View style={styles.detailRow}>
                        <Ionicons name="bag" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          Orders: {session?.orders?.length || 0} item(s)
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Ionicons name="car" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {session?.truck?.model} - {session?.truck?.plateNo}
                        </Text>
                      </View>
                      {/* Show delivery addresses */}
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color="#666" />
                        <Text style={styles.detailText}>
                          {session?.orders?.length} delivery location(s)
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.deliveryButton}
                        onPress={() => handleStartDelivery(session)}
                      >
                        <Ionicons name="navigate" size={20} color="#fff" />
                        <Text style={styles.deliveryButtonText}>Start Delivery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.completeButton,
                          completingDeliveries[session._id] && styles.disabledButton
                        ]}
                        onPress={() => handleCompleteDeliveryWithConfirmation(session)}
                        disabled={completingDeliveries[session._id]}
                      >
                        {completingDeliveries[session._id] ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons name="camera" size={20} color="#fff" />
                            <Text style={styles.completeButtonText}>Complete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="car-outline" size={64} color="#94a3b8" />
                  <Text style={styles.emptyText}>No ongoing deliveries</Text>
                  <Text style={styles.emptySubText}>Accept a pending task to start delivering.</Text>
                </View>
              )}
            </ScrollView>
          )}
        </>
      )}

      {/* History Content */}
      {selectedTab === "History" && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {completedSessions?.length > 0 ? (
            completedSessions.map((session) => (
              <View key={session?._id} style={styles.historyCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskIdContainer}>
                    <Ionicons name="document-text" size={16} color="#4ade80" />
                    <Text style={styles.taskId}>#{session?._id?.slice(-6).toUpperCase()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: "#4ade80" }]}>
                    <Text style={styles.statusText}>Completed</Text>
                  </View>
                </View>

                <View style={styles.taskDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="bag" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      Orders: {session?.orders?.length || 0} item(s)
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(session?.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyText}>No delivery history</Text>
              <Text style={styles.emptySubText}>Complete your first delivery to see history here.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* My Account Content */}
      {selectedTab === "MyAccount" && (
        <View style={styles.content}>
          {rider ? (
            <View style={styles.profileContainer}>
              <View style={styles.profileHeader}>
                <Image source={{ uri: rider.avatar }} style={styles.avatar} />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {rider.fname} {rider.lname}
                  </Text>
                  <Text style={styles.profileEmail}>{rider.email}</Text>
                </View>
              </View>

              <View style={styles.profileDetails}>
                <View style={styles.profileDetailRow}>
                  <Ionicons name="call" size={20} color="#e01d47" />
                  <Text style={styles.profileDetailText}>{rider.phone}</Text>
                </View>
                <View style={styles.profileDetailRow}>
                  <Ionicons name="mail" size={20} color="#e01d47" />
                  <Text style={styles.profileDetailText}>{rider.email}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.logoutButton}>
                <Ionicons name="log-out" size={20} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#e01d47" />
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          )}
        </View>
      )}

      {/* Start Delivery Modal */}
      <Modal
        visible={showDeliveryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeliveryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Start Delivery</Text>
            <TouchableOpacity onPress={() => setShowDeliveryModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Ionicons name="play-circle" size={64} color="#3b82f6" />
            <Text style={styles.modalTitleText}>Ready to Start Delivery?</Text>
            <Text style={styles.modalDescription}>
              This will mark the delivery as started and notify the customer.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowDeliveryModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={startDeliveryProcess}
              >
                <Text style={styles.confirmButtonText}>Start Delivery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#e01d47",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
  },
  subTabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  activeSubTab: {
    backgroundColor: "#e01d47",
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    textAlign: "center",
  },
  activeSubTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  taskDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#4b5563",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  declineButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 8,
  },
  declineButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  deliveryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
  },
  deliveryButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#4ade80",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#d1d5db",
    marginTop: 8,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ef4444",
    marginTop: 16,
  },
  errorSubText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#e01d47",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  profileContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f3f4f6",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  profileEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginBottom: 24,
  },
  profileDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  profileDetailText: {
    fontSize: 16,
    color: "#374151",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  modalContent: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#e01d47",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RiderDashboard;