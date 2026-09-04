import { motion } from 'framer-motion'
import { HeroIllustration } from './HeroIllustration'
import { useTheme } from '../../hooks/useTheme'

export function HeroSection() {
  const { theme, toggle } = useTheme()

  return (
    <section className="relative overflow-hidden px-4 pt-8 pb-0">
      <div
        className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, var(--accent-light), transparent 70%)' }}
      />

      <button
        onClick={toggle}
        aria-label="Växla mörkt läge"
        className="absolute top-6 right-6 md:top-8 md:right-8 z-10 w-11 h-11 rounded-full bg-[var(--card)] border border-[var(--card-border)] flex items-center justify-center text-lg cursor-pointer"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="relative z-10 max-w-2xl mx-auto text-center pt-2 pb-14">
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-mono-label text-xs tracking-[0.2em] mb-5"
          style={{ color: 'var(--accent-dark)' }}
        >
          DYNGRAK.SE
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05] mb-6"
        >
          Hur full blir plånboken?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base md:text-lg leading-relaxed"
          style={{ color: 'var(--text-soft)' }}
        >
          Ange vikt, kön och vad du redan hällt i dig. Vi räknar promillen med Widmarks
          formel minus förbränningen – och ritar upp kvällens rutt efter budget och gångavstånd.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35 }}
        className="relative z-10"
      >
        <HeroIllustration />
      </motion.div>

      <div className="h-10" />
      <div className="border-t" style={{ borderColor: 'var(--divider)' }} />
      <div className="h-px" style={{ background: 'var(--bg-soft)', boxShadow: '0 1px 0 var(--bg-soft)' }} />
    </section>
  )
}
