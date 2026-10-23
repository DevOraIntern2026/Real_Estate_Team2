import { create } from 'zustand'
import { profileService } from '../components/profile.service'
import type { Inquiry, InquiryQuery } from '../schema/inquiry.schema'
import type { User } from '../types/user'

interface ProfileState {
  user: User | null
  profileLoading: boolean
  profileError: string | null
  inquiries: Inquiry[]
  total: number
  inquiriesLoading: boolean
  inquiriesError: string | null
  query: InquiryQuery
  fetchUser: () => Promise<void>
  saveUser: (data: Partial<User>) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  removeAvatar: () => Promise<void>
  setQuery: (patch: Partial<InquiryQuery>) => void
  fetchInquiries: () => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  profileLoading: false,
  profileError: null,
  inquiries: [],
  total: 0,
  inquiriesLoading: false,
  inquiriesError: null,
  query: { status: 'all', search: '', sort: 'newest', page: 1, limit: 4 },

  fetchUser: async () => {
    if (get().profileLoading) return
    set({ profileLoading: true, profileError: null })
    try {
      set({ user: await profileService.getMe() })
    } catch (error) {
      set({ profileError: error instanceof Error ? error.message : 'Could not load profile.' })
      throw error
    } finally {
      set({ profileLoading: false })
    }
  },

  saveUser: async (data) => {
    const user = get().user
    if (!user) throw new Error('Load your profile before saving changes.')
    set({ user: await profileService.updateMe(user, data) })
  },

  uploadAvatar: async (file) => {
    const user = get().user
    if (!user) throw new Error('Load your profile before uploading a photo.')
    set({ user: await profileService.uploadAvatar(user, file) })
  },

  removeAvatar: async () => {
    const user = get().user
    if (!user) throw new Error('Load your profile before removing its photo.')
    set({ user: await profileService.removeAvatar(user) })
  },

  // Any filter change resets to page 1 unless page is set explicitly
  setQuery: (patch) =>
    set((s) => ({ query: { ...s.query, page: 1, ...patch } })),

  fetchInquiries: async () => {
    set({ inquiriesLoading: true, inquiriesError: null })
    try {
      const res = await profileService.getInquiries(get().query)
      set({ inquiries: res.items, total: res.total })
    } catch (error) {
      set({ inquiriesError: error instanceof Error ? error.message : 'Could not load your inquiries.' })
    } finally {
      set({ inquiriesLoading: false })
    }
  },
}))
