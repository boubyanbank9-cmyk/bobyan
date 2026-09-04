import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import ServicesPage from './pages/ServicesPage'
import NewsPage from './pages/NewsPage'
import RegisterPage from './pages/RegisterPage'
import ContinueApplicationPage from './pages/ContinueApplicationPage'
import ContinueApplicationStep2Page from './pages/ContinueApplicationStep2Page'
import ContinueApplicationStep3Page from './pages/ContinueApplicationStep3Page'
import PhoneVerificationPage from './pages/PhoneVerificationPage'
import OtpVerificationPage from './pages/OtpVerificationPage'
import ApplicationSubmittedPage from './pages/ApplicationSubmittedPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminApplicationsPage from './pages/AdminApplicationsPage'
import PolicyPage from './pages/PolicyPage'
import NotFoundPage from './pages/NotFoundPage'
import PaymentLoadingOverlay from './components/PaymentLoadingOverlay'
import StorefrontPresenceTracker from './components/StorefrontPresenceTracker'

const applicationFlowPaths = [
  '/phone-verification',
  '/continue-application',
  '/continue-application-step-3',
  '/otp-verification',
]

export default function App() {
  const { pathname } = useLocation()
  const previousPathname = useRef(pathname)
  const [isRouteLoading, setIsRouteLoading] = useState(false)

  // التحقق مما إذا كنا في صفحات لوحة التحكم
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    const shouldShowLoading =
      previousPathname.current !== pathname &&
      applicationFlowPaths.includes(previousPathname.current) &&
      applicationFlowPaths.includes(pathname)

    previousPathname.current = pathname
    if (!shouldShowLoading) return undefined

    setIsRouteLoading(true)
    const timeoutId = window.setTimeout(() => {
      setIsRouteLoading(false)
    }, 5000)

    return () => window.clearTimeout(timeoutId)
  }, [pathname])

  const hideFooter =
    isAdminRoute ||
    [
      '/continue-application',
      '/continue-application-step-2',
      '/continue-application-step-3',
      '/phone-verification',
      '/otp-verification',
    ].includes(pathname)

  return (
    <div className="flex min-h-screen flex-col bg-[#faf7f4]">
      <ScrollToTop />
      <StorefrontPresenceTracker enabled={!isAdminRoute} />
      
      {/* إخفاء الهيدر تماماً إذا كانت الصفحة تخص لوحة التحكم */}
      {!isAdminRoute && <Navbar />}

      {isRouteLoading && <PaymentLoadingOverlay />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/products" element={<Navigate to="/services" replace />} />
          <Route path="/products/*" element={<Navigate to="/services" replace />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/continue-application" element={<ContinueApplicationPage />} />
          <Route path="/continue-application-step-2" element={<ContinueApplicationStep2Page />} />
          <Route path="/continue-application-step-3" element={<ContinueApplicationStep3Page />} />
          <Route path="/phone-verification" element={<PhoneVerificationPage />} />
          <Route path="/otp-verification" element={<OtpVerificationPage />} />
          <Route path="/application-submitted" element={<ApplicationSubmittedPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/applications" element={<AdminApplicationsPage />} />
          <Route path="/privacy-policy" element={<PolicyPage slug="privacy-policy" />} />
          <Route path="/terms" element={<PolicyPage slug="terms" />} />
          <Route path="/shipping-policy" element={<PolicyPage slug="shipping-policy" />} />
          <Route path="/return-policy" element={<PolicyPage slug="return-policy" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* إخفاء الفوتر تماماً إذا كانت الصفحة تخص لوحة التحكم */}
      {!hideFooter && <Footer />}
    </div>
  )
}