import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import { View, Text, StyleSheet } from "react-native"
import { useTheme, colorThemes } from "@/lib/theme-context"
import * as Haptics from 'expo-haptics'
import { useEffect } from "react"
import Animated, { FadeIn } from "react-native-reanimated"

export default function HomePage() {
  const router = useRouter()
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;

  useEffect(() => {
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, 100)
  }, [])

  return (
    <View className="flex-1 bg-gradient-to-b from-background to-muted/20 p-6">
      <View className="flex-1 items-center justify-center">
        <View className="w-full max-w-[300px] items-center">

          {/* Avatar */}
          <Animated.View entering={FadeIn.duration(700).delay(150)} style={styles.block}>
            <View className="relative overflow-visible">
              <View className="flex h-28 w-28 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor + '1A' }}>
                <Text className="text-7xl" style={{ lineHeight: 80 }}>
                  🌸
                </Text>
              </View>

            <View className="absolute -inset-2 rounded-full" style={{ borderColor: primaryColor + '33' }} />
          </View>

          </Animated.View>

          {/* Textos */}
          <Animated.View entering={FadeIn.duration(700).delay(250)} style={styles.block}>
            <Text
              className="text-5xl text-foreground text-center"
              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
            >
              Respira
            </Text>

            <Text className="mt-5 text-2xl text-muted-foreground text-center">
              Un espacio seguro para tus pensamientos
            </Text>
          </Animated.View>

          {/* Botones */}
          <Animated.View entering={FadeIn.duration(700).delay(350)} className="w-full gap-5 items-center">
            <Button
              onPress={() => {
                router.push("/onboarding" as any)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              }

              size="lg"
              className="w-full rounded-full h-14"
            >
              <Text className="text-white">Comenzar</Text>
            </Button>

            <Button
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push("/auth/login");
              }}
              variant="ghost"
              size="lg"
              className="w-full rounded-full h-14"
            >
              <Text >Ya tengo una cuenta</Text>
            </Button>
          </Animated.View>

        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 40,
  },
})
