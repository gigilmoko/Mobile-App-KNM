import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useDispatch, useSelector } from "react-redux";
import { getAllCategories, deleteCategory } from "../../../redux/actions/categoryActions";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; // Import MaterialCommunityIcons
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler"; // Import Swipeable for swipe actions

const AdminCategory = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isDeleting, setIsDeleting] = useState(false);
  const { categories, loading } = useSelector((state) => state.category);

  useEffect(() => {
    dispatch(getAllCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigation.navigate("admincategoryupdate", { categoryId });
  };

  const handleNewCategoryClick = () => {
    navigation.navigate("admincategorycreate");
  };

  const handleDelete = (categoryId) => {
    // Confirm delete action
    Alert.alert("Delete Category", "Are you sure you want to delete this category?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          setIsDeleting(true);
          dispatch(deleteCategory(categoryId));
        },
      },
    ]);
  };

  const renderRightActions = (categoryId) => (
    <View style={styles.swipeActionContainer}>
      <TouchableOpacity
        style={styles.swipeActionEdit}
        onPress={() => handleCategoryClick(categoryId)}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeActionDelete}
        onPress={() => handleDelete(categoryId)}
      >
        <MaterialCommunityIcons name="trash-can" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#ffb703" }}>
        <Header back={true} />

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>Loading...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
            <View style={styles.container}>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.headerText}>Categories</Text>
              </View>

              <View style={{ marginTop: 20 }}>
                {categories.map((category) => (
                  <Swipeable
                    key={category._id}
                    renderRightActions={() => renderRightActions(category._id)}
                    overshootRight={false}
                  >
                    <TouchableOpacity
                      style={styles.categoryCard}
                      onPress={() => handleCategoryClick(category._id)}
                    >
                      <Text style={styles.categoryTitle}>{category.name}</Text>
                      <Text style={styles.categoryDescription}>{category.description}</Text>
                    </TouchableOpacity>
                  </Swipeable>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Floating + Icon Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleNewCategoryClick}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
        </TouchableOpacity>

        <Footer activeRoute={"home"} />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 0,
  },
  categoryCard: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    borderColor: "#ffb703",
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },  
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryDescription: {
    fontSize: 14,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 70, // Adjust to stay above the footer
    right: 20,
    backgroundColor: "#ffb703",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  swipeActionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    height: 70,
  },
  swipeActionEdit: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#ffb703",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  swipeActionDelete: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#ffb703",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AdminCategory;