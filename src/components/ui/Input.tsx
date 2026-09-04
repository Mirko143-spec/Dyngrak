interface InputProps {
  label: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  placeholder?: string
  min?: number
  max?: number
  icon?: string
}

export function Input({ label, value, onChange, type = 'text', placeholder, min, max, icon }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono-label text-[11px] tracking-widest text-[var(--label)] uppercase">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-4 py-3 text-[var(--text)] placeholder:text-[var(--text-faint)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        {icon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)] pointer-events-none">
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}
