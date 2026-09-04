interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (val: number) => void
  formatValue?: (val: number) => string
}

export function Slider({ label, value, min, max, step, onChange, formatValue }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-3">
      <label className="font-mono-label text-[11px] tracking-widest text-[var(--label)] uppercase">
        {label}: <span className="text-[var(--text)] font-semibold">{formatValue ? formatValue(value) : value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, var(--text) ${pct}%, var(--input-border) ${pct}%)`,
        }}
      />
    </div>
  )
}
