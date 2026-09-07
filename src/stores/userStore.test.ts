import { beforeEach, describe, expect, it } from 'vitest'
import { useUserStore } from './userStore'

const LOCAL_PROFILE_KEY = 'dyngrak_profile'

function createMemoryStorage(): Storage {
  const store = new Map<string, string>()
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size
    },
  } as Storage
}

beforeEach(() => {
  globalThis.localStorage = createMemoryStorage()
  useUserStore.setState({ profile: null })
})

describe('userStore.updateProfile', () => {
  it('rejects a weight below 40kg', async () => {
    const result = await useUserStore.getState().updateProfile(30, 'male')
    expect(result.ok).toBe(false)
  })

  it('rejects a weight above 250kg', async () => {
    const result = await useUserStore.getState().updateProfile(300, 'male')
    expect(result.ok).toBe(false)
  })

  it('rejects an unparsable (NaN) weight', async () => {
    const result = await useUserStore.getState().updateProfile(NaN, 'male')
    expect(result.ok).toBe(false)
  })

  it('saves a valid profile and updates the store', async () => {
    const result = await useUserStore.getState().updateProfile(80, 'female', 'Kim')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.profile.weight_kg).toBe(80)
      expect(result.profile.gender).toBe('female')
      expect(result.profile.name).toBe('Kim')
    }
    expect(useUserStore.getState().profile?.weight_kg).toBe(80)
  })

  it('persists a valid profile to localStorage', async () => {
    await useUserStore.getState().updateProfile(70, 'male')

    const raw = localStorage.getItem(LOCAL_PROFILE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!).weight_kg).toBe(70)
  })

  it('leaves localStorage and store state untouched when validation fails', async () => {
    await useUserStore.getState().updateProfile(1000, 'male')

    expect(localStorage.getItem(LOCAL_PROFILE_KEY)).toBeNull()
    expect(useUserStore.getState().profile).toBeNull()
  })
})
