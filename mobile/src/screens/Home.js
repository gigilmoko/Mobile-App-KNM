import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Image, 
  Dimensions, 
  ScrollView,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; 
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { getAllProducts, getProductsByCategory, searchProducts } from "../redux/actions/productActions"; 
import { loadUser } from "../redux/actions/userActions";
import { useSetCategories } from "../../utils/hooks";
import Footer from "../components/Layout/Footer";
import Toast from "react-native-toast-message";
import { getAverageProductRating } from "../redux/actions/productFeedbackActions";

const { width, height } = Dimensions.get("window");

const Home = ({ navigation }) => {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const scrollViewRef = useRef();
  const carouselTimer = useRef(null);
  const firstRender = useRef(true);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const wishlistItemCount = wishlistItems.length;

  const carouselImages = [
    { 
      id: "1", 
      url: "https://res.cloudinary.com/dglawxazg/image/upload/t_Banner 16:9/v1729633919/for_calendar_rdts5z.png",
      title: "Summer Collection",
      subtitle: "Fresh new arrivals for the season"
    },
    { 
      id: "2", 
      url: "https://res.cloudinary.com/dglawxazg/image/upload/t_Banner 16:9/v1729371023/60aff2c3-f8c3-4ac6-9971-53ecabfb821f_lbyppz.png",
      title: "Special Offers",
      subtitle: "Limited time discounts"
    },
    { 
      id: "3", 
      url: "https://res.cloudinary.com/dglawxazg/image/upload/t_Banner 16:9/v1727764315/croisshark_kscd2p.jpg",
      title: "Featured Products",
      subtitle: "Our best selections"
    },
  ];

  const navigate = useNavigation();
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const { products, error, loading: productsLoading } = useSelector((state) => state.product);
  const cart = useSelector((state) => state.cart.cartItems);
  const wishlist = useSelector((state) => state.wishlist.wishlistItems) || [];
  const { user } = useSelector((state) => state.user);
  const [isCategoryFetched, setIsCategoryFetched] = useState(false);
  const averageRatings = useSelector((state) => state.feedbacks.averageRatings);

  useSetCategories(setCategories, isFocused);

  // Start carousel auto-scroll
  useEffect(() => {
    startCarouselTimer();
    return () => {
      if (carouselTimer.current) {
        clearInterval(carouselTimer.current);
      }
    };
  }, []);

  const startCarouselTimer = () => {
    if (carouselTimer.current) {
      clearInterval(carouselTimer.current);
    }
    
    carouselTimer.current = setInterval(() => {
      setCarouselIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % carouselImages.length;
        return nextIndex;
      });
    }, 5000);
  };

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  // Initial data loading - runs only once on first render
  useEffect(() => {
    const loadInitialData = async () => {
      if (firstRender.current) {
        setLoading(true);
        if (!category) {
          await dispatch(getAllProducts("", ""));
          setIsCategoryFetched(true);
        }
        setLoading(false);
        setInitialDataLoaded(true);
        firstRender.current = false;
      }
    };
    
    loadInitialData();
  }, [dispatch]);

  // This will only run when the component is focused and we need to refresh
  useFocusEffect(
    useCallback(() => {
      // Only fetch if products are empty (first load) or searchQuery/category changed
      if ((!products || products.length === 0) && initialDataLoaded) {
        if (category) {
          dispatch(getProductsByCategory(category));
        } else if (searchQuery.trim()) {
          dispatch(searchProducts(searchQuery));
        } else {
          dispatch(getAllProducts("", ""));
        }
      }

      return () => {
        // Cleanup if needed
      };
    }, [dispatch, category, searchQuery, initialDataLoaded])
  );
  
  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) return;
    
    const timeOutId = setTimeout(() => {
      dispatch({ type: "CLEAR_PRODUCTS" });
      dispatch(searchProducts(searchQuery));
    }, 200);
    
    return () => clearTimeout(timeOutId);
  }, [dispatch, searchQuery]);

  // Rating fetch should only happen when products change
  useEffect(() => {
    if (products && products.length > 0) {
      products.forEach(product => {
        dispatch(getAverageProductRating(product._id));
      });
    }
  }, [products, dispatch]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setCategory(categoryId === null ? "" : categoryId);
    dispatch({ type: "CLEAR_PRODUCTS" });
    setLoading(true);
    
    if (categoryId === null) {
      dispatch(getAllProducts("", ""));
    } else {
      dispatch(getProductsByCategory(categoryId));
    }
  };

  const addToCartHandler = (id, name, price, image, stock) => {
    if (stock === 0) {
      return Toast.show({
        type: "error",
        text1: "Out Of Stock",
      });
    }

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
            quantity: cartItem.quantity + 1,
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

  const renderProductGrid = () => {
    if (loading || productsLoading) {
      // Show skeleton loading UI
      return (
        <View style={styles.productsGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={`skeleton-${index}`} style={styles.productCardWrapper}>
              <ProductCardSkeleton />
            </View>
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={50} color="#e01d47" />
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      );
    }

    if (!products || products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={50} color="#999" />
          <Text style={styles.emptyText}>
            {searchQuery ? "No products found for your search" : "No products available"}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.productsGrid}>
        {products.map((item, index) => (
          <View key={item._id} style={styles.productCardWrapper}>
            <ProductCard
              stock={item.stock}
              name={item.name}
              price={item.price}
              image={item.images[0]?.url}
              addToCartHandler={addToCartHandler}
              addToWishlistHandler={addToWishlistHandler}
              id={item._id}
              i={index}
              categoryName={item.category ? item.category.name : "Unknown"}
              navigate={navigation}
              averageRating={averageRatings[item._id]}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Logo and Welcome */}
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741112980/image_2025-03-05_022855838-removebg-preview_thwgac.png" }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.welcomeText}>
                Welcome, <Text style={styles.userName}>{user?.fname || "Guest"}!</Text>
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#c5162e" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)}
            />
            {searchQuery.trim() !== "" && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearSearch}
              >
                <Ionicons name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={styles.promoBannerContent}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle}>Mega Sale</Text>
              <Text style={styles.promoTitle}>Spectacular!</Text>
              <Text style={styles.promoSubtitle}>Indulge in unbeatable deals</Text>
              <Text style={styles.promoSubtitle}>across various products.</Text>
            </View>
            <Image
              source={{ uri: "https://res.cloudinary.com/dglawxazg/image/upload/v1741545362/tote_bag_kq7jhu-removebg-preview_ztj8kv.png" }}
              style={styles.promoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Categories */}
        {isCategoryFetched && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesList}>
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScrollContent}
              >
                <TouchableOpacity
                  onPress={() => {
                    handleCategoryClick(null);
                    dispatch(getAllProducts("", ""));
                  }}
                  style={[
                    styles.categoryButton,
                    selectedCategory === null && styles.categoryButtonActive
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === null && styles.categoryTextActive
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {categories.map(item => (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => handleCategoryClick(item._id)}
                    style={[
                      styles.categoryButton,
                      selectedCategory === item._id && styles.categoryButtonActive
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === item._id && styles.categoryTextActive
                      ]}
                    >
                      {item.name || "Unknown"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? "Search Results" : selectedCategory ? "Products" : "Top Products"}
          </Text>
          {renderProductGrid()}
        </View>
      </ScrollView>

      {/* Wishlist Button */}
      <TouchableOpacity
        style={styles.wishlistButton}
        onPress={() => navigation.navigate("wishlist")}
      >
        <Ionicons name="heart-outline" size={24} color="#ffffff" />
        {wishlistItemCount > 0 && (
          <View className="absolute -top-1 -right-2 bg-[#e01d47] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            <Text className="text-white text-[10px] font-bold">
              {wishlistItemCount > 99 ? '99+' : wishlistItemCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Footer activeRoute={"home"} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 60,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#333',
  },
  userName: {
    color: '#e01d47',
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginLeft: 10,
    maxWidth: 170,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  clearSearch: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  carouselContainer: {
    marginVertical: 15,
    position: 'relative',
  },
  carouselSlide: {
    width: width * 0.9,
    height: width * 0.5,
    marginHorizontal: width * 0.05,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  carouselTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  carouselSubtitle: {
    color: '#f0f0f0',
    fontSize: 13,
    marginTop: 3,
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: '#e01d47',
    width: 12,
    height: 8,
  },
  promoBanner: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e01d47',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promoBannerContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  promoSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  promoImage: {
    width: 120,
    height: 100,
  },
  categoriesSection: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoriesList: {
    marginBottom: 10,
  },
  categoriesScrollContent: {
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryButtonActive: {
    backgroundColor: '#e01d47',
    borderColor: '#e01d47',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  productsSection: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loaderText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e01d47',
    marginTop: 10,
  },
  errorSubtext: {
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 30,
  },
  wishlistButton: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    backgroundColor: '#e01d47',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e01d47',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  }
});

export default Home;