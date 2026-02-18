'use client'

import { ArrowLeft, Eye, EyeOff, Copy } from 'lucide-react'

interface WardHeaderProps {
  hospitalName: string
  wardName: string
  wardCode: string
  showCode: boolean
  copied: boolean
  isHeadNurse: boolean
  onBack: () => void
  onToggleCode: () => void
  onCopyCode: () => void
}

export function WardHeader({
  hospitalName,
  wardName,
  wardCode,
  showCode,
  copied,
  isHeadNurse,
  onBack,
  onToggleCode,
  onCopyCode,
}: WardHeaderProps) {
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

      {/* Hospital + Ward name */}
      <div className="mb-2">
        <p className="text-lg text-foreground">{hospitalName}</p>
      </div>
      <h1 className="mb-4 text-2xl font-bold text-sky-500">{wardName}</h1>

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
