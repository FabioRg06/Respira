import React, { useState } from "react"
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Animated, { FadeIn, SlideInLeft, ZoomIn, SlideInRight, SlideInUp } from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import OptionCard from "@/components/ui/option-card"
import { Button } from "@/components/ui/button"
import { useTheme, colorThemes } from "@/lib/theme-context"
import Slider from "@react-native-community/slider"
import { useRouter } from "expo-router"
import { supabase } from "@/lib/supabase"




/* DATA */
const emotionalStates = [
  { value: "bien", label: "Bien, generalmente estoy equilibrado", emoji: "😊" },
  { value: "ansioso", label: "Ansioso, me preocupo con frecuencia", emoji: "😰" },
  { value: "triste", label: "Triste, a veces me siento deprimido", emoji: "😔" },
  { value: "estresado", label: "Estresado, tengo mucha presión", emoji: "😓" },
  { value: "variable", label: "Variable, cambia constantemente", emoji: "🎭" },
]

const ageRanges = [
  { value: "-18", label: "Menos de 18 años" },
  { value: "18-24", label: "18-24 años" },
  { value: "25-34", label: "25-34 años" },
  { value: "35-44", label: "35-44 años" },
  { value: "45-54", label: "45-54 años" },
  { value: "55+", label: "55+ años" },
]

const goalsOptions = [
  { value: "ansiedad", label: "Manejar mi ansiedad", emoji: "💭" },
  { value: "autoconocimiento", label: "Conocerme mejor", emoji: "🪞" },
  { value: "habito", label: "Crear un hábito saludable", emoji: "✨" },
  { value: "pensamientos", label: "Ordenar mis pensamientos", emoji: "📝" },
  { value: "apoyo", label: "Sentirme escuchado", emoji: "🤗" },
]

const mentalHealthIssues = [
  { value: "ansiedad", label: "Ansiedad", emoji: "😰" },
  { value: "depresion", label: "Depresión", emoji: "😔" },
  { value: "insomnio", label: "Insomnio", emoji: "😴" },
  { value: "estres", label: "Estrés crónico", emoji: "😓" },
  { value: "autoestima", label: "Baja autoestima", emoji: "💔" },
  { value: "ninguno", label: "Ninguno de estos", emoji: "🌿" },
]

const sleepQuality = [
  { value: 1, label: "Muy mal" },
  { value: 2, label: "Mal" },
  { value: 3, label: "Regular" },
  { value: 4, label: "Bien" },
  { value: 5, label: "Muy bien" },
]


