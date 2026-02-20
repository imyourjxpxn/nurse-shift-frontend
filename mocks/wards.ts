export const MOCK_WARD_ID = 'mock-med-ward'

export const defaultShifts = [
  { name: 'เวรเช้า', code: 'ช', startHour: '8', startMinute: '00', endHour: '16', endMinute: '00', nursesRequired: 5 },
  { name: 'เวรบ่าย', code: 'บ', startHour: '16', startMinute: '00', endHour: '24', endMinute: '00', nursesRequired: 4 },
  { name: 'เวรดึก', code: 'ด', startHour: '0', startMinute: '00', endHour: '8', endMinute: '00', nursesRequired: 3 },
]

// Helper to create shift entries for the multi-slot data model
const _  = { M: false, A: false, N: false, E: false, L: false, O: false }  // blank base
const M  = { ..._, M: true }   // Morning only
const A  = { ..._, A: true }   // Afternoon only
const N  = { ..._, N: true }   // Night only
const MA = { ..._, M: true, A: true }   // Morning + Afternoon
const MN = { ..._, M: true, N: true }   // Morning + Night
const E  = { ..._, E: true }   // Emergency
const L  = { ..._, L: true }   // Leave
const O  = { ..._, O: true }   // Off

function s(date: number, shifts: { M: boolean; A: boolean; N: boolean; E: boolean; L: boolean; O: boolean }) {
  return { date, shifts }
}

export function createMockMedWard() {
  return {
    id: MOCK_WARD_ID,
    name: 'อายุรกรรมชาย',
    hospitalId: '1',
    hospitalName: 'โรงพยาบาลอินท์บุรี',
    code: 'MED12345',
    createdById: 'mock-head-nurse',
    createdByName: 'พว.สมหญิง จริงใจ',
    members: [
      { id: 'member-1', name: 'พว.สมหญิง จริงใจ', role: 'head_nurse' as const, userId: 'mock-head-nurse' },
      { id: 'member-2', name: 'พว.ปรียา วงศ์กุล', role: 'nurse' as const, userId: 'nurse-2' },
      { id: 'member-3', name: 'พว.นภา ศรีสุข', role: 'nurse' as const, userId: 'nurse-3' },
      { id: 'member-4', name: 'พว.จันทร์ เพ็ญสว่าง', role: 'nurse' as const, userId: 'nurse-4' },
      { id: 'member-5', name: 'พว.มาลี ดอกไม้', role: 'nurse' as const, userId: 'nurse-5' },
      { id: 'member-6', name: 'พว.สุดา ใจดี', role: 'nurse' as const, userId: 'nurse-6' },
    ],
    shifts: [...defaultShifts],
    schedules: [
      {
        memberId: 'member-1',
        entries: [
          s(1, M), s(2, M), s(3, M), s(4, M), s(5, M), s(6, M),
          s(9, M), s(10, M), s(11, M), s(12, M), s(13, M), s(14, M),
        ],
      },
      {
        memberId: 'member-2',
        entries: [
          s(1, A), s(2, A), s(3, M), s(4, M), s(5, N), s(6, A),
          s(7, M), s(8, M), s(9, A), s(10, A), s(11, N), s(12, N),
        ],
      },
      {
        memberId: 'member-3',
        entries: [
          s(1, N), s(2, N), s(3, A), s(4, A), s(5, M), s(6, N),
          s(7, A), s(8, A), s(9, N), s(10, M), s(11, M), s(12, MA),
        ],
      },
      {
        memberId: 'member-4',
        entries: [
          s(1, M), s(2, A), s(3, N), s(4, M), s(5, A), s(6, M),
          s(7, N), s(8, N), s(9, M), s(10, A),
        ],
      },
      {
        memberId: 'member-5',
        entries: [
          s(1, A), s(2, M), s(3, M), s(4, N), s(5, M), s(6, MN),
          s(7, M), s(8, A), s(9, A), s(10, N), s(11, A),
        ],
      },
      {
        memberId: 'member-6',
        entries: [
          s(1, N), s(2, N), s(3, N), s(4, A), s(6, M),
          s(7, M), s(8, M), s(9, M),
        ],
      },
    ],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }
}
