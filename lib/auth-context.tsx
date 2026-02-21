'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  loginWithGoogle as serviceLoginWithGoogle,
  completeRegistration as serviceCompleteRegistration,
  updateDisplayName as serviceUpdateDisplayName,
  logout as serviceLogout,
  persistUser,
  getPersistedUser,
  clearPersistedUser,
  type User,
} from '@/services/auth.service'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<{ isNewUser: boolean }>
  completeRegistration: (
    displayName: string,
    hospitalId: string,
    hospitalName: string,
  ) => Promise<void>
  updateDisplayName: (newName: string) => Promise<void>
  logout: () => Promise<void>
  googleEmail: string | null
  googleName: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getPersistedUser())
  const [isLoading, setIsLoading] = useState(false)
  const [googleEmail, setGoogleEmail] = useState<string | null>(null)
  const [googleName, setGoogleName] = useState<string | null>(null)

  /* ============================= */
  /* Google Login */
  /* ============================= */

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)

    try {
      const result = await serviceLoginWithGoogle()

      if (!result.isNewUser && result.existingUser) {
        setUser(result.existingUser)
        persistUser(result.existingUser)
        return { isNewUser: false }
      }

      setGoogleEmail(result.email || null)
      setGoogleName(result.name || null)

      return { isNewUser: true }
    } finally {
      setIsLoading(false)
    }
  }, [])

  /* ============================= */
  /* Complete Registration */
  /* ============================= */

  const completeRegistration = useCallback(
    async (displayName: string, hospitalId: string, hospitalName: string) => {
      if (!googleEmail) throw new Error('Missing Google email')

      const newUser = await serviceCompleteRegistration(
        googleEmail,
        displayName,
        hospitalId,
        hospitalName,
      )

      setUser(newUser)
      persistUser(newUser)
      setGoogleEmail(null)
      setGoogleName(null)
    },
    [googleEmail],
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
    setGoogleEmail(null)
    setGoogleName(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user?.isRegistered,
        loginWithGoogle,
        completeRegistration,
        updateDisplayName,
        logout,
        googleEmail,
        googleName,
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