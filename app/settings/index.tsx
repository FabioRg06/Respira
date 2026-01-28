import React, { useEffect, useState } from "react"
import { View, ScrollView, TouchableOpacity, Text, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ArrowLeft } from "lucide-react-native"
import { router } from "expo-router"

import Animated, { SlideInLeft } from "react-native-reanimated"
import * as Haptics from "expo-haptics"

import { Button } from "@/components/ui/button"
import { useTheme, colorThemes, ThemeName } from "@/lib/theme-context"
import { logoutUser } from "@/lib/api"

export default function SettingsPage() {
  const { selectedTheme, applyTheme } = useTheme()
  const primaryColor = colorThemes[selectedTheme].primary
  const [currentPlan, setCurrentPlan] = useState<"free" | "premium">("free")
  const [isChangingPlan, setIsChangingPlan] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  /* 🔹 HAPTICS DE ENTRADA */
  useEffect(() => {
    // temas
    Object.values(colorThemes).forEach((_, index) => {
      setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }, index * 120)
    })

    // plan
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, 500)

    // cuenta
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    }, 700)
  }, [])

  const handleApplyTheme = (theme: ThemeName) => {
    applyTheme(theme)
  }

  const handleChangePlan = () => {
    router.push("/paywall" as any)
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

      const response = await logoutUser()

      if (!response.success) {
        console.error("Error logging out:", response.error)
        setIsLoggingOut(false)
        return
      }

      // Logout exitoso - redirigir a login
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      router.push("/auth/login" as any)
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="border-b border-border/40 bg-background/90">
        <View className="mx-auto flex-row items-center gap-3 max-w-[520px] w-full" style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          <TouchableOpacity
            onPress={() => router.push("/app")}
            className="rounded-full p-2"
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <View
              className="h-9 w-9 items-center justify-center rounded-full"
              style={{ backgroundColor: primaryColor + "1A" }}
            >
              <Text className="text-xl">🌸</Text>
            </View>
            <Text className="text-base font-light">Ajustes</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mx-auto w-full max-w-[520px]">
          {/* PERSONALIZACIÓN */}
          <Animated.View
            entering={SlideInLeft.stiffness(120)}
            className="rounded-3xl bg-card mb-6"
            style={{
              padding: 24,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }}
          >
            <Text className="mb-5 font-serif text-2xl font-light">
              Personalización
            </Text>

            <Text className="text-sm text-muted-foreground mb-4">
              Elige el color que te haga sentir más cómodo
            </Text>

            {Object.values(colorThemes).map((theme, index) => {
              const isActive = selectedTheme === theme.name

              return (
                <Animated.View
                  key={theme.name}
                  entering={SlideInLeft
                    .delay(index * 120)
                    .springify()
                    .damping(30)
                    .stiffness(120)}
                >
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      handleApplyTheme(theme.name as ThemeName)
                    }
                    className="rounded-2xl mb-3"
                    style={{
                      padding: 16,
                      borderWidth: 2,
                      borderColor: isActive
                        ? colorThemes[theme.name as ThemeName].primary
                        : "rgba(0,0,0,0.08)",
                      backgroundColor: isActive
                        ? colorThemes[theme.name as ThemeName].primary + "0D"
                        : "rgba(255,255,255,0.5)",
                    }}
                  >
                    <View className="flex-row items-center gap-3 mb-2">
                      <View
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <Text className="font-medium">{theme.name}</Text>
                    </View>

                    <Text className="text-xs text-muted-foreground">
                      {theme.description}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </Animated.View>

          {/* PLAN */}
          <Animated.View
            entering={SlideInLeft
              .delay(150)
              .springify()

              .stiffness(120)}
            className="rounded-3xl bg-card mb-6"
            style={{
              padding: 24,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }}
          >
            <Text className="mb-5 font-serif text-2xl font-light">
              Tu plan
            </Text>

            <View
              className="flex-row items-center justify-between rounded-2xl border border-border/40 mb-4"
              style={{ padding: 16, backgroundColor: primaryColor + "0D" }}
            >
              <View>
                <Text className="font-medium capitalize">
                  {currentPlan === "premium" ? "Premium" : "Gratuito"}
                </Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  {currentPlan === "premium"
                    ? "$3.99 / mes"
                    : "Plan básico"}
                </Text>
              </View>

              <View
                className="h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: primaryColor + "33" }}
              >
                <Text className="text-xl">
                  {currentPlan === "premium" ? "✨" : "🌸"}
                </Text>
              </View>
            </View>

            <Button
              onPress={handleChangePlan}
              variant="outline"
              className="h-14 rounded-full"
              disabled={isChangingPlan}
            >
              {currentPlan === "premium"
                ? "Cambiar a plan gratuito"
                : "Actualizar a Premium"}
            </Button>
          </Animated.View>

          {/* CUENTA */}
          <Animated.View
            entering={SlideInLeft
              .delay(300)
              .springify()

              .stiffness(120)}
            className="rounded-3xl bg-card"
            style={{
              padding: 24,
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }}
          >
            <Text className="mb-4 font-serif text-2xl font-light">
              Cuenta
            </Text>

            <Button
              onPress={handleLogout}
              variant="outline"
              className="h-14 rounded-full"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color={primaryColor} />
                  <Text className="font-medium">Cerrando sesión...</Text>
                </View>
              ) : (
                <Text className="font-medium">Cerrar sesión</Text>
              )}
            </Button>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
