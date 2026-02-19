'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { ShiftConfig, NurseSchedule } from '@/lib/types'

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useUnsavedChanges(
  initialShifts: ShiftConfig[] | undefined,
  initialSchedules: NurseSchedule[] | undefined,
  isHeadNurse: boolean,
  /** Pass month+year so drafts re-sync when the user switches month */
  month?: number,
  year?: number,
) {
  const [draftShifts, setDraftShifts] = useState<ShiftConfig[] | null>(null)
  const [draftSchedules, setDraftSchedules] = useState<NurseSchedule[] | null>(null)
  const savedShiftsRef = useRef<ShiftConfig[] | null>(null)
  const savedSchedulesRef = useRef<NurseSchedule[] | null>(null)

  // Re-sync drafts whenever the source ward data changes (month switch, initial load, save)
  useEffect(() => {
    if (initialShifts && initialSchedules) {
      setDraftShifts(initialShifts)
      setDraftSchedules(initialSchedules)
      savedShiftsRef.current = initialShifts
      savedSchedulesRef.current = initialSchedules
    }
  }, [initialShifts, initialSchedules, month, year])

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
