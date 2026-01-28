'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Header } from '@/components/header'
import { HospitalCard } from '@/components/hospital-card'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleCreateWard = () => {
    // Mock action - would navigate to ward creation in real app
    alert('Create Ward functionality will be implemented with backend integration')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <HospitalCard
          hospitalName={user.hospitalName}
          onCreateWard={handleCreateWard}
        />
      </main>
    </div>
  )
}
