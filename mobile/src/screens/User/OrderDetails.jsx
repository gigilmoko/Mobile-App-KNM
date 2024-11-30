import {
    StyleSheet,
    Text,
    View,
    ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors } from "../../constants";
import { Button } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused, useRoute } from "@react-navigation/native";
import { getOrderDetails } from '../../redux/actions/orderActions';
import Header from "../../components/Layout/Header";
import StepIndicator from "react-native-step-indicator";
import ConfirmOrderItem from "../../components/Cart/ConfirmOrderItem";
import { processOrder } from "../../redux/actions/orderActions";
import DropDownPicker from "react-native-dropdown-picker";

const OrderDetails = ({ admin }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const [statusDisable, setStatusDisable] = useState(false);
    const route = useRoute();
    const { id } = route.params;

    const updateHandler = () => {
        dispatch(processOrder(id));
    };

    useEffect(() => {
        dispatch(getOrderDetails(id));
    }, [dispatch, id]);

    const { order } = useSelector((state) => state.order);
    const orderStatus = useSelector((state) => state.order.orderStatus);
    const status = order ? order.orderStatus : '';

    const [items, setItems] = useState([
        { label: 'Preparing', value: 'Preparing' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' }
    ]);

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);

    const labels = ["Preparing", "Shipping", "Delivery"];
    const [trackingState, setTrackingState] = useState(1);
    const customStyles = {
        stepIndicatorSize: 25,
        currentStepIndicatorSize: 30,
        separatorStrokeWidth: 2,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: "#FB6831",
        stepStrokeWidth: 3,
        stepStrokeFinishedColor: "#FB6831",
        stepStrokeUnFinishedColor: "#aaaaaa",
        separatorFinishedColor: "#fe7013",
        separatorUnFinishedColor: "#aaaaaa",
        stepIndicatorFinishedColor: "#fe7013",
        stepIndicatorUnFinishedColor: "#ffffff",
        stepIndicatorCurrentColor: "#FFFFFF",
        stepIndicatorLabelFontSize: 13,
        currentStepIndicatorLabelFontSize: 13,
        stepIndicatorLabelCurrentColor: "#fe7013",
        stepIndicatorLabelFinishedColor: "#ffffff",
        stepIndicatorLabelUnFinishedColor: "#aaaaaa",
        labelColor: "#999999",
        labelSize: 13,
        currentStepLabelColor: "#fe7013",
    };

    useEffect(() => {
        if (order && order.orderStatus) {
            if (order.orderStatus === "Delivered") {
                setStatusDisable(true);
                setTrackingState(3);
            } else if (order.orderStatus === "Shipped") {
                setStatusDisable(false);
                setTrackingState(2);
            } else if (order.orderStatus === "Preparing") {
                setStatusDisable(false);
                setTrackingState(1);
            }
        }
    }, [order]);

    return (
        <>
            <Header back={true} />
            <View style={styles.container}>
                <View style={styles.screenNameContainer}>
                    <View>
                        <Text style={styles.screenNameText}>Order Details</Text>
                    </View>
                    <View>
                        <Text style={styles.screenNameParagraph}>
                            View all detail about order
                        </Text>
                    </View>
                </View>
                <ScrollView
                    style={styles.bodyContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.containerNameContainer}>
                        <View>
                            <Text style={styles.containerNameText}>Shipping Address</Text>
                        </View>
                    </View>
                    <View style={styles.ShipingInfoContainer}>
                        <Text style={styles.secondarytextSm}>
                            {order?.shippingInfo?.address}, {order?.shippingInfo?.city}, {order?.shippingInfo?.country} {order?.shippingInfo?.pinCode}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.containerNameText}>Order Info</Text>
                    </View>
                    <View style={styles.orderInfoContainer}>
                        <Text style={styles.secondarytextMedian}>
                            Order # {order?._id}
                        </Text>
                        <Text style={styles.secondarytextSm}>
                            Ordered on {order?.createdAt?.split("T")[0]}
                        </Text>
                        <View style={{ marginTop: 15, width: "100%" }}>
                            <StepIndicator
                                customStyles={customStyles}
                                currentPosition={trackingState}
                                stepCount={3}
                                labels={labels}
                            />
                        </View>
                    </View>

                    <View style={styles.containerNameContainer}>
                        <View>
                            <Text style={styles.containerNameText}>Package Details</Text>
                        </View>
                    </View>
                    <View style={styles.orderItemsContainer}>
                        <View style={styles.orderItemContainer}>
                            <Text style={styles.orderItemText}>Package</Text>
                            <Text>{order?.orderStatus}</Text>
                        </View>
                        <View style={styles.orderItemContainer}>
                            <Text style={styles.orderItemText}>
                                Payment Method : {order?.paymentMethod ? order?.orderStatus : ''}
                            </Text>
                        </View>
                        <ScrollView
                            style={styles.orderSummaryContainer}
                            nestedScrollEnabled={true}
                        >
                            {order && order.orderItems && order.orderItems.map((i) => (
                                <ConfirmOrderItem
                                    key={i.product}
                                    price={i.price}
                                    image={i.image}
                                    name={i.name}
                                    quantity={i.quantity}
                                />
                            ))}
                        </ScrollView>
                        <View style={styles.orderItemContainer}>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: '500',
                                maxWidth: '80%',
                                color: '#000000',
                                opacity: 0.5,
                            }}>Total</Text>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: '500',
                                color: '#e84219',
                            }}>${order?.totalAmount}</Text>
                        </View>
                    </View>
                    <View style={styles.emptyView}></View>
                </ScrollView>
                {admin && (
                        <View>
                            {statusDisable == false ? (
                                <>
                                    <View style={styles.bottom1Container}>
                                        <View>
                                            <DropDownPicker
                                                style={{ width: 200 }}
                                                open={open}
                                                value={value}
                                                items={items}
                                                setOpen={setOpen}
                                                setValue={setValue}
                                                setItems={setItems}
                                                disabled={statusDisable}
                                                disabledStyle={{
                                                    backgroundColor: colors.light,
                                                    borderColor: colors.white,
                                                }}
                                                labelStyle={{ color: colors.muted }}
                                            />
                                        </View>
                                        <Button onPress={updateHandler}>Update Order</Button>
                                    </View>
                                </>
                            ) : (
                                <View style={styles.bottom2Container}>
                                <Text style={styles.deliveryText}>This order was already delivered to the customer</Text>
                                </View>
                            )}
                        </View>
                )}
            </View>
        </>
    );
};

