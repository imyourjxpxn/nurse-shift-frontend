'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { WaneYenLogo } from '@/components/waneyen-logo'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, loginWithGoogle, loginAsMockHeadNurse, isLoading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, router])

  const handleGoogleLogin = async () => {
    setIsSigningIn(true)
    try {
      const result = await loginWithGoogle()
      if (result.isNewUser) {
        router.push('/register')
      } else {
        router.push('/home')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <WaneYenLogo size="lg" />
        
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-medium italic text-foreground">
            Blessed Schedules for a Better Life
          </h1>
          <p className="text-muted-foreground">
            Sign in with your Google account to continue
          </p>
        </div>

        <Button
          variant="outline"
          className="h-12 w-full max-w-sm gap-3 rounded-full border-border bg-background text-foreground shadow-sm hover:bg-muted"
          onClick={handleGoogleLogin}
          disabled={isLoading || isSigningIn}
        >
          <GoogleIcon className="size-5" />
          <span className="font-medium">
            {isSigningIn ? 'Signing in...' : 'Continue with Google'}
          </span>
        </Button>

        <div className="flex w-full max-w-sm flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>Development Only</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <Button
            variant="outline"
            className="h-10 w-full gap-2 rounded-full border-dashed border-amber-400 text-amber-700 hover:bg-amber-50"
            onClick={() => {
              loginAsMockHeadNurse()
              router.push('/home')
            }}
            disabled={isLoading || isSigningIn}
          >
            <span className="text-sm font-medium">Sign in as Head Nurse (Mock)</span>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{' '}
          <a href="#" className="text-sky-600 hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-sky-600 hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  )
}
