import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { ArrowLeft, Phone } from "lucide-react-native"

import { Button } from "@/components/ui/button"
import { useTheme, colorThemes } from "@/lib/theme-context"

const supportLines = [
  {
    country: "Estados Unidos",
    name: "National Suicide Prevention Lifeline",
    number: "988",
    available: "24/7",
  },
  {
    country: "México",
    name: "SAPTEL",
    number: "(55) 5259-8121",
    available: "24/7",
  },
  {
    country: "España",
    name: "Teléfono de la Esperanza",
    number: "717 003 717",
    available: "24/7",
  },
  {
    country: "Argentina",
    name: "Centro de Asistencia al Suicida",
    number: "135",
    available: "24/7",
  },
  {
    country: "Colombia",
    name: "Línea 106",
    number: "106",
    available: "24/7",
  },
]

export default function SupportPage() {
  const router = useRouter()
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;

  // 🔹 AÑADIDO: asegura que el sistema muestre el popup de llamada
  const callNumber = (number: string) => {
    const cleanNumber = number.replace(/[^\d+]/g, "")
    Linking.openURL(`tel:${cleanNumber}`)
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER */}
      <View className="border-b border-border/40 bg-background/90">
        <View className="mx-auto flex-row items-center gap-3 px-6 py-3 max-w-[520px] w-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>

          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor + '1A' }}>
              <Text className="text-lg">🌸</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              Líneas de apoyo
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
      >
        <View className="items-center px-6 py-6">
          <View className="w-full max-w-[520px]">
            {/* HERO CARD */}
            <View
              className="rounded-3xl bg-card p-6 mb-6 mx-1"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 2,
              }}
            >
              <Text className="text-center font-serif text-2xl font-light mb-3">
                No estás solo
              </Text>
              <Text className="text-center text-sm leading-relaxed text-muted-foreground">
                Si necesitas hablar con alguien, estas líneas están disponibles
                para ti
              </Text>
            </View>

            {/* LIST */}
            {supportLines.map((line, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => callNumber(line.number)}
                className="rounded-2xl bg-card p-5 mb-4 mx-1 border border-border/40"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 2,
                }}
              >
                <View className="flex-row gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: primaryColor + '1A' }}>
                    <Phone size={22} color={primaryColor} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground mb-1">
                      {line.country}
                    </Text>

                    <Text className="text-base font-medium mb-1">
                      {line.name}
                    </Text>

                    <Text className="text-lg font-serif" style={{ color: primaryColor }}>
                      {line.number}
                    </Text>

                    <Text className="text-xs text-muted-foreground mt-2">
                      Disponible {line.available}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
