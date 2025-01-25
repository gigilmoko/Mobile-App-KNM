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

    // Search effect
    useEffect(() => {
        const timeOutId = setTimeout(() => {
            dispatch(searchProducts(searchQuery)); 
        }, 200);
    
        return () => {
            clearTimeout(timeOutId);
        };
    }, [dispatch, searchQuery, category, isFocused]); 

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        setCategory(categoryId === null ? "" : categoryId);
        dispatch({ type: "CLEAR_PRODUCTS" });
    };

    const renderCategoryItem = ({ item }) => {
        return (
            <TouchableOpacity key={item._id} onPress={() => handleCategoryClick(item._id)}>
                <Text style={[styles.categoryButton, category === item._id ? styles.selectedCategory : styles.unselectedCategory]}>
                    {item.name || "Unknown"}
                </Text>
            </TouchableOpacity>
        );
    };

    const addToCardHandler = (id, name, price, image, stock) => {
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
            addToCardHandler={addToCardHandler}
            addToWishlistHandler={addToWishlistHandler}
            id={item._id}
            key={item._id}
            i={index}
            navigate={navigation}
        />
    );

    const renderCarouselItem = ({ item }) => (
        <Image source={{ uri: item.url }} style={styles.carouselImage} />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Hello, {user?.fname} {user?.lname || "Guest"}!
                </Text>
                <View style={styles.locationContainer}>
                    <Icon name="location-outline" size={20} color="#000" />
                    <Text style={styles.locationText}>
                        {user?.DeliveryAddress || "Location not set"}
                    </Text>
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)} // Update search query
                />
            </View>

            {/* Main Content */}
            <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={styles.productListRow} // Center the product cards
                contentContainerStyle={styles.productList}
                ListHeaderComponent={
                    <>
                        {isCategoryFetched ? (
                            <>
                                <View style={styles.carouselContainer}>
                                    <FlatList
                                        data={carouselImages}
                                        renderItem={renderCarouselItem}
                                        keyExtractor={(item) => item.id}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        pagingEnabled
                                        snapToAlignment="center"
                                        snapToInterval={screenWidth}
                                        decelerationRate="fast"
                                        contentContainerStyle={styles.carouselContentContainer}
                                    />
                                </View>
                                <View style={styles.primaryTextContainer}>
                                    <Text style={styles.primaryText}>Categories</Text>
                                </View>
                                <View style={styles.categoryContainer}>
                                    <FlatList
                                        data={categories}
                                        renderItem={renderCategoryItem}
                                        keyExtractor={(item) => item._id}
                                        horizontal
                                        contentContainerStyle={{ alignItems: "center" }}
                                        showsHorizontalScrollIndicator={false}
                                        ListHeaderComponent={
                                            <TouchableOpacity onPress={() => handleCategoryClick(null)}>
                                                <Text
                                                    style={[styles.categoryButton, selectedCategory === null ? styles.selectedCategory : styles.unselectedCategory]}
                                                >
                                                    All
                                                </Text>
                                            </TouchableOpacity>
                                        }
                                    />
                                </View>
                            </>
                        ) : (
                            // Optionally, you can show a loading spinner or some message if no category is selected or products are being fetched
                            <Text>Loading products...</Text>
                        )}
                    </>
                }
            />

            {/* Floating Wishlist Button */}
            <TouchableOpacity
                style={styles.floatingWishlistButton}
                onPress={() => navigation.navigate("wishlist")}
            >
                <Icon name="heart-outline" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
                <Footer />
            </View>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 60,
        paddingTop:15
    },
    header: {
        padding: 12,
        backgroundColor: "#ffb703",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        marginLeft: 8,
        fontSize: 12,
        color: "#000",
    },
    searchContainer: {
        paddingHorizontal: 12,
        backgroundColor: "#ffb703",
        height: 40,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: "100%", // Ensure the search container takes the full width
    },
    searchInput: {
        height: 35,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: "#fff",
        width: "100%",
    },
    productList: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    productListRow: {
        justifyContent: 'center', 
    },
    primaryTextContainer: {
        paddingHorizontal: 5,
        marginTop: 5, // Adjust space between carousel and categories
    },
    primaryText: {
        fontSize: 16, // Smaller text size
        fontWeight: "bold",
        marginVertical: 5,
    },
    categoryContainer: {
        flexDirection: "row",
        height: 40, // Less height
        // marginTop: 10, // Adjust space between categories and category buttons
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 5, // Less padding
        marginHorizontal: 5, // Less margin
        borderRadius: 5,
        fontSize: 12, // Smaller text size
    },
    selectedCategory: {
        backgroundColor: "#bc430b",
        color: "#fff",
    },
    unselectedCategory: {
        backgroundColor: "#ffb703",
        color: "#000",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        backgroundColor: "#ffb703",
    },
    floatingWishlistButton: {
        position: "absolute",
        bottom: 60,
        right: 10,
        backgroundColor: "#bc430b",
        padding: 16,
        borderRadius: 50,
        elevation: 5,
    },
    carouselContainer: {
        width: screenWidth * 0.90,
        margin: screenHeight * 0.002,
        height: 150,
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
    },
    carouselContentContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 30,
    },
    carouselImage: {
        width: screenWidth,
        height: 150,
        resizeMode: "cover",
    },
});