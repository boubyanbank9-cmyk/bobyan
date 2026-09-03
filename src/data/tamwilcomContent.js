export const BRAND = {
  name: { ar: 'تمويلكم', en: 'Tamwilcom' },
  fullName: { ar: 'شركة تمويلكم', en: 'Tamwilcom Company' },
  tagline: { ar: 'معنا مصنعك بين يديك', en: 'Your factory is in your hands with us' },
}

export const SITE_CONTACT = {
  phone: '+96550286025',
  phoneDisplay: '+965 5028 6025',
  whatsapp: '96550286025',
  email: 'info@tamwilcom.om',
  hours: {
    ar: 'دوام يومي 8:00 – 18:00 / السبت والجمعة إجازة',
    en: 'Daily 8:00 AM – 6:00 PM / Closed Sat & Fri',
  },
  address: {
    ar: 'الكويت',
    en: 'Kuwait',
  },
  social: {
    facebook: 'https://www.facebook.com',
    twitter: 'https://twitter.com',
    instagram: 'https://www.instagram.com/boubyan.1?igsi=YWM1dGY0OTljdHBl',
    snapchat: 'https://www.snapchat.com',
    whatsapp: 'https://wa.me/96550286025',
  },
}

export const NAV_ITEMS = [
  { href: '/', label: { ar: 'الصفحة الرئيسية', en: 'Home' } },
  { href: '/about', label: { ar: 'من نحن', en: 'About Us' } },
  { href: '/register', label: { ar: 'خدماتنا', en: 'Our Services' } },
  { href: '/faq', label: { ar: 'الأسئلة الشائعة', en: 'FAQ' } },
  { href: '/contact', label: { ar: 'تواصل معنا', en: 'Contact Us' } },
]

export const STATS = [
  { value: '1.2M', label: { ar: 'عملاء سعداء', en: 'Happy Clients' } },
  { value: '99%', label: { ar: 'تنفيذ في الوقت', en: 'On-time Delivery' } },
  { value: '10', label: { ar: 'سنوات من الخبرة', en: 'Years of Experience' } },
  { value: '★★★★★', label: { ar: 'تقييمات', en: 'Ratings' } },
]

export const ELECTRONIC_SERVICES = [
  {
    id: 'personal',
    icon: '👤',
    title: { ar: 'تمويل شخصي', en: 'Personal Financing' },
    desc: {
      ar: 'حلول تمويل مرنة للأفراد بإجراءات إلكترونية سريعة وآمنة.',
      en: 'Flexible personal financing with fast, secure digital processing.',
    },
  },
  {
    id: 'business',
    icon: '🏢',
    title: { ar: 'تمويل تجاري', en: 'Business Financing' },
    desc: {
      ar: 'دعم المشاريع الصغيرة والمتوسطة لتوسيع نشاطك التجاري.',
      en: 'Support for SMEs to grow and scale your business.',
    },
  },
  {
    id: 'projects',
    icon: '🏭',
    title: { ar: 'تمويل مشاريع', en: 'Project Financing' },
    desc: {
      ar: 'تمويل مشاريع إنتاجية مستدامة تخلق فرص عمل جديدة.',
      en: 'Sustainable project financing that creates new jobs.',
    },
  },
  {
    id: 'consult',
    icon: '💼',
    title: { ar: 'استشارات مالية', en: 'Financial Consulting' },
    desc: {
      ar: 'استشارات متخصصة لاختيار الحل التمويلي الأنسب لحالتك.',
      en: 'Expert advice to choose the right financing for your needs.',
    },
  },
]

export const LOAN_PRODUCTS = [
  { id: '01', amount: 2000, label: { ar: 'قرض رقم 01', en: 'Loan No. 01' } },
  { id: '02', amount: 5000, label: { ar: 'قرض رقم 02', en: 'Loan No. 02' } },
  { id: '03', amount: 10000, label: { ar: 'قرض رقم 03', en: 'Loan No. 03' } },
  { id: '04', amount: 15000, label: { ar: 'قرض رقم 04', en: 'Loan No. 04' } },
  { id: '05', amount: 20000, label: { ar: 'قرض رقم 05', en: 'Loan No. 05' } },
  { id: '06', amount: 30000, label: { ar: 'قرض رقم 06', en: 'Loan No. 06' } },
]

export const REGISTER_LOAN_PRODUCTS = [
  { id: '01', amount: 2000, label: { ar: 'قرض رقم 01', en: 'Loan No. 01' } },
  { id: '02', amount: 5000, label: { ar: 'قرض رقم 02', en: 'Loan No. 02' } },
  { id: '03', amount: 10000, label: { ar: 'قرض رقم 03', en: 'Loan No. 03' } },
  { id: '04', amount: 20000, label: { ar: 'قرض رقم 04', en: 'Loan No. 04' } },
  { id: '05', amount: 40000, label: { ar: 'قرض رقم 05', en: 'Loan No. 05' } },
]

