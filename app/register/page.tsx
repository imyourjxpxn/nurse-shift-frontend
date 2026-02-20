'use client'

import React from "react"

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { WaneYenLogo } from '@/components/waneyen-logo'
import { LegalContentModal } from '@/components/modals/legal-content-modal'
import { TermsOfServiceContent, PrivacyPolicyContent } from '@/components/legal-content'
import { useAuth } from '@/lib/auth-context'
import { getHospitals } from '@/services/hospital.service'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, googleEmail, googleName, completeRegistration } = useAuth()

  const [hospitals, setHospitals] = useState<{ id: string; name: string }[]>([])
  const [fullName, setFullName] = useState('')
  const [selectedHospital, setSelectedHospital] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  useEffect(() => {
    getHospitals().then(setHospitals)
  }, [])

  useEffect(() => {
    if (googleName) {
      setFullName(googleName)
    }
  }, [googleName])

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    // If no google email, user hasn't started OAuth flow
    if (!googleEmail && !isAuthenticated) {
      router.replace('/login')
    }
  }, [googleEmail, isAuthenticated, router])

  const isFormValid = fullName.trim() !== '' && selectedHospital !== '' && acceptedTerms && acceptedPrivacy

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    const hospital = hospitals.find(h => h.id === selectedHospital)
    if (hospital) {
      completeRegistration(fullName, selectedHospital, hospital.name)
      router.push('/home')
    }
  }

  if (!googleEmail && !isAuthenticated) {
    return null
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-sky-600 hover:underline"
        >
          <ArrowLeft className="size-4" />
          ย้อนกลับ
        </Link>

        <div className="flex flex-col items-center gap-6">
          <WaneYenLogo size="lg" />

          <div className="w-full">
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              ลงทะเบียนผู้ใช้ใหม่
            </h1>
            <p className="text-muted-foreground">
              กรุณากรอกข้อมูลของคุณเพื่อทำการลงทะเบียน
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Email field (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                อีเมล
              </Label>
              <Input
                id="email"
                type="email"
                value={googleEmail || ''}
                disabled
                className="bg-muted/50"
              />
            </div>

            {/* Full Name field */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm text-sky-600">
                ชื่อ-นามสกุล <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="กรอกชื่อ-นามสกุลของคุณ"
                className="border-sky-300 focus-visible:border-sky-500 focus-visible:ring-sky-500/30"
              />
            </div>

            {/* Hospital Select */}
            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-sm text-sky-600">
                โรงพยาบาล <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger className="w-full border-border">
                  <SelectValue placeholder="เลือกโรงพยาบาล" />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* About Roles Info Box */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <h3 className="mb-2 font-semibold text-foreground">เกี่ยวกับหน้าที่ในระบบ</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                หน้าที่ของคุณในระบบจะถูกกำหนดโดยการกระทำของคุณหลังจากนี้:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    สร้างวอร์ด → คุณจะเป็น <strong className="text-foreground">หัวหน้าพยาบาล</strong> ในระบบ
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    เข้าร่วมวอร์ด → คุณจะเป็น <strong className="text-foreground">พยาบาล</strong> ในระบบ
                  </span>
                </li>
              </ul>
            </div>

            {/* Terms Checkbox -- opens modal, cannot toggle directly */}
            <button
              type="button"
              onClick={() => {
                if (!acceptedTerms) setTermsModalOpen(true)
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-transparent px-1 py-1 text-left transition-colors hover:bg-muted/40"
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  acceptedTerms
                    ? 'border-sky-500 bg-sky-500'
                    : 'border-muted-foreground/50 bg-background'
                }`}
                aria-hidden="true"
              >
                {acceptedTerms && (
                  <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {'ฉันยอมรับ '}
                <span className="text-sky-600 underline">เงื่อนไขการใช้งาน</span>
                {acceptedTerms
                  ? <span className="ml-1 text-xs text-green-600 font-medium">(ยอมรับแล้ว)</span>
                  : <span className="ml-1 text-xs text-destructive font-medium">(กรุณากดยอมรับ)</span>
                }
              </span>
            </button>

            {/* Privacy Checkbox -- opens modal, cannot toggle directly */}
            <button
              type="button"
              onClick={() => {
                if (!acceptedPrivacy) setPrivacyModalOpen(true)
              }}
              className="flex w-full items-center gap-3 rounded-lg border border-transparent px-1 py-1 text-left transition-colors hover:bg-muted/40"
            >
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  acceptedPrivacy
                    ? 'border-sky-500 bg-sky-500'
                    : 'border-muted-foreground/50 bg-background'
                }`}
                aria-hidden="true"
              >
                {acceptedPrivacy && (
                  <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {'ฉันยอมรับ '}
                <span className="text-sky-600 underline">นโยบายความเป็นส่วนตัว (PDPA)</span>
                {acceptedPrivacy
                  ? <span className="ml-1 text-xs text-green-600 font-medium">(ยอมรับแล้ว)</span>
                  : <span className="ml-1 text-xs text-destructive font-medium">(กรุณากดยอมรับ)</span>
                }
              </span>
            </button>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid}
              className="h-12 w-full bg-sky-400 text-white hover:bg-sky-500 disabled:bg-sky-300 disabled:opacity-70"
            >
              ยืนยันการลงทะเบียน
            </Button>
          </form>
        </div>
      </div>

      {/* Terms of Service modal */}
      <LegalContentModal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        title="Terms of Service"
        onAccept={() => setAcceptedTerms(true)}
      >
        <TermsOfServiceContent />
      </LegalContentModal>

      {/* Privacy Policy modal */}
      <LegalContentModal
        open={privacyModalOpen}
        onOpenChange={setPrivacyModalOpen}
        title="Privacy Policy (PDPA)"
        onAccept={() => setAcceptedPrivacy(true)}
      >
        <PrivacyPolicyContent />
      </LegalContentModal>
    </main>
  )
}
