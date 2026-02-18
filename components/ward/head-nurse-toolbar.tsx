'use client'

import { Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeadNurseToolbarProps {
  hasUnsavedChanges: boolean
  onSwapHistory: () => void
  onClear: () => void
  onExport: () => void
  onSave: () => void
  onDelete: () => void
}

export function HeadNurseToolbar({
  hasUnsavedChanges,
  onSwapHistory,
  onClear,
  onExport,
  onSave,
  onDelete,
}: HeadNurseToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="rounded-full bg-orange-500 px-5 text-white hover:bg-orange-600"
        onClick={onSwapHistory}
      >
        {'ประวัติการแลกเวร'}
      </Button>
      <Button
        variant="outline"
        className="rounded-full border-red-300 text-red-500 hover:bg-red-50 bg-transparent"
        onClick={onClear}
        disabled={!hasUnsavedChanges}
      >
        {'ล้างข้อมูล'}
      </Button>
      <Button
        variant="outline"
        className="rounded-full border-green-400 text-green-600 hover:bg-green-50 bg-transparent"
        onClick={onExport}
      >
        Export
      </Button>
      <Button
        className="rounded-full bg-sky-500 px-5 text-white hover:bg-sky-600 disabled:opacity-50"
        onClick={onSave}
        disabled={!hasUnsavedChanges}
      >
        <Save className="mr-1.5 size-4" />
        {'บันทึก'}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="rounded-lg border-red-200 text-red-500 hover:bg-red-50 bg-transparent"
        onClick={onDelete}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
