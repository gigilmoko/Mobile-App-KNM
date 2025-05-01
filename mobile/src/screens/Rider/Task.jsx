import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PendingSessions from "./PendingSessions"; // Import the new PendingSessions component
import OngoingSessions from "./OngoingSessions"; // Import the new OngoingSessions component
import Footer from "../../components/Footer";
z
const Task = () => {
    const [taskTab, setTaskTab] = useState("Pending");

    return (
        <View className="flex-1">
            <View className="p-5">
                <Text className="text-xl font-bold text-red-500 mb-2">My Tasks</Text>
                <View className="border-b border-red-300 mb-5"></View>

                <View className="flex-row items-center mb-5">
                    <TouchableOpacity
                        onPress={() => setTaskTab("Pending")}
                        className={`flex-1 py-2 text-center rounded-md ${
                            taskTab === "Pending" ? "bg-red-500 text-white" : "bg-red-100 text-red-500"
                        }`}
                    >
                        <Text className="text-center font-bold">Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTaskTab("Ongoing")}
                        className={`flex-1 py-2 text-center rounded-md ${
                            taskTab === "Ongoing" ? "bg-red-500 text-white" : "bg-red-100 text-red-500"
                        }`}
                    >
                        <Text className="text-center font-bold">Ongoing</Text>
                    </TouchableOpacity>
                </View>

                {taskTab === "Pending" && <PendingSessions />}
                {taskTab === "Ongoing" && <OngoingSessions />}
            </View>
            <Footer />
        </View>
    );
};

export default Task;