import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen'
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from 'expo-font';
import { useEffect } from 'react'
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import '../global.css';
import { ThemeProvider } from '../lib/theme-context';
SplashScreen.preventAutoHideAsync()
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        
            <Stack screenOptions={{ headerShown: false }} />
          
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

