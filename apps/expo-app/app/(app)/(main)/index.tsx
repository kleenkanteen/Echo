import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { speakTextWithElevenLabs } from '../../../helpers/tts';

const ENDPOINT = 'https://us-central1-gen-lang-client-0136115968.cloudfunctions.net/describe';

export default function EchoScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const hasRefreshedAfterGrant = useRef(false);

  useEffect(() => {
    if (permission?.granted && !hasRefreshedAfterGrant.current) {
      hasRefreshedAfterGrant.current = true;
      router.replace('/');
    }
  }, [permission?.granted, router]);

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

  const takePicture = async () => {
    if (isProcessing) return;
    if (!cameraRef.current) return;

    setIsProcessing(true);

    try {
      const photo: any = await cameraRef.current.takePictureAsync();
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
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
        <View className="flex-1 bg-transparent">
          <View className="flex-1" />

          <View className="flex-row justify-center mb-12">
            <TouchableOpacity
              onPress={takePicture}
              accessibilityRole="button"
              accessibilityLabel="Press to take a picture and describe what it sees"
              accessibilityHint="Captures an image and explains what is around you and how far"
              className="bg-white w-20 h-20 rounded-full border-4 border-gray-300 items-center justify-center"
            >
              <View className="w-16 h-16 bg-white rounded-full" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}
