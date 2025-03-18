import React, { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import Footer from "../../../components/Layout/Footer";
import Header from "../../../components/Layout/Header";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, deleteProduct } from "../../../redux/actions/productActions";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"; 
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";

const AdminProducts = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { products = [], loading } = useSelector((state) => state.product); 
  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const handleProductClick = (productId) => {
    navigation.navigate("adminproductsupdate", { productId });
  };

  const handleNewProductClick = () => {
    navigation.navigate("adminproductscreate");
  };

  const handleDelete = (productId) => {
    // Confirm delete action
    Alert.alert("Delete Product", "Are you sure you want to delete this product?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          dispatch(deleteProduct(productId));
        },
      },
    ]);
  };

  const renderRightActions = (productId) => (
    <View style={styles.swipeActionContainer}>
      <TouchableOpacity
        style={styles.swipeActionEdit}
        onPress={() => handleProductClick(productId)}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.swipeActionDelete}
        onPress={() => handleDelete(productId)}
      >
        <MaterialCommunityIcons name="trash-can" size={24} color="#000" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Products</Text>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 18 }}>Loading...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}>
            <View style={styles.container}>
              <View>
                {products.length > 0 ? (
                  products.map((product) => (
                    <Swipeable
                      key={product._id}
                      renderRightActions={() => renderRightActions(product._id)}
                      overshootRight={false}
                    >
                      <TouchableOpacity
                        style={styles.productCard}
                        onPress={() => handleProductClick(product._id)}
                      >
                        <Text style={styles.productTitle}>{product.name}</Text>
                        <Text style={styles.productDescription}>Price: ₱{product.price}</Text>
                        <Text style={styles.productDescription}>Description: {product.description}</Text>
                        <Text style={styles.productDescription}>Stock: {product.stock}</Text>
                      </TouchableOpacity>
                    </Swipeable>
                  ))
                ) : (
                  <Text style={{ textAlign: "center", color: "#666666" }}>No products found</Text>
                )}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Floating + Icon Button */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleNewProductClick}
        >
          <MaterialCommunityIcons name="plus" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  productCard: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 70, // Adjust to stay above the footer
    right: 20,
    backgroundColor: "#bc430b",
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
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 10,
    height: 100,
  },
  swipeActionEdit: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  swipeActionDelete: {
    padding: 10,
    borderRadius: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AdminProducts;