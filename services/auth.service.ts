import { mockGoogleProfile, mockUsers } from '@/mocks/users'

interface User {
  id: string
  email: string
  displayName: string
  hospitalId: string
  hospitalName: string
  avatarUrl?: string
  isRegistered: boolean
}

const USER_STORAGE_KEY = 'waneyen_user'

// TODO: Replace mock implementations with real API calls
// e.g., POST /api/auth/google, POST /api/auth/register, POST /api/auth/logout

/** Simulate Google OAuth and return Google profile data */
export async function loginWithGoogle(): Promise<{
  isNewUser: boolean
  email: string
  name: string
  existingUser?: User
}> {
  await new Promise((r) => setTimeout(r, 1000))

  const storedUser = localStorage.getItem(USER_STORAGE_KEY)
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser) as User
      if (parsed.isRegistered) {
        return { isNewUser: false, email: parsed.email, name: parsed.displayName, existingUser: parsed }
      }
    } catch {
      // corrupted storage – treat as new
    }
  }

  return { isNewUser: true, email: mockGoogleProfile.email, name: mockGoogleProfile.name }
}

/** Return a mock user by userId (dev-only shortcut) */
export async function loginAsMockUser(userId: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 50))
  const found = mockUsers.find((u) => u.id === userId)
  if (!found) throw new Error(`Mock user not found: ${userId}`)
  return {
    id: found.id,
    email: found.email,
    displayName: found.displayName,
    hospitalId: found.hospitalId,
    hospitalName: found.hospitalName,
    isRegistered: found.isRegistered,
  }
}

/** Return the list of all available mock users (for dev login UI) */
export function getMockUsers() {
  return mockUsers
}

/** Complete first-time registration */
export async function completeRegistration(
  email: string,
  displayName: string,
  hospitalId: string,
  hospitalName: string,
): Promise<User> {
  await new Promise((r) => setTimeout(r, 300))

  const newUser: User = {
    id: crypto.randomUUID(),
    email,
    displayName,
    hospitalId,
    hospitalName,
    isRegistered: true,
  }

  return newUser
}

/** Update user display name */
export async function updateDisplayName(user: User, newName: string): Promise<User> {
  await new Promise((r) => setTimeout(r, 100))
  return { ...user, displayName: newName }
}

/** Persist the authenticated user to local storage (client-side session) */
export function persistUser(user: User): void {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

/** Read persisted user from local storage */
export function getPersistedUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  } catch {
    return null
  }
}

/** Clear the persisted session */
export function clearPersistedUser(): void {
  localStorage.removeItem(USER_STORAGE_KEY)
}
