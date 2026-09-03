import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatsBar from '../components/site/StatsBar'
import SeoMeta from '../components/SeoMeta'
import {
  FAQ_ITEMS,
  HOME,
  INSTALLMENT_PLANS,
  REGISTER_LOAN_PRODUCTS,
  REGISTER_PAGE,
  calculateInstallmentAmount,
} from '../data/tamwilcomContent'
import { useLanguage } from '../context/LanguageContext'

function SelectionCard({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-xl border bg-[#f8f9fa] p-5 text-center transition-all md:p-6 ${className} ${
        active
          ? 'border-2 border-red-500 bg-white shadow-[0_0_0_1px_rgba(220,38,38,0.08)]'
          : 'border-slate-300 hover:border-red-300'
      }`}
    >
      {children}
    </button>
  )
}

function AmountButton({ active, amount, isAr }) {
  return (
    <span
      className={`mt-3 block w-full rounded-md py-3 text-base font-bold text-white md:text-lg ${
        active ? 'bg-gradient-to-r from-red-700 to-red-600 shadow-md' : 'bg-gradient-to-r from-red-700 to-red-600'
      }`}
    >
      {amount.toLocaleString()} ({isAr ? 'د.ك' : 'KWD'})
    </span>
  )
}

function SelectedCheck({ active }) {
  if (!active) return null

  return (
    <span className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm text-white shadow">
      ✓
    </span>
  )
}

export default function RegisterPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const navigate = useNavigate()
  const [selectedLoan, setSelectedLoan] = useState(REGISTER_LOAN_PRODUCTS[2].id)
  const [selectedPlan, setSelectedPlan] = useState(INSTALLMENT_PLANS[0].id)
  const [openFaq, setOpenFaq] = useState(0)

  const selectedLoanAmount =
    REGISTER_LOAN_PRODUCTS.find((loan) => loan.id === selectedLoan)?.amount ?? 0

  // إنشاء مرجع لقسم الكارتين (خطط الأقساط)
  const plansSectionRef = useRef(null)

  // دالة لاختيار القرض وتنفيذ السكرول للأسفل
  const handleLoanSelect = (loanId) => {
    setSelectedLoan(loanId)
    if (plansSectionRef.current) {
      plansSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <SeoMeta
        title={isAr ? 'التسجيل — تمويلكم' : 'Register — Tamwilcom'}
        description={
          isAr
            ? 'ابدأ طلب التمويل الإلكتروني — اختر نوع التمويل وخطة الأقساط.'
            : 'Start your digital financing request — choose loan type and installment plan.'
        }
        path="/register"
      />

      <section className="bg-gradient-to-b from-[#e8eaed] via-[#f0f1f3] to-white py-10 text-center md:py-14">
        <div className="mx-auto max-w-4xl px-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mb-6 inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-700"
          >
            {isAr ? '← رجوع للرئيسية' : '← Back to home'}
          </button>
          <h1 className="text-2xl font-bold text-slate-800 md:text-4xl">
            {REGISTER_PAGE.heroTitle[isAr ? 'ar' : 'en']}
          </h1>
          <p className="mt-3 text-sm text-slate-500 md:text-base">
            {REGISTER_PAGE.heroSubtitle[isAr ? 'ar' : 'en']}
          </p>
        </div>
      </section>

      <section className="bg-white pb-10 pt-8 md:pb-14 md:pt-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 md:text-3xl">
              {REGISTER_PAGE.loanTypeTitle[isAr ? 'ar' : 'en']}
            </h2>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 md:text-base">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs">
                i
              </span>
              {REGISTER_PAGE.promo[isAr ? 'ar' : 'en']}
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {REGISTER_LOAN_PRODUCTS.map((loan) => {
              const active = selectedLoan === loan.id
              return (
                <SelectionCard
                  key={loan.id}
                  active={active}
                  onClick={() => handleLoanSelect(loan.id)}
                >
                  <p className="text-sm font-medium text-slate-500">
                    {loan.label[isAr ? 'ar' : 'en']}
                  </p>
                  <p className="mt-1 text-slate-600">{HOME.currency[isAr ? 'ar' : 'en']}</p>
                  <p className="mt-4 text-sm font-medium text-slate-500">
                    {HOME.amountLabel[isAr ? 'ar' : 'en']}
                  </p>
                  <AmountButton active={active} amount={loan.amount} isAr={isAr} />
                  <SelectedCheck active={active} />
                </SelectionCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* تم ربط المرجع (ref) بهذا القسم ليتم النزول إليه */}
      <section ref={plansSectionRef} className="bg-[#faf7f4] pb-10 pt-4 md:pb-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-black text-slate-800 md:text-5xl">
              {isAr ? 'مدة القروض المتوفرة لدينا' : 'Available loan terms'}
            </h2>
            <p className="mt-3 text-slate-600 md:text-xl">
              {isAr ? 'يرجى اختيار حجم ومدة القرض' : 'Please choose the loan amount and term'}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {INSTALLMENT_PLANS.map((plan, index) => {
              const active = selectedPlan === plan.id
              const installmentValue = calculateInstallmentAmount(selectedLoanAmount, plan.years)

              return (
                <SelectionCard
                  key={plan.id}
                  active={active}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <p className="text-sm font-medium text-slate-500">
                    {REGISTER_PAGE.installmentPrefix[isAr ? 'ar' : 'en']}{' '}
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-4 text-lg font-bold text-slate-800 md:text-xl">
                    {plan.title[isAr ? 'ar' : 'en']}
                  </p>
                  <p className="mt-4 text-sm font-medium text-slate-500">
                    {HOME.installmentLabel[isAr ? 'ar' : 'en']}
                  </p>
                  <AmountButton active={active} amount={installmentValue} isAr={isAr} />
                  <SelectedCheck active={active} />
                </SelectionCard>
              )
            })}
          </div>

          <Link
            to="/phone-verification"
            className="mt-8 flex w-full items-center justify-center rounded-md bg-gradient-to-r from-red-700 to-red-600 py-4 text-lg font-bold text-white shadow-[0_8px_24px_rgba(220,38,38,0.25)] transition hover:from-red-600 hover:to-red-500"
          >
            {HOME.continue[isAr ? 'ar' : 'en']}
          </Link>
        </div>
      </section>

      <div className="bg-[#faf7f4] pb-10">
        <StatsBar />
      </div>

      <section className="bg-[#faf7f4] pb-16 pt-2">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-red-700 md:text-3xl">
            {REGISTER_PAGE.faqTitle[isAr ? 'ar' : 'en']}
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={item.q.ar}
                  className="overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start font-bold text-slate-800"
                  >
                    <span>{item.q[isAr ? 'ar' : 'en']}</span>
                    <span className="text-xl text-slate-500">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-3 text-sm leading-8 text-slate-600">
                      {item.a[isAr ? 'ar' : 'en']}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}