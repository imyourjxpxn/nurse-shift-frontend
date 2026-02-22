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
  loginWithGoogle: () => void
  completeRegistration: (
    email: string,
    displayName: string,
    hospitalId: string,
    hospitalName: string
  ) => Promise<void>
  updateDisplayName: (newName: string) => Promise<void>
  logout: () => Promise<void>
  
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getPersistedUser())
  const [isLoading, setIsLoading] = useState(false)

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
   async (
    email: string,
    displayName: string,
    hospitalId: string,
    hospitalName: string
  ) => {
    const newUser = await serviceCompleteRegistration(
      email,
      displayName,
      hospitalId,
      hospitalName,
    )

      setUser(newUser)
      persistUser(newUser)
    },
    [],
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
        isAuthenticated: !!user?.isRegistered,
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