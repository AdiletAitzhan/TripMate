export type ProfileLocation = { city?: string; country?: string }

export type ProfilePreferences = {
  interests?: string[]
  minAge?: number
  maxAge?: number
  preferredGender?: string
  budgetRange?: { min?: number; max?: number; currency?: string }
}

export type ProfileData = {
  id?: string
  email?: string
  fullName?: string
  dateOfBirth?: string
  age?: number
  gender?: string
  location?: ProfileLocation
  profilePhoto?: string
  bio?: string
  interests?: string[]
  preferences?: ProfilePreferences
  profileComplete?: boolean
  memberSince?: string
}

export type ProfileResponse = { success: boolean; data?: ProfileData }
