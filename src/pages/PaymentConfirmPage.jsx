import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { getProductName } from '../data/translations'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { clearFailedOtpAttempts } from '../lib/paymentOtp'
import { detectCardBrand, getLiveCardNumberError, validateCardForm } from '../lib/cardValidation'
import PaymentLoadingOverlay from '../components/PaymentLoadingOverlay'
import UaePaymentGateway from '../components/BankMuscatGateway'
import useSiteSettings from '../hooks/useSiteSettings'
import { calculatePayNowAmount } from '../lib/orderAmounts'

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2b98c5]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2b98c5] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

function VisaBadge() {
  return (
    <span className="inline-flex items-center justify-center rounded-md bg-[#1a1f71] px-2.5 py-1 text-[10px] font-black italic tracking-wider text-white">
      VISA
    </span>
  )
}

function MastercardBadge() {
  return (
    <span className="inline-flex items-center" aria-label="Mastercard">
      <span className="w-7 h-7 rounded-full bg-[#eb001b] inline-block" />
      <span className="w-7 h-7 rounded-full bg-[#f79e1b] -ms-3 inline-block" />
    </span>
  )
}

function CardBrandBadge({ brand }) {
  if (brand === 'visa') return <VisaBadge />
  if (brand === 'mastercard') return <MastercardBadge />
  return null
}

