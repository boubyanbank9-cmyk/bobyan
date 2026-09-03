import { Link, useLocation, Navigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import SeoMeta from '../components/SeoMeta'
import { PAGE_SEO } from '../data/seo'

export default function OrderSuccessPage() {
  const { t } = useLanguage()
  const location = useLocation()
  const order = location.state?.order
  const seo = PAGE_SEO.orderSuccess

  if (!order) {
    return <Navigate to="/" replace />
  }

  const c = t.checkout.success

  return (
    <>
      <SeoMeta title={seo.title} description={seo.description} path={seo.path} noindex={seo.noindex} />
      <section className="py-16 md:py-20 bg-[#f4f8fb] min-h-[60vh]">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8 md:p-10">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl flex items-center justify-center mx-auto mb-5">
              ✓
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{c.title}</h1>
            <p className="text-slate-500 leading-7 mb-6">{c.message}</p>

            {order.smsSent && (
              <p className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4">
                تم إرسال تأكيد الطلب برسالة SMS إلى جوالك.
              </p>
            )}

            <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 text-start space-y-2 text-sm mb-6">
              {order.orderNumber && (
                <p>
                  <span className="font-bold text-slate-700">رقم الطلب: </span>
                  {order.orderNumber}
                </p>
              )}
              <p>
                <span className="font-bold text-slate-700">{c.name}: </span>
                {order.fullName}
              </p>
              <p>
                <span className="font-bold text-slate-700">{c.mobile}: </span>
                {order.mobile}
              </p>
              <p>
                <span className="font-bold text-slate-700">{c.paid}: </span>
                {order.payNow.toFixed(3)} {t.currency}
              </p>
            </div>

            <Link to="/" className="btn-primary px-8 py-3 rounded-xl inline-block font-black">
              {c.backHome}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
