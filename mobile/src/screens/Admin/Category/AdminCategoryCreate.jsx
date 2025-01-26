import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import Header from "../../../components/Layout/Header";
import Toast from "react-native-toast-message"; // Import Toast
import { useDispatch } from "react-redux";
import { createCategory } from "../../../redux/actions/categoryActions";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

const AdminCategoryCreate = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const navigation = useNavigation(); // Initialize useNavigation hook
  const [centered, setCentered] = useState(true);

  const handleCreateCategory = () => {
    if (!name || !description) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Name and Description are required.",
      });
      return;
    }

    const categoryData = { name, description };

    // Dispatch createCategory and handle success/failure
    dispatch(createCategory(categoryData))
      .then((response) => {
        // If successful, navigate to admin category list page
        navigation.navigate("admincategory"); // Replace "AdminCategory" with your route name
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Category created successfully!",
        });
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message || "Something went wrong.",
        });
      });

    // console.log(categoryData);
  };

  return (
    <View style={{ flex: 1 }}>
      <Header back={true} />

      <ScrollView
        contentContainerStyle={{
          flex: 1,
          justifyContent: centered ? "center" : "flex-start",
          alignItems: "center",
          backgroundColor: "#F5F5F5",
        }}
      >
        <View
          style={{
            backgroundColor: "#F5F5F5",
            width: "90%",
            height: "60%",
            padding: 20,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            shadowOffset: { width: 0, height: 3 },
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginBottom: 20,
              textAlign: "center",
              color: "#333333",
              paddingTop: 15,
            }}
          >
            Create Category
          </Text>

          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Category Name*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
            }}
            placeholder="Enter category name"
            value={name}
            onChangeText={setName}
          />

          <Text style={{ fontSize: 14, color: "#666666", marginBottom: 10 }}>
            Description*
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#CCCCCC",
              borderRadius: 5,
              padding: 10,
              marginBottom: 15,
              height: 100,
              textAlignVertical: "top",
            }}
            placeholder="Enter category description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: "20" }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#DDDDDD",
                padding: 12,
                borderRadius: 5,
                flex: 1,
                marginRight: 10,
              }}
              onPress={() => {
                setName("");
                setDescription("");
              }}
            >
              <Text style={{ textAlign: "center", color: "#666666" }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: "#bc430b", // Changed to orange
                padding: 12,
                borderRadius: 5,
                flex: 1,
              }}
              onPress={handleCreateCategory}
            >
              <Text style={{ textAlign: "center", color: "#fff" }}>
                Create Category
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AdminCategoryCreate;