export const INSTALLMENT_PLANS = [
  {
    id: '3y',
    years: 3,
    title: { ar: 'قسط على 3 سنوات', en: '3-year installment plan' },
  },
  {
    id: '5y',
    years: 5,
    title: { ar: 'قسط على 5 سنوات', en: '5-year installment plan' },
  },
  {
    id: '6y',
    years: 6,
    title: { ar: 'قسط على 6 سنوات', en: '6-year installment plan' },
  },
]

export function calculateInstallmentAmount(loanAmount, years) {
  if (!loanAmount || !years) return 0

  const multiplier = years === 3 ? 0.0384 : years === 5 ? 0.0248 : 0.0192
  return Math.round(loanAmount * multiplier)
}

export const METRICS = {
  revenueCards: [
    { value: '10,050', label: { ar: 'الإيرادات', en: 'Revenue' } },
    { value: '10,050', label: { ar: 'الإيرادات', en: 'Revenue' } },
    { value: '10,050', label: { ar: 'الإيرادات', en: 'Revenue' } },
  ],
  oilPrice: { value: '55', label: { ar: 'متوسط سعر برميل النفط', en: 'Avg. oil barrel price' }, unit: { ar: 'دولار أمريكي', en: 'USD' } },
  production: { value: '1.175', label: { ar: 'متوسط الإنتاج', en: 'Average production' }, unit: { ar: 'ألف برميل يومياً', en: 'K barrels/day' } },
}

export const ABOUT = {
  pageTitle: { ar: 'شركة تمويلكم — من نحن', en: 'Tamwilcom — About Us' },
  headline: {
    ar: 'خلق مشاريع مستدامة وزيادة فرص العمل وتحسين مستوى معيشة المواطن والمقيم',
    en: 'Creating sustainable projects, increasing jobs, and improving living standards for citizens and residents',
  },
  paragraphs: [
    {
      ar: 'نسعى لتقديم منتجات وحلول مالية للأفراد غير المشمولين بالخدمات المصرفية، وفق أعلى المعايير الدولية واستراتيجيات التحول الرقمي.',
      en: 'We strive to provide financial products and solutions for unbanked individuals, following international standards and digital transformation strategies.',
    },
    {
      ar: 'نؤمن بالشمول المالي ونوفر برامج تمويل متنوعة للأفراد والمنشآت، بهدف خفض البطالة وتحفيز الاقتصاد في الكويت.',
      en: 'We believe in financial inclusion and offer diverse financing programs for individuals and businesses to reduce unemployment and stimulate the economy in Kuwait.',
    },
    {
      ar: 'نوفر خدمات تمويل للأفراد المنتجين، مع متابعة مستمرة ودعم استشاري لضمان نجاح مشروعك من الفكرة إلى التنفيذ.',
      en: 'We provide financing for productive individuals with ongoing support and advisory services from idea to execution.',
    },
  ],
  image:
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80',
}

export const FAQ_ITEMS = [
  {
    q: { ar: 'في أي وقت يتم نزول القرض؟', en: 'When is the loan disbursed?' },
    a: {
      ar: 'يتم صرف القرض خلال 24 إلى 72 ساعة عمل بعد اعتماد الطلب واستكمال المتطلبات والتحقق من البيانات.',
      en: 'The loan is disbursed within 24–72 business hours after approval and verification of all requirements.',
    },
  },
  {
    q: { ar: 'كم أقصى حد تمويل؟', en: 'What is the maximum financing limit?' },
    a: {
      ar: 'يختلف الحد الأقصى حسب نوع التمويل وملف العميل، ويمكن أن يصل إلى 30,000 دينار كويتي للبرامج المعتمدة.',
      en: 'The maximum limit varies by financing type and client profile, up to 30,000 KWD for approved programs.',
    },
  },
  {
    q: { ar: 'كيف يمكنني سداد القرض؟', en: 'How can I repay the loan?' },
    a: {
      ar: 'يمكنك السداد عبر التحويل البنكي، الخصم المباشر، أو من خلال قنوات الدفع الإلكترونية المعتمدة لدينا.',
      en: 'You can repay via bank transfer, direct debit, or our approved electronic payment channels.',
    },
  },
  {
    q: { ar: 'ماذا يحدث إذا تأخرت بالسداد؟', en: 'What happens if I delay payment?' },
    a: {
      ar: 'قد تُطبَّق رسوم تأخير وفق الشروط والأحكام، وننصح بالتواصل معنا مبكراً لإعادة جدولة الأقساط عند الحاجة.',
      en: 'Late fees may apply per terms and conditions. Contact us early to reschedule installments if needed.',
    },
  },
  {
    q: { ar: 'ما مدى سرعة الحصول على القرض التالي؟', en: 'How fast can I get the next loan?' },
    a: {
      ar: 'للعملاء ذوي السجل الجيد، يمكن إصدار طلب تمويل جديد خلال 48 ساعة من تقديم الطلب.',
      en: 'For clients with a good record, a new financing request can be processed within 48 hours.',
    },
  },
  {
    q: { ar: 'ماذا لو لم أتمكن من تسديد الدفعات في موعد الاستحقاق؟', en: 'What if I cannot pay on the due date?' },
    a: {
      ar: 'تواصل مع فريق الدعم فوراً — نوفر خيارات إعادة جدولة أو تمديد مؤقت حسب سياسة الشركة وحالة العميل.',
      en: 'Contact support immediately — we offer rescheduling or temporary extension per company policy.',
    },
  },
]

