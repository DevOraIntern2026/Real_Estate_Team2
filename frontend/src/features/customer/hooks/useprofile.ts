import { create } from 'zustand'
import { profileService } from '../components/profile.service'
import type { Inquiry, InquiryQuery } from '../schema/inquiry.schema'
import type { User } from '../types/user'

interface ProfileState {
  user: User | null
  inquiries: Inquiry[]
  total: number
  inquiriesLoading: boolean
  query: InquiryQuery
  fetchUser: () => Promise<void>
  saveUser: (data: Partial<User>) => Promise<void>
  setQuery: (patch: Partial<InquiryQuery>) => void
  fetchInquiries: () => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  inquiries: [],
  total: 0,
  inquiriesLoading: false,
  query: { status: 'all', search: '', sort: 'newest', page: 1, limit: 4 },

  fetchUser: async () => set({ user: await profileService.getMe() }),

  saveUser: async (data) => set({ user: await profileService.updateMe(data) }),

  // Any filter change resets to page 1 unless page is set explicitly
  setQuery: (patch) =>
    set((s) => ({ query: { ...s.query, page: 1, ...patch } })),

  fetchInquiries: async () => {
    set({ inquiriesLoading: true })
    try {
      const res = await profileService.getInquiries(get().query)
      set({ inquiries: res.items, total: res.total })
    } finally {
      set({ inquiriesLoading: false })
    }
  },
}))
