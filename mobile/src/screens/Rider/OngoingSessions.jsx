import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { View, ActivityIndicator, ToastAndroid, Text, ScrollView, Button, Modal, TouchableOpacity, Image, Alert, RefreshControl } from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import mime from 'mime';
import axios from 'axios';
import { getRiderProfile, updateRiderLocation } from "../../redux/actions/riderActions";
import { getSessionsByRider, submitProofDeliverySession, completeDeliverySession, startDeliverySession, cancelOrder } from "../../redux/actions/deliverySessionActions";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

const OngoingSessions = () => {
    <Text className="text-2xl font-bold text-red-500 mb-5">Ongoing Sessions</Text>;
  };

export default OngoingSessions;
