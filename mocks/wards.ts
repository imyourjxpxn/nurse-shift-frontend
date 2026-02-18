export const MOCK_WARD_ID = 'mock-med-ward'

export const defaultShifts = [
  { name: 'เวรเช้า', code: 'ช', startHour: '8', startMinute: '00', endHour: '16', endMinute: '00', nursesRequired: 5 },
  { name: 'เวรบ่าย', code: 'บ', startHour: '16', startMinute: '00', endHour: '24', endMinute: '00', nursesRequired: 4 },
  { name: 'เวรดึก', code: 'ด', startHour: '0', startMinute: '00', endHour: '8', endMinute: '00', nursesRequired: 3 },
]

export function createMockMedWard() {
  return {
    id: MOCK_WARD_ID,
    name: 'MED',
    hospitalId: '1',
    hospitalName: 'Inburi Hospital',
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
          { date: 1, shiftCode: 'ช' }, { date: 2, shiftCode: 'ช' }, { date: 3, shiftCode: 'ช' },
          { date: 4, shiftCode: 'ช' }, { date: 5, shiftCode: 'ช' }, { date: 6, shiftCode: 'ช' },
          { date: 9, shiftCode: 'ช' }, { date: 10, shiftCode: 'ช' }, { date: 11, shiftCode: 'ช' },
          { date: 12, shiftCode: 'ช' }, { date: 13, shiftCode: 'ช' }, { date: 14, shiftCode: 'ช' },
        ],
      },
      {
        memberId: 'member-2',
        entries: [
          { date: 1, shiftCode: 'บ' }, { date: 2, shiftCode: 'บ' }, { date: 3, shiftCode: 'ช' },
          { date: 4, shiftCode: 'ช' }, { date: 5, shiftCode: 'ด' }, { date: 6, shiftCode: 'บ' },
          { date: 7, shiftCode: 'ช' }, { date: 8, shiftCode: 'ช' }, { date: 9, shiftCode: 'บ' },
          { date: 10, shiftCode: 'บ' }, { date: 11, shiftCode: 'ด' }, { date: 12, shiftCode: 'ด' },
        ],
      },
      {
        memberId: 'member-3',
        entries: [
          { date: 1, shiftCode: 'ด' }, { date: 2, shiftCode: 'ด' }, { date: 3, shiftCode: 'บ' },
          { date: 4, shiftCode: 'บ' }, { date: 5, shiftCode: 'ช' }, { date: 6, shiftCode: 'ด' },
          { date: 7, shiftCode: 'บ' }, { date: 8, shiftCode: 'บ' }, { date: 9, shiftCode: 'ด' },
          { date: 10, shiftCode: 'ช' }, { date: 11, shiftCode: 'ช' }, { date: 12, shiftCode: 'E' },
        ],
      },
      {
        memberId: 'member-4',
        entries: [
          { date: 1, shiftCode: 'ช' }, { date: 2, shiftCode: 'บ' }, { date: 3, shiftCode: 'ด' },
          { date: 4, shiftCode: 'ช' }, { date: 5, shiftCode: 'บ' }, { date: 6, shiftCode: 'ช' },
          { date: 7, shiftCode: 'ด' }, { date: 8, shiftCode: 'ด' }, { date: 9, shiftCode: 'ช' },
          { date: 10, shiftCode: 'บ' },
        ],
      },
      {
        memberId: 'member-5',
        entries: [
          { date: 1, shiftCode: 'บ' }, { date: 2, shiftCode: 'ช' }, { date: 3, shiftCode: 'ช' },
          { date: 4, shiftCode: 'ด' }, { date: 5, shiftCode: 'ช' }, { date: 6, shiftCode: 'E' },
          { date: 7, shiftCode: 'ช' }, { date: 8, shiftCode: 'บ' }, { date: 9, shiftCode: 'บ' },
          { date: 10, shiftCode: 'ด' }, { date: 11, shiftCode: 'บ' },
        ],
      },
      {
        memberId: 'member-6',
        entries: [
          { date: 1, shiftCode: 'ด' }, { date: 2, shiftCode: 'ด' }, { date: 3, shiftCode: 'ด' },
          { date: 4, shiftCode: 'บ' }, { date: 5, shiftCode: 'ล' }, { date: 6, shiftCode: 'ช' },
          { date: 7, shiftCode: 'ช' }, { date: 8, shiftCode: 'ช' }, { date: 9, shiftCode: 'ช' },
          { date: 10, shiftCode: 'ล' },
        ],
      },
    ],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  }
}
