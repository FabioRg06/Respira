import { Text, View } from "react-native"
import { useEffect, useState } from "react"

interface TypingTextProps {
  text: string
  speed?: number
}

interface TextSegment {
  text: string
  isBold: boolean
}

function parseText(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  const regex = /\*\*(.*?)\*\*/g

  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    // Texto normal antes del **
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isBold: false
      })
    }

    // Texto en negrita
    segments.push({
      text: match[1],
      isBold: true
    })

    lastIndex = regex.lastIndex
  }

  // Texto normal restante
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isBold: false
    })
  }

  return segments
}

export function TypingText({ text, speed = 30 }: TypingTextProps) {
  const [visibleLength, setVisibleLength] = useState(0)
  const segments = parseText(text)

  useEffect(() => {
    if (visibleLength < text.length) {
      const timeout = setTimeout(() => {
        setVisibleLength((prev) => prev + 1)
      }, speed)

      return () => clearTimeout(timeout)
    }
  }, [visibleLength, text.length, speed])

  const renderSegments = () => {
    let currentLength = 0
    return segments.map((segment, index) => {
      const start = currentLength
      const end = currentLength + segment.text.length
      const visibleText = segment.text.slice(0, Math.max(0, visibleLength - start))

      currentLength = end

      return (
        <Text
          key={`visible-${index}`}
          className="text-base leading-relaxed"
          style={{
            color: "#2b1e1c",
            fontWeight: segment.isBold ? "bold" : "normal"
          }}
        >
          {visibleText}
        </Text>
      )
    })
  }

  return (
    <Text className="text-base leading-relaxed" style={{ color: "#2b1e1c" }}>
      {renderSegments()}
    </Text>
  )

}
