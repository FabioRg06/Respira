import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Heart, Settings, MessageCircle } from "lucide-react-native"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme,
     colorThemes } from "@/lib/theme-context"
import Animated, { FadeIn, SlideInLeft } from "react-native-reanimated"
import { getUserProfile, getUserThoughts, getCurrentUser } from "@/lib/api"

/* ---------------- SHADOW ADAPTATIVO ---------------- */
const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: {
    elevation: 2,
  },
  web: {
    boxShadow: "0px 6px 12px rgba(0,0,0,0.08)",
  },
})

/* ---------------- DATA ---------------- */
const thoughtPrompts = [
  "¿Qué está pasando por tu mente?",
  "¿Qué te preocupa ahora mismo?",
  "¿Hay algo que quieras compartir?",
  "¿Qué sientes en este momento?",
  "¿Qué pensamiento te acompaña hoy?",
  "¿Necesitas hablar de algo?",
  "¿Cómo te sientes ahora?",
  "¿Hay algo que quieras expresar?",
]

function getRandomPrompt() {
  return thoughtPrompts[Math.floor(Math.random() * thoughtPrompts.length)]
}

function hapticFeedback(type: "light" | "medium") {
  Haptics.impactAsync(
    type === "medium"
      ? Haptics.ImpactFeedbackStyle.Medium
      : Haptics.ImpactFeedbackStyle.Light
  )
}

/* ---------------- SCREEN ---------------- */
export default function AppPage() {
  const router = useRouter()
  const { selectedTheme } = useTheme()
  const primaryColor = colorThemes[selectedTheme].primary

  const [profile, setProfile] = useState<any>(null)
  const [recentThoughts, setRecentThoughts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [randomPrompt] = useState(getRandomPrompt())

  const loadData = async () => {
    try {
      // Verificar que el usuario esté autenticado
      const userResponse = await getCurrentUser()
      if (!userResponse.success) {
        router.push("/auth/login" as any)
        return
      }

      // Cargar perfil del usuario
      const profileResponse = await getUserProfile()
      if (profileResponse.success) {
        setProfile(profileResponse.data)
      }

      // Cargar pensamientos recientes (máximo 5)
      const thoughtsResponse = await getUserThoughts(5)
      if (thoughtsResponse.success) {
        setRecentThoughts(thoughtsResponse.data as any[])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      router.push("/auth/login" as any)
    } finally {
      // Haptic feedback al cargar
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }, 100)
    }
  }

  useEffect(() => {
    loadData().then(() => setLoading(false))
  }, [router])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text className="mt-4 text-muted-foreground">Cargando...</Text>
      </SafeAreaView>
    )
  }

  const displayProfile = profile || { name: "Usuario", subscription_plan: "premium" }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <Animated.View entering={FadeIn.duration(700).delay(100)}>
        <View className="border-b border-border/40 bg-background">
          <View className="flex-row items-center justify-between" style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <View className="flex-row items-center">
              <View
                className="items-center justify-center rounded-full mr-3"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: primaryColor + "1A",
                }}
              >
                <Text className="text-2xl">🌸</Text>
              </View>
              <Text className="text-base text-muted-foreground">
                Hola, {displayProfile.name}
              </Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity
                className="p-2 mr-1"
                onPress={() => {
                  hapticFeedback("light")
                  router.push("/support/support" as any)
                }}
              >
                <Heart size={20} color={primaryColor} />
              </TouchableOpacity>

              <TouchableOpacity
                className="p-2"
                onPress={() => {
                  hapticFeedback("light")
                  router.push("/settings" as any)
                }}
              >
                <Settings size={20} color={primaryColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* CONTENT */}
      <ScrollView
        className="flex-1"
        style={{ paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[primaryColor]}
            tintColor={primaryColor}
          />
        }
      >
        <View className="self-center w-full" style={{ maxWidth: 640 }}>
          {/* PROMPT */}
          <Animated.View
            entering={FadeIn.duration(700).delay(150)}
            className="rounded-3xl"
            style={[{ padding: 32, marginBottom: 32, backgroundColor: "#ffffff", borderRadius: 24 }, cardShadow]}
          >
            <Text
              className="mb-6 text-2xl text-center leading-relaxed"
              style={{ fontFamily: "PlayfairDisplay_400Regular" }}
            >
              {randomPrompt}
            </Text>

            <View className="items-center">
              <Button
                size="lg"
                className="rounded-full px-10 h-14"
                onPress={() => {
                  hapticFeedback("medium")
                  router.push("/new-thought/new-thought" as any)
                }}
              >
                Escribir un pensamiento
              </Button>
            </View>
          </Animated.View>

          {/* SUMMARY */}
          <Animated.View entering={FadeIn.duration(700).delay(200)}>
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-full h-14"
              style={{
                marginBottom: 32,
                borderColor: primaryColor + "33",
                backgroundColor: primaryColor + "0D",
              }}
              onPress={() => router.push("/summary" as any)}
            >
              <Text>Ver resumen de la semana</Text>
            </Button>
          </Animated.View>

          {/* RECENTS */}
          <Animated.View entering={FadeIn.duration(700).delay(250)}>
            <Text className="text-sm text-muted-foreground" style={{ marginBottom: 16 }}>
              Pensamientos recientes
            </Text>

            {recentThoughts.map((thought, index) => (
              <Animated.View
                key={thought.id}
                entering={SlideInLeft
                  .delay(index * 100 + 300)
                  .springify()
                  .damping(30)
                  .stiffness(120)}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={{ marginBottom: 16 }}
                  onPress={() => {
                    hapticFeedback("light")
                    router.push(`/thought/${thought.id}` as any)
                  }}
                >
                  {thought.is_important ? (
                    <LinearGradient
                      colors={[primaryColor, "#ffffff"]}
                      start={{ x: -2, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[
                        {
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: "#eaeaea",
                          padding: 20,
                        },
                        cardShadow,
                      ]}
                    >
                      <View className="flex-row items-start gap-3">
                        <View className="flex-1">
                          <Text numberOfLines={2} className="text-base leading-relaxed">
                            {thought.thought_content}
                          </Text>

                          <Text className="mt-3 text-sm text-muted-foreground">
                            {new Date(thought.created_at).toLocaleDateString("es", {
                              day: "numeric",
                              month: "long",
                            })}
                          </Text>
                        </View>

                        <View
                          className="items-center justify-center rounded-full"
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: primaryColor + "1A",
                          }}
                        >
                          <Text className="text-lg">🌸</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      className="rounded-2xl border border-border/40 bg-card"
                      style={[
                        { padding: 20 },
                        cardShadow,
                      ]}
                    >
                      <Text numberOfLines={2} className="text-base leading-relaxed">
                        {thought.thought_content}
                      </Text>

                      <Text className="mt-3 text-sm text-muted-foreground">
                        {new Date(thought.created_at).toLocaleDateString("es", {
                          day: "numeric",
                          month: "long",
                        })}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </View>
      </ScrollView>

      {/* FLOATING CHAT */}
      {displayProfile.subscription_plan === "premium" && (
        <Animated.View entering={FadeIn.duration(700).delay(500)}>
          <TouchableOpacity
            className="absolute bottom-6 right-6 items-center justify-center rounded-full"
            style={[
              { width: 56, height: 56, backgroundColor: primaryColor },
              cardShadow,
            ]}
            onPress={() => router.push("/chat/general" as any)}
          >
            <MessageCircle size={22} color="#ffffff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  )
}
