import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message"; // Import Toast
import { getSingleCategory, updateCategory } from "../../../redux/actions/categoryActions";

const AdminCategoryUpdate = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { categoryId } = route.params;

  const { category, loading, success } = useSelector((state) => state.category);

  const [updatedCategory, setUpdatedCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (categoryId) {
      dispatch(getSingleCategory(categoryId));
    }
  }, [dispatch, categoryId]);

  useEffect(() => {
    if (category) {
      setUpdatedCategory({
        name: category.name || "",
        description: category.description || "",
      });
    }
  }, [category]);

  const handleInputChange = (field, value) => {
    setUpdatedCategory((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  };

  const handleUpdate = () => {
    if (!updatedCategory.name || !updatedCategory.description) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Name and Description are required.",
      });
      return;
    }

    const updatedCategoryData = {
      ...updatedCategory,
      _id: categoryId,
    };

    dispatch(updateCategory(updatedCategoryData));
    if (success) {
      Toast.show({
        type: "success",
        text1: "Category Updated",
        text2: "Category details have been updated successfully.",
      });
      navigation.navigate("admincategory");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
      <Header back={true} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ fontSize: 18 }}>Loading category details...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F5F5F5",
            borderTopRightRadius: 30,
            borderTopLeftRadius: 30,
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
              Update Category
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
              value={updatedCategory.name}
              onChangeText={(text) => handleInputChange("name", text)}
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
              value={updatedCategory.description}
              onChangeText={(text) => handleInputChange("description", text)}
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
                  navigation.navigate("admincategory");
                }}
              >
                <Text style={{ textAlign: "center", color: "#666666" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: "#ffb703",
                  padding: 12,
                  borderRadius: 5,
                  flex: 1,
                }}
                onPress={handleUpdate}
              >
                <Text style={{ textAlign: "center", color: "#000" }}>
                  Update Category
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Footer */}
      <View style={{ position: "absolute", bottom: 0, width: "100%" }}>
        <Footer activeRoute={"home"} />
      </View>
    </View>
  );
};

export default AdminCategoryUpdate;