import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import mime from 'mime';

const CameraCapture = () => {
  const [capturedImage, setCapturedImage] = useState(null);

  const captureImage = async () => {
    // Request camera permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      return Alert.alert("Permission required", "Camera permission is needed to capture an image.");
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const imageUri = result.assets[0].uri;
      setCapturedImage(imageUri);
      uploadToCloudinary(imageUri);
    }
  };

  const uploadToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: mime.getType(imageUri),
      name: imageUri.split("/").pop(),
    });
    formData.append('upload_preset', 'ml_default');

    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      Alert.alert("Success", `Image uploaded successfully: ${response.data.secure_url}`);
    } catch (error) {
      console.error('Failed to upload image', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Capture Image" onPress={captureImage} />
      {capturedImage && <Image source={{ uri: capturedImage }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});

export default CameraCapture;
