'use client'

import { useEffect, useCallback, useState, createContext, useContext, type ReactNode } from 'react'
import { useRouter } from "next/navigation"

import {
  loginWithGoogle as serviceLoginWithGoogle,
  completeRegistration as serviceCompleteRegistration,
  updateDisplayName as serviceUpdateDisplayName,
  logout as serviceLogout,
  persistUser,
  getPersistedUser,
  clearPersistedUser,
  getCurrentUser,
  type CompleteRegistrationPayload,
  type User,
} from '@/services/auth.service'

/* =========================================================
   TYPES
========================================================= */

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  loginWithGoogle: () => void
  completeRegistration: (payload: CompleteRegistrationPayload) => Promise<User>
  updateDisplayName: (newName: string) => Promise<void>
  logout: () => Promise<void>
}

/* =========================================================
   CONTEXT
========================================================= */

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/* =========================================================
   PROVIDER
========================================================= */

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(() => {
    console.log("🔵 [INIT] Load persisted user from localStorage")
    return getPersistedUser()
  })

  const [isLoading, setIsLoading] = useState(true)

  /* =========================================================
     INIT AUTH FLOW
  ========================================================= */

  useEffect(() => {
    const init = async () => {
      console.log("====================================")
      console.log("🚀 [AUTH INIT] START")
      console.log("====================================")

      try {
        /* -----------------------------------------
           STEP 1️⃣ : Check URL for accessToken
        ----------------------------------------- */
        console.log("🔎 STEP 1: Check URL params")

        const params = new URLSearchParams(window.location.search)
        const token = params.get("accessToken")

        console.log("➡ accessToken:", token)

        if (token) {
          console.log("✅ Token found in URL")

          localStorage.setItem("accessToken", token)

          console.log("📡 STEP 1.1: Fetch current user from backend")

          const currentUser = await getCurrentUser()

          console.log("👤 currentUser:", currentUser)

          if (currentUser) {
            console.log("✅ User fetched successfully")
            setUser(currentUser)
            persistUser(currentUser)
          } else {
            console.log("❌ No user returned from backend")
            setUser(null)
            clearPersistedUser()
          }

          // remove query params
          window.history.replaceState({}, "", window.location.pathname)
          console.log("🧹 URL cleaned")

          return
        }

        /* -----------------------------------------
           STEP 2️⃣ : Normal page refresh flow
        ----------------------------------------- */
        console.log("🔎 STEP 2: No token in URL, normal auth check")

        const currentUser = await getCurrentUser()

        console.log("👤 currentUser:", currentUser)

        if (currentUser) {
          console.log("✅ User still logged in")
          setUser(currentUser)
          persistUser(currentUser)
        } else {
          console.log("❌ Not authenticated")
          setUser(null)
          clearPersistedUser()
        }

      } catch (error) {
        console.error("💥 [AUTH INIT ERROR]:", error)
        setUser(null)
        clearPersistedUser()
      } finally {
        console.log("🏁 [AUTH INIT] END")
        console.log("====================================")
        setIsLoading(false)
      }
    }

    init()
  }, [])

  /* =========================================================
     GOOGLE LOGIN
  ========================================================= */

  const loginWithGoogle = useCallback(() => {
    console.log("🟢 [AUTH] loginWithGoogle called")
    setIsLoading(true)

    // redirect immediately
    serviceLoginWithGoogle()
  }, [])

  /* =========================================================
     COMPLETE REGISTRATION
  ========================================================= */

  const completeRegistration = useCallback(
    async (payload: CompleteRegistrationPayload) => {

      console.log("====================================")
      console.log("🟢 [AUTH] COMPLETE REGISTRATION")
      console.log("====================================")
      console.log("📦 Payload:", payload)

      try {
        console.log("📡 Calling backend service...")
        const newUser = await serviceCompleteRegistration(payload)

        console.log("✅ Backend success:", newUser)

        setUser(newUser)
        persistUser(newUser)

        console.log("💾 User updated in state + localStorage")

        return newUser

      } catch (error) {
        console.error("💥 Complete registration failed:", error)
        throw error
      }
    },
    []
  )

  /* =========================================================
     UPDATE DISPLAY NAME
  ========================================================= */

  const updateDisplayName = useCallback(
    async (newName: string) => {
      console.log("====================================")
      console.log("🟢 [AUTH] UPDATE DISPLAY NAME")
      console.log("====================================")

      if (!user) {
        console.log("❌ No user found, abort")
        return
      }

      try {
        console.log("📡 Sending update to backend...")
        const updated = await serviceUpdateDisplayName(user, newName)

        console.log("✅ Updated user:", updated)

        setUser(updated)
        persistUser(updated)

      } catch (error) {
        console.error("💥 Update name failed:", error)
        throw error
      }
    },
    [user]
  )

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = useCallback(async () => {
  await serviceLogout()
  setUser(null)
  router.replace("/login")
}, [router])

  /* =========================================================
     PROVIDER RETURN
  ========================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        loginWithGoogle,
        completeRegistration,
        updateDisplayName,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

/* =========================================================
   HOOK
========================================================= */

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}