import * as React from 'react'
import { Text } from 'react-native'

import { cn } from '@/lib/utils'

function Label({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        'text-sm leading-none font-medium',
        className,
      )}
      {...props}
    />
  )
}

export { Label }