export default OrderDetails

const styles = StyleSheet.create({
    container: {
        flexDirecion: "row",
        backgroundColor: "#F5F5F5",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingBottom: 0,
        flex: 1,
    },
    TopBarContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    screenNameContainer: {
        marginTop: 10,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        marginBottom: 5,
    },
    screenNameText: {
        fontSize: 30,
        fontWeight: "800",
        color: "#707981",
    },
    screenNameParagraph: {
        marginTop: 10,
        fontSize: 15,
    },
    bodyContainer: { flex: 1, width: "100%", padding: 5 },
    ShipingInfoContainer: {
        marginTop: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderRadius: 10,
        borderColor: "#707981",
        elevation: 5,
        marginBottom: 10,
    },
    containerNameContainer: {
        marginTop: 10,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
    },
    containerNameText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#707981",
    },
    secondarytextSm: {
        color: "#707981",
        fontSize: 13,
    },
    orderItemsContainer: {
        height: 350,
        marginTop: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderRadius: 10,

        borderColor: "#FFFFFF",
        elevation: 3,
        marginBottom: 10,
    },
    orderItemContainer: {
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    orderItemText: {
        fontSize: 13,
        color: "#707981",
    },
    orderSummaryContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        padding: 10,
        maxHeight: 260,
        width: "100%",
        marginBottom: 5,
    },
    bottom1Container: {
        backgroundColor: "#FFFFFF",
        width: "110%",
        height: 70,
        borderTopLeftRadius: 10,
        borderTopEndRadius: 10,
        elevation: 5,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",

        paddingLeft: 10,
        paddingRight: 10,
    },
    bottom2Container: {
        backgroundColor: "#FFFFFF",
        width: 375,
        height: 70,
        borderTopLeftRadius: 10,
        borderTopEndRadius: 10,
        elevation: 5,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    orderInfoContainer: {
        marginTop: 5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundColor: "#FFFFFF",
        padding: 10,
        borderRadius: 10,

        borderColor: "#707981",
        elevation: 1,
        marginBottom: 10,
    },
    primarytextMedian: {
        color: "#FB6831",
        fontSize: 15,
        fontWeight: "bold",
    },
    secondarytextMedian: {
        color: "#707981",
        fontSize: 15,
        fontWeight: "bold",
    },
    deliveryText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    emptyView: {
        height: 20,
    },
});