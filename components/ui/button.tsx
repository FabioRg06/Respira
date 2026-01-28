import * as React from 'react'
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native'
import { cn } from '@/lib/utils'
import { useTheme, colorThemes } from '@/lib/theme-context'

const buttonVariants = {
  variant: {
    default: { container: 'bg-primary', text: 'text-primary-foreground' },
    destructive: { container: 'bg-destructive', text: 'text-white' },
    outline: { container: 'border bg-background shadow-xs border-input', text: 'text-foreground' },
    secondary: { container: 'bg-secondary', text: 'text-secondary-foreground' },
    ghost: { container: '', text: 'text-accent-foreground' },
    link: { container: '', text: 'text-primary underline-offset-4' },
  },
  size: {
    default: { container: 'px-4 py-2 rounded-lg', text: 'text-base' },
    sm: { container: 'h-10 rounded-lg px-3', text: 'text-base' },
    lg: { container: 'h-12 rounded-lg px-6', text: 'text-lg' },
    icon: { container: 'h-10 w-10 rounded-full', text: '' },
    'icon-sm': { container: 'h-9 w-9 rounded-full', text: '' },
    'icon-lg': { container: 'h-11 w-11 rounded-full', text: '' },
  },
}

type ButtonVariant = keyof typeof buttonVariants.variant
type ButtonSize = keyof typeof buttonVariants.size

interface ButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

function Button({
  className,
  variant = 'default',
  size = 'default',
  disabled,
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  const { selectedTheme } = useTheme();
  const primaryColor = colorThemes[selectedTheme].primary;

  const baseClasses =
    'flex-row items-center justify-center gap-2 disabled:opacity-50'
  const containerClasses = buttonVariants.variant[variant].container
  const textClasses = buttonVariants.variant[variant].text
  const sizeClasses = buttonVariants.size[size].container
  const textSizeClasses = buttonVariants.size[size].text

  const dynamicStyle = variant === 'default' ? { backgroundColor: primaryColor } : {};

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || isLoading}
      className={cn(baseClasses, containerClasses, sizeClasses, className)}
      style={dynamicStyle}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : typeof children === 'string' ? (
        <Text className={cn('font-medium', textClasses, textSizeClasses)}>
          {children}
        </Text>
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {children}
        </View>
      )}
    </TouchableOpacity>
  )
}

export { Button, buttonVariants }
