import { sanitizeUaePhoneInput } from '../lib/uaePhone'

export default function UaePhoneInput({
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
}) {
  return (
    <div>
      <div
        className={`flex items-stretch rounded-xl border bg-white overflow-hidden ${
          error ? 'border-red-500' : 'border-slate-200 focus-within:border-slate-300'
        }`}
        dir="ltr"
      >
        <span className="inline-flex items-center justify-center px-4 min-h-[46px] bg-slate-50 border-r border-slate-200 text-slate-700 font-bold text-[15px] shrink-0">
          +971
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={(event) => onChange(sanitizeUaePhoneInput(event.target.value))}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={9}
          className="flex-1 min-w-0 min-h-[46px] px-4 bg-white focus:outline-none text-start text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
        />
      </div>
      {hint && !error && (
        <p className="text-xs text-slate-500 font-medium mt-1.5">{hint}</p>
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1.5 font-semibold leading-5">{error}</p>
      )}
    </div>
  )
}
