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
  hospitalName: 'Inburi Hospital',
  isRegistered: true as const,
}
