import { motion } from 'framer-motion'

const FUR = '#a3703f'
const FUR_DARK = '#8a5a34'
const FUR_LIGHT = '#c99a5f'
const BELLY = '#f3ead8'
const ANTLER = '#5c3d22'
const HOOF = '#3a2a1a'
const CHEEK = '#e8896f'
const MUG = '#f3ead8'
const MUG_STROKE = '#d8cbae'
const FOAM = '#fffaf0'

function Sparkle({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${y - size} L${x + size * 0.28} ${y - size * 0.28} L${x + size} ${y} L${x + size * 0.28} ${y + size * 0.28} L${x} ${y + size} L${x - size * 0.28} ${y + size * 0.28} L${x - size} ${y} L${x - size * 0.28} ${y - size * 0.28} Z`}
      fill="var(--accent)"
      animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.15, 0.8] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    />
  )
}

export function HeroIllustration() {
  return (
    <div className="w-full flex justify-center select-none" aria-hidden="true">
      <motion.svg
        width="240"
        height="260"
        viewBox="0 0 240 260"
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '120px 220px' }}
      >
        {/* ground shadow */}
        <ellipse cx="120" cy="248" rx="62" ry="8" fill="var(--divider)" />

        {/* legs */}
        <rect x="90" y="178" width="20" height="58" rx="10" fill={FUR} />
        <rect x="130" y="178" width="20" height="58" rx="10" fill={FUR} />
        <rect x="87" y="222" width="26" height="16" rx="8" fill={HOOF} />
        <rect x="127" y="222" width="26" height="16" rx="8" fill={HOOF} />

        {/* resting arm */}
        <path d="M78 148 Q66 172 70 196" stroke={FUR} strokeWidth="20" strokeLinecap="round" fill="none" />

        {/* torso */}
        <ellipse cx="120" cy="168" rx="56" ry="58" fill={FUR} />
        <ellipse cx="120" cy="180" rx="32" ry="36" fill={BELLY} />

        {/* head */}
        <g>
          {/* antlers */}
          <g stroke={ANTLER} strokeWidth="7" strokeLinecap="round" fill="none">
            <path d="M84 58 L68 34" />
            <path d="M74 46 L58 40" />
            <path d="M74 46 L62 58" />
            <path d="M156 58 L172 34" />
            <path d="M166 46 L182 40" />
            <path d="M166 46 L178 58" />
          </g>

          {/* ears */}
          <ellipse cx="72" cy="86" rx="13" ry="18" fill={FUR} transform="rotate(-25 72 86)" />
          <ellipse cx="168" cy="86" rx="13" ry="18" fill={FUR} transform="rotate(25 168 86)" />

          {/* face */}
          <circle cx="120" cy="104" r="50" fill={FUR} />
          <ellipse cx="120" cy="134" rx="28" ry="22" fill={FUR_LIGHT} />
          <ellipse cx="109" cy="132" rx="4" ry="5" fill={ANTLER} />
          <ellipse cx="131" cy="132" rx="4" ry="5" fill={ANTLER} />

          {/* cheeks */}
          <ellipse cx="84" cy="112" rx="9" ry="6" fill={CHEEK} opacity="0.5" />
          <ellipse cx="156" cy="112" rx="9" ry="6" fill={CHEEK} opacity="0.5" />

          {/* eyes: one open, one happy-squint (tipsy) */}
          <circle cx="99" cy="90" r="7" fill="#fff" />
          <circle cx="100" cy="91" r="3.5" fill={HOOF} />
          <path d="M133 92 q7 -8 14 0" stroke={HOOF} strokeWidth="3.5" strokeLinecap="round" fill="none" />

          {/* smile */}
          <path d="M108 146 q12 10 24 0" stroke={FUR_DARK} strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>

        {/* raised arm holding mug, drawn last so it sits on top */}
        <path d="M162 150 Q188 132 186 96" stroke={FUR} strokeWidth="20" strokeLinecap="round" fill="none" />

        <g transform="translate(171 58)">
          <rect x="0" y="6" width="30" height="34" rx="5" fill={MUG} stroke={MUG_STROKE} strokeWidth="2" />
          <rect x="4" y="16" width="22" height="20" rx="3" fill="var(--accent)" />
          <path d="M30 14 q12 0 12 12 q0 12 -12 12" fill="none" stroke={MUG_STROKE} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="15" cy="8" rx="15" ry="6" fill={FOAM} />
        </g>

        <Sparkle x={44} y={70} size={9} delay={0} />
        <Sparkle x={214} y={70} size={7} delay={0.5} />
        <Sparkle x={40} y={130} size={6} delay={1} />
      </motion.svg>
    </div>
  )
}
