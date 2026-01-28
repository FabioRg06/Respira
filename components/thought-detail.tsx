import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"
import { Heart } from "lucide-react-native"
import * as Haptics from "expo-haptics"

import { TypingText } from "@/components/typing-text"
import { useTheme, colorThemes } from "@/lib/theme-context"

interface ThoughtDetailProps {
  thought: any
}


export function ThoughtDetail({ thought }: ThoughtDetailProps) {
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;
  const [isImportant, setIsImportant] = useState(thought.is_important)
  const aiResponse = thought.ai_response

  const toggleImportant = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setIsImportant((prev: any) => !prev)
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }

  return (
    <View>
      {/* THOUGHT CARD */}
      <View
        className="rounded-3xl bg-card p-7 border border-border/40"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2,
          marginBottom: 28,
        }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-sm font-serif italic text-muted-foreground">
            Tu pensamiento
          </Text>

          <TouchableOpacity onPress={toggleImportant} activeOpacity={0.8}>
            <Heart
              size={20}
              color={isImportant ? primaryColor : "#9ca3af"}
              fill={isImportant ? primaryColor : "transparent"}
            />
          </TouchableOpacity>
        </View>

        <Text className="text-lg leading-relaxed mb-5">
          {thought.thought_content}
        </Text>

        {thought.trigger_event && (
          <View className="pt-4 border-t border-border/40 mb-4">
            <Text className="text-sm font-serif italic text-muted-foreground mb-1">
              Lo que lo provocó
            </Text>
            <Text className="text-base text-muted-foreground leading-relaxed">
              {thought.trigger_event}
            </Text>
          </View>
        )}

        {thought.emotions && (
          <View className="pt-4 border-t border-border/40">
            <Text className="text-sm font-serif italic text-muted-foreground mb-1">
              Emociones
            </Text>
            <Text className="text-base text-muted-foreground leading-relaxed">
              {(() => {
                let emotionsArray = [];
                if (Array.isArray(thought.emotions)) {
                  emotionsArray = thought.emotions;
                } else if (typeof thought.emotions === 'string') {
                  try {
                    emotionsArray = JSON.parse(thought.emotions);
                  } catch {
                    emotionsArray = [thought.emotions];
                  }
                }
                return emotionsArray.join(", ");
              })()}
            </Text>
          </View>
        )}
      </View>

      {/* AI RESPONSE */}
      <View
        className="rounded-3xl p-7"
        style={{
          borderColor: primaryColor + '33',
          borderWidth: 1,
          backgroundColor: primaryColor + '14',
        }}
      >
        <View className="mb-4 flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor + '33' }}>
            <Text className="text-2xl">🌸</Text>
          </View>
          <Text className="text-base font-serif italic font-medium">
            Mi perspectiva
          </Text>
        </View>

        <TypingText text={aiResponse} speed={25} />
      </View>
    </View>
  )
}
