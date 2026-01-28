import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter, useLocalSearchParams } from "expo-router"
import { ArrowLeft, MessageCircle } from "lucide-react-native"
import * as Haptics from "expo-haptics"
import { useEffect, useState } from "react"
import Animated, { SlideInUp } from "react-native-reanimated"

import { Button } from "@/components/ui/button"
import { ThoughtDetail } from "@/components/thought-detail"
import { getThought, getCurrentUser } from "@/lib/api"
import { useTheme, colorThemes } from "@/lib/theme-context"

export default function ThoughtPage() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { selectedTheme } = useTheme()
  const primaryColor = colorThemes[selectedTheme].primary

  const [thought, setThought] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Load thought data
  useEffect(() => {
    const loadThought = async () => {
      try {
        // Verificar autenticación
        const userResponse = await getCurrentUser()
        if (!userResponse.success) {
          setError(true)
          return
        }

        // Obtener el pensamiento
        const id = params.id as string
        if (!id) {
          setError(true)
          return
        }

        const thoughtResponse = await getThought(id)
        if (!thoughtResponse.success || !thoughtResponse.data) {
          setError(true)
          return
        }

        setThought(thoughtResponse.data)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      } catch (err) {
        console.error("Error loading thought:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadThought()
  }, [params.id])

  // Handle error redirect
  useEffect(() => {
    if (error && !loading) {
      router.push("/app" as any)
    }
  }, [error, loading, router])

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="border-b border-border/40 bg-background/80">
          <View className="mx-auto flex-row items-center gap-3 px-6 py-4 max-w-[520px] w-full">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-xl">🌸</Text>
            </View>
            <Text className="text-base font-serif italic text-muted-foreground">
              Detalles
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4 text-muted-foreground">Cargando pensamiento...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state - redirige a home
  if (error || !thought) {
    return null
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="border-b border-border/40 bg-background/80">
        <View className="mx-auto flex-row items-center gap-3 px-6 py-4 max-w-[520px] w-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onPress={() => router.push("/app")}
          >
            <ArrowLeft size={22} />
          </Button>

          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-xl">🌸</Text>
            </View>
            <Text className="text-base font-serif italic text-muted-foreground">
              Detalles
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View className="mx-auto w-full max-w-[520px]">
          <Animated.View entering={SlideInUp.delay(200).springify().damping(30).stiffness(120)}>
            <ThoughtDetail thought={thought} />
          </Animated.View>

          <Animated.View
            entering={SlideInUp.delay(300).springify().damping(30).stiffness(120)}
            className="mt-8"
          >
            <Button
              variant="outline"
              className="h-14 rounded-full flex-row items-center justify-center gap-2"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                router.push(`/chat/${params.id}` as any)
              }}
            >
              <MessageCircle size={15} />
              <Text className="text-base font-medium">
                Conversar sobre esto
              </Text>
            </Button>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
