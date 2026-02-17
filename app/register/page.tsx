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
import { useAuth } from '@/lib/auth-context'
import { hospitals } from '@/lib/mock-data'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, googleEmail, googleName, completeRegistration } = useAuth()

  const [firstName, setFirstName] = useState('')
  //const [LastName, setLastName] = useState('')
  const [selectedHospital, setSelectedHospital] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  useEffect(() => {
    if (googleName) {
      setFirstName(googleName)
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

  const isFormValid = firstName.trim() !== ''  && selectedHospital !== '' && acceptedTerms && acceptedPrivacy

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    const hospital = hospitals.find(h => h.id === selectedHospital)
    if (hospital) {
      completeRegistration(firstName, selectedHospital, hospital.name)
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
          
            <p className="text-muted-foreground">
              โปรดลงทะเบียนเพื่อเข้าสู่ระบบ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your full name"
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
                  <SelectValue placeholder="Select Hospital" />
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
              <h3 className="mb-2 font-semibold text-foreground">คำอธิบายเกี่ยวกับหน้าที่ในระบบของเรา</h3>
              <p className="mb-2 text-sm text-muted-foreground">
                หน้าที่ของคุณขึ้นอยู่กับวอร์ดในโรงพยาบาล:
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    ถ้าคุณเป็นผู้สร้างวอร์ดในโรงพยาบาล → คุณจะเป็น <strong className="text-foreground">หัวหน้าพยาบาล</strong>
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    หากคุณเข้าร่วมวอร์ด → คุณจะเป็น <strong className="text-foreground">พยาบาล</strong> ที่เป็นสมาชิกภายใต้วอร์ด
                  </span>
                </li>
              </ul>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  acceptedTerms
                    ? 'border-sky-500 bg-sky-500'
                    : 'border-muted-foreground/50 bg-background'
                }`}
                aria-label="Accept Terms of Service"
              >
                {acceptedTerms && (
                  <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-muted-foreground">
                I accept the{' '}
                <a href="#" className="text-sky-600 hover:underline">
                  Terms of Service
                </a>
              </span>
            </div>

            {/* Privacy Checkbox */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  acceptedPrivacy
                    ? 'border-sky-500 bg-sky-500'
                    : 'border-muted-foreground/50 bg-background'
                }`}
                aria-label="Accept Privacy Policy"
              >
                {acceptedPrivacy && (
                  <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-muted-foreground">
                I accept the{' '}
                <a href="#" className="text-sky-600 hover:underline">
                  Privacy Policy (PDPA)
                </a>
              </span>
            </div>

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
    </main>
  )
}
