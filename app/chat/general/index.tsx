import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import * as Haptics from "expo-haptics"
import { ArrowLeft, Send } from "lucide-react-native"
import { useTheme, colorThemes } from "@/lib/theme-context"
import { checkMessageLimit, sendGeneralChatMessage } from "@/lib/api/thoughts"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function GeneralChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hola, estoy aquí para hablar si quieres. ¿Cómo te sientes hoy?",
    },
  ])
  const [context, setContext] = useState("Asistente: Hola, estoy aquí para hablar si quieres. ¿Cómo te sientes hoy?")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [messageCount, setMessageCount] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

  const scrollRef = useRef<ScrollView>(null)

  const router = useRouter()
  const { selectedTheme } = useTheme()
  const primary = colorThemes[selectedTheme].primary

  useEffect(() => {
    checkLimits()
  }, [])

  const checkLimits = async () => {
    const response = await checkMessageLimit()
    if (response.success) {
      setMessageCount(response.count || 0)
      setLimitReached(response.limitReached || false)
      setIsPremium(response.isPremium || false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading || limitReached) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const userMessage: Message = { role: "user", content: input }
    const userMessageText = input.trim()
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendGeneralChatMessage(userMessageText, context)

      if (!response.success) {
        if (response.error === "limit_reached") {
          setLimitReached(true)
          setMessageCount(10)
          return
        }
        throw new Error(response.message || response.error)
      }

      const aiMessage: Message = {
        role: "assistant",
        content: response.response || "Entiendo.",
      }

      setMessages((prev) => [...prev, aiMessage])
      setContext(context + `\nUsuario: ${userMessageText}\nAsistente: ${response.response}`)
      setMessageCount((prev) => prev + 1)

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error("Error sending message:", error)
      // Fallback response
      const fallbackMessage: Message = {
        role: "assistant",
        content: "Entiendo. ¿Quieres contarme más sobre eso?",
      }
      setMessages((prev) => [...prev, fallbackMessage])
      setContext(context + `\nUsuario: ${userMessageText}\nAsistente: Entiendo. ¿Quieres contarme más sobre eso?`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
      >
        {/* HEADER */}
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        >
          <View className="flex-row items-center px-4 py-3">
            <TouchableOpacity
              onPress={() => router.replace("/app")}
              style={{ marginRight: 12 }}
            >
              <ArrowLeft size={22} color={primary} />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <View
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 16,
                  backgroundColor: `${primary}1A`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <Text className="text-lg">🌸</Text>
              </View>
              <Text className="text-sm font-serif italic">
                Estoy aquí para hablar
              </Text>
            </View>

            {!isPremium && (
              <View className="ml-auto">
                <Text className="text-xs text-muted-foreground">
                  {messageCount}/10 mensajes
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* CHAT */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 24,
          }}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message, index) => {
            const isUser = message.role === "user"

            return (
              <View
                key={index}
                style={{
                  alignItems: isUser ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    maxWidth: "85%",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 18,
                    backgroundColor: isUser
                      ? primary
                      : "rgba(0,0,0,0.04)",
                    borderWidth: isUser ? 0 : 1,
                    borderColor: "rgba(0,0,0,0.08)",
                  }}
                >
                  <Text
                    style={{
                      color: isUser ? "white" : "black",
                      fontSize: 14,
                      lineHeight: 20,
                    }}
                  >
                    {message.content}
                  </Text>
                </View>
              </View>
            )
          })}

          {limitReached && (
            <View style={{ alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  padding: 20,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: `${primary}33`,
                  backgroundColor: `${primary}0D`,
                  alignItems: "center",
                  maxWidth: "85%",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "serif",
                    fontWeight: "300",
                    color: primary,
                    marginBottom: 8,
                  }}
                >
                  Límite diario alcanzado
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "rgba(0,0,0,0.6)",
                    textAlign: "center",
                    lineHeight: 20,
                    marginBottom: 16,
                  }}
                >
                  Has usado tus 10 mensajes diarios. Actualiza a premium para mensajes ilimitados.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/paywall")}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    backgroundColor: primary,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "500" }}>
                    Ver planes premium
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isLoading && (
            <View style={{ alignItems: "flex-start", marginBottom: 12 }}>
              <View
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 18,
                  backgroundColor: "rgba(0,0,0,0.04)",
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                }}
              >
                <View className="flex-row">
                  {[0, 1, 2].map((i) => (
                    <View
                      key={i}
                      style={{
                        height: 6,
                        width: 6,
                        borderRadius: 3,
                        backgroundColor: "#999",
                        marginRight: 4,
                      }}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* INPUT */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: 12,
            borderTopWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        >
          <View className="flex-row items-end">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={limitReached ? "Límite alcanzado" : "Escribe lo que sientes..."}
              multiline
              editable={!limitReached}
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 120,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.15)",
                paddingHorizontal: 14,
                paddingVertical: 10,
                fontSize: 14,
                marginRight: 10,
              }}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || isLoading || limitReached}
              style={{
                height: 44,
                width: 44,
                borderRadius: 22,
                backgroundColor:
                  !input.trim() || isLoading || limitReached
                    ? "rgba(0,0,0,0.15)"
                    : primary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
