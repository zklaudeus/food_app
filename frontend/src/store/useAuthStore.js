import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('adminToken') || null,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('adminToken', token)
    } else {
      localStorage.removeItem('adminToken')
    }
    set({ token })
  },
  logout: () => {
    localStorage.removeItem('adminToken')
    set({ token: null })
  }
}))
