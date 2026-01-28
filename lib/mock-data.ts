import { Hospital, Ward } from './types'

export const hospitals: Hospital[] = [
  { id: '1', name: 'Inburi Hospital' },
  { id: '2', name: 'Bangkok General Hospital' },
  { id: '3', name: 'Siriraj Hospital' },
  { id: '4', name: 'Ramathibodi Hospital' },
  { id: '5', name: 'Chulalongkorn Hospital' },
]

export const wards: Ward[] = [
  { id: '1', name: 'Emergency Ward', hospitalId: '1' },
  { id: '2', name: 'ICU', hospitalId: '1' },
  { id: '3', name: 'Pediatrics', hospitalId: '1' },
  { id: '4', name: 'Surgery', hospitalId: '2' },
  { id: '5', name: 'Cardiology', hospitalId: '2' },
]

export const mockGoogleUser = {
  email: 'user1769634240440@gmail.com',
  name: 'Google User',
  avatarUrl: undefined,
}
