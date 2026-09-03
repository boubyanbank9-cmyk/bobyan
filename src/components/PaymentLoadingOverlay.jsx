export default function PaymentLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div
        className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-[#3b82f6] animate-spin"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
