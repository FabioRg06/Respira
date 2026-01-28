import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ArrowLeft, Heart } from "lucide-react-native"
import * as Haptics from "expo-haptics"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useTheme, colorThemes } from "@/lib/theme-context"
import { createThought } from "@/lib/api"
import { analyzeThought } from "@/lib/ai"

export default function NewThoughtPage() {
  const router = useRouter()
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;

  const [step, setStep] = useState(1)
  const [thought, setThought] = useState("")
  const [trigger, setTrigger] = useState("")
  const [emotions, setEmotions] = useState("")
  const [isImportant, setIsImportant] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Animación
  const animation = useRef(new Animated.Value(0)).current

  const animateIn = () => {
    animation.setValue(0)
    Animated.timing(animation, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start()
  }

  useEffect(() => {
    animateIn()
  }, [])

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  })

  const opacity = animation

  const nextStep = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setStep(value)
    animateIn()
  }

  const handleSubmit = async () => {
    if (!thought.trim()) return

    setIsLoading(true)
    try {
      const emotionsArray = emotions
        .split(",")
        .map(e => e.trim())
        .filter(e => e.length > 0)

      // Generate AI response
      const aiResponse = await analyzeThought(
        thought.trim(),
        trigger.trim() || "",
        emotions.trim() || ""
      )

      const response = await createThought({
        thought: thought.trim(),
        trigger: trigger.trim() || undefined,
        emotions: emotionsArray.length > 0 ? emotionsArray : undefined,
        is_important: isImportant,
        ai_response: aiResponse,
      })

      if (response.success && response.data) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push(`/thought/${response.data.id}` as any)
      } else {
        console.error("Error creating thought:", response.error)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
      }
    } catch (error) {
      console.error("Error:", error)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {/* HEADER */}
        <View className="border-b border-border/40 bg-background/90">
          <View className="flex-row items-center gap-3 px-4 py-3">
            <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor + '1A' }}>
              <Text className="text-lg">🌸</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              Guardando pensamiento...
            </Text>
          </View>
        </View>

        {/* CONTENT */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="mt-4 text-muted-foreground">Un momento...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="border-b border-border/40 bg-background/90">
        <View className="flex-row items-center gap-3 px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full p-2"
          >
            <ArrowLeft size={20} color="#3d2a2a" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor + '1A' }}>
              <Text className="text-lg">🌸</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              Paso {step} de 3
            </Text>
          </View>
        </View>
      </View>

      {/* 🔑 EVITA QUE EL TECLADO TAPE EL BOTÓN */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        
        
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          
        >
          <View className="flex-1 justify-center px-5 py-12">
            <Animated.View
              style={{
                width: "100%",
                maxWidth: 520,
                opacity,
                transform: [{ translateY }],
                alignSelf: "center",
              }}
            >
              {/* STEP 1 */}
              {step === 1 && (
                <View style={{ gap: 32 }}>
                  <View style={{ gap: 16 }}>
                    <Text
  style={{
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 34,      // ⬇️ apenas más pequeño
    lineHeight: 40,
  }}
  className="text-center text-foreground"
>
  ¿Qué estás pensando?
</Text>

<Text className="text-center text-lg text-muted-foreground px-6">
  Escribe lo que está pasando por tu mente sin filtros
</Text>

                  </View>

                  {/* TEXTAREA MÁS GRANDE */}
                  <Textarea
                    value={thought}
                    onChangeText={setThought}
                    placeholder="Por ejemplo: Creo que todos piensan que soy un fracaso..."
                    
                    className="min-h-[260px]"
                  />

                  {/* BOTÓN MOMENTO IMPORTANTE MÁS GRANDE */}
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      setIsImportant(!isImportant)
                    }}
                    className="self-center flex-row items-center gap-3 rounded-full px-6 py-3"
                    style={{
                      backgroundColor: isImportant
                        ? primaryColor + '40'
                        : "rgba(0,0,0,0.05)",
                    }}
                  >
                    <Heart
                      size={18}
                      color={isImportant ? primaryColor : "#777"}
                      fill={isImportant ? primaryColor : "transparent"}
                    />
                    <Text className="text-base">
                      {isImportant
                        ? "Momento relevante marcado"
                        : "Marcar como momento relevante"}
                    </Text>
                  </TouchableOpacity>

                  <View className="items-center">
                    {/* BOTÓN h-14 */}
                    <Button
                      size="lg"
                      className="h-14 rounded-full px-14"
                      disabled={!thought.trim()}
                      onPress={() => nextStep(2)}
                    >
                      Continuar
                    </Button>
                  </View>
                </View>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <View style={{ gap: 32 }}>
                  <View style={{ gap: 16 }}>
                    <Text
                      style={{
                        fontFamily: "PlayfairDisplay_400Regular",
                        fontSize: 34,
                        lineHeight: 40,
                      }}
                      className="text-center"
                    >
                      ¿Qué lo provocó?
                    </Text>

                    <Text className="text-center text-base text-muted-foreground px-6">
                      ¿Hubo algo que desencadenó este pensamiento?
                    </Text>
                  </View>

                  <Textarea
                    value={trigger}
                    onChangeText={setTrigger}
                    placeholder="Por ejemplo: Mi jefe no respondió mi mensaje..."
                    className="min-h-[220px]"
                  />

                  <View className="flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-14 rounded-full"
                      onPress={() => nextStep(1)}
                    >
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 h-14 rounded-full"
                      onPress={() => nextStep(3)}
                    >
                      Continuar
                    </Button>
                  </View>
                </View>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <View style={{ gap: 32 }}>
                  <View style={{ gap: 16 }}>
                    <Text
                      style={{
                        fontFamily: "PlayfairDisplay_400Regular",
                        fontSize: 34,
                        lineHeight: 40,
                      }}
                      className="text-center"
                    >
                      ¿Cómo te hace sentir eso?
                    </Text>

                    <Text className="text-center text-base text-muted-foreground px-6">
                      Describe las emociones que estás experimentando
                    </Text>
                  </View>

                  <Textarea
                    value={emotions}
                    onChangeText={setEmotions}
                    placeholder="Por ejemplo: Ansioso, frustrado, con miedo..."
                    className="min-h-[220px]"
                  />

                  <View className="flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-14 rounded-full"
                      onPress={() => nextStep(2)}
                    >
                      Atrás
                    </Button>
                    <Button
                      className="flex-1 h-14 rounded-full"
                      disabled={isLoading}
                      onPress={handleSubmit}
                    >
                      Finalizar
                    </Button>
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}