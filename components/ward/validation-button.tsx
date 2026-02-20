'use client'

interface ValidationButtonProps {
  /** null = never validated, [] = no warnings, [..] = has warnings */
  warnings: import('@/lib/schedule-validator').ValidationIssue[] | null
  onClick: () => void
}

export function ValidationButton({ warnings, onClick }: ValidationButtonProps) {
  // Only show when validation has been run (non-null) AND there are warnings
  if (warnings === null || warnings.length === 0) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-6 top-20 z-40 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-amber-950 shadow-lg transition-colors hover:bg-amber-500 active:bg-amber-600"
    >
      {'พบข้อผิดพลาด : ' + warnings.length + ' แจ้งเตือน' }
    </button>
  )
}
