import React, { useEffect, useRef, useState } from "react"
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Send } from "lucide-react-native"
import * as Haptics from "expo-haptics"
import { useTheme, colorThemes } from "@/lib/theme-context"
import { getThought, updateThought, sendThoughtChatMessage } from "@/lib/api/thoughts"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { selectedTheme } = useTheme()
  const primary = colorThemes[selectedTheme].primary

  const [messages, setMessages] = useState<Message[]>([])
  const [context, setContext] = useState("")
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [thought, setThought] = useState<any>(null)

  const scrollRef = useRef<ScrollView>(null)

  /* =========================
      LOAD THOUGHT + CHAT
   ========================= */
  useEffect(() => {
    if (!id) return

    const loadThought = async () => {
      const response = await getThought(id)
      if (response.success && response.data) {
        setThought(response.data)
        let chatHistory = response.data.chat_history || []

        // If no chat history, generate initial message
        if (chatHistory.length === 0) {
          try {
            const response = await sendThoughtChatMessage(id, "Hola, quiero hablar sobre este pensamiento.")
            if (response.success && response.response) {
              const initialMessage = { role: "assistant" as const, content: response.response }
              chatHistory = [initialMessage]
              setMessages(chatHistory)
              setContext(`Asistente: ${response.response}`)
            } else {
              throw new Error(response.error || "Error generating response")
            }
          } catch (error) {
            console.error("Error generating initial message:", error)
            // Fallback
            const fallback = { role: "assistant" as const, content: "Hola, estoy aquí para hablar sobre este pensamiento. ¿Qué te gustaría explorar?" }
            chatHistory = [fallback]
            setMessages(chatHistory)
            setContext(`Asistente: ${fallback.content}`)
            // Still save it
            await updateThought(id, { chat_history: chatHistory })
          }
        } else {
          setMessages(chatHistory)
          // Build initial context
          const initialContext = chatHistory.map((msg: Message) =>
            `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
          ).join('\n')
          setContext(initialContext)
        }
      } else {
        console.error("Error loading thought:", response.error)
      }
      setIsLoading(false)
    }

    loadThought()
  }, [id])

  /* =========================
     AUTO SCROLL
  ========================= */
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true })
  }, [messages, isSending])

  /* =========================
      SEND MESSAGE
   ========================= */
  const handleSend = async () => {
    if (!input.trim() || isSending || !thought) return

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const userMessage = input.trim()
    setInput("")
    const newUserMessage = { role: "user" as const, content: userMessage }
    setMessages((prev) => [...prev, newUserMessage])
    setIsSending(true)

    try {
      const response = await sendThoughtChatMessage(id, userMessage)

      if (!response.success) {
        if (response.error === "limit_reached") {
          // Handle limit reached - perhaps show a message
          const limitMessage = { role: "assistant" as const, content: "Has alcanzado el límite diario de mensajes. Actualiza a premium para continuar." }
          setMessages((prev) => [...prev, limitMessage])
          return
        }
        throw new Error(response.message || response.error)
      }

      const newAiMessage = { role: "assistant" as const, content: response.response || "Entiendo." }
      setMessages((prev) => [...prev, newAiMessage])
      setContext(context + `\nUsuario: ${userMessage}\nAsistente: ${response.response}`)

    } catch (error) {
      console.error("Error sending message", error)
      // Fallback
      const fallbackMessage = { role: "assistant" as const, content: "Entiendo. ¿Quieres contarme más sobre eso?" }
      setMessages((prev) => [...prev, fallbackMessage])
      setContext(context + `\nUsuario: ${userMessage}\nAsistente: Entiendo. ¿Quieres contarme más sobre eso?`)
    } finally {
      setIsSending(false)
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
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={22} color={primary} />
            </TouchableOpacity>

            <View className="flex-row items-center ml-3">
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
              <Text className="text-sm font-light">Conversación</Text>
            </View>
          </View>
        </View>

        {/* CHAT */}
        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color={primary} />
            </View>
          ) : (
            <>
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
                          lineHeight: 20,
                        }}
                      >
                        {message.content}
                      </Text>
                    </View>
                  </View>
                )
              })}

              {isSending && (
                <View style={{ alignItems: "flex-start", marginBottom: 12 }}>
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 18,
                      backgroundColor: "rgba(0,0,0,0.04)",
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
            </>
          )}
        </ScrollView>

        {/* INPUT */}
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderColor: "rgba(0,0,0,0.08)",
            backgroundColor: "rgba(255,255,255,0.96)",
          }}
        >
          <View className="flex-row items-end">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Escribe algo..."
              multiline
              editable={!isSending && !isLoading}
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 120,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(0,0,0,0.15)",
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginRight: 10,
              }}
            />

            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || isSending || isLoading}
              style={{
                height: 44,
                width: 44,
                borderRadius: 22,
                backgroundColor:
                  !input.trim() || isSending || isLoading
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
