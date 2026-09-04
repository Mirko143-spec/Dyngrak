import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const location = useLocation()

  if (location.pathname === '/') return null

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderColor: 'var(--divider)' }}
    >
      <Link to="/" className="font-mono-label text-sm tracking-[0.2em]" style={{ color: 'var(--accent-dark)' }}>
        DYNGRAK.SE
      </Link>
      <Link to="/" className="text-sm transition-colors" style={{ color: 'var(--text-soft)' }}>
        ← Tillbaka
      </Link>
    </nav>
  )
}
