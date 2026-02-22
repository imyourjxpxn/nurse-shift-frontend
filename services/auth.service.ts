
/* ============================= */
/* Types */
/* ============================= */

export interface User {
  id: string
  email: string
  displayName: string
  hospitalId: string
  hospitalName: string
  avatarUrl?: string
  isRegistered: boolean
}

const USER_STORAGE_KEY = 'user'

/* ============================= */
/* Wait for Google SDK */
/* ============================= */

export async function extractGoogleAuth() {
  const params = new URLSearchParams(window.location.search)

  const token = params.get("accessToken")
  const complete = params.get("profileComplete")

  if (!token) {
  return null
}

  localStorage.setItem("accessToken", token)

  return {
    profileComplete: complete === "true"
  }
}

/* ============================= */
/* Google Login */
/* ============================= */

export function loginWithGoogle() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
  const redirectUri = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google` 

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  })

  window.location.href =
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}


export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem("accessToken")
  if (!token) return null

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
  localStorage.removeItem("accessToken")
  return null
  }

  return res.json()
}

/* ============================= */
/* Complete Registration */
/* ============================= */

export interface CompleteRegistrationPayload {
  email: string
  firstName: string
  lastName: string
  hospitalId: string
}

export async function completeRegistration(
  payload: CompleteRegistrationPayload
): Promise<User> {

  const token = localStorage.getItem("accessToken")

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/user/updateForCompleteProfile`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  )

  if (!res.ok) {
    throw new Error('Registration failed')
  }

  const data = await res.json()
  return data.user
}

/* ============================= */
/* Update Display Name */
/* ============================= */

export async function updateDisplayName(
  user: User,
  newName: string,
): Promise<User> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ displayName: newName }),
    },
  )

  if (!res.ok) {
    throw new Error('Failed to update display name')
  }

  const data = await res.json()
  return data.user
}

/* ============================= */
/* Logout */
/* ============================= */

export async function logout(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  clearPersistedUser()
}

/* ============================= */
/* Local Storage */
/* ============================= */

export function persistUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function getPersistedUser(): User | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  } catch {
    return null
  }
}

export function clearPersistedUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_STORAGE_KEY)
}