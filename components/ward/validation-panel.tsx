'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { ValidationIssue } from '@/lib/schedule-validator'

const INITIAL_VISIBLE = 10

interface ValidationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warnings: ValidationIssue[]
}

export function ValidationPanel({ open, onOpenChange, warnings }: ValidationPanelProps) {
  const [showAll, setShowAll] = useState(false)

  const visibleWarnings = showAll ? warnings : warnings.slice(0, INITIAL_VISIBLE)
  const hasMore = warnings.length > INITIAL_VISIBLE

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border bg-amber-50 px-6 pt-6 pb-4">
          <SheetTitle className="flex items-center gap-2.5 text-base font-bold text-amber-900">
            <AlertTriangle className="size-5 text-amber-600" />
            {'Validation Warnings (' + warnings.length + ')'}
          </SheetTitle>
        </SheetHeader>

        {/* Scrollable body -- isolated from main page */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {warnings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No warnings found. Schedule looks good.
            </p>
          ) : (
            <ul className="space-y-2">
              {visibleWarnings.map((w, i) => {
                const isConsecutive = w.type === 'consecutive'
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                      isConsecutive
                        ? 'border-rose-200 bg-rose-50/60'
                        : 'border-amber-200 bg-amber-50/60'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        isConsecutive
                          ? 'bg-rose-400 text-rose-950'
                          : 'bg-amber-400 text-amber-950'
                      }`}
                    >
                      {isConsecutive ? '!' : w.day}
                    </span>
                    <span className="text-sm text-foreground">{w.message}</span>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Show All / Show Less toggle */}
          {hasMore && (
            <div className="mt-4">
              {!showAll ? (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="w-full rounded-lg border border-amber-300 bg-amber-50 py-2 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-100"
                >
                  {'Show All (' + warnings.length + ' warnings)'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAll(false)}
                  className="w-full rounded-lg border border-border bg-muted py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80"
                >
                  Show Less
                </button>
              )}
            </div>
          )}

          {!showAll && hasMore && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {'Showing ' + INITIAL_VISIBLE + ' of ' + warnings.length + ' warnings'}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
