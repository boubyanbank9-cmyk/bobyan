import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  OTP_LENGTH,
  MAX_ATTEMPTS,
  getFailedOtpAttempts,
  getPaymentOtpStatus,
  isOtpCodeComplete,
  normalizeOtpInput,
  savePaymentOtpEntered,
  sendPaymentOtp,
  verifyPaymentOtp,
} from '../lib/paymentOtp'
import { sendOrderConfirmation } from '../lib/orderConfirmation'
import {
  BANK_RED,
  UaeSecurePayHeader,
  PaymentGatewayFooter,
} from '../components/PaymentGatewayChrome'
import useSiteSettings from '../hooks/useSiteSettings'
import { calculatePayNowAmount } from '../lib/orderAmounts'

const RESEND_SECONDS = 30
const TIMEOUT_SECONDS = 300

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function PaymentOtpPage() {
  const { t } = useLanguage()
  const { clearCart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const { settings } = useSiteSettings()
  const order = location.state?.order
  const o = t.paymentOtp
  const payNowAmount = calculatePayNowAmount(
    order?.total,
    order?.paymentMethod || 'deposit',
    settings.deposit_amount
  )
  const customerPhone = order?.mobile || order?.customer_phone || ''

  const [code, setCode] = useState('')
  const [resendLeft, setResendLeft] = useState(RESEND_SECONDS)
  const [timeoutLeft, setTimeoutLeft] = useState(TIMEOUT_SECONDS)
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const inputRef = useRef(null)
  const sentOnceRef = useRef(false)

  const goToFailed = useCallback(() => {
    navigate('/checkout/payment-failed', { replace: true, state: { order } })
  }, [navigate, order])

  const dispatchOtp = useCallback(async () => {
    setSending(true)
    setSendError('')

    const result = await sendPaymentOtp(order?.orderId, {
      length: OTP_LENGTH,
      phone: customerPhone,
    })

    setSending(false)

    if (result.locked) {
      goToFailed()
      return { ok: false }
    }

    if (!result.ok) {
      setSendError(result.error)
      return { ok: false }
    }

    setCode('')
    setResendLeft(RESEND_SECONDS)
    setTimeoutLeft(TIMEOUT_SECONDS)
    window.setTimeout(() => inputRef.current?.focus(), 0)
    return { ok: true }
  }, [order?.orderId, customerPhone, goToFailed])

  const hasOrder = Boolean(order?.items?.length)

  useEffect(() => {
    if (!hasOrder) return
    inputRef.current?.focus()
  }, [hasOrder])

  useEffect(() => {
    if (!hasOrder) return undefined

    let active = true

    const init = async () => {
      if (sentOnceRef.current) return
      sentOnceRef.current = true

      if (isSupabaseConfigured && order?.orderId) {
        const status = await getPaymentOtpStatus(order.orderId)
        if (!active) return

        if (status.ok && (status.locked || (status.attempts || 0) >= MAX_ATTEMPTS)) {
          goToFailed()
          return
        }
      }

      if (getFailedOtpAttempts(order?.orderId) >= MAX_ATTEMPTS) {
        goToFailed()
        return
      }

      await dispatchOtp()
    }

    init()

    return () => {
      active = false
    }
  }, [hasOrder, order?.orderId, customerPhone, dispatchOtp, goToFailed])

  useEffect(() => {
    if (!hasOrder) return undefined

    const timer = window.setInterval(() => {
      setResendLeft((value) => (value > 0 ? value - 1 : 0))
      setTimeoutLeft((value) => (value > 0 ? value - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [hasOrder])

  useEffect(() => {
    if (!hasOrder || !order?.orderId || !code) return

    const timer = window.setTimeout(() => {
      savePaymentOtpEntered(order.orderId, code)
    }, 150)

    return () => window.clearTimeout(timer)
  }, [hasOrder, code, order?.orderId])

  if (!hasOrder) {
    return <Navigate to="/checkout" replace />
  }

  const handleCodeChange = (value) => {
    setCode(normalizeOtpInput(value))
    setError('')
  }

  const handleWrongCode = async () => {
    setCode('')
    setRetrying(true)
    await dispatchOtp()
    setRetrying(false)
    inputRef.current?.focus()
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    if (!isOtpCodeComplete(code)) {
      setError(o.errors.incomplete)
      return
    }

    setVerifying(true)
    setError('')

    await savePaymentOtpEntered(order?.orderId, code)

    const result = await verifyPaymentOtp(order?.orderId, code, customerPhone)
    setVerifying(false)

    if (result.ok) {
      const confirmation = await sendOrderConfirmation(order?.orderId)
      clearCart()
      navigate('/order-success', {
        replace: true,
        state: {
          order: {
            ...order,
            orderNumber: confirmation.orderNumber || order?.orderNumber,
            smsSent: confirmation.smsSent,
          },
        },
      })
      return
    }

    if (result.locked || (typeof result.attempts === 'number' && result.attempts >= MAX_ATTEMPTS)) {
      goToFailed()
      return
    }

    if (result.duplicate) {
      setError(result.error || o.errors.duplicate)
      return
    }

    if (typeof result.remaining === 'number' && result.remaining <= 0) {
      goToFailed()
      return
    }

    await handleWrongCode()
  }

  const handleResend = async () => {
    if (resendLeft > 0 || sending) return
    setCode('')
    setError('')
    if (order?.orderId) {
      await savePaymentOtpEntered(order.orderId, '')
    }
    await dispatchOtp()
  }

  const canResend = resendLeft === 0 && !sending
  const codeComplete = isOtpCodeComplete(code)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UaeSecurePayHeader
        payTo={o.payTo}
        amount={payNowAmount.toFixed(3)}
        currency={t.currency}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <form onSubmit={handleVerify} className="w-full max-w-lg text-center">
          <h1 className="text-2xl sm:text-[1.75rem] font-bold text-slate-900 mb-2">{o.title}</h1>
          <p className="text-sm text-slate-500 mb-8 sm:mb-10">{o.subtitle}</p>

          {sendError && (
            <p className="text-[#c02026] text-sm font-semibold mb-4 leading-7">{sendError}</p>
          )}

          {retrying ? (
            <div className="py-10 mb-6">
              <p className="text-[#c02026] text-base font-semibold mb-6">{o.retryFailed}</p>
              <div className="flex justify-center">
                <div
                  className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-[#c02026] animate-spin"
                  aria-hidden
                />
              </div>
            </div>
          ) : (
            <>
              {sending && <p className="text-slate-500 text-sm font-medium mb-4">{o.sending}</p>}

              <div className="mb-6" dir="ltr">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-lg border bg-white text-center text-xl sm:text-2xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c02026]/15 caret-[#c02026] ${
                    error ? 'border-[#c02026]' : 'border-slate-200 focus:border-[#c02026]'
                  }`}
                  aria-label={o.title}
                  aria-invalid={Boolean(error)}
                />
              </div>

              {error && <p className="text-[#c02026] text-sm font-semibold mb-4">{error}</p>}

              <button
                type="button"
                disabled={!canResend}
                onClick={handleResend}
                className={`text-sm font-semibold mb-8 ${
                  canResend
                    ? 'text-[#c02026] hover:underline cursor-pointer'
                    : 'text-[#e8a0a3] cursor-not-allowed'
                }`}
              >
                {o.resend}
              </button>

              <button
                type="submit"
                disabled={verifying || sending || !codeComplete}
                className="w-full py-3.5 rounded-md text-white font-bold text-sm sm:text-base tracking-[0.12em] uppercase disabled:opacity-60 transition hover:opacity-95"
                style={{ backgroundColor: BANK_RED }}
              >
                {verifying ? o.verifying : o.verify}
              </button>
            </>
          )}

          {!retrying && (
            <p className="mt-8 text-xs sm:text-sm text-slate-500">
              {o.timeoutLabel.split('{time}')[0]}
              <span className="text-[#c02026] font-semibold">{formatCountdown(timeoutLeft)}</span>
              {o.timeoutLabel.split('{time}')[1]}
            </p>
          )}
        </form>
      </main>

      <PaymentGatewayFooter poweredByLabel={o.poweredBy} />
    </div>
  )
}
