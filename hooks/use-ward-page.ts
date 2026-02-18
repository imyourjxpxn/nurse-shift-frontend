'use client'

import { useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useWard } from '@/lib/ward-context'
import { useUnsavedChanges } from './use-unsaved-changes'
import type { ShiftConfig, NurseSchedule, Ward } from '@/lib/types'

export function useWardPage() {
  const routeParams = useParams<{ id: string }>()
  const wardId = routeParams.id
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const {
    isHydrated,
    getWardById,
    getUserRole,
    updateShiftConfig,
    updateSchedule,
    clearSchedule,
    deleteWard,
  } = useWard()

  const ward = getWardById(wardId)
  const userRole = user ? getUserRole(wardId, user.id) : null
  const isHeadNurse = userRole === 'head_nurse'

  const {
    draftShifts,
    draftSchedules,
    setDraftShifts,
    setDraftSchedules,
    hasUnsavedChanges,
    markAsSaved,
    revertToSaved,
  } = useUnsavedChanges(ward?.shifts, ward?.schedules, isHeadNurse)

  // Ward with draft overlays for display
  const displayWard: Ward | undefined =
    ward && draftShifts && draftSchedules
      ? { ...ward, shifts: draftShifts, schedules: draftSchedules }
      : ward

  // --- Modal states ---
  const [showCode, setShowCode] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shiftSelectorOpen, setShiftSelectorOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    memberId: string
    date: number
    currentShift: string
  } | null>(null)

  // --- Actions ---
  const handleSave = useCallback(() => {
    if (!ward || !draftShifts || !draftSchedules) return
    updateShiftConfig(ward.id, draftShifts)
    clearSchedule(ward.id)
    for (const schedule of draftSchedules) {
      for (const entry of schedule.entries) {
        updateSchedule(ward.id, schedule.memberId, entry.date, entry.shiftCode)
      }
    }
    markAsSaved()
  }, [
    ward,
    draftShifts,
    draftSchedules,
    updateShiftConfig,
    updateSchedule,
    clearSchedule,
    markAsSaved,
  ])

  const handleClear = useCallback(() => {
    revertToSaved()
  }, [revertToSaved])

  const handleBackNavigation = useCallback(() => {
    if (hasUnsavedChanges) {
      setUnsavedModalOpen(true)
    } else {
      router.push('/home')
    }
  }, [hasUnsavedChanges, router])

  const handleCopyCode = useCallback(async () => {
    if (!ward) return
    await navigator.clipboard.writeText(ward.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [ward])

  const handleShiftConfigChange = useCallback(
    (index: number, newShift: ShiftConfig) => {
      if (!draftShifts) return
      const newShifts = [...draftShifts]
      newShifts[index] = newShift
      setDraftShifts(newShifts)
    },
    [draftShifts, setDraftShifts]
  )

  const handleNursesRequiredChange = useCallback(
    (index: number, value: string) => {
      if (!draftShifts) return
      const numValue = Number.parseInt(value) || 0
      const newShifts = [...draftShifts]
      newShifts[index] = { ...newShifts[index], nursesRequired: numValue }
      setDraftShifts(newShifts)
    },
    [draftShifts, setDraftShifts]
  )

  const handleCellClick = useCallback(
    (memberId: string, date: number, currentShift: string) => {
      setSelectedCell({ memberId, date, currentShift })
      setShiftSelectorOpen(true)
    },
    []
  )

  const handleShiftSelect = useCallback(
    (shiftCode: string) => {
      if (!selectedCell || !draftSchedules) return

      const newSchedules = [...draftSchedules]
      const existingIdx = newSchedules.findIndex(
        (s) => s.memberId === selectedCell.memberId
      )

      if (existingIdx === -1) {
        if (shiftCode) {
          newSchedules.push({
            memberId: selectedCell.memberId,
            entries: [{ date: selectedCell.date, shiftCode }],
          })
        }
      } else {
        const schedule = { ...newSchedules[existingIdx] }
        const entryIdx = schedule.entries.findIndex(
          (e) => e.date === selectedCell.date
        )

        if (shiftCode === '') {
          schedule.entries = schedule.entries.filter(
            (e) => e.date !== selectedCell.date
          )
        } else if (entryIdx === -1) {
          schedule.entries = [
            ...schedule.entries,
            { date: selectedCell.date, shiftCode },
          ]
        } else {
          schedule.entries = schedule.entries.map((e) =>
            e.date === selectedCell.date ? { ...e, shiftCode } : e
          )
        }
        newSchedules[existingIdx] = schedule
      }

      setDraftSchedules(newSchedules)
      setSelectedCell(null)
    },
    [selectedCell, draftSchedules, setDraftSchedules]
  )

  const handleDeleteWard = useCallback(() => {
    if (!ward || !user) return
    deleteWard(ward.id, user.id)
    setDeleteModalOpen(false)
    router.replace('/home')
  }, [ward, user, deleteWard, router])

  return {
    // Auth state
    user,
    isAuthenticated,
    isHydrated,

    // Ward data
    ward,
    displayWard,
    userRole,
    isHeadNurse,

    // Unsaved changes
    hasUnsavedChanges,

    // Code visibility
    showCode,
    setShowCode,
    copied,
    handleCopyCode,

    // Modal states
    shiftSelectorOpen,
    setShiftSelectorOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    unsavedModalOpen,
    setUnsavedModalOpen,
    selectedCell,

    // Actions
    handleSave,
    handleClear,
    handleBackNavigation,
    handleShiftConfigChange,
    handleNursesRequiredChange,
    handleCellClick,
    handleShiftSelect,
    handleDeleteWard,

    // Navigation
    router,
  }
}
