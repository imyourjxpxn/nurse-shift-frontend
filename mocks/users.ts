/** Simulated data returned from Google OAuth */
export const mockGoogleProfile = {
  email: 'user1769634240440@gmail.com',
  name: 'Google User',
  avatarUrl: undefined as string | undefined,
}

/** Pre-built head-nurse user for dev mock sign-in */
export const mockHeadNurseUser = {
  id: 'mock-head-nurse',
  email: 'headnurse@mock.dev',
  displayName: 'พว.สมหญิง จริงใจ',
  hospitalId: '1',
  hospitalName: 'โรงพยาบาลอินท์บุรี',
  isRegistered: true as const,
}

/** All selectable mock users for the dev login screen */
export const mockUsers = [
  {
    id: 'mock-head-nurse',
    email: 'headnurse@mock.dev',
    displayName: 'พว.สมหญิง จริงใจ',
    hospitalId: '1',
    hospitalName: 'โรงพยาบาลอินท์บุรี',
    isRegistered: true as const,
    label: 'A',
    role: 'Head Nurse' as const,
  },
  {
    id: 'nurse-2',
    email: 'nurse2@mock.dev',
    displayName: 'พว.ปรียา วงศ์กุล',
    hospitalId: '1',
    hospitalName: 'โรงพยาบาลอินท์บุรี',
    isRegistered: true as const,
    label: 'B',
    role: 'Nurse' as const,
  },
  {
    id: 'nurse-3',
    email: 'nurse3@mock.dev',
    displayName: 'พว.นภา ศรีสุข',
    hospitalId: '1',
    hospitalName: 'โรงพยาบาลอินท์บุรี',
    isRegistered: true as const,
    label: 'C',
    role: 'Nurse' as const,
  },
] as const