export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [emotionalState, setEmotionalState] = useState("")
  const [seesTherapist, setSeesTherapist] = useState<boolean | null>(null)
  const [ageRange, setAgeRange] = useState("")
  const [goals, setGoals] = useState<string[]>([])
  const [mentalHealthProblems, setMentalHealthProblems] = useState<string[]>([])
  const [sleepRating, setSleepRating] = useState(0)
  const [stressTriggers, setStressTriggers] = useState("")
  const [supportSystem, setSupportSystem] = useState<string | null>(null)
  const [relationshipImpact, setRelationshipImpact] = useState(3)
  const [selfCareFrequency, setSelfCareFrequency] = useState("")
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [isProcessing, setIsProcessing] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [error, setError] = useState("")
    const totalSteps = 13
    const router = useRouter()

  const handleComplete = async () => {
    try {
      setIsProcessing(true)
      setError("")

      // Validar campos requeridos
      if (!name.trim() || !email.trim() || password.length < 6) {
        setError("Por favor completa todos los campos correctamente")
        setIsProcessing(false)
        return
      }

      // Sign up con Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            emotional_state: emotionalState,
            sees_therapist: seesTherapist,
            age_range: ageRange,
            app_goals: goals.join(","),
            mental_health_problems: mentalHealthProblems.join(","),
            sleep_quality: sleepRating.toString(),
            stress_triggers: stressTriggers,
            support_system: supportSystem,
            relationship_impact: relationshipImpact.toString(),
            self_care_frequency: selfCareFrequency,
            onboarding_completed: true,
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      // Mostrar pantalla de carga
      setShowLoadingScreen(true)
      setLoadingMessage("Utilizando inteligencia artificial para mejorar tu experiencia")

      // Esperar 3 segundos y redirigir
      setTimeout(() => {
        setShowLoadingScreen(false)
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push("/paywall" as any)
      }, 3000)
    } catch (err: any) {
      console.error("Error during onboarding:", err)
      setError(err.message || "Ocurrió un error al crear tu cuenta")
      setIsProcessing(false)
    }
  }


  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }
  
  const toggleGoal = (goalValue: string) => {
    setGoals((prev) => (prev.includes(goalValue) ? prev.filter((g) => g !== goalValue) : [...prev, goalValue]))
  }

  const next = () => {
    triggerHaptic()
    if (step === totalSteps) {
      handleComplete()
      return
    }

    setStep(step + 1)
  }

  const canContinue = () => {
    if (step === 1) return emotionalState !== ""
    if (step === 2) return seesTherapist !== null
    if (step === 3) return ageRange !== ""
    if (step === 4) return goals.length > 0
    if (step === 5) return mentalHealthProblems.length > 0
    if (step === 6) return sleepRating > 0
    if (step === 7) return relationshipImpact > 0
    if (step === 8) return stressTriggers.trim() !== ""
    if (step === 9) return supportSystem !== null
    if (step === 10) return selfCareFrequency !== ""
    if (step === 11) return name.trim() !== ""
    if (step === 12) return email.trim() !== "" && password.length >= 6
    return true
  }

   const toggleMentalHealthProblem = (problem: string) => {
    if (problem === "ninguno") {
      setMentalHealthProblems(["ninguno"])
    } else {
      setMentalHealthProblems((prev) => {
        const filtered = prev.filter((p) => p !== "ninguno")
        return filtered.includes(problem) ? filtered.filter((p) => p !== problem) : [...filtered, problem]
      })
    }
  }
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* LOADING SCREEN */}
      {showLoadingScreen && (
        <View className="flex-1 bg-background items-center justify-center">
          <Animated.View entering={FadeIn.duration(500)} className="items-center gap-6">
            <Animated.View
              entering={ZoomIn.duration(600).springify().damping(25).stiffness(120)}
              className="h-20 w-20 rounded-full bg-primary/10 items-center justify-center"
            >
              <Text className="text-5xl">🌸</Text>
            </Animated.View>

            <View className="items-center gap-3">
              <ActivityIndicator size="large" color={primaryColor} />
              <Text className="font-serif text-2xl font-light text-center text-foreground">
                {loadingMessage}
              </Text>
            </View>
          </Animated.View>
        </View>
      )}

      {/* MAIN CONTENT */}
      {!showLoadingScreen && (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View style={{ maxWidth: 420, width: "100%", alignSelf: "center" }}>
          {/* HEADER */}
          
            <Animated.View 
              entering={FadeIn.duration(700).delay(100)}
              style={{ alignItems: "center", marginBottom: 36 }}
            >
                <Animated.View
                    entering={ZoomIn.duration(600).springify().damping(25).stiffness(120)}
                    className="h-16 w-16 rounded-full bg-primary/10 items-center justify-center"
                >
                    <Text className="text-3xl">🌸</Text>
                </Animated.View>

                <Animated.Text 
                  entering={FadeIn.duration(600).delay(200)}
                  className="text-xs text-muted-foreground mt-3"
                >
                    Paso {step} de {totalSteps}
                </Animated.Text>

                <Animated.View 
                  entering={FadeIn.duration(700).delay(300)}
                  className="flex-row flex-wrap justify-center mt-2 max-w-[280px]"
                >
                    {Array.from({ length: totalSteps }).map((_, i) => (
                    <View
                        key={i}
                        style={{
                        height: 6,
                        width: 16,
                        borderRadius: 999,
                        margin: 2,
                        backgroundColor:
                            i < step
                            ? primaryColor
                            : "rgba(0,0,0,0.1)",
                        }}
                    />
                    ))}
                </Animated.View>
            </Animated.View>


          {/* STEP 1 */}
          {step === 1 && (
            <Animated.View entering={SlideInLeft.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
              <Animated.Text 
                entering={FadeIn.duration(700).delay(450)}
                className="font-serif text-3xl font-light text-center" 
                style={{ marginBottom: 16 }}
              >
                ¿Cómo describirías tu estado emocional generalmente?
              </Animated.Text>

              {emotionalStates.map((state, index) => {
                const active = emotionalState === state.value

                return (
                  <Animated.View
                    key={state.value}
                    entering={SlideInLeft.duration(1000).springify().damping(40).stiffness(120).delay(500 + index * 100)}
                  >
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        triggerHaptic()
                        setEmotionalState(state.value)
                      }}
                      style={{
                        padding: 16,
                        borderRadius: 20,
                        borderWidth: 2,
                        marginBottom: 12,
                        borderColor: active
                          ? "hsl(var(--primary))"
                          : "rgba(0,0,0,0.08)",
                        backgroundColor: active
                          ? "hsla(var(--primary),0.12)"
                          : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Text className="text-sm">
                        {state.emoji} {state.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )
              })}
            </Animated.View>
          )}
            {step === 2 && (
                <Animated.View entering={FadeIn.duration(1000).delay(400)}>
                    <Animated.Text 
                      entering={FadeIn.duration(700).delay(450)}
                      className="font-serif text-3xl font-light text-center mb-4"
                    >
                    ¿Actualmente vas al psicólogo?
                    </Animated.Text>

                    <Animated.View entering={FadeIn.duration(900).delay(550)}>
                      <OptionCard active={seesTherapist === true} onPress={() => setSeesTherapist(true)}>
                      Sí, voy regularmente
                      </OptionCard>
                    </Animated.View>

                    <Animated.View entering={FadeIn.duration(900).delay(700)}>
                      <OptionCard active={seesTherapist === false} onPress={() => setSeesTherapist(false)}>
                      No, no voy actualmente
                      </OptionCard>
                    </Animated.View>
                </Animated.View>
            )}
            {step === 3 && (
                <Animated.View entering={SlideInLeft.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
                    <Animated.Text 
                      entering={FadeIn.duration(700).delay(450)}
                      className="font-serif text-3xl font-light text-center mb-4"
                    >
                    ¿Cuál es tu rango de edad?
                    </Animated.Text>

                    {ageRanges.map((r, index) => (
                      <Animated.View 
                        key={r.value}
                        entering={SlideInLeft.duration(1000).springify().damping(40).stiffness(120).delay(550 + index * 100)}
                      >
                        <OptionCard active={ageRange === r.value} onPress={() => setAgeRange(r.value)}>
                            {r.label}
                        </OptionCard>
                      </Animated.View>
                    ))}
                </Animated.View>
            )}
            {step === 4 && (
                <Animated.View entering={SlideInRight.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
                    <Animated.Text 
                      entering={FadeIn.duration(700).delay(450)}
                      className="font-serif text-3xl font-light text-center mb-4"
                    >
                    ¿Qué quieres lograr con esta app?
                    </Animated.Text>

                    {goalsOptions.map((g, index) => (
                      <Animated.View
                        key={g.value}
                        entering={SlideInRight.duration(1000).springify().damping(40).stiffness(120).delay(550 + index * 100)}
                      >
                        <OptionCard
                            active={goals.includes(g.value)}
                            onPress={() => toggleGoal(g.value)}
                        >
                            {g.emoji} {g.label}
                        </OptionCard>
                      </Animated.View>
                    ))}
                </Animated.View>
            )}
            {step === 5 && (
            <Animated.View entering={FadeIn.duration(1000).delay(400)}>
                <Animated.Text 
                  entering={FadeIn.duration(700).delay(450)}
                  className="font-serif text-3xl font-light text-center mb-4"
                >
                ¿Has experimentado alguno de estos problemas?
                </Animated.Text>

                {mentalHealthIssues.map((i, index) => (
                  <Animated.View
                    key={i.value}
                    entering={FadeIn.duration(900).delay(550 + index * 80)}
                  >
                    <OptionCard
                        active={mentalHealthProblems.includes(i.value)}
                        onPress={() => toggleMentalHealthProblem(i.value)}
                    >
                        {i.emoji} {i.label}
                    </OptionCard>
                  </Animated.View>
                ))}
            </Animated.View>
            )}
            {step === 6 && (
            <Animated.View entering={SlideInRight.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
                <Animated.Text 
                  entering={FadeIn.duration(700).delay(450)}
                  className="font-serif text-3xl font-light text-center mb-6"
                >
                ¿Cómo calificas tu calidad de sueño?
                </Animated.Text>

                <Animated.View entering={SlideInUp.duration(1000).springify().damping(40).stiffness(120).delay(550)} className="flex-row justify-between px-2">
                {[1,2,3,4,5].map((v) => (
                    <TouchableOpacity
                    key={v}
                    onPress={() => setSleepRating(v)}
                    className={`h-12 w-12 rounded-full items-center justify-center border-2 ${
                        sleepRating === v ? "border-primary bg-primary/20" : "border-border"
                    }`}
                    >
                    <Text>{v}</Text>
                    </TouchableOpacity>
                ))}
                </Animated.View>
            </Animated.View>
            )}
            {step === 7 && (
              <Animated.View entering={FadeIn.duration(1000).delay(400)}>
                <Animated.Text 
                  entering={FadeIn.duration(700).delay(450)}
                  className="font-serif text-3xl font-light text-center mb-4"
                >
                  ¿Cómo afectan tus emociones a tus relaciones?
                </Animated.Text>

                <Animated.Text 
                  entering={FadeIn.duration(700).delay(550)}
                  className="text-sm text-muted-foreground text-center mb-6"
                >
                  Desliza para indicar el impacto que sientes
                </Animated.Text>

                <Animated.View entering={FadeIn.duration(900).delay(650)} style={{ paddingHorizontal: 12 }}>
                  <Slider
                    minimumValue={1}
                    maximumValue={5}
                    step={1}
                    value={relationshipImpact}
                    onValueChange={setRelationshipImpact}
                    minimumTrackTintColor={primaryColor}
                    maximumTrackTintColor="rgba(0,0,0,0.15)"
                    thumbTintColor={primaryColor}
                  />

                  <View className="flex-row justify-between mt-2">
                    <Text className="text-xs text-muted-foreground">Poco impacto</Text>
                    <Text className="text-xs text-muted-foreground">Mucho impacto</Text>
                  </View>

                  <View className="items-center mt-6">
                    <View
                      style={{
                        height: 48,
                        width: 48,
                        borderRadius: 999,
                        backgroundColor: `${primaryColor}33`,
                        borderWidth: 2,
                        borderColor: primaryColor,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: primaryColor }} className="text-lg font-medium">
                        {relationshipImpact}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            )}

            {step === 8 && (
            <Animated.View entering={FadeIn.duration(1000).delay(400)}>
                <Animated.Text 
                  entering={FadeIn.duration(700).delay(450)}
                  className="font-serif text-3xl font-light text-center mb-4"
                >
                ¿Qué situaciones te generan más estrés?
                </Animated.Text>

                <Animated.View entering={FadeIn.duration(900).delay(550)}>
                  <TextInput
                  multiline
                  numberOfLines={4}
                  value={stressTriggers}
                  onChangeText={setStressTriggers}
                  className="border border-border rounded-2xl p-4"
                  placeholder="Escribe libremente..."
                  />
                </Animated.View>
            </Animated.View>
            )}
            {step === 9 && (
            <Animated.View entering={FadeIn.duration(1200).delay(400)}>
                <Animated.Text 
                  entering={FadeIn.duration(700).delay(450)}
                  className="font-serif text-3xl font-light text-center mb-4"
                >
                ¿Tienes un buen sistema de apoyo?
                </Animated.Text>

                <Animated.View entering={FadeIn.duration(900).delay(600)}>
                  <OptionCard active={supportSystem === "si"} onPress={() => setSupportSystem("si")}>
                  Sí, tengo personas en quien confiar
                  </OptionCard>
                </Animated.View>
                <Animated.View entering={FadeIn.duration(900).delay(750)}>
                  <OptionCard active={supportSystem === "parcial"} onPress={() => setSupportSystem("parcial")}>
                  Tengo algunas personas
                  </OptionCard>
                </Animated.View>
                <Animated.View entering={FadeIn.duration(900).delay(900)}>
                  <OptionCard active={supportSystem === "no"} onPress={() => setSupportSystem("no")}>
                  No, me siento solo/a
                  </OptionCard>
                </Animated.View>
            </Animated.View>
            )}
            {step === 10 && (
            <Animated.View entering={FadeIn.duration(1000).delay(400)}>
                <Animated.Text 
                  entering={FadeIn.duration(700).delay(450)}
                  className="font-serif text-3xl font-light text-center mb-4"
                >
                ¿Con qué frecuencia practicas autocuidado?
                </Animated.Text>

                <Animated.View entering={FadeIn.duration(900).delay(600)}>
                  <OptionCard active={selfCareFrequency === "diario"} onPress={() => setSelfCareFrequency("diario")}>
                  🌟 Diariamente
                  </OptionCard>
                </Animated.View>
                <Animated.View entering={FadeIn.duration(900).delay(750)}>
                  <OptionCard active={selfCareFrequency === "ocasional"} onPress={() => setSelfCareFrequency("ocasional")}>
                  Ocasionalmente
                  </OptionCard>
                </Animated.View>
            </Animated.View>
            )}
        


          {/* STEP 11 (nombre) */}
          {step === 11 && (
            <Animated.View entering={SlideInLeft.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
              <Animated.Text 
                entering={FadeIn.duration(700).delay(450)}
                className="font-serif text-3xl font-light text-center" 
                style={{ marginBottom: 8 }}
              >
                ¿Cómo te llamas?
              </Animated.Text>
              <Animated.Text 
                entering={FadeIn.duration(700).delay(550)}
                className="text-sm text-muted-foreground text-center" 
                style={{ marginBottom: 16 }}
              >
                Queremos conocerte mejor
              </Animated.Text>

              <Animated.View entering={SlideInUp.duration(1000).springify().damping(40).stiffness(120).delay(650)}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre"
                  placeholderTextColor="#999"
                  className="border border-border rounded-2xl h-12 px-4 text-center"
                />
              </Animated.View>
            </Animated.View>
          )}
          {step === 12 && (
            <Animated.View entering={SlideInRight.duration(1000).springify().damping(40).stiffness(120).delay(400)}>
              <Animated.Text 
                entering={FadeIn.duration(700).delay(450)}
                className="font-serif text-3xl font-light text-center mb-2"
              >
                ¡Ya casi terminamos!
              </Animated.Text>

              <Animated.Text 
                entering={FadeIn.duration(700).delay(550)}
                className="text-sm text-muted-foreground text-center mb-6"
              >
                Crea tu cuenta para guardar tu progreso
              </Animated.Text>

              <Animated.View entering={SlideInUp.duration(1000).springify().damping(40).stiffness(120).delay(650)}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                  className="border border-border rounded-2xl h-12 px-4 mb-4"
                />
              </Animated.View>

              <Animated.View entering={SlideInUp.duration(1000).springify().damping(40).stiffness(120).delay(800)}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña (mín. 6 caracteres)"
                  placeholderTextColor="#999"
                  secureTextEntry
                  className="border border-border rounded-2xl h-12 px-4"
                />
              </Animated.View>

              {error !== "" && (
                <Animated.Text 
                  entering={FadeIn.duration(600).delay(900)}
                  className="text-sm text-red-500 text-center mt-3"
                >
                  {error}
                </Animated.Text>
              )}
            </Animated.View>
          )}

          {/* CONTINUE */}
          <Animated.View entering={SlideInUp.duration(1000).springify().damping(40).stiffness(120).delay(900)} style={{ marginTop: 40 }}>
            <Button
              disabled={!canContinue() || isProcessing}
              onPress={next}
              className="rounded-full h-14"
            >
              {isProcessing ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-white font-medium">Procesando...</Text>
                </View>
              ) : (
                <Text className="text-white font-medium">
                  {step === totalSteps ? "Crear mi cuenta" : "Continuar"}
                </Text>
              )}
            </Button>
          </Animated.View>
        </View>
        </ScrollView>
        )}
      </SafeAreaView>
      )
    }
