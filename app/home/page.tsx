'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { HospitalCard } from '@/components/hospital-card'
import { WardListItem } from '@/components/ward-list-item'
import { CreateWardModal } from '@/components/modals/create-ward-modal'
import { WardSuccessModal } from '@/components/modals/ward-success-modal'
import { JoinWardModal } from '@/components/modals/join-ward-modal'
import { DeleteWardModal } from '@/components/modals/delete-ward-modal'
import { useAuth } from '@/lib/auth-context'
import { useWard } from '@/lib/ward-context'
import type { Ward } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { createWard, joinWard, deleteWard, getWardsByHospital, getUserRole, ensureUserInMockWard } =
    useWard()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [createdWard, setCreatedWard] = useState<Ward | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  // Ensure current user is added to mock MED ward for demo purposes
  useEffect(() => {
    if (user) {
      ensureUserInMockWard(user.id, user.displayName, user.hospitalId)
    }
  }, [user, ensureUserInMockWard])

  if (!isAuthenticated || !user) {
    return null
  }

  const hospitalWards = getWardsByHospital(user.hospitalId)

  const handleCreateWard = async (name: string) => {
    const ward = await createWard(
      name,
      user.hospitalId,
      user.hospitalName,
      user.id,
      user.displayName
    )
    setCreatedWard(ward)
    setCreateModalOpen(false)
    setSuccessModalOpen(true)
  }

  const handleEnterWard = (ward: Ward) => {
    const role = getUserRole(ward.id, user.id)
    if (role) {
      router.push(`/ward/${ward.id}`)
    } else {
      setSelectedWard(ward)
      setJoinModalOpen(true)
    }
  }

  const handleJoinWard = async (code: string) => {
    const result = await joinWard(code, user.id, user.displayName)
    if (result.success && result.ward) {
      setJoinModalOpen(false)
      router.push(`/ward/${result.ward.id}`)
    }
    return result
  }

  const handleDeleteWard = (ward: Ward) => {
    setSelectedWard(ward)
    setDeleteModalOpen(true)
  }

  const confirmDeleteWard = async () => {
    if (selectedWard) {
      await deleteWard(selectedWard.id, user.id)
      setDeleteModalOpen(false)
      setSelectedWard(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">
        <HospitalCard
          hospitalName={user.hospitalName}
          onCreateWard={() => setCreateModalOpen(true)}
        />

        {hospitalWards.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
            {hospitalWards.map((ward) => (
              <WardListItem
                key={ward.id}
                ward={ward}
                isHeadNurse={ward.createdById === user.id}
                onEnterWard={handleEnterWard}
                onDeleteWard={handleDeleteWard}
              />
            ))}
          </div>
        )}
      </main>

      <CreateWardModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreateWard={handleCreateWard}
      />

      {createdWard && (
        <WardSuccessModal
          open={successModalOpen}
          onOpenChange={setSuccessModalOpen}
          wardName={createdWard.name}
          wardCode={createdWard.code}
          onEnterWard={() => {
            setSuccessModalOpen(false)
            router.push(`/ward/${createdWard.id}`)
          }}
        />
      )}

      {selectedWard && (
        <>
          <JoinWardModal
            open={joinModalOpen}
            onOpenChange={setJoinModalOpen}
            wardName={selectedWard.name}
            onJoinWard={handleJoinWard}
          />
          <DeleteWardModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            wardName={selectedWard.name}
            onDelete={confirmDeleteWard}
          />
        </>
      )}
    </div>
  )
}
