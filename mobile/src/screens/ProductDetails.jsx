import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import Header from "../../components/Layout/Header";
import { Avatar, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getProductDetails } from "../../redux/actions/productActions";
import { fetchProductFeedbacks } from "../../redux/actions/productFeedbackActions";


const QuantityControl = React.memo(({ quantity, incrementQty, decrementQty }) => (
  <View style={styles.quantityControl}>
    <TouchableOpacity onPress={decrementQty} disabled={quantity <= 1}>
      <Avatar.Icon
        icon={"minus"}
        size={20}
        style={styles.quantityButton}
      />
    </TouchableOpacity>
    <Text style={styles.quantity}>{quantity}</Text>
    <TouchableOpacity onPress={incrementQty}>
      <Avatar.Icon
        icon={"plus"}
        size={18}
        style={styles.quantityButton}
      />
    </TouchableOpacity>
  </View>
));


const ProductDetails = ({ route: { params } }) => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();


  const { isLoading, product, error } = useSelector((state) => state.product);
  const { feedbacks, feedbackLoading } = useSelector((state) => state.feedbacks);
  const { user } = useSelector((state) => state.user);


  const [quantity, setQuantity] = useState(1);
  const { name, price, stock, description, images } = product || {};


  const isOutOfStock = stock === 0;


  useEffect(() => {
    dispatch(getProductDetails(params.id));
    dispatch(fetchProductFeedbacks(params.id));
  }, [dispatch, params.id, isFocused]);


  useEffect(() => {
    if (product) {
      console.log("Fetched Product Details:", product);
    }
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
      });
    }
  }, [product, error]);


  const incrementQty = () => {
    if (stock <= quantity) {
      return Toast.show({
        type: "error",
        text1: "Maximum Value Added",
      });
    }
    setQuantity((prev) => prev + 1);
  };


  const decrementQty = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };


  const addToCartHandler = (id, name, price, image, stock) => {
    if (!user) {
      navigate.navigate("login");
      return Toast.show({
        type: "info",
        text1: "Log in to continue.",
      });
    }


    dispatch({
      type: "addToCart",
      payload: {
        product: id,
        name,
        price,
        image,
        stock,
        quantity,
      },
    });
    Toast.show({
      type: "success",
      text1: "Added To Cart",
    });
  };


  const addToWishlistHandler = (id, name, price, image, stock) => {
    if (!user) {
      navigate.navigate("login");
      return Toast.show({
        type: "info",
        text1: "Log in to continue.",
      });
    }


    dispatch({
      type: "addToWishlist",
      payload: {
        product: id,
        name,
        price,
        image,
        stock,
      },
    });


    Toast.show({
      type: "success",
      text1: "Added To Wishlist",
    });
  };


  if (isLoading || feedbackLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <Header back={true} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {images && images.length > 0 ? (
            images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.url }}
                  style={styles.image}
                />
              </View>
            ))
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={{ color: "gray" }}>No Images Available</Text>
            </View>
          )}
        </ScrollView>


        <View style={styles.productDetailsContainer}>
          <Text numberOfLines={2} style={styles.productName}>
            {name}
          </Text>
          <Text style={styles.productPrice}>${price}</Text>
          <Text style={styles.productDescription} numberOfLines={8}>
            {description}
          </Text>


          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <QuantityControl
              quantity={quantity}
              incrementQty={incrementQty}
              decrementQty={decrementQty}
            />
          </View>


          <View style={styles.buttonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                addToCartHandler(params.id, name, price, images[0]?.url, stock)
              }
              disabled={isOutOfStock}
            >
              <Button
                icon={"cart"}
                style={styles.cartButton}
                textColor="#fff"
              >
                {isOutOfStock ? "Out Of Stock" : "Add To Cart"}
              </Button>
            </TouchableOpacity>
            <View>
              <TouchableOpacity
                onPress={() =>
                  addToWishlistHandler(
                    params.id,
                    name,
                    price,
                    images[0]?.url,
                    stock
                  )
                }
              >
                <Button
                  icon={"heart"}
                  style={styles.wishlistButton}
                  textColor={"black"}
                >
                  Add to Wishlist
                </Button>
              </TouchableOpacity>
            </View>
          </View>


          {/* Feedback Section */}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>Customer Feedbacks</Text>


            {feedbacks && feedbacks.length > 0 ? (
              feedbacks.map((fb) => (
                <View key={fb._id} style={styles.feedbackBox}>
                  <Text style={styles.feedbackRating}>Rating: {fb.rating} ⭐</Text>
                  <Text>{fb.feedback}</Text>
                  <Text style={styles.feedbackDate}>
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>
                No reviews available yet.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    flex: 1,
    alignItems: "center",
  },
  image: {
    width: Dimensions.get("window").width, // Full width
    height: Dimensions.get("window").height / 2 + 30, // Half of the screen height + 30px
  },
  noImageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 2 + 30, // Half of the screen height + 30px
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    marginTop: -30, // Overlap the image by 30px
  },
  productDetailsContainer: {
    padding: 15,
    marginTop: -30, // Overlap the image by 30px
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: "#fff",
    flex: 1, // Ensure it occupies the remaining space
  },
  productName: {
    fontSize: 25,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "400",
  },
  productDescription: {
    lineHeight: 20,
    marginVertical: 15,
    color: "grey",
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  quantityLabel: {
    color: "#000",
    fontWeight: "300",
  },
  quantityControl: {
    width: 80,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityButton: {
    borderRadius: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#bc430b",
    height: 25,
    width: 25,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: "column",
    marginTop: 20,
  },
  cartButton: {
    borderRadius: 5,
    backgroundColor: "#bc430b",
  },
  wishlistButton: {
    backgroundColor: "white",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#bc430b", // Same color as the background of the cart button
    borderRadius: 5,
  },
  feedbackContainer: {
    padding: 15,
    backgroundColor: "#ffb703",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    flex: 1, // Ensure it occupies the remaining space
    marginTop: 20, // Add distance between Add to Wishlist and Feedbacks
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  feedbackBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
  },
  feedbackRating: {
    fontWeight: "bold",
  },
  feedbackDate: {
    color: "gray",
    fontSize: 12,
  },
  noReviewsText: {
    marginTop: 10,
    color: "gray",
    textAlign: "center",
  },
});


export default ProductDetails;

