import React, { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import Animated, { FadeIn, SlideInDown, SlideInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated"
import { useTheme, colorThemes } from "@/lib/theme-context"
import { Check, Sparkles, MessageCircle, TrendingUp, Heart } from "lucide-react-native"
import { Button } from "@/components/ui/button"

type Plan = "care" | "annual" | "free"

export default function PaywallPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>("care")
  const [isProcessing, setIsProcessing] = useState(false)
  const scalePopular = useSharedValue(1)

  const { selectedTheme } = useTheme()
  const primary = colorThemes[selectedTheme].primary

  const router = useRouter()

  useEffect(() => {
    scalePopular.value = withRepeat(
      withTiming(1.02, {
        duration: 1250,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    )
  }, [])

  const selectPlan = (plan: Plan) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setSelectedPlan(plan)
  }

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsProcessing(true)

    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace("/app")
    }, 700)
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140, // solo lo necesario para el footer
          }}
        >
          {/* HEADER */}
          <Animated.View style={{ alignItems: "center", marginBottom: 20 }} entering={FadeIn.duration(700).delay(100)}>
            <View
              style={{
                height: 56,
                width: 56,
                borderRadius: 28,
                backgroundColor: `${primary}1A`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text className="text-3xl">🌸</Text>
            </View>

            <Text className="font-serif text-4xl font-light text-center mb-2">
              Desbloquea todo tu potencial
            </Text>

            <Text className="text-sm text-muted-foreground text-center max-w-[260px]">
              Mejora tu bienestar emocional con herramientas avanzadas
            </Text>
          </Animated.View>

          {/* BENEFICIOS */}
          <Animated.View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: `${primary}33`,
              backgroundColor: `${primary}14`,
              padding: 14,
              marginBottom: 20,
            }}
            entering={FadeIn.duration(700).delay(150)}
          >
            <Animated.View className="flex-row items-center mb-3" entering={SlideInRight.duration(800).delay(300)}>
              <Sparkles size={18} color={primary} />
              <Text className="font-serif text-base ml-2">
                Ventajas del cuidado personalizado
              </Text>
            </Animated.View>

            {[
              { icon: TrendingUp, text: "Resumen semanal personalizado" },
              { icon: MessageCircle, text: "Chat ilimitado con IA empática" },
              { icon: Heart, text: "Análisis emocional adaptado a ti" },
            ].map((item, i) => (
              <Animated.View key={i} className="flex-row items-start mb-2" entering={SlideInRight.duration(800).delay(400 + i * 100)}>
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    backgroundColor: `${primary}33`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                    marginTop: 2,
                  }}
                >
                  <item.icon size={12} color={primary} />
                </View>
                <Text className="text-sm flex-1">{item.text}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          {/* PLANES */}
          <View className="flex-row justify-between mb-5">
            <Animated.View entering={SlideInDown.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
              <PlanCard
                title="Básico"
                price="$0"
                subtitle="gratis"
                active={selectedPlan === "free"}
                primary={primary}
                onPress={() => selectPlan("free")}
              />
            </Animated.View>

            <Animated.View entering={SlideInDown.duration(1000).springify().damping(40).stiffness(120).delay(600)}>
              <View>
                <View
                  style={{
                    position: "absolute",
                    top: -14,
                    left: "50%",
                    transform: [{ translateX: -35 }],
                    backgroundColor: primary,
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 999,
                    zIndex: 10,
                  }}
                >
                  <Text className="text-[10px] text-white font-medium">
                    POPULAR
                  </Text>
                </View>

                <PopularPlanCard
                  title="Cuidado"
                  price="$3.99"
                  subtitle="/ mes"
                  active={selectedPlan === "care"}
                  primary={primary}
                  onPress={() => selectPlan("care")}
                  scalePopular={scalePopular}
                />
              </View>
            </Animated.View>

            <Animated.View entering={SlideInDown.duration(1000).springify().damping(40).stiffness(120).delay(800)}>
              <PlanCard
                title="Bienestar"
                price="$39.99"
                subtitle="/ año"
                badge="Ahorra 17%"
                active={selectedPlan === "annual"}
                primary={primary}
                onPress={() => selectPlan("annual")}
              />
            </Animated.View>
          </View>

          {/* FEATURES */}
          <Animated.View className="rounded-2xl bg-muted/30 p-4" entering={FadeIn.duration(700).delay(200)}>
            {[
              "Registro de pensamientos",
              "Momentos importantes",
              "Análisis con IA",
              "Resumen semanal",
              "Chat ilimitado",
            ].map((text, i) => (
              <Animated.View key={i} className="flex-row justify-between mb-3" entering={SlideInRight.duration(800).delay(900 + i * 100)}>
                <Text className="text-sm">{text}</Text>
                {selectedPlan !== "free" || i < 2 ? (
                  <Check size={16} color={primary} />
                ) : (
                  <Text className="text-xs text-muted-foreground">
                    Premium
                  </Text>
                )}
              </Animated.View>
            ))}
          </Animated.View>
        </ScrollView>

        {/* FOOTER */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        >
          <Button
            disabled={isProcessing}
            onPress={handleContinue}
            className="rounded-full h-14 shadow-lg"
          >
            {isProcessing
              ? "Procesando..."
              : `Continuar con ${
                  selectedPlan === "care"
                    ? "Cuidado"
                    : selectedPlan === "annual"
                    ? "Bienestar"
                    : "Básico"
                }`}
          </Button>

          <Text className="text-xs text-muted-foreground text-center mt-2">
            {selectedPlan === "free"
              ? "Siempre puedes actualizar después"
              : "Cancela cuando quieras • Sin compromisos"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

/* ------------------------- */
function PlanCard({
  title,
  price,
  subtitle,
  badge,
  active,
  onPress,
  primary,
}: any) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View
        style={{
          width: 96,
          minHeight: 160,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: active ? primary : "rgba(0,0,0,0.12)",
          backgroundColor: active ? `${primary}14` : "transparent",
          padding: 10,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text className="font-serif text-xs text-center mb-2">
            {title}
          </Text>
          <Text className="text-xl font-light text-center">{price}</Text>
          <Text className="text-[10px] text-muted-foreground text-center">
            {subtitle}
          </Text>
          {badge && (
            <Text className="text-[9px] text-green-600 text-center mt-1">
              {badge}
            </Text>
          )}
        </View>

        <View
          style={{
            height: 20,
            width: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: active ? primary : "rgba(0,0,0,0.25)",
            backgroundColor: active ? primary : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {active && <Check size={12} color="white" />}
        </View>
      </View>
    </TouchableOpacity>
  )
}

/* ------------------------- */
function PopularPlanCard({
  title,
  price,
  subtitle,
  active,
  onPress,
  primary,
  scalePopular,
}: any) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scalePopular.value }],
    }
  })

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <View
          style={{
            width: 96,
            minHeight: 160,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: active ? primary : "rgba(0,0,0,0.12)",
            backgroundColor: active ? `${primary}14` : "transparent",
            padding: 10,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text className="font-serif text-xs text-center mb-2">
              {title}
            </Text>
            <Text className="text-xl font-light text-center">{price}</Text>
            <Text className="text-[10px] text-muted-foreground text-center">
              {subtitle}
            </Text>
          </View>

          <View
            style={{
              height: 20,
              width: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: active ? primary : "rgba(0,0,0,0.25)",
              backgroundColor: active ? primary : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {active && <Check size={12} color="white" />}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}
