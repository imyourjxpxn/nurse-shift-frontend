'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { User, AuthState } from './types'
import { mockGoogleUser } from './mock-data'

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<{ isNewUser: boolean }>
  completeRegistration: (displayName: string, hospitalId: string, hospitalName: string) => void
  logout: () => void
  googleEmail: string | null
  googleName: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'waneyen_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(false)
  const [googleEmail, setGoogleEmail] = useState<string | null>(null)
  const [googleName, setGoogleName] = useState<string | null>(null)

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    
    // Simulate OAuth flow delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if user already exists (registered)
    const storedUser = localStorage.getItem(STORAGE_KEY)
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.isRegistered) {
        setUser(parsedUser)
        setIsLoading(false)
        return { isNewUser: false }
      }
    }
    
    // New user - store Google data for registration
    setGoogleEmail(mockGoogleUser.email)
    setGoogleName(mockGoogleUser.name)
    setIsLoading(false)
    return { isNewUser: true }
  }, [])

  const completeRegistration = useCallback((displayName: string, hospitalId: string, hospitalName: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      email: googleEmail || mockGoogleUser.email,
      displayName,
      hospitalId,
      hospitalName,
      isRegistered: true,
    }
    
    setUser(newUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setGoogleEmail(null)
    setGoogleName(null)
  }, [googleEmail])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
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
