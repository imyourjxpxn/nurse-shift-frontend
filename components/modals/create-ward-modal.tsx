'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface CreateWardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateWard: (name: string) => void
}

export function CreateWardModal({
  open,
  onOpenChange,
  onCreateWard,
}: CreateWardModalProps) {
  const [wardName, setWardName] = useState('')

  const handleCreate = () => {
    if (wardName.trim()) {
      onCreateWard(wardName.trim())
      setWardName('')
    }
  }

  const handleClose = () => {
    setWardName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">สร้างวอร์ด</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="กรอกชื่อวอร์ด"
            value={wardName}
            onChange={(e) => setWardName(e.target.value)}
            className="border-sky-300 focus-visible:ring-sky-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
            }}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!wardName.trim()}
            className="bg-sky-500 text-white hover:bg-sky-600"
          >
            สร้าง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
