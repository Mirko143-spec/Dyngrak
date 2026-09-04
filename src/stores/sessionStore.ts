import { create } from 'zustand'
import type { SessionInput, BacResult, BarRoute } from '../types'

interface SessionStore {
  sessionInput: SessionInput | null
  bacResult: BacResult | null
  routes: BarRoute[] | null
  setSessionInput: (input: SessionInput) => void
  setBacResult: (result: BacResult) => void
  setRoutes: (routes: BarRoute[]) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionInput: null,
  bacResult: null,
  routes: null,
  setSessionInput: (input) => set({ sessionInput: input }),
  setBacResult: (result) => set({ bacResult: result }),
  setRoutes: (routes) => set({ routes }),
  reset: () => set({ sessionInput: null, bacResult: null, routes: null }),
}))
