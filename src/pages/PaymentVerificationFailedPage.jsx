import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

function ShieldErrorIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M32 14l14 6v10c0 10-6 18-14 20-8-2-14-10-14-20V20l14-6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M24 24l16 16M40 24L24 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function PaymentFailedFooter() {
  return (
    <div className="border-t border-slate-100 pt-5 mt-6">
      <div className="flex items-center justify-center gap-6 flex-wrap opacity-80">
        <span className="font-bold text-sm text-[#0b2e4e]">UAE Secure Pay</span>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 mb-0.5">مدعوم من</p>
          <p className="font-black text-xs text-[#0077c8]">Network International</p>
        </div>
        <span className="text-[10px] font-bold text-slate-500 border border-slate-300 rounded px-1.5 py-0.5">
          PCI DSS
        </span>
      </div>
    </div>
  )
}

export default function PaymentVerificationFailedPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const order = location.state?.order
  const f = t.paymentFailed

  return (
    <div className="min-h-screen bg-[#eef2f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="h-1.5 bg-[#e53935]" />

        <div className="px-6 sm:px-8 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#e53935] flex items-center justify-center mx-auto mb-5">
            <ShieldErrorIcon />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-[#e53935] mb-4 leading-relaxed">
            {f.title}
          </h1>

          <p className="text-sm text-slate-600 font-medium leading-7 mb-8">{f.message}</p>

          <button
            type="button"
            onClick={() =>
              navigate('/checkout', {
                replace: true,
                state: order ? { restoreOrder: order } : undefined,
              })
            }
            className="w-full py-3.5 rounded-xl bg-[#e53935] hover:bg-[#c62828] text-white font-black text-base transition flex items-center justify-center gap-2"
          >
            {f.backCheckout}
            <span aria-hidden className="text-lg leading-none">‹</span>
          </button>

          <p className="text-xs text-slate-400 font-medium mt-5 leading-6">{f.orderSaved}</p>

          <PaymentFailedFooter />
        </div>
      </div>
    </div>
  )
}
