'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, Check, X, User as UserIcon, Mail, Building2 } from 'lucide-react'
import { Header } from '@/components/header'
import { useAuth } from '@/lib/auth-context'
import { useWard } from '@/lib/ward-context'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateDisplayName } = useAuth()
  const { updateMemberNameByUserId } = useWard()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) return null

  const handleEdit = () => {
    setDraft(user.displayName)
    setEditing(true)
  }

  const handleSave = async () => {
    const trimmed = draft.trim()
    if (!trimmed || trimmed === user.displayName) {
      setEditing(false)
      return
    }
    setSaving(true)
    await updateDisplayName(trimmed)
    // Also update the member name in all wards this user belongs to
    if (user) {
      await updateMemberNameByUserId(user.id, trimmed)
    }
    setSaving(false)
    setEditing(false)
  }

  const handleCancel = () => {
    setDraft(user.displayName)
    setEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-8">
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          {'ย้อนกลับ'}
        </button>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h1 className="mb-6 text-xl font-bold text-foreground">Profile</h1>

          {/* Avatar placeholder */}
          <div className="mb-6 flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-sky-100">
              <UserIcon className="size-10 text-sky-500" />
            </div>
          </div>

          {/* Display name */}
          <div className="mb-4 rounded-lg border border-border p-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              ชื่อแสดง
            </label>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave()
                    if (e.key === 'Escape') handleCancel()
                  }}
                  disabled={saving}
                  className="h-9 flex-1 rounded-lg border border-sky-400 bg-background px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-sky-300 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full p-1.5 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                  aria-label="Save name"
                >
                  <Check className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-full p-1.5 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Cancel edit"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{user.displayName}</span>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded-full p-1.5 text-muted-foreground hover:text-sky-500 hover:bg-sky-50 transition-colors"
                  aria-label="Edit name"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4 rounded-lg border border-border p-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Email
            </label>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user.email}</span>
            </div>
          </div>

          {/* Hospital */}
          <div className="rounded-lg border border-border p-4">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              โรงพยาบาล
            </label>
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{user.hospitalName}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
