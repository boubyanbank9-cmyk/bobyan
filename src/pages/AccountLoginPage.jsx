import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UI } from '../data/alainContent'
import { useLanguage } from '../context/LanguageContext'
import SeoMeta from '../components/SeoMeta'

export default function AccountLoginPage() {
  const { lang } = useLanguage()
  const ui = UI[lang] || UI.en
  const [value, setValue] = useState('')

  return (
    <>
      <SeoMeta title="Sign In – Al Ain Water" path="/account/login" />
      {/* Clean white login matching alainwater.com/account/login */}
      <section className="min-h-[70vh] bg-white px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-black text-alain-blue md:text-4xl">
            {lang === 'ar' ? 'تسجيل الدخول لحسابك' : 'Sign In to Your Account'}
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            {lang === 'ar' ? 'جديد على مياه العين؟ ' : 'New to Al Ain Water? '}
            <button type="button" className="font-bold text-alain-blue underline">
              {lang === 'ar' ? 'إنشاء حساب' : 'Create an Account'}
            </button>
          </p>

          <label className="mt-10 block text-start text-sm font-semibold text-slate-600">
            {lang === 'ar' ? 'البريد أو رقم الموبايل' : 'Email Address OR Mobile Number'}
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="john.doe@email.com OR +971 5x xxx xxxx"
              className="mt-2 w-full rounded-xl border-0 bg-slate-100 px-4 py-3.5 text-sm outline-none ring-alain-blue focus:ring-2"
            />
          </label>

          <button
            type="button"
            className="mt-5 w-full rounded-xl bg-alain-blue py-3.5 text-sm font-bold text-white hover:bg-alain-blue-dark"
          >
            {ui.login}
          </button>

          <div className="my-8 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-sm text-alain-blue">
            {lang === 'ar' ? 'تحتاج مساعدة؟ ' : 'Need Help? '}
            <Link to="/contact" className="font-bold">
              {lang === 'ar' ? 'نحن هنا لمساعدتك ›' : "We're here to assist ›"}
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
