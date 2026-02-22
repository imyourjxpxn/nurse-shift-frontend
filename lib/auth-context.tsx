'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
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


interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}


interface AuthContextType extends AuthState {
  loginWithGoogle: () => void
  completeRegistration: (
   payload: CompleteRegistrationPayload
  ) => Promise<User>

  updateDisplayName: (newName: string) => Promise<void>
  logout: () => Promise<void>
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(() => getPersistedUser())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // 1️⃣ เช็คว่าเพิ่งกลับมาจาก Google หรือไม่
        const params = new URLSearchParams(window.location.search)
        const token = params.get("accessToken")
        const profileCompleted = params.get("profileCompleted")

        if (token) {
          localStorage.setItem("accessToken", token)

          // ลบ query ออกจาก URL กัน rerun
          window.history.replaceState({}, "", window.location.pathname)

          if (profileCompleted === "false") {
            router.replace("/register")
          } else {
            router.replace("/home")
          }

          return
        }

        // 2️⃣ โหลด user จาก backend ปกติ
        const currentUser = await getCurrentUser()

        if (currentUser) {
          setUser(currentUser)
          persistUser(currentUser)
        } else {
          setUser(null)
          clearPersistedUser()
        }
      } catch (error) {
        console.error("Auth init error:", error)
        setUser(null)
        clearPersistedUser()
      } finally {
        // 🔥 จะรันเสมอ ไม่ว่า success หรือ error
        setIsLoading(false)
      }
    }

    init()
  }, [router])

  /* ============================= */
  /* Google Login */
  /* ============================= */

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    serviceLoginWithGoogle() // redirect ไป Google เลย
    
  }, [])



  /* ============================= */
  /* Complete Registration */
  /* ============================= */

  const completeRegistration = useCallback(
    async (payload: CompleteRegistrationPayload) => {
    try {
      const newUser = await serviceCompleteRegistration(payload)

      setUser(newUser)
      persistUser(newUser)
      
      return newUser
      
    } catch (error) {
      console.error('Complete registration failed:', error)
      throw error
    }
  },
  [serviceCompleteRegistration, persistUser],
)

  /* ============================= */
  /* Update Name */
  /* ============================= */

  const updateDisplayName = useCallback(
    async (newName: string) => {
      if (!user) return

      const updated = await serviceUpdateDisplayName(user, newName)
      setUser(updated)
      persistUser(updated)
    },
    [user],
  )

  /* ============================= */
  /* Logout */
  /* ============================= */

  const logout = useCallback(async () => {
    await serviceLogout()
    setUser(null)
    clearPersistedUser()
  }, [])

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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}