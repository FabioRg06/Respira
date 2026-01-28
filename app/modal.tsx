import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-black/50">
      <View className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
        <Text className="text-xl font-bold mb-4 text-center">Modal</Text>
        <Text className="text-gray-600 mb-6 text-center">
          This is a modal screen in Expo Router.
        </Text>
        <Button
          onPress={() => router.back()}
          className="w-full"
        >
          <Text className="text-white">Close</Text>
        </Button>
      </View>
    </View>
  );
}