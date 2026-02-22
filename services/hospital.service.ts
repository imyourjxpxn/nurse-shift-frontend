// services/hospital.service.ts

export interface Hospital {
  hospitalId: string
  name: string
}

export async function getHospitals(): Promise<Hospital[]> {
  const token = localStorage.getItem('accessToken')

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hospital/getAllHospital`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch hospitals')
  }

  return res.json()
}