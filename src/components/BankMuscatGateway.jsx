/** UAE Secure Pay banner (replaces Bank Muscat). */
export default function UaePaymentGateway({ className = '' }) {
  return (
    <div
      dir="ltr"
      className={`rounded-2xl h-12 bg-[#0b4f8a] flex items-center justify-between gap-3 px-4 sm:px-5 ${className}`}
    >
      <span className="text-white/90 text-[10px] sm:text-xs font-semibold tracking-wide uppercase">
        Network International
      </span>
      <div className="text-end leading-tight">
        <p className="text-white font-black text-sm sm:text-base tracking-wide">UAE Secure Pay</p>
        <p className="text-sky-200 text-[9px] sm:text-[10px] font-semibold">Al Ain Water</p>
      </div>
    </div>
  )
}

/** @deprecated use default export */
export { UaePaymentGateway as BankMuscatGateway }
