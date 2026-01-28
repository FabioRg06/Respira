import { supabase } from "@/lib/supabase"
import { generateThoughtChatResponse, generateGeneralChatResponse } from "@/lib/ai"

/**
 * Obtener un pensamiento por ID
 */
export async function getThought(id: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    const { data: thought, error } = await supabase
      .from("thoughts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single()

    if (error || !thought) {
      throw new Error("Pensamiento no encontrado")
    }

    return { success: true, data: thought }
  } catch (error) {
    console.error("[getThought] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Actualizar un pensamiento
 */
export async function updateThought(id: string, updates: Record<string, any>) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    const { error } = await supabase
      .from("thoughts")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("[updateThought] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Crear un nuevo pensamiento
 */
export async function createThought(thoughtData: {
  thought: string
  trigger?: string
  emotions?: string[]
  is_important?: boolean
  ai_response?: string
}) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    const { data: newThought, error } = await supabase
      .from("thoughts")
      .insert({
        user_id: user.id,
        thought_content: thoughtData.thought,
        trigger_event: thoughtData.trigger || null,
        emotions: thoughtData.emotions || null,
        chat_history: [],
        is_important: thoughtData.is_important || false,
        ai_response: thoughtData.ai_response || null,
      })
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: newThought }
  } catch (error) {
    console.error("[createThought] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Obtener todos los pensamientos del usuario
 */
export async function getUserThoughts(limit?: number) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    let query = supabase
      .from("thoughts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data: thoughts, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: thoughts || [] }
  } catch (error) {
    console.error("[getUserThoughts] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Eliminar un pensamiento
 */
export async function deleteThought(id: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    const { error } = await supabase
      .from("thoughts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("[deleteThought] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Enviar mensaje de chat para un pensamiento
 */
export async function sendThoughtChatMessage(thoughtId: string, message: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    // Verificar plan premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    const isPremium = profile?.subscription_plan !== "free"

    // Verificar límite diario para usuarios free
    if (!isPremium) {
      const { data: usage } = await supabase
        .from("daily_message_usage")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split("T")[0])
        .single()

      const currentCount = usage?.message_count || 0

      if (currentCount >= 10) {
        return {
          success: false,
          error: "limit_reached",
          message: "Has consumido tus 10 mensajes diarios. Actualiza a premium para mensajes ilimitados."
        }
      }
    }

    // Obtener pensamiento y historial
    const { data: thought, error: thoughtError } = await supabase
      .from("thoughts")
      .select("*")
      .eq("id", thoughtId)
      .eq("user_id", user.id)
      .single()

    if (thoughtError || !thought) {
      throw new Error("Pensamiento no encontrado")
    }

    const chatHistory = thought.chat_history || []
    const context = chatHistory.map((msg: any) =>
      `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
    ).join('\n')

    // Generar respuesta AI
    const aiResponse = await generateThoughtChatResponse(
      thought.thought_content,
      thought.trigger_event || "",
      Array.isArray(thought.emotions) ? thought.emotions.join(', ') : thought.emotions || "",
      context,
      message
    )

    // Actualizar historial
    const updatedHistory = [
      ...chatHistory,
      { role: "user", content: message },
      { role: "assistant", content: aiResponse },
    ]

    const { error: updateError } = await supabase
      .from("thoughts")
      .update({ chat_history: updatedHistory })
      .eq("id", thoughtId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    // Incrementar contador para usuarios free
    if (!isPremium) {
      await supabase.rpc("increment_message_count", { p_user_id: user.id })
    }

    return { success: true, response: aiResponse }
  } catch (error) {
    console.error("[sendThoughtChatMessage] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Verificar límite de mensajes
 */
export async function checkMessageLimit() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    // Verificar plan premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    const isPremium = profile?.subscription_plan !== "free"

    if (isPremium) {
      return { success: true, limitReached: false, count: 0, isPremium: true }
    }

    // Obtener uso diario para usuarios free
    const { data: usage } = await supabase
      .from("daily_message_usage")
      .select("message_count")
      .eq("user_id", user.id)
      .eq("date", new Date().toISOString().split("T")[0])
      .single()

    const count = usage?.message_count || 0
    const limitReached = count >= 10

    return { success: true, limitReached, count, isPremium: false }
  } catch (error) {
    console.error("[checkMessageLimit] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Enviar mensaje de chat general
 */
export async function sendGeneralChatMessage(message: string, context: string) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    // Verificar plan premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    const isPremium = profile?.subscription_plan !== "free"

    // Verificar límite diario para usuarios free
    if (!isPremium) {
      const { data: usage } = await supabase
        .from("daily_message_usage")
        .select("message_count")
        .eq("user_id", user.id)
        .eq("date", new Date().toISOString().split("T")[0])
        .single()

      const currentCount = usage?.message_count || 0

      if (currentCount >= 10) {
        return {
          success: false,
          error: "limit_reached",
          message: "Has consumido tus 10 mensajes diarios. Actualiza a premium para mensajes ilimitados."
        }
      }
    }

    // Generar respuesta AI
    const aiResponse = await generateGeneralChatResponse(context, message)

    // Incrementar contador para usuarios free
    if (!isPremium) {
      await supabase.rpc("increment_message_count", { p_user_id: user.id })
    }

    return { success: true, response: aiResponse }
  } catch (error) {
    console.error("[sendGeneralChatMessage] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}
