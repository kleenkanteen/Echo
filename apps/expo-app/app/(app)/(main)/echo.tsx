import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions, CameraType, CameraCapturedPicture } from 'expo-camera';
import * as Speech from 'expo-av';
import { ElevenLabsClient, play } from '@elevenlabs/elevenlabs-js';
import { speakTextWithElevenLabs } from './tts';

const ENDPOINT = 'https://us-central1-gen-lang-client-0136115968.cloudfunctions.net/describe';

const elevenlabs = new ElevenLabsClient({ 
  apiKey: process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY
});


export default function EchoScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (isProcessing) return;
    if (!cameraRef.current) return;

    setIsProcessing(true);

    try {
      const photo: CameraCapturedPicture = await cameraRef.current.takePictureAsync();
      setCapturedImage(photo.uri);

      await processImage(photo.uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
      console.error(error);
    } finally {
      setIsProcessing(false);
      setCapturedImage(null);
    }
  };

  const processImage = async (imageUri: string) => {
    const started_at = Date.now();
    try {
      const result = await mockImageAnalysis(imageUri);
      console.log('DESCRIPTION', result);
      await speakText(result);
    } catch (error) {
      Alert.alert('Error', 'Could not process image');
      console.error(error);
    } finally {
      const elapsed_ms = Date.now() - started_at;
      const remaining_ms = Math.max(0, 5000 - elapsed_ms);
      if (remaining_ms > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining_ms));
      }
    }
  };

  const mockImageAnalysis = async (imageUri: string): Promise<string> => {
    const blob = await (await fetch(imageUri)).blob();

    const formData = new FormData();
    formData.append('image', blob);

    const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: formData,
    });

    const text = await response.text();

    if (!response.ok) {
        throw new Error(`Request failed (${response.status}): ${text}`);
    }

    return text;
  };

  const speakText = async (text: string) => {
    speakTextWithElevenLabs(text, process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY!);
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
