import { motion } from 'framer-motion'

const FUR = '#a3703f'
const FUR_LIGHT = '#c99a5f'
const ANTLER = '#5c3d22'
const HOOF = '#3a2a1a'
const CHEEK = '#e8896f'
const TONGUE = '#d9736a'
const GLASS = '#5c7a52'
const GLASS_DARK = '#425c3a'
const LABEL = '#f3ead8'

function Hoof({ cx, cy, rotate }: { cx: number; cy: number; rotate: number }) {
  return (
    <g transform={`rotate(${rotate} ${cx} ${cy})`}>
      <ellipse cx={cx - 4.5} cy={cy} rx="7.5" ry="8.5" fill={HOOF} />
      <ellipse cx={cx + 4.5} cy={cy} rx="7.5" ry="8.5" fill={HOOF} />
      <ellipse cx={cx - 4.5} cy={cy - 2.5} rx="3" ry="2" fill="#54402a" opacity="0.6" />
      <ellipse cx={cx + 4.5} cy={cy - 2.5} rx="3" ry="2" fill="#54402a" opacity="0.6" />
    </g>
  )
}

function EmptyCan({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`} opacity="0.92">
      <ellipse cx="0" cy="9" rx="14" ry="3.5" fill="var(--divider)" opacity="0.5" />
      <rect x="-13" y="-7" width="26" height="14" rx="7" fill="#c1443a" />
      <rect x="-13" y="-2.5" width="26" height="3.5" fill="#f0ede4" opacity="0.55" />
      <ellipse cx="-13" cy="0" rx="2.6" ry="7" fill="#aab0b8" />
      <ellipse cx="13" cy="0" rx="2.6" ry="7" fill="#8b9199" />
    </g>
  )
}

function Zzz({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.text
      x={x}
      y={y}
      fontSize={size}
      fontWeight={800}
      fill="var(--accent)"
      style={{ fontFamily: 'var(--font-display)' }}
      animate={{ y: [y, y - 12, y], opacity: [0.15, 1, 0.15] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      z
    </motion.text>
  )
}

export function SleepingMascot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="230"
      height="150"
      viewBox="0 0 280 180"
      aria-hidden="true"
    >
      {/* tail, resting on top */}
      <ellipse cx="266" cy="58" rx="16" ry="13" fill={FUR} />

      {/* back leg, hanging over the edge near the rear */}
      <rect x="210" y="76" width="18" height="72" rx="9" fill={FUR} transform="rotate(9 210 76)" />
      <Hoof cx={208} cy={145} rotate={4} />

      {/* long side-lying body, resting on top of the surface */}
      <ellipse cx="175" cy="58" rx="98" ry="38" fill={FUR} />

      {/* front leg, hanging over the edge near the shoulder */}
      <rect x="118" y="84" width="19" height="78" rx="9.5" fill={FUR} transform="rotate(-8 118 84)" />
      <Hoof cx={138} cy={157} rotate={4} />

      {/* neck bridge, keeps the head visually attached to the body */}
      <ellipse cx="108" cy="72" rx="34" ry="26" fill={FUR} />

      {/* head, resting on its cheek and drooping past the edge */}
      <g transform="rotate(8 68 92)">
        {/* ear */}
        <ellipse cx="86" cy="56" rx="10" ry="14" fill={FUR} transform="rotate(20 86 56)" />

        {/* far antler, standing up behind the head */}
        <g stroke={ANTLER} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M72 46 L82 22" />
          <path d="M78 34 L92 30" />
        </g>

        {/* near antler, drooping down beside the face */}
        <g stroke={ANTLER} strokeWidth="6" strokeLinecap="round" fill="none">
          <path d="M50 52 L36 36" />
          <path d="M42 44 L28 42" />
        </g>

        <circle cx="68" cy="92" r="46" fill={FUR} />

        {/* muzzle, protruding toward the front */}
        <ellipse cx="30" cy="108" rx="26" ry="21" fill={FUR_LIGHT} />
        <ellipse cx="18" cy="104" rx="4" ry="5" fill={ANTLER} />

        <ellipse cx="58" cy="78" rx="9" ry="6.5" fill={CHEEK} opacity="0.5" />

        {/* single closed, sleepy eye (side profile) */}
        <path d="M60 66 q9 6 18 0" stroke={HOOF} strokeWidth="3.6" strokeLinecap="round" fill="none" />

        {/* open snoring mouth with a lolling tongue */}
        <ellipse cx="22" cy="122" rx="6" ry="5" fill={HOOF} />
        <path d="M18 126 q3 18 6 2 q3 16 6 -2" fill={TONGUE} />

        {/* empty bottle, at the same angle as the antler tip, which sits buried halfway in its mouth */}
        <g transform="rotate(98 28 42)">
          <rect x="24" y="35" width="8" height="14" rx="3" fill={GLASS} />
          <rect x="20" y="47" width="16" height="30" rx="6" fill={GLASS} />
          <rect x="20" y="55" width="16" height="9" fill={LABEL} opacity="0.9" />
          <rect x="23" y="50" width="3" height="23" rx="1.5" fill="#ffffff" opacity="0.25" />
          <rect x="22" y="75" width="20" height="4" rx="2" fill={GLASS_DARK} />
          <ellipse cx="28" cy="35" rx="4.5" ry="3" fill={GLASS_DARK} />
        </g>
      </g>

      {/* empty cans, kicked around during the night */}
      <EmptyCan x={90} y={169} rotate={35} />
      <EmptyCan x={148} y={171} rotate={-20} />
      <EmptyCan x={252} y={168} rotate={12} />

      <Zzz x={40} y={54} size={13} delay={0} />
      <Zzz x={26} y={30} size={17} delay={0.5} />
      <Zzz x={12} y={4} size={21} delay={1} />
    </svg>
  )
}
