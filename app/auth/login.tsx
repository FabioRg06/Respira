import { View, Text, KeyboardAvoidingView, Platform } from "react-native"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useRouter } from "expo-router"
import { useState, useEffect } from "react"
import Animated, { FadeIn } from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }, 100)
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          router.push("/app")
        }
      } catch (err) {
        console.error("Error checking user:", err)
      }
    }
    checkUser()
  }, [router])

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Por favor ingresa email y contraseña")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: signInError, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push("/app")
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Algo salió mal"
      setError(errorMessage)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-[300px]" style={{ gap: 40 }}>
          <Animated.View entering={FadeIn.duration(700).delay(150)} className="flex flex-col items-center" style={{ gap: 12 }}>
            <View className="flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
              <Text className="text-7xl" style={{ lineHeight: 80 }}>🌸</Text>
            </View>
            <Text className="text-5xl font-light" style={{ textAlign: 'center',fontFamily: 'PlayfairDisplay_400Regular' }}>Bienvenido de vuelta</Text>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(700).delay(250)} style={{ gap: 20 }}>
            <View className="space-y-2">
              <Label className="text-xl font-normal">
                Correo electrónico
              </Label>
              <Input
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                className="rounded-full border-muted-foreground/20 h-14"
              />
            </View>

            <View className="space-y-2">
              <Label className="text-xl font-normal">
                Contraseña
              </Label>
              <Input
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                className="rounded-full border-muted-foreground/20 h-14"
              />
            </View>

            {error && (
              <Text className="text-sm text-red-500">
                {error}
              </Text>
            )}

            <Button
              onPress={handleLogin}
              className="w-full rounded-full h-14"
              size="lg"
              disabled={isLoading}
            >
              <Text className="text-white">{isLoading ? "Entrando..." : "Entrar"}</Text>
            </Button>

            <View className="flex-row items-center justify-center">
              <Text className="text-sm text-muted-foreground" style={{ textAlign: 'center' }}>¿No tienes cuenta? </Text>
              <Link href="/onboarding" asChild    >
                <Text className="text-muted-foreground" style={{ textDecorationLine: 'underline' }}>Crear una</Text>
              </Link>
            </View>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}