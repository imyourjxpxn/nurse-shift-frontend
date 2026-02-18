'use client'

import { useState, useCallback, useRef } from 'react'
import type { ShiftConfig, NurseSchedule } from '@/lib/types'

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useUnsavedChanges(
  initialShifts: ShiftConfig[] | undefined,
  initialSchedules: NurseSchedule[] | undefined,
  isHeadNurse: boolean
) {
  const [draftShifts, setDraftShifts] = useState<ShiftConfig[] | null>(null)
  const [draftSchedules, setDraftSchedules] = useState<NurseSchedule[] | null>(
    null
  )
  const savedShiftsRef = useRef<ShiftConfig[] | null>(null)
  const savedSchedulesRef = useRef<NurseSchedule[] | null>(null)
  const initialized = useRef(false)

  // Initialize draft state from ward data (call once when ward loads)
  if (initialShifts && initialSchedules && !initialized.current) {
    setDraftShifts(initialShifts)
    setDraftSchedules(initialSchedules)
    savedShiftsRef.current = initialShifts
    savedSchedulesRef.current = initialSchedules
    initialized.current = true
  }

  const hasUnsavedChanges =
    isHeadNurse &&
    draftShifts !== null &&
    draftSchedules !== null &&
    (!deepEqual(draftShifts, savedShiftsRef.current) ||
      !deepEqual(draftSchedules, savedSchedulesRef.current))

  const markAsSaved = useCallback(() => {
    savedShiftsRef.current = draftShifts
    savedSchedulesRef.current = draftSchedules
  }, [draftShifts, draftSchedules])

  const revertToSaved = useCallback(() => {
    if (savedShiftsRef.current) setDraftShifts(savedShiftsRef.current)
    if (savedSchedulesRef.current) setDraftSchedules(savedSchedulesRef.current)
  }, [])

  return {
    draftShifts,
    draftSchedules,
    setDraftShifts,
    setDraftSchedules,
    hasUnsavedChanges,
    markAsSaved,
    revertToSaved,
  }
}
