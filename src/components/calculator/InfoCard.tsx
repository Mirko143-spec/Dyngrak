import { Card } from '../ui/Card'

export function InfoCard() {
  return (
    <Card>
      <h2 className="font-display font-semibold text-xl mb-3">Så räknar vi</h2>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
        Ett standardglas ≈ 12–14 g ren alkohol. Promille = gram / (vikt × r) och sedan dras 0,15‰ av
        per timme sedan du började. Siffrorna är en uppskattning – kör aldrig bil och lita inte på en
        hemsida med en sovande gubbe i hero-sektionen.
      </p>
    </Card>
  )
}
