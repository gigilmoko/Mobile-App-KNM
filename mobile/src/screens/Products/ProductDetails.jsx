import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { defaultStyle, colors } from "../../styles/styles";
import Header from "../../components/Layout/Header";
import { Avatar, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getProductDetails } from "../../redux/actions/productActions";
import { fetchProductFeedbacks } from "../../redux/actions/productFeedbackActions";

const QuantityControl = React.memo(({ quantity, incrementQty, decrementQty }) => (
  <View
    style={{
      width: 80,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <TouchableOpacity onPress={decrementQty} disabled={quantity <= 1}>
      <Avatar.Icon
        icon={"minus"}
        size={20}
        style={{
          borderRadius: 5,
          backgroundColor: "#fff",
          height: 25,
          width: 25,
        }}
      />
    </TouchableOpacity>
    <Text style={style.quantity}>{quantity}</Text>
    <TouchableOpacity onPress={incrementQty}>
      <Avatar.Icon
        icon={"plus"}
        size={20}
        style={{
          borderRadius: 5,
          backgroundColor: "#ffb703",
          height: 25,
          width: 25,
        }}
      />
    </TouchableOpacity>
  </View>
));

const ProductDetails = ({ route: { params } }) => {
  const navigate = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const { isLoading, product, error } = useSelector((state) => state.product);
  const { feedbacks, feedbackLoading } = useSelector((state) => state.feedbacks);  // Use feedbacks here
  const { user } = useSelector((state) => state.user);

  const [quantity, setQuantity] = useState(1);
  const { name, price, stock, description, images } = product || {};

  const isOutOfStock = stock === 0;

  useEffect(() => {
    dispatch(getProductDetails(params.id));
    dispatch(fetchProductFeedbacks(params.id)); // Fetch feedback
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <Header back={true} />
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.url }}
              style={{
                width: Dimensions.get("window").width,
                height: 200,
                // resizeMode: "cover",
              }}
            />
          ))
        ) : (
          <View
            style={{
              width: Dimensions.get("window").width,
              height: 250,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Text style={{ color: "gray" }}>No Images Available</Text>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          padding: 15,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Text numberOfLines={2} style={{ fontSize: 25 }}>
          {name}
        </Text>
        <Text style={{ fontSize: 15, fontWeight: "400" }}>${price}</Text>
        <Text
          style={{ lineHeight: 20, marginVertical: 15, color: "grey" }}
          numberOfLines={8}
        >
          {description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 5,
          }}
        >
          <Text style={{ color:"#000", fontWeight: "300" }}>Quantity</Text>
          <QuantityControl
            quantity={quantity}
            incrementQty={incrementQty}
            decrementQty={decrementQty}
          />
        </View>

        <View style={{ flexDirection: "column", marginTop: 20 }}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() =>
              addToCartHandler(params.id, name, price, images[0]?.url, stock)
            }
            disabled={isOutOfStock}
          >
          <Button
            icon={"cart"}
            style={{
              borderRadius: 5,
              backgroundColor: "#bc430b",
            }}
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
                style={{
                  borderRadius: 5,
                  backgroundColor: "white",
                  marginTop: 4,
                  borderWidth: 1,
                  borderColor: "#bc430b ",
                }}
                textColor={"black"}
              >
                Add to Wishlist
              </Button>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Feedback Section */}
      <View style={{ marginTop: 20, padding: 15, backgroundColor: colors.color1 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>Customer Feedbacks</Text>

        {feedbacks && feedbacks.length > 0 ? (
          feedbacks.map((fb) => (
            <View
              key={fb._id}
              style={{
                marginTop: 10,
                padding: 10,
                backgroundColor: colors.color2,
                borderRadius: 5,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Rating: {fb.rating} ⭐</Text>
              <Text>{fb.feedback}</Text>
              <Text style={{ color: "gray", fontSize: 12 }}>
                {new Date(fb.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ marginTop: 10, color: "gray" }}>
            No reviews available yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  quantity: {
    fontSize: 16,
    fontWeight: "700",
    marginHorizontal: 5,
  },
});

export default ProductDetails;
