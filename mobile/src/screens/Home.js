import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Image, Dimensions, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons"; 
import ProductCard from "../components/ProductCard";
import { getAllProducts, getProductsByCategory, searchProducts } from "../redux/actions/productActions"; 
import { loadUser } from "../redux/actions/userActions";
import { useSetCategories } from "../../utils/hooks";
import Footer from "../components/Layout/Footer";
import Toast from "react-native-toast-message";
import { getAverageProductRating } from "../redux/actions/productFeedbackActions";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const Home = ({ navigation }) => {
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [carouselImages, setCarouselImages] = useState([
        { id: "1", url: "https://res.cloudinary.com/dglawxazg/image/upload/t_Banner 16:9/v1729633919/for_calendar_rdts5z.png" },
        { id: "2", url: "https://res.cloudinary.com/dglawxazg/image/upload/t_Banner 16:9/v1729371023/60aff2c3-f8c3-4ac6-9971-53ecabfb821f_lbyppz.png" },
        { id: "3", url: "https://res.cloudinary.com/dglawxazg/image/upload/t_Banner 16:9/v1727764315/croisshark_kscd2p.jpg" },
    ]);

    const navigate = useNavigation();
    const dispatch = useDispatch();
    const isFocused = useIsFocused();

    const { products } = useSelector((state) => state.product);
    const cart = useSelector((state) => state.cart.cartItems);
    const wishlist = useSelector((state) => state.wishlist.wishlistItems) || [];
    const { user } = useSelector((state) => state.user);
    const [isCategoryFetched, setIsCategoryFetched] = useState(false);
    const averageRatings = useSelector((state) => state.feedbacks.averageRatings);

    useSetCategories(setCategories, isFocused);

    useEffect(() => {
        dispatch(loadUser());
    }, [dispatch]);

    useEffect(() => {
        if (!category) {
            dispatch(getAllProducts("", ""));
            setIsCategoryFetched(true);
        }
    }, [dispatch, category]);

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (category) {
                dispatch(getProductsByCategory(category));
            } else {
                dispatch(getAllProducts("", ""));
            }
        }, 200);
        return () => clearTimeout(timeOutId);
    }, [dispatch, category, isFocused]);

    useEffect(() => {
        const timeOutId = setTimeout(() => {
            dispatch({ type: "CLEAR_PRODUCTS" });
            dispatch(searchProducts(searchQuery)); 
        }, 200);
    
        return () => {
            clearTimeout(timeOutId);
        };
    }, [dispatch, searchQuery, category, isFocused]); 

    useEffect(() => {
        if (products && products.length > 0) {
            products.forEach(product => {
                dispatch(getAverageProductRating(product._id)).then((result) => {
                    console.log(`Average rating for product ${product._id}:`, result.payload);
                });
            });
        }
    }, [products, dispatch]);

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setCategory(categoryId === null ? "" : categoryId);
        dispatch({ type: "CLEAR_PRODUCTS" });
        if (categoryId === null) {
            dispatch(getAllProducts("", ""));
        } else {
            dispatch(getProductsByCategory(categoryId));
        }
    };

    const renderCategoryItem = ({ item }) => {
        return (
            <TouchableOpacity
            key={item._id}
            onPress={() => handleCategoryClick(item._id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginHorizontal: 5,
              borderRadius: 20,
              backgroundColor: selectedCategory === item._id ? "#ff6b81" : "#f5f5f5",
              borderWidth: selectedCategory === item._id ? 0 : 1,
              borderColor: "#ddd",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "bold",
                color: selectedCategory === item._id ? "#fff" : "#888",
              }}
            >
              {item.name || "Unknown"}
            </Text>
          </TouchableOpacity>
          
        );
    };

    const addToCartHandler = (id, name, price, image, stock) => {
        if (!user || user === undefined || Object.keys(user).length === 0) {
            navigate.navigate("login");
            return Toast.show({
                type: "info",
                text1: "Log in to continue.",
            });
        }
        const cartItem = cart.find((item) => item.product === id);

        if (cartItem) {
            if (cartItem.quantity < stock) {
                dispatch({
                    type: "updateCartQuantity",
                    payload: {
                        product: id,
                        quantity: 1,
                    },
                });

                Toast.show({
                    type: "info",
                    text1: "Already in Cart. Quantity +1",
                });
            } else {
                Toast.show({
                    type: "info",
                    text1: "Cannot add more. Stock limit reached.",
                });
            }
        } else {
            dispatch({
                type: "addToCart",
                payload: {
                    product: id,
                    name,
                    price,
                    image,
                    stock,
                    quantity: 1,
                },
            });

            Toast.show({
                type: "success",
                text1: "Added To Cart",
            });
        }

        if (stock === 0)
            return Toast.show({
                type: "error",
                text1: "Out Of Stock",
        });
    };

    const addToWishlistHandler = (id, name, price, image, stock) => {
        if (!user) {
            navigate.navigate("login");
            return;
        }

        const isAlreadyInWishlist = wishlist.some((item) => item.product === id);

        if (isAlreadyInWishlist) {
            Toast.show({
                type: "info",
                text1: "Already in Wishlist",
            });
        } else {
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
        }
    };

    useSetCategories(setCategories, isFocused);

    const renderProductItem = ({ item, index }) => (
        <ProductCard
            stock={item.stock}
            name={item.name}
            price={item.price}
            image={item.images[0]?.url}
            addToCartHandler={addToCartHandler}
            addToWishlistHandler={addToWishlistHandler}
            id={item._id}
            key={item._id}
            i={index}
            categoryName={item.category ? item.category.name : "Unknown"} // Add condition to check if category is not null
            navigate={navigation}
            averageRating={averageRatings[item._id]} // Pass average rating to ProductCard
        />
    );
    return (
        <View className="flex-1 pb-20">    
       <View className="flex-row items-center justify-between px-2 py-2 bg-white">
    {/* Logo and Welcome Text */}
    <View className="items-center">
        <Image
            source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741112980/image_2025-03-05_022855838-removebg-preview_thwgac.png" }}
            style={{ width: 100, height: 80, marginRight: 20 }}
            resizeMode="contain"
        />
        <View className="ml-5">
        <Text className="text-md font-bold text-black -mt-5">
            Welcome, <Text className="font-bold text-[#c5162e]">{user?.fname || "Guest"}!</Text>
        </Text>
        </View>
    </View>

    {/* Search Bar */}
    <View className="flex-row items-center bg-white border border-gray-300 mt-5 rounded-full px-2 py-1 w-[50%] shadow-sm">
    <Icon name="search" size={16} color="#c5162e" style={{ marginRight: 5 }} />
    <TextInput
        className="flex-1 text-gray-600"
        placeholder="Search"
        placeholderTextColor="#c5162e"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
    />
</View>
</View>

        <View className="bg-red-600 p-4 rounded-xl flex-row items-center w-[90%] self-center my-4">
            <View className="flex-1">
                <Text className="text-white font-bold text-lg">Mega Sale</Text>
                <Text className="text-white font-bold text-lg">Spectacular!</Text>
                <Text className="text-white text-sm">Indulge in unbeatable deals</Text>
                <Text className="text-white text-sm">across various products.</Text>
            </View>
            <Image
                source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741545362/tote_bag_kq7jhu-removebg-preview_ztj8kv.png" }}
                style={{ width: 140, height: 120, marginLeft: 16 }}
                resizeMode="contain"
            />
        </View>     
        <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "center" }}
            contentContainerStyle={{ paddingHorizontal: 16, }}
            ListHeaderComponent={
                <>
                    {isCategoryFetched ? (
                        <>
                            <View className="px-1 ">
                                <Text className="text-lg font-bold my-1">Categories</Text>
                            </View>

                            <View className="flex-row h-10">
                                <FlatList
                                    data={categories}
                                    renderItem={renderCategoryItem}
                                    keyExtractor={(item) => item._id}
                                    horizontal
                                    contentContainerStyle={{ alignItems: "center" }}
                                    showsHorizontalScrollIndicator={false}
                                    ListHeaderComponent={
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleCategoryClick(null);
                                                dispatch(getAllProducts("", ""));
                                            }}
                                            style={{
                                                paddingHorizontal: 12,
                                                paddingVertical: 6,
                                                marginHorizontal: 5,
                                                borderRadius: 20,
                                                backgroundColor: selectedCategory === null ? "#ff6b81" : "#f5f5f5",
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: "bold",
                                                    color: selectedCategory === null ? "#fff" : "#888",
                                                }}
                                            >
                                                All
                                            </Text>
                                        </TouchableOpacity>
                                    }
                                />
                            </View>
                        </>
                    ) : (
                        <Text>Loading products...</Text>
                    )}
                </>
            }
        />
        <TouchableOpacity
            className="absolute bottom-20 right-6 bg-[#bc430b] p-4 rounded-full shadow-lg"
            onPress={() => navigation.navigate("wishlist")}
        >
            <Icon name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Footer */}
        <View className="absolute bottom-0 w-full bg-[#ffb703]">
            <Footer />
        </View>
    </View>
    );
};

export default Home;

