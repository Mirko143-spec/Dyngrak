import { create } from 'zustand'
import type { UserProfile, Gender } from '../types'

const LOCAL_PROFILE_KEY = 'dyngrak_profile'

function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

interface UserStore {
  user: null
  profile: UserProfile | null
  loading: boolean
  init: () => Promise<void>
  updateProfile: (weight_kg: number, gender: Gender, name?: string) => Promise<void>
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  profile: loadLocalProfile(),
  loading: false,

  init: async () => {
    set({ profile: loadLocalProfile(), loading: false })
  },

  updateProfile: async (weight_kg, gender, name) => {
    const profile: UserProfile = {
      id: 'local',
      user_id: 'local',
      name,
      weight_kg,
      gender,
      created_at: new Date().toISOString(),
    }
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile))
    set({ profile })
  },
}))
