import { useRouter } from "expo-router"
import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Lock } from "lucide-react-native"
import { TypingText } from "@/components/typing-text"
import * as Haptics from "expo-haptics"

import { useTheme, colorThemes } from "@/lib/theme-context"
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated"
import { getWeeklySummary } from "@/lib/api"

function AnimatedNumber({ value, duration = 1000, delay = 0 }: { value: number; duration?: number; delay?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number
    let delayTimer: NodeJS.Timeout

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      const current = Math.floor(progress * value)
      setDisplayValue(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        // Haptic feedback cuando termina la animación de números
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
    }

    delayTimer = setTimeout(() => {
      // Haptic feedback al empezar a contar
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      animationFrame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(delayTimer)
      cancelAnimationFrame(animationFrame)
    }
  }, [value, duration, delay])

  return <Text>{displayValue}</Text>
}

export default function SummaryPage() {
  const router = useRouter()
  const { selectedTheme } = useTheme()
  const theme = colorThemes[selectedTheme]

  const [summary, setSummary] = useState<string>("")
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [weekStart, setWeekStart] = useState<string>("")
  const [weekEnd, setWeekEnd] = useState<string>("")

  // Load summary data
  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        const response = await getWeeklySummary()

        if (!response.success) {
          console.error("Error loading summary:", response.error)
          setIsLoading(false)
          return
        }

        setIsPremium(response.isPremium)

        if (response.isPremium && response.summary && response.stats) {
          setSummary(response.summary)
          setStats(response.stats)
          setWeekStart(response.weekStart)
          setWeekEnd(response.weekEnd)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error:", error)
        setIsLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  useEffect(() => {
    if (!isLoading && isPremium && stats) {
      // Vibración constante mientras suben los números
      const startVibration = setTimeout(() => {
        const vibrationInterval = setInterval(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }, 150) // Vibra cada 150ms

        // Detener vibración cuando termina la animación de números
        setTimeout(() => {
          clearInterval(vibrationInterval)
        }, 1200) // 1200ms de duración de vibración
      }, 600) // Empieza a vibrar cuando empiezan los números

      return () => clearTimeout(startVibration)
    }
  }, [isLoading, isPremium, stats])

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      {/* HEADER */}
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: theme.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            gap: 12,
          }}
        >
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft size={20} color={theme.foreground} />
          </Button>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color={theme.primary} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: theme.foreground,
              }}
            >
              Resumen semanal
            </Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: 32,
          flexGrow: 1,
        }}
      >
        {!isPremium ? (
          /* LOCKED */
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 80,
              gap: 24,
            }}
          >
            <View
              style={{
                height: 80,
                width: 80,
                borderRadius: 40,
                backgroundColor: `${theme.primary}1A`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lock size={36} color={theme.primary} />
            </View>

            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "serif",
                  fontWeight: "300",
                  textAlign: "center",
                  color: theme.foreground,
                }}
              >
                Función Premium
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.mutedForeground,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                El resumen semanal es exclusivo para usuarios Premium.
              </Text>
            </View>

            <Button
              size="lg"
              className="rounded-full"
              onPress={() => router.push("/paywall")}
            >
              Ver planes Premium
            </Button>
          </View>
        ) : isLoading ? (
          /* LOADING */
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text
              style={{
                marginTop: 12,
                fontSize: 14,
                color: theme.mutedForeground,
              }}
            >
              Analizando tu semana...
            </Text>
          </View>
        ) : (
          /* SUMMARY */
          <View style={{ gap: 24 }}>
            {/* STATS */}
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Animated.View
                style={{
                  flex: 1,
                  padding: 24,
                  borderRadius: 20,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: "center",
                }}
                entering={SlideInUp.delay(200).springify().damping(50).stiffness(120)}
              >
                <Text
                  style={{
                    fontSize: 36,
                    fontFamily: "serif",
                    fontWeight: "300",
                    color: theme.primary,
                  }}
                >
                  <AnimatedNumber value={stats.thoughtCount} duration={1200} delay={600} />
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: theme.mutedForeground,
                  }}
                >
                  Pensamientos
                </Text>
              </Animated.View>

              <Animated.View
                style={{
                  flex: 1,
                  padding: 24,
                  borderRadius: 20,
                  backgroundColor: `${theme.primary}0D`,
                  borderWidth: 1,
                  borderColor: `${theme.primary}33`,
                  alignItems: "center",
                }}
                entering={SlideInUp.delay(400).springify().damping(50).stiffness(120)}
              >
                <Text
                  style={{
                    fontSize: 36,
                    fontFamily: "serif",
                    fontWeight: "300",
                    color: theme.primary,
                  }}
                >
                  <AnimatedNumber value={stats.importantCount} duration={1200} delay={600} />
                </Text>
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: theme.mutedForeground,
                  }}
                >
                  Importantes
                </Text>
              </Animated.View>
            </View>

            {/* SUMMARY CARD */}
            <Animated.View
              style={{
                padding: 28,
                borderRadius: 24,
                backgroundColor: `${theme.primary}0D`,
                borderWidth: 1,
                borderColor: `${theme.primary}33`,
              }}
              entering={FadeIn.delay(700)}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                    backgroundColor: `${theme.primary}33`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>🌸</Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: theme.foreground,
                      fontFamily: "PlayfairDisplay_400Regular",
                    }}
                  >
                    Tu progreso esta semana
                  </Text>
                  {weekStart && weekEnd && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: theme.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      Del {new Date(weekStart).toLocaleDateString("es", { day: "numeric", month: "short" })} al {new Date(weekEnd).toLocaleDateString("es", { day: "numeric", month: "short" })}
                    </Text>
                  )}
                </View>
              </View>

              <TypingText text={summary} speed={20} />
            </Animated.View>

            {/* CTA */}
            <Animated.View entering={FadeIn.delay(800)}>
              <Button
                size="lg"
                className="rounded-full"
                onPress={() => router.push("/app")}
              >
                Volver al inicio
              </Button>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
