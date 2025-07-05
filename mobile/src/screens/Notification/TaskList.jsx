import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Footer from "../../components/Layout/Footer";

const TaskList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  // For now, we'll use notifications that are task-related
  // You can replace this with a dedicated task Redux store later
  const { notifications = [], loading = false } = useSelector((state) => state.notifications || {});
  
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending");

  // Filter notifications to get only task-related ones
  const taskNotifications = notifications.filter(notification => {
    const description = notification.description || '';
    return description.toLowerCase().includes('task') || 
           description.toLowerCase().includes('delivery') ||
           description.toLowerCase().includes('rider') ||
           description.toLowerCase().includes('session');
  });

  // Categorize tasks
  const pendingTasks = taskNotifications.filter(task => !task.read);
  const completedTasks = taskNotifications.filter(task => task.read);
  const allTasks = taskNotifications;

  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Replace with actual task loading action
        // await dispatch(getTasks());
        setInitialLoading(false);
      } catch (error) {
        console.error("Error loading tasks:", error);
        setInitialLoading(false);
      }
    };

    if (isFocused) {
      loadTasks();
    }
  }, [dispatch, isFocused]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Replace with actual task refresh action
    // await dispatch(getTasks());
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? "min" : "mins"} ago`;
    } else if (hours < 24) {
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" })
      });
    }
  };

  const getTaskPriority = (description) => {
    if (description.toLowerCase().includes('urgent') || description.toLowerCase().includes('asap')) {
      return { priority: 'high', color: '#ef4444', label: 'High Priority' };
    } else if (description.toLowerCase().includes('delivery')) {
      return { priority: 'medium', color: '#f59e0b', label: 'Medium Priority' };
    }
    return { priority: 'normal', color: '#10b981', label: 'Normal Priority' };
  };

  const getTaskStatus = (task) => {
    if (task.read) {
      return { status: 'completed', color: '#10b981', label: 'Completed', icon: 'checkmark-circle' };
    }
    return { status: 'pending', color: '#f59e0b', label: 'Pending', icon: 'time' };
  };

  const handleTaskPress = (task) => {
    // Navigate to task details or mark as completed
    navigation.navigate('taskdetails', { taskId: task._id });
  };

  const markTaskAsCompleted = (taskId) => {
    // Mark task as completed (read)
    dispatch({ type: 'MARK_TASK_COMPLETED', payload: taskId });
  };

  const getCurrentTasks = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingTasks;
      case 'completed':
        return completedTasks;
      default:
        return allTasks;
    }
  };

  const renderTaskItem = ({ item }) => {
    const taskPriority = getTaskPriority(item.description);
    const taskStatus = getTaskStatus(item);

    return (
      <TouchableOpacity
        className="bg-white rounded-xl shadow-sm mb-3 overflow-hidden"
        onPress={() => handleTaskPress(item)}
        style={[
          styles.taskCard,
          { borderLeftWidth: 4, borderLeftColor: taskPriority.color }
        ]}
      >
        <View className="p-4">
          {/* Task Header */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <View 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: taskPriority.color }}
                />
                <Text className="text-xs font-medium" style={{ color: taskPriority.color }}>
                  {taskPriority.label}
                </Text>
              </View>
              <Text className="text-base font-bold text-gray-800">
                Task Assignment
              </Text>
            </View>
            
            <View className="items-end">
              <View className="flex-row items-center">
                <Ionicons 
                  name={taskStatus.icon} 
                  size={16} 
                  color={taskStatus.color} 
                />
                <Text 
                  className="text-xs font-medium ml-1"
                  style={{ color: taskStatus.color }}
                >
                  {taskStatus.label}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mt-1">
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* Task Description */}
          <View className="bg-gray-50 rounded-lg p-3 mb-3">
            <Text className="text-sm text-gray-700 leading-5">
              {item.description}
            </Text>
          </View>

          {/* Task Actions */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="briefcase-outline" size={16} color="#666" />
              <Text className="text-xs text-gray-600 ml-1">
                Task ID: {item._id.substring(0, 8)}
              </Text>
            </View>
            
            {!item.read && (
              <TouchableOpacity
                className="bg-green-500 px-3 py-1.5 rounded-full flex-row items-center"
                onPress={() => markTaskAsCompleted(item._id)}
              >
                <Ionicons name="checkmark" size={14} color="white" />
                <Text className="text-white text-xs font-medium ml-1">
                  Mark Complete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View className="flex-1 justify-center items-center mt-24">
      <Ionicons name="briefcase-outline" size={70} color="#e0e0e0" />
      <Text className="text-lg font-medium text-gray-400 mt-4">
        {selectedTab === 'pending' ? 'No pending tasks' :
         selectedTab === 'completed' ? 'No completed tasks' : 'No tasks available'}
      </Text>
      <Text className="text-sm text-gray-400 text-center mt-2 px-10">
        {selectedTab === 'pending' 
          ? 'New tasks will appear here when assigned to you'
          : selectedTab === 'completed'
          ? 'Completed tasks will be shown here'
          : 'Your tasks will be displayed here'}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm pt-5 pb-4 px-5">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-800">My Tasks</Text>
          
          <View className="w-8" />
        </View>

        {/* Tabs */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${
              selectedTab === 'all' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setSelectedTab('all')}
          >
            <Text className={`text-center text-sm font-medium ${
              selectedTab === 'all' ? 'text-[#e01d47]' : 'text-gray-600'
            }`}>
              All ({allTasks.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${
              selectedTab === 'pending' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setSelectedTab('pending')}
          >
            <Text className={`text-center text-sm font-medium ${
              selectedTab === 'pending' ? 'text-[#e01d47]' : 'text-gray-600'
            }`}>
              Pending ({pendingTasks.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${
              selectedTab === 'completed' ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => setSelectedTab('completed')}
          >
            <Text className={`text-center text-sm font-medium ${
              selectedTab === 'completed' ? 'text-[#e01d47]' : 'text-gray-600'
            }`}>
              Completed ({completedTasks.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Task Summary Cards */}
      <View className="flex-row justify-between px-5 py-4">
        <View className="bg-orange-100 rounded-lg p-3 flex-1 mr-2">
          <View className="flex-row items-center">
            <Ionicons name="time" size={20} color="#f59e0b" />
            <Text className="text-orange-700 font-bold text-lg ml-2">
              {pendingTasks.length}
            </Text>
          </View>
          <Text className="text-orange-700 text-xs mt-1">Pending Tasks</Text>
        </View>
        
        <View className="bg-green-100 rounded-lg p-3 flex-1 ml-2">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text className="text-green-700 font-bold text-lg ml-2">
              {completedTasks.length}
            </Text>
          </View>
          <Text className="text-green-700 text-xs mt-1">Completed</Text>
        </View>
      </View>

      {/* Task List */}
      {initialLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#e01d47" />
          <Text className="text-gray-500 mt-3">Loading tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={getCurrentTasks()}
          renderItem={renderTaskItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#e01d47"]}
              tintColor="#e01d47"
            />
          }
        />
      )}
      
      {/* Footer */}
      <View className="absolute bottom-0 w-full">
        <Footer activeRoute="notification" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  }
});

export default TaskList;