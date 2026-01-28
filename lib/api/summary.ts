import { supabase } from "@/lib/supabase"
import { generateWeeklySummary } from "@/lib/ai"

/**
 * Obtener resumen semanal del usuario
 */
export async function getWeeklySummary() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    // Verificar si es premium
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_plan")
      .eq("id", user.id)
      .single()

    const isPremium = profile?.subscription_plan === "premium"
       

    if (!isPremium) {
      return {
        success: true,
        isPremium: false,
        summary: null,
        stats: null,
      }
    }

    // Calcular inicio y fin de la semana actual
    const now = new Date()
    const dayOfWeek = now.getDay()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - dayOfWeek)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    // Verificar si hay resumen en caché
    const { data: cachedSummary } = await supabase
      .from("weekly_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStart.toISOString().split("T")[0])
      .gte("expires_at", now.toISOString())
      .single()

    // Obtener pensamientos actuales para verificar si hay cambios
    const { data: thoughts, error } = await supabase
      .from("thoughts")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const thoughtCount = thoughts ? thoughts.length : 0
    const importantCount = thoughts ? thoughts.filter((t) => t.is_important).length : 0

    if (cachedSummary && cachedSummary.thought_count === thoughtCount && cachedSummary.important_count === importantCount) {
      console.log("[getWeeklySummary] Devolviendo resumen desde caché")
      return {
        success: true,
        isPremium: true,
        summary: cachedSummary.summary,
        stats: { thoughtCount: cachedSummary.thought_count, importantCount: cachedSummary.important_count },
        weekStart: cachedSummary.week_start,
        weekEnd: cachedSummary.week_end,
      }
    }

    console.log("[getWeeklySummary] Generando nuevo resumen semanal")

    if (!thoughts || thoughts.length === 0) {
      const emptySummary =
        "No has registrado pensamientos esta semana. Recuerda que escribir tus pensamientos te ayuda a procesarlos mejor."
      return {
        success: true,
        isPremium: true,
        summary: emptySummary,
        stats: { thoughtCount: 0, importantCount: 0 },
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
      }
    }

    let summary: string
    try {
      summary = await generateWeeklySummary(thoughts)
    } catch (aiError) {
      console.error("[generateWeeklySummary] Error:", aiError)
      // Fallback to static summary if AI fails
      summary = `Esta semana has registrado ${thoughtCount} ${thoughtCount === 1 ? "pensamiento" : "pensamientos"}${importantCount > 0 ? `, de los cuales ${importantCount} ${importantCount === 1 ? "fue marcado" : "fueron marcados"} como importante${importantCount > 1 ? "s" : ""}` : ""}.

${thoughtCount >= 3 ? "Has estado muy consciente de tus pensamientos, lo cual es excelente. Escribir regularmente te ayuda a identificar patrones." : thoughtCount >= 1 ? "Es un buen comienzo. Mientras más escribas, más patrones podrás identificar." : ""}

Recuerda: el simple acto de escribir y reflexionar sobre tus pensamientos ya es terapéutico. Estás haciendo un gran trabajo cuidando de tu salud mental.

${importantCount > 0 ? "Los pensamientos que marcaste como importantes merecen atención especial. Tal vez quieras conversar con alguien de confianza sobre ellos." : "Si algún pensamiento te preocupa especialmente, no dudes en marcarlo como importante."}

Sigue así. Cada día que trabajas en esto, te vuelves más fuerte y consciente.`
    }

    // Guardar o actualizar en caché
    const expiresAt = new Date(weekEnd)
    expiresAt.setDate(expiresAt.getDate() + 7) // Expira una semana después del fin de semana

    const { error: upsertError } = await supabase.from("weekly_summaries").upsert({
      user_id: user.id,
      week_start: weekStart.toISOString().split("T")[0],
      week_end: weekEnd.toISOString().split("T")[0],
      summary,
      thought_count: thoughtCount,
      important_count: importantCount,
      expires_at: expiresAt.toISOString(),
    }, {
      onConflict: 'user_id,week_start'
    })

    if (upsertError) {
      console.error("[getWeeklySummary] Error guardando resumen en caché:", upsertError)
      // Continuar de todos modos
    }

    return {
      success: true,
      isPremium: true,
      summary,
      stats: { thoughtCount, importantCount },
      weekStart: weekStart.toISOString().split("T")[0],
      weekEnd: weekEnd.toISOString().split("T")[0],
    }
  } catch (error) {
    console.error("[getWeeklySummary] Error:", error)
    return {
      success: false,
      error: (error as Error).message,
      isPremium: false,
      summary: null,
      stats: null,
    }
  }
}