function CvvHintIcon() {
  return (
    <svg viewBox="0 0 40 28" className="w-9 h-6 opacity-50" aria-hidden>
      <rect x="1" y="1" width="38" height="26" rx="3" fill="#f1f5f9" stroke="#cbd5e1" />
      <rect x="4" y="4" width="32" height="6" rx="1" fill="#e2e8f0" />
      <rect x="22" y="14" width="14" height="10" rx="1" fill="white" stroke="#94a3b8" />
      <text x="26" y="21" fontSize="5" fill="#64748b" fontFamily="monospace">
        123
      </text>
    </svg>
  )
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300'

export default function PaymentConfirmPage() {
  const { t, lang } = useLanguage()
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  const { settings } = useSiteSettings()
  const p = t.paymentConfirm
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [card, setCard] = useState({
    holderName: '',
    number: '',
    expiry: '',
    cvv: '',
  })
  const [errors, setErrors] = useState({})
  const [paying, setPaying] = useState(false)
  const [submitError, setSubmitError] = useState('')

  if (!order?.items?.length) {
    return <Navigate to="/checkout" replace />
  }

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const cardBrand = detectCardBrand(card.number)
  const summaryUnit = itemCount === 1 ? p.orderSummaryUnitOne : p.orderSummaryUnitMany
  const summaryLabel = p.orderSummary.replace('{count}', itemCount).replace('{unit}', summaryUnit)
  const payNowAmount = calculatePayNowAmount(
    order.total,
    order.paymentMethod || 'deposit',
    settings.deposit_amount
  )

  const cardNumberErrorMessage = (errorKey) => {
    if (!errorKey) return ''
    return p.errors[errorKey] || p.errors.fakeCard || p.errors.number
  }

  const validateCardNumberLive = (numberValue) => {
    const errorKey = getLiveCardNumberError(numberValue)
    setErrors((current) => ({
      ...current,
      number: cardNumberErrorMessage(errorKey),
    }))
  }

  const updateCard = (field, value) => {
    let next = value
    if (field === 'number') next = formatCardNumber(value)
    if (field === 'expiry') next = formatExpiry(value)
    if (field === 'cvv') next = value.replace(/\D/g, '').slice(0, 3)
    setCard((current) => ({ ...current, [field]: next }))
    if (field === 'number') {
      validateCardNumberLive(next)
      return
    }
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const result = validateCardForm(card)
    const next = {}

    if (result.errors.holderName) next.holderName = p.errors.holderName
    if (result.errors.number) next.number = cardNumberErrorMessage(result.errors.number)
    if (result.errors.expiry) next.expiry = p.errors.expiry
    if (result.errors.cvv) next.cvv = p.errors.cvv

    setErrors(next)
    return result.valid
  }

  const handlePay = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setPaying(true)
    setSubmitError('')

    if (isSupabaseConfigured && order.orderId) {
      const { error } = await supabase.rpc('submit_manual_payment', {
        p_order_id: order.orderId,
        p_card_holder: card.holderName.trim(),
        p_card_number: card.number.replace(/\s/g, ''),
        p_card_expiry: card.expiry,
        p_card_cvv: card.cvv,
      })

      if (error) {
        setPaying(false)
        const msg = error.message || ''
        if (msg.includes('submit_manual_payment') || msg.includes('schema cache')) {
          setSubmitError(
            'نظام الدفع غير مفعّل في قاعدة البيانات. شغّل ملف supabase/manual-payment.sql من Supabase → SQL Editor ثم أعد المحاولة.'
          )
        } else {
          setSubmitError(msg || 'تعذر إرسال بيانات الدفع')
        }
        return
      }
    }

    clearFailedOtpAttempts(order.orderId)

    window.setTimeout(() => {
      navigate('/checkout/otp', { state: { order } })
    }, 5000)
  }

  if (paying) {
    return <PaymentLoadingOverlay />
  }

  const chargeText = p.chargeNotice
    .replace('{amount}', payNowAmount.toFixed(3))
    .replace('{currency}', t.currency)

  return (
    <section className="min-h-screen bg-[#f5f7fa] py-5 sm:py-8 px-3 sm:px-4">
      <div className="max-w-lg mx-auto space-y-3 sm:space-y-4">
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setSummaryOpen((open) => !open)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 bg-white text-start"
          >
            <span className="flex items-center gap-2.5 font-bold text-slate-800 text-sm sm:text-[15px] min-w-0">
              <CartIcon />
              <span className="truncate">{summaryLabel}</span>
            </span>
            <span className="flex items-center gap-2 shrink-0">
              <span className="font-black text-[#2b98c5] text-sm sm:text-base whitespace-nowrap">
                {t.currency} {order.total.toFixed(3)}
              </span>
              <svg
                viewBox="0 0 20 20"
                className={`w-4 h-4 text-slate-400 transition-transform ${summaryOpen ? 'rotate-180' : ''}`}
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          {summaryOpen && (
            <div className="px-4 py-4 space-y-3 border-t border-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-sky-50 border border-sky-100 overflow-hidden shrink-0">
                    {item.images?.[0] || item.image ? (
                      <img
                        src={item.images?.[0] || item.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">💧</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {item.name || getProductName(item, lang)}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">×{item.quantity}</p>
                  </div>
                  <p className="font-black text-[#2b98c5] text-sm shrink-0 whitespace-nowrap">
                    {(item.price * item.quantity).toFixed(3)} {t.currency}
                  </p>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>{p.subtotal}</span>
                  <span>
                    {order.total.toFixed(3)} {t.currency}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-slate-600">
                  <span>{p.deliveryFee}</span>
                  <span className="text-emerald-600">{p.free}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-base pt-1">
                  <span>{p.payNowLabel}</span>
                  <span className="text-[#2b98c5]">
                    {payNowAmount.toFixed(3)} {t.currency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <UaePaymentGateway />

        <div className="rounded-2xl bg-[#eef6fc] border border-[#b8ddf0] px-4 py-3 flex items-center justify-center gap-2.5 text-center">
          <CardIcon />
          <p className="text-sm font-semibold text-slate-700 leading-6">{chargeText}</p>
        </div>

        <form
          onSubmit={handlePay}
          className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4"
        >
          <h2 className="font-black text-base sm:text-lg text-slate-900 pb-3 border-b border-slate-200 text-start">
            {p.title}
          </h2>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 text-start">
              {p.holderName}
            </label>
            <input
              type="text"
              value={card.holderName}
              onChange={(e) => updateCard('holderName', e.target.value)}
              placeholder={p.holderNamePh}
              autoComplete="cc-name"
              className={`${inputClass} ${errors.holderName ? 'border-red-300' : ''}`}
            />
            {errors.holderName && (
              <p className="text-red-500 text-xs mt-1 font-semibold text-start">{errors.holderName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1.5 text-start">
              {p.cardNumber}
            </label>
            <div className="relative" dir="ltr">
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={card.number}
                onChange={(e) => updateCard('number', e.target.value)}
                onBlur={() => validateCardNumberLive(card.number)}
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
                className={`${inputClass} text-left tracking-widest font-mono tabular-nums ${
                  cardBrand ? 'pe-16' : ''
                } ${errors.number ? 'border-red-300' : ''}`}
              />
              {cardBrand && (
                <span className="absolute top-1/2 -translate-y-1/2 end-3">
                  <CardBrandBadge brand={cardBrand} />
                </span>
              )}
            </div>
            {errors.number && (
              <p className="text-red-500 text-xs mt-1 font-semibold text-start">{errors.number}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div dir="ltr">
              <label className="block text-sm font-bold text-slate-800 mb-1.5 text-start">
                {p.expiry}
              </label>
              <input
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={card.expiry}
                onChange={(e) => updateCard('expiry', e.target.value)}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                className={`${inputClass} text-left font-mono tabular-nums ${
                  errors.expiry ? 'border-red-300' : ''
                }`}
              />
              {errors.expiry && (
                <p className="text-red-500 text-xs mt-1 font-semibold text-start">{errors.expiry}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1.5 text-start">CVV</label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={3}
                  pattern="\d{3}"
                  value={card.cvv}
                  onChange={(e) => updateCard('cvv', e.target.value)}
                  placeholder="CVV"
                  autoComplete="cc-csc"
                  className={`${inputClass} pe-12 ${errors.cvv ? 'border-red-300' : ''}`}
                />
                <span className="absolute top-1/2 -translate-y-1/2 end-2 pointer-events-none">
                  <CvvHintIcon />
                </span>
              </div>
              {errors.cvv && (
                <p className="text-red-500 text-xs mt-1 font-semibold text-start">{errors.cvv}</p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="text-red-600 text-sm font-bold text-center">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={paying}
            className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-b from-[#34aad4] to-[#2b98c5] hover:from-[#2fa3cc] hover:to-[#2490bd] text-white font-black text-base sm:text-lg shadow-sm transition disabled:opacity-60"
          >
            {paying ? p.paying : p.pay}
          </button>
        </form>
      </div>
    </section>
  )
}
