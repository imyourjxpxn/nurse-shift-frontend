'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Eye, EyeOff, Copy, Pencil, Check, X } from 'lucide-react'

interface WardHeaderProps {
  hospitalName: string
  wardName: string
  wardCode: string
  showCode: boolean
  copied: boolean
  isHeadNurse: boolean
  isCreator: boolean
  onBack: () => void
  onToggleCode: () => void
  onCopyCode: () => void
  onRename?: (newName: string) => void
}

export function WardHeader({
  hospitalName,
  wardName,
  wardCode,
  showCode,
  copied,
  isHeadNurse,
  isCreator,
  onBack,
  onToggleCode,
  onCopyCode,
  onRename,
}: WardHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(wardName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const canRename = isHeadNurse && isCreator && !!onRename

  const handleConfirm = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== wardName) {
      onRename?.(trimmed)
    } else {
      setDraft(wardName)
    }
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(wardName)
    setEditing(false)
  }

  return (
    <div>
      {/* Back link */}
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        {'ย้อนกลับ'}
      </button>

      {/* Hospital */}
      <div className="mb-2">
        <p className="text-lg text-foreground">{hospitalName}</p>
      </div>

      {/* Ward name -- inline editable for creator head nurse */}
      <div className="mb-4 flex items-center gap-2">
        {editing ? (
          <>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm()
                if (e.key === 'Escape') handleCancel()
              }}
              className="h-9 rounded-lg border border-sky-400 bg-background px-3 text-2xl font-bold text-sky-500 outline-none focus:ring-2 focus:ring-sky-300"
            />
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-full p-1 text-green-600 hover:bg-green-50 transition-colors"
              aria-label="Confirm rename"
            >
              <Check className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full p-1 text-red-500 hover:bg-red-50 transition-colors"
              aria-label="Cancel rename"
            >
              <X className="size-5" />
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-sky-500">{wardName}</h1>
            {canRename && (
              <button
                type="button"
                onClick={() => {
                  setDraft(wardName)
                  setEditing(true)
                }}
                className="rounded-full p-1 text-muted-foreground hover:text-sky-500 hover:bg-sky-50 transition-colors"
                aria-label="Rename ward"
              >
                <Pencil className="size-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Ward code (Head Nurse only) */}
      {isHeadNurse && (
        <div className="mb-6 flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 w-fit">
          <span className="text-sm text-muted-foreground">
            {'รหัสเข้าร่วม:'}
          </span>
          <span className="font-mono font-semibold text-foreground">
            {showCode ? wardCode : '--------'}
          </span>
          <button
            type="button"
            onClick={onToggleCode}
            className="text-muted-foreground hover:text-foreground"
          >
            {showCode ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
          <button
            type="button"
            onClick={onCopyCode}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
          {copied && (
            <span className="text-xs text-green-600">{'คัดลอกแล้ว!'}</span>
          )}
        </div>
      )}
    </div>
  )
}
