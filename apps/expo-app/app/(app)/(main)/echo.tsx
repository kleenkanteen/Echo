import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, CameraCapturedPicture } from 'expo-camera';
import * as Speech from 'expo-av';

export default function EchoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg">Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-8">
        <Text className="text-center text-lg mb-4">
          We need your permission to use the camera for obstacle detection
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
        setDescription(null);
        await processImage(photo.uri);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error(error);
      }
    }
  };

  const processImage = async (imageUri: string) => {
    setIsProcessing(true);
    try {
      const result = await mockImageAnalysis(imageUri);
      setDescription(result);
      await speakText(result);
    } catch (error) {
      Alert.alert('Error', 'Could not process image');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const mockImageAnalysis = async (imageUri: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "I can see a table in front of you with a coffee mug. There's a chair on your right and a doorway on the left. The path ahead appears clear.";
  };

  const speakText = async (text: string) => {
    try {
      await Speech.Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setDescription(null);
  };

  if (capturedImage) {
    return (
      <View className="flex-1 bg-black">
        <Image source={{ uri: capturedImage }} className="flex-1" resizeMode="contain" />
        
        {isProcessing ? (
          <View className="absolute inset-0 bg-black/70 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className="text-white mt-4 text-lg">Analyzing scene...</Text>
          </View>
        ) : description ? (
          <View className="absolute bottom-0 left-0 right-0 bg-black/90 p-6">
            <Text className="text-white text-base leading-6 mb-4">{description}</Text>
            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => speakText(description)}
                className="flex-1 bg-blue-500 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">Replay Audio</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetCamera}
                className="flex-1 bg-gray-600 py-3 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">Take New Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
        <View className="flex-1 bg-transparent">
          <View className="flex-1 justify-center items-center">
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="bg-black/50 p-3 rounded-full absolute top-12 right-6"
            >
              <Text className="text-white">Flip</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mb-12">
            <TouchableOpacity
              onPress={takePicture}
              className="bg-white w-20 h-20 rounded-full border-4 border-gray-300 items-center justify-center"
            >
              <View className="w-16 h-16 bg-white rounded-full" />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-8 left-0 right-0 items-center">
            <Text className="text-white text-sm bg-black/50 px-4 py-2 rounded-full">
              Tap to capture and analyze your surroundings
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