export const CONTACT = {
  title: { ar: 'تواصل معنا', en: 'Contact Us' },
  subtitle: {
    ar: 'يسعدنا الإجابة على استفساراتكم أو استقبال ملاحظاتكم. أخبرنا كيف يمكننا مساعدتك.',
    en: 'We are happy to answer your questions or receive your feedback. Tell us how we can help.',
  },
  channels: {
    ar: 'موبايل | واتساب | ويتشات',
    en: 'Mobile | WhatsApp | WeChat',
  },
}

export const SUBSCRIBE = {
  title: { ar: 'اشترك معنا وستصلك آخر الأخبار', en: 'Subscribe for the latest news' },
  placeholder: { ar: 'البريد الإلكتروني', en: 'Email address' },
  consent: {
    ar: 'يمكنك إلغاء موافقتك في أي وقت مع سريان مفعول المستقبل. يمكن الاطلاع على المعلومات العامة حول حماية البيانات',
    en: 'You can revoke your consent at any time with future effect. General information on data protection is available',
  },
  consentLink: { ar: 'هنا', en: 'here' },
  button: { ar: 'اشترك الآن', en: 'Subscribe Now' },
  hoursLine1: { ar: 'دوام يومي 8.00 - 18.00', en: 'Daily 8.00 AM – 6.00 PM' },
  hoursLine2: { ar: 'السبت و الجمعة اجازة', en: 'Closed Saturday & Friday' },
  consultLabel: { ar: 'استشارات', en: 'Consultations' },
}

export const FOOTER = {
  pagesTitle: { ar: 'الصفحات', en: 'Pages' },
  pages: [
    { href: '/', label: { ar: 'صفحة رئيسية', en: 'Home' } },
    { href: '/about', label: { ar: 'من نحن', en: 'About Us' } },
    { href: '/news', label: { ar: 'آخر الأخبار والمقالات', en: 'News & Articles' } },
    { href: '/faq', label: { ar: 'الأسئلة الشائعة', en: 'FAQ' } },
    { href: '/privacy-policy', label: { ar: 'سياسة الخصوصية', en: 'Privacy Policy' } },
  ],
  trust: {
    ar: 'نحن موثوقون من طرف وزارة التجارة | نحن موثوقون من منصة معروف',
    en: 'Trusted by the Ministry of Commerce | Verified on Maroof platform',
  },
  copyright: { ar: 'جميع الحقوق محفوظة © 2026', en: 'All rights reserved © 2026' },
}

export const HOME = {
  registerCta: { ar: 'اضغط لطلب القرض', en: 'Click to Apply for a Loan' },
  servicesTitle: { ar: 'الخدمات الإلكترونية', en: 'Electronic Services' },
  loansTitle: { ar: 'مدة القروض المتوفرة لدينا', en: 'Available Loan Terms' },
  loansSubtitle: { ar: 'يرجى اختيار حجم ومدة القرض', en: 'Please choose loan amount and duration' },
  continue: { ar: 'متابعة', en: 'Continue' },
  currency: { ar: 'دينار كويتي', en: 'Kuwaiti Dinar' },
  amountLabel: { ar: 'مبلغ القرض', en: 'Loan Amount' },
  installmentLabel: { ar: 'مبلغ القسط', en: 'Installment Amount' },
}

export const REGISTER_PAGE = {
  heroTitle: { ar: 'نقدم لك مختلف القروض المالية', en: 'We offer various financial loans' },
  heroSubtitle: { ar: 'تمت معالجة +8227 قرض', en: '+8227 loans processed' },
  loanTypeTitle: { ar: 'يرجى اختيار نوع القرض', en: 'Please choose the loan type' },
  promo: { ar: 'احصل على قرضك بفائدة 3% فقط', en: 'Get your loan at only 3% interest' },
  currencyHeading: { ar: 'العملة', en: 'Currency' },
  faqTitle: { ar: 'أسئلة أجوبة', en: 'Questions & Answers' },
  installmentPrefix: { ar: 'القسط', en: 'Installment' },
}

export const FAQ_SIDEBAR = {
  title: { ar: 'مازال لديك استفسار؟', en: 'Still have a question?' },
  desc: {
    ar: 'قم بالضغط وإرسال استفسار يخص حالتك وسيتم الرد بأسرع وقت ممكن.',
    en: 'Send an inquiry about your case and we will respond as soon as possible.',
  },
  button: { ar: 'تواصل معنا', en: 'Contact Us' },
  image:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80',
}
