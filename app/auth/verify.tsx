import React from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'

export default function VerifyPage() {
  const router = useRouter()

  React.useEffect(() => {
    // Since authentication is removed, redirect to main app
    const timer = setTimeout(() => {
      router.push('/app')
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Redirigiendo...</Text>
    </View>
  )
}