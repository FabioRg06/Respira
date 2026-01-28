import * as React from 'react'
import { TextInput } from 'react-native'

import { cn } from '@/lib/utils'

function Input({ className, ...props }: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      className={cn(
        'placeholder:text-muted-foreground border-input w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base shadow-xs disabled:opacity-50',
        className,
      )}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  )
}

export { Input }