import { MOCK_WARD_ID } from '@/mocks/wards'

// Re-declare type locally (หรือจะ import จาก lib/types ก็ได้)
export interface SwapRequest {
 id: string
  wardId: string
  fromNurseId: string
  fromNurseName: string
  toNurseId: string
  toNurseName: string
  fromDate: number
  toDate: number
  fromShiftCode: string
  toShiftCode: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  createdAt: string
  month: number
  year: number
}

const now = new Date().toISOString()

// 👇 แยก mock data มาอยู่ที่นี่

export let mockSwapRequests: SwapRequest[] = [
  {
    id: 'swap-1',
    wardId: MOCK_WARD_ID,
    fromNurseId: 'member-2',
    fromNurseName: 'พว.ปรียา วงศ์กุล',
    toNurseId: 'member-3',
    toNurseName: 'พว.นภา ศรีสุข',
    fromDate: 1,
    toDate: 3,
    fromShiftCode: 'บ',
    toShiftCode: 'บ',
    reason: 'ติดธุระส่วนตัว',
    status: 'pending',
    createdAt: now,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'swap-2',
    wardId: MOCK_WARD_ID,
    fromNurseId: 'member-4',
    fromNurseName: 'พว.จันทร์ เพ็ญสว่าง',
    toNurseId: 'member-2',
    toNurseName: 'พว.ปรียา วงศ์กุล',
    fromDate: 5,
    toDate: 7,
    fromShiftCode: 'บ',
    toShiftCode: 'ช',
    reason: 'ต้องพาแม่ไปหาหมอ',
    status: 'pending',
    createdAt: now,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'swap-3',
    wardId: MOCK_WARD_ID,
    fromNurseId: 'member-3',
    fromNurseName: 'พว.นภา ศรีสุข',
    toNurseId: 'member-5',
    toNurseName: 'พว.มาลี ดอกไม้',
    fromDate: 2,
    toDate: 4,
    fromShiftCode: 'ด',
    toShiftCode: 'ด',
    reason: 'แลกเวรเพื่อเรียน',
    status: 'approved',
    createdAt: now,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
  {
    id: 'swap-4',
    wardId: MOCK_WARD_ID,
    fromNurseId: 'member-5',
    fromNurseName: 'พว.มาลี ดอกไม้',
    toNurseId: 'member-6',
    toNurseName: 'พว.สุดา ใจดี',
    fromDate: 8,
    toDate: 10,
    fromShiftCode: 'บ',
    toShiftCode: 'ล',
    reason: 'มีนัดสำคัญ',
    status: 'rejected',
    createdAt: now,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  },
]
