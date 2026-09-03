export default function AdminBarChart({ items, valueKey = 'value', labelKey = 'label', formatValue }) {
  if (!items?.length) {
    return <p className="text-sm font-bold text-slate-500">لا توجد بيانات.</p>
  }

  const max = Math.max(...items.map((item) => Number(item[valueKey] || 0)), 1)

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = Number(item[valueKey] || 0)
        const width = `${Math.max((value / max) * 100, value > 0 ? 8 : 0)}%`

        return (
          <div key={item[labelKey]}>
            <div className="flex items-center justify-between gap-3 text-sm font-bold mb-1">
              <span className="text-slate-700 truncate">{item[labelKey]}</span>
              <span className="text-admin shrink-0">
                {formatValue ? formatValue(value) : value}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-admin-dark transition-all"
                style={{ width }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
