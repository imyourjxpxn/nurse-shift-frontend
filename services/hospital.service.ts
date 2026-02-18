import { mockHospitals } from '@/mocks/hospitals'
import type { Hospital } from '@/mocks/hospitals'

// Re-export the Hospital type so consumers can import from one place
export type { Hospital }

// TODO: Replace mock implementations with real API calls (fetch/axios)
// e.g., const res = await fetch('/api/hospitals'); return res.json();

export async function getHospitals(): Promise<Hospital[]> {
  return [...mockHospitals]
}

export async function getHospitalById(id: string): Promise<Hospital | undefined> {
  return mockHospitals.find((h) => h.id === id)
}
