import { useState } from 'react'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { R_FACTOR } from '../../lib/widmark'
import { useUserStore } from '../../stores/userStore'
import type { Gender } from '../../types'

export function ProfileCard() {
  const { profile, updateProfile } = useUserStore()
  const [name, setName] = useState(profile?.name ?? '')
  const [weight, setWeight] = useState(profile?.weight_kg ? String(profile.weight_kg) : '')
  const [gender, setGender] = useState<Gender>(profile?.gender ?? 'male')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(profile)

  const submit = async () => {
    const result = await updateProfile(parseFloat(weight), gender, name || undefined)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError('')
    setSaved(result.profile)
  }

  return (
    <Card>
      <h2 className="font-display font-semibold text-xl mb-1">1. Profil</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-soft)' }}>
        Krävs för Widmarks formel. Sparas bara i din webbläsare.
      </p>

      <div className="flex flex-col gap-4">
        <Input label="Namn (valfritt)" value={name} onChange={setName} placeholder="t.ex. Per" />
        <Input label="Vikt (kg)" value={weight} onChange={setWeight} type="number" min={40} max={250} placeholder="t.ex. 75" />

        <div className="flex flex-col gap-2">
          <label className="font-mono-label text-[11px] tracking-widest text-[var(--label)] uppercase">
            Kön (fördelningskonstant r)
          </label>
          <div className="flex gap-3">
            {(['male', 'female'] as Gender[]).map(g => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl border font-medium transition-all cursor-pointer ${
                  gender === g ? 'text-[#2a1a06] border-transparent' : 'border-[var(--input-border)] text-[var(--text-soft)] hover:border-[var(--accent)]'
                }`}
                style={gender === g ? { background: 'var(--accent-grad)' } : undefined}
              >
                {g === 'male' ? `Man ${R_FACTOR.male.toFixed(2)}` : `Kvinna ${R_FACTOR.female.toFixed(2)}`}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

        <Button onClick={submit} variant="primary">
          Uppdatera profil
        </Button>

        {saved && (
          <p className="font-mono-label text-xs" style={{ color: 'var(--text-faint)' }}>
            Profil sparad: {saved.name ? `${saved.name}, ` : ''}
            {saved.weight_kg} kg, {saved.gender === 'male' ? 'man' : 'kvinna'}, r = {R_FACTOR[saved.gender]}
          </p>
        )}
      </div>
    </Card>
  )
}
