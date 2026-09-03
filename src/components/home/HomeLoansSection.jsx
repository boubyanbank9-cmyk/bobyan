import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  HOME,
  INSTALLMENT_PLANS,
  LOAN_PRODUCTS,
  calculateInstallmentAmount,
} from '../../data/tamwilcomContent'
import { useLanguage } from '../../context/LanguageContext'

export default function HomeLoansSection() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const [selectedLoan, setSelectedLoan] = useState(LOAN_PRODUCTS[2].id)
  const [selectedPlan, setSelectedPlan] = useState(INSTALLMENT_PLANS[0].id)

  const selectedLoanAmount =
    LOAN_PRODUCTS.find((loan) => loan.id === selectedLoan)?.amount ?? 0

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center md:text-start">
          <h2 className="text-2xl font-black text-[#120305] md:text-4xl">
            {HOME.loansTitle[isAr ? 'ar' : 'en']}
          </h2>
          <p className="mt-2 text-slate-600">{HOME.loansSubtitle[isAr ? 'ar' : 'en']}</p>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LOAN_PRODUCTS.map((loan) => {
            const active = selectedLoan === loan.id
            return (
              <button
                key={loan.id}
                type="button"
                onClick={() => setSelectedLoan(loan.id)}
                className={`rounded-3xl border p-6 text-start transition ${
                  active
                    ? 'border-red-600 bg-gradient-to-br from-red-50 to-white shadow-[0_0_30px_rgba(220,38,38,0.15)]'
                    : 'border-slate-200 bg-white hover:border-red-300'
                }`}
              >
                <p className="text-sm font-bold text-slate-500">{loan.label[isAr ? 'ar' : 'en']}</p>
                <p className="mt-1 text-xs text-slate-400">{HOME.currency[isAr ? 'ar' : 'en']}</p>
                <p className="mt-4 text-xs font-bold text-slate-500">{HOME.amountLabel[isAr ? 'ar' : 'en']}</p>
                <span
                  className={`mt-2 inline-flex rounded-2xl px-5 py-2.5 text-lg font-black ${
                    active
                      ? 'bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg'
                      : 'bg-slate-100 text-[#120305]'
                  }`}
                >
                  {loan.amount.toLocaleString()} ({isAr ? 'د.ك' : 'KWD'})
                </span>
              </button>
            )
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {INSTALLMENT_PLANS.map((plan) => {
            const active = selectedPlan === plan.id
            const installmentValue = calculateInstallmentAmount(selectedLoanAmount, plan.years)

            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-3xl border p-6 text-start transition ${
                  active
                    ? 'border-red-600 bg-red-50/50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-red-200'
                }`}
              >
                <p className="font-black text-[#120305]">{plan.title[isAr ? 'ar' : 'en']}</p>
                <p className="mt-2 text-sm text-slate-500">{HOME.installmentLabel[isAr ? 'ar' : 'en']}</p>
                <span className="mt-3 inline-flex rounded-2xl bg-gradient-to-r from-red-700 to-red-600 px-5 py-2.5 text-xl font-black text-white">
                  {installmentValue} ({isAr ? 'د.ك' : 'KWD'})
                </span>
                {active && (
                  <span className="absolute bottom-4 end-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow">
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <Link
          to="/services"
          className="mt-8 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-red-700 to-red-600 py-4 text-lg font-black text-white shadow-[0_0_30px_rgba(220,38,38,0.35)] transition hover:from-red-600 hover:to-red-500 md:mx-auto md:max-w-md"
        >
          {HOME.continue[isAr ? 'ar' : 'en']}
        </Link>
      </div>
    </section>
  )
}
