'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
  loginWithGoogle as serviceLoginWithGoogle,
  loginAsMockUser as serviceLoginAsMockUser,
  completeRegistration as serviceCompleteRegistration,
  updateDisplayName as serviceUpdateDisplayName,
  persistUser,
  getPersistedUser,
  clearPersistedUser,
} from '@/services/auth.service'

interface User {
  id: string
  email: string
  displayName: string
  hospitalId: string
  hospitalName: string
  avatarUrl?: string
  isRegistered: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<{ isNewUser: boolean }>
  loginAsMockUser: (userId: string) => void
  completeRegistration: (displayName: string, hospitalId: string, hospitalName: string) => void
  updateDisplayName: (newName: string) => Promise<void>
  logout: () => void
  googleEmail: string | null
  googleName: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getPersistedUser())
  const [isLoading, setIsLoading] = useState(false)
  const [googleEmail, setGoogleEmail] = useState<string | null>(null)
  const [googleName, setGoogleName] = useState<string | null>(null)

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    const result = await serviceLoginWithGoogle()

    if (!result.isNewUser && result.existingUser) {
      setUser(result.existingUser)
      setIsLoading(false)
      return { isNewUser: false }
    }

    setGoogleEmail(result.email)
    setGoogleName(result.name)
    setIsLoading(false)
    return { isNewUser: true }
  }, [])

  const loginAsMockUser = useCallback(async (userId: string) => {
    const mockUser = await serviceLoginAsMockUser(userId)
    setUser(mockUser)
    persistUser(mockUser)
  }, [])

  const completeRegistration = useCallback(
    async (displayName: string, hospitalId: string, hospitalName: string) => {
      const email = googleEmail || ''
      const newUser = await serviceCompleteRegistration(email, displayName, hospitalId, hospitalName)
      setUser(newUser)
      persistUser(newUser)
      setGoogleEmail(null)
      setGoogleName(null)
    },
    [googleEmail],
  )

  const updateDisplayName = useCallback(async (newName: string) => {
    if (!user) return
    const updated = await serviceUpdateDisplayName(user, newName)
    setUser(updated)
    persistUser(updated)
  }, [user])

  const logout = useCallback(() => {
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
        loginAsMockUser,
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
