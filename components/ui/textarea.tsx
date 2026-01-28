import { useState } from "react"
import { TextInput, View } from "react-native"
import { cn } from "@/lib/utils"
import { useTheme, colorThemes } from "@/lib/theme-context"

interface TextareaProps extends React.ComponentProps<typeof TextInput> {}

export function Textarea({ className, style, ...props }: TextareaProps) {
  const [focused, setFocused] = useState(false)
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;

  return (
    <View
      className={cn(
        "rounded-2xl border bg-card",
        focused ? "" : "border-border/40",
      )}
      style={{
        borderColor: focused ? primaryColor : undefined,
        shadowColor: "#000",
        shadowOpacity: focused ? 0.08 : 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: focused ? 4 : 2,
      }}
    >
      <TextInput
        {...props}
        multiline
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical="top"
        placeholderTextColor="#9ca3af"
        className={cn(
          "min-h-[160px] px-4 py-4 text-base text-foreground",
          className,
        )}
        style={style}
      />
    </View>
  )
}
