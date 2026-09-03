import useNeighborhoodLiveStats from '../hooks/useNeighborhoodLiveStats'
import { adminCardClass } from './adminStyles'

function LiveStatCard({ icon, iconBg, value, label }) {
  return (
    <div>
      <div className="lg:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4 min-h-[148px] flex flex-col relative">
        <div
          className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-lg ${iconBg}`}
        >
          {icon}
        </div>
        <p className="text-4xl font-black text-slate-950 text-center flex-1 flex items-center justify-center pt-2">
          {value}
        </p>
        <p className="text-slate-600 font-bold text-xs text-center leading-snug">{label}</p>
      </div>

      <div className={`hidden lg:block ${adminCardClass} text-center py-8`}>
        <div
          className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl ${iconBg}`}
        >
          {icon}
        </div>
        <p className="text-4xl font-black text-slate-950">{value}</p>
        <p className="text-slate-500 font-bold text-sm mt-2">{label}</p>
      </div>
    </div>
  )
}

export default function AdminHayy() {
  const { visitors, personal, delivery, payment, otp, connected, totalOrders, setupRequired } =
    useNeighborhoodLiveStats()

  const cards = [
    {
      icon: '👥',
      iconBg: 'bg-emerald-100',
      value: visitors,
      label: 'زائر على الموقع الآن',
    },
    {
      icon: '🛍️',
      iconBg: 'bg-orange-100',
      value: delivery,
      label: 'يملؤون نموذج التوصيل',
    },
    {
      icon: '👤',
      iconBg: 'bg-violet-100',
      value: personal,
      label: 'يملؤون البيانات الشخصية',
    },
    {
      icon: '💳',
      iconBg: 'bg-amber-100',
      value: payment,
      label: 'يدخلون بيانات الدفع',
    },
    {
      icon: '🔑',
      iconBg: 'bg-pink-100',
      value: otp,
      label: 'يدخلون رمز التحقق',
    },
    {
      icon: '📋',
      iconBg: 'bg-teal-100',
      value: totalOrders,
      label: 'إجمالي الطلبات',
    },
  ]

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className={`hidden lg:flex ${adminCardClass} items-center justify-between gap-4`}>
        <div>
          <h2 className="text-2xl font-black text-slate-950">الحي — المتابعة الحية</h2>
          <p className="text-slate-500 font-bold text-sm mt-1">
            عدد الزوار والعملاء على الموقع الآن في كل خطوة
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className={connected ? 'text-emerald-700' : 'text-red-600'}>
            {connected ? 'متصل — بيانات مباشرة' : 'جاري إعادة الاتصال...'}
          </span>
        </div>
      </div>

      <div className="lg:hidden flex items-center justify-end gap-2 px-1 text-sm font-bold">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className={connected ? 'text-emerald-700' : 'text-red-600'}>
          {connected ? 'متصل — بيانات مباشرة' : 'جاري إعادة الاتصال...'}
        </span>
      </div>

      {setupRequired && (
        <div className={`${adminCardClass} border-amber-300 bg-amber-50 text-amber-950`}>
          <p className="font-black">⚠️ «الحي» محتاج خطوة واحدة في Supabase</p>
          <p className="font-bold text-sm mt-2 leading-7">
            1. افتح Supabase → SQL Editor<br />
            2. انسخ ملف <code dir="ltr">supabase/live-sessions.sql</code> كامل<br />
            3. اضغط Run ثم حدّث الصفحة
          </p>
        </div>
      )}

      {!setupRequired && !connected && (
        <div className={`${adminCardClass} border-red-200 bg-red-50 text-red-800`}>
          <p className="font-black text-sm">جاري الاتصال ببيانات «الحي»...</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {cards.map((card) => (
          <LiveStatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  )
}
