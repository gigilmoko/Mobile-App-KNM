import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

const OrderList = ({
    id,
    price,
    address,
    orderedOn,
    status,
    statusColor,
    paymentMethod,
    i = 0,
    navigate,
}) => {
    // const navigation = useNavigation("Comment");

    // const getProductIds = () => {
    //     return orderItems.map((item) => item.product);
    // };

    const badgeTextColor = status === "Shipped" ? "#707981" : "#ffffff";

    return (
        <View style={styles.container}>
            <View style={styles.innerRow}>
                <View>
                    <Text style={styles.primaryText}>Order # {id}</Text>
                </View>
                <View style={styles.timeDateContainer}>
                    <Text style={styles.secondaryTextSm}>
                        {orderedOn}
                    </Text>
                </View>
            </View>
            <View style={styles.innerRow}>
                <Text style={styles.secondaryText} i={i}>{address} </Text>
            </View>
            <View style={styles.innerRow}>
                <Text style={styles.secondaryText} i={i}>Payment Method : {paymentMethod}</Text>
                <Text style={styles.secondaryText} i={i}>Total Amount : ${price}</Text>
            </View>
            <View style={styles.innerRow}>
                <TouchableOpacity style={styles.detailButton} onPress={() => navigate.navigate("orderdetails", { id })}>
                    <Text>Details</Text>
                </TouchableOpacity>
                <View style={[styles.badge, { backgroundColor: statusColor }]}>
                <Text style={[styles.badgeText, { color: badgeTextColor }]}>{status}</Text>
                </View>            
            </View>
        </View>
    );
};

export default OrderList;

const styles = StyleSheet.create({
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        height: "auto",
        backgroundColor: "#ffffff",
        borderRadius: 10,
        padding: 10,
        elevation: 1,
    },
    innerRow: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    primaryText: {
        fontSize: 15,
        color: "#343A3F",
        fontWeight: "bold",
    },
    secondaryTextSm: {
        fontSize: 11,
        color: "#707981",
        fontWeight: "bold",
    },
    secondaryText: {
        fontSize: 14,
        color: "#707981",
        fontWeight: "bold",
    },
    timeDateContainer: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    detailButton: {
        marginTop: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 1,
        padding: 5,
        borderColor: "#707981",
        color: "#707981",
        width: 100,
    },
    badge: {
        borderRadius: 20, // Adjust this to change badge roundness
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: "#ff6347", // Default badge color
    },
    badgeText: {
        fontWeight: "bold",
        fontSize: 12,
    },
});