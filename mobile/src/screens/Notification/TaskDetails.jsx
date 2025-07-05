import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";

const TaskDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { taskId } = route.params;

  // Get task from notifications store (replace with actual task store later)
  const { notifications = [] } = useSelector((state) => state.notifications || {});
  const task = notifications.find(n => n._id === taskId);

  if (!task) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Ionicons name="alert-circle-outline" size={70} color="#e0e0e0" />
        <Text className="text-lg font-medium text-gray-400 mt-4">Task not found</Text>
        <TouchableOpacity
          className="mt-6 bg-[#e01d47] py-3 px-6 rounded-full"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskPriority = (description) => {
    if (description.toLowerCase().includes('urgent') || description.toLowerCase().includes('asap')) {
      return { priority: 'high', color: '#ef4444', label: 'High Priority' };
    } else if (description.toLowerCase().includes('delivery')) {
      return { priority: 'medium', color: '#f59e0b', label: 'Medium Priority' };
    }
    return { priority: 'normal', color: '#10b981', label: 'Normal Priority' };
  };

  const taskPriority = getTaskPriority(task.description);
  const isCompleted = task.read;

  const markAsCompleted = () => {
    dispatch({ type: 'MARK_TASK_COMPLETED', payload: taskId });
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm pt-5 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#e01d47" />
          </TouchableOpacity>
          
          <Text className="text-xl font-bold text-gray-800">Task Details</Text>
          
          <View className="w-8" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Task Status Card */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <View 
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: taskPriority.color }}
              />
              <Text className="text-lg font-bold text-gray-800">Task Assignment</Text>
            </View>
            
            <View className={`px-3 py-1 rounded-full ${
              isCompleted ? 'bg-green-100' : 'bg-orange-100'
            }`}>
              <Text className={`text-xs font-medium ${
                isCompleted ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center mb-2">
            <Ionicons name="flag" size={16} color={taskPriority.color} />
            <Text className="text-sm ml-2" style={{ color: taskPriority.color }}>
              {taskPriority.label}
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              Assigned: {formatDate(task.createdAt)}
            </Text>
          </View>
        </View>

        {/* Task Description */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Description</Text>
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-base text-gray-700 leading-6">
              {task.description}
            </Text>
          </View>
        </View>

        {/* Task Information */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">Task Information</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Task ID</Text>
              <Text className="font-medium text-gray-800">{task._id.substring(0, 12)}</Text>
            </View>
            
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Status</Text>
              <Text className={`font-medium ${
                isCompleted ? 'text-green-600' : 'text-orange-600'
              }`}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-600">Priority</Text>
              <Text className="font-medium" style={{ color: taskPriority.color }}>
                {taskPriority.label}
              </Text>
            </View>
            
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-600">Assigned Date</Text>
              <Text className="font-medium text-gray-800">
                {new Date(task.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View className="bg-blue-50 rounded-xl p-4 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={20} color="#3b82f6" />
            <Text className="text-blue-800 font-bold ml-2">Instructions</Text>
          </View>
          <Text className="text-blue-700 text-sm leading-5">
            Please complete this task as described above. If you have any questions or need clarification, 
            contact your supervisor. Mark the task as completed once finished.
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isCompleted && (
        <View className="bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
            onPress={markAsCompleted}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Mark as Completed
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default TaskDetails;