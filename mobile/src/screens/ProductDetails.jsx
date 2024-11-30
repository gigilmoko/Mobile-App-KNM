import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { defaultStyle, colors } from "../styles/styles";
import Header from "../components/Layout/Header";
import { Avatar, Button } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { getProductDetails } from "../redux/actions/productActions";

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
          backgroundColor: quantity <= 1 ? "gray" : colors.color5,
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
          backgroundColor: colors.color5,
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
  const { user } = useSelector((state) => state.user);

  const [quantity, setQuantity] = useState(1);
  const { name, price, stock, description, images } = product || {};

  const isOutOfStock = stock === 0;

  useEffect(() => {
    dispatch(getProductDetails(params.id));
  }, [dispatch, params.id, isFocused]);

  useEffect(() => {
    if (error) {
      Toast.show({
        type: "error",
        text1: error,
      });
    }
  }, [error]);

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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Failed to load product details</Text>
        <Button mode="contained" onPress={() => dispatch(getProductDetails(params.id))}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={{ ...defaultStyle, padding: 0 }} nestedScrollEnabled>
      <Header back={true} />
      {/* Image Carousel */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.url }}
              style={{
                width: Dimensions.get("window").width,
                height: 250,
                resizeMode: "cover",
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
              backgroundColor: "#f5f5f5", // light gray background
            }}
          >
            <Text style={{ color: "gray" }}>No Images Available</Text>
          </View>
        )}
      </ScrollView>


      {/* Product Details */}
      <View
        style={{
          backgroundColor: colors.color2,
          padding: 15,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        }}
      >
        <Text numberOfLines={2} style={{ fontSize: 25 }}>
          {name}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "900" }}>${price}</Text>
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
          <Text style={{ color: colors.color3, fontWeight: "100" }}>Quantity</Text>
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
                backgroundColor: "black",
              }}
              textColor={isOutOfStock ? colors.color2 : colors.color2}
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
                  borderColor: colors.color1,
                }}
                textColor={"black"}
              >
                Add to Wishlist
              </Button>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const style = StyleSheet.create({
  quantity: {
    backgroundColor: colors.color4,
    height: 25,
    width: 25,
    textAlignVertical: "center",
    textAlign: "center",
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.color5,
  },
});

export default ProductDetails;
