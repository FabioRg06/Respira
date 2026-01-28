import { supabase } from "@/lib/supabase"

/**
 * Obtener perfil del usuario
 */
export async function getUserProfile() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true, data: profile }
  } catch (error) {
    console.error("[getUserProfile] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Actualizar perfil del usuario
 */
export async function updateUserProfile(updates: Record<string, any>) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No autorizado")
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("[updateUserProfile] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      throw new Error("No autorizado")
    }

    return { success: true, data: user }
  } catch (error) {
    console.error("[getCurrentUser] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}

/**
 * Logout / Sign out del usuario
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("[logoutUser] Error:", error)
    return { success: false, error: (error as Error).message }
  }
}
