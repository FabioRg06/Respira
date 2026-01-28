import { TouchableOpacity, Text } from "react-native"

function OptionCard({
  active,
  onPress,
  children,
}: {
  active: boolean
  onPress: () => void
  children: React.ReactNode
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
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
      <Text className="text-sm">{children}</Text>
    </TouchableOpacity>
  )
}
export default OptionCard