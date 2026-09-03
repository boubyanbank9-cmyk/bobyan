export const EMIRATES = [
  { id: 'abu-dhabi', nameEn: 'Abu Dhabi', nameAr: 'أبوظبي' },
  { id: 'dubai', nameEn: 'Dubai', nameAr: 'دبي' },
  { id: 'sharjah', nameEn: 'Sharjah', nameAr: 'الشارقة' },
  { id: 'ajman', nameEn: 'Ajman', nameAr: 'عجمان' },
  { id: 'uaq', nameEn: 'Umm Al Quwain', nameAr: 'أم القيوين' },
  { id: 'rak', nameEn: 'Ras Al Khaimah', nameAr: 'رأس الخيمة' },
  { id: 'fujairah', nameEn: 'Fujairah', nameAr: 'الفجيرة' },
]

export const CITIES = {
  'abu-dhabi': [
    { id: 'abu-dhabi-city', nameEn: 'Abu Dhabi City', nameAr: 'مدينة أبوظبي' },
    { id: 'al-ain', nameEn: 'Al Ain', nameAr: 'العين' },
    { id: 'al-reem', nameEn: 'Al Reem Island', nameAr: 'جزيرة الريم' },
    { id: 'yas-island', nameEn: 'Yas Island', nameAr: 'جزيرة ياس' },
    { id: 'saadiyat', nameEn: 'Saadiyat Island', nameAr: 'جزيرة السعديات' },
    { id: 'khalifa-city', nameEn: 'Khalifa City', nameAr: 'مدينة خليفة' },
    { id: 'mohammed-bin-zayed', nameEn: 'Mohammed Bin Zayed City', nameAr: 'مدينة محمد بن زايد' },
    { id: 'al-dhafra', nameEn: 'Al Dhafra', nameAr: 'الظفرة' },
  ],
  dubai: [
    { id: 'dubai-marina', nameEn: 'Dubai Marina', nameAr: 'دبي مارينا' },
    { id: 'jumeirah', nameEn: 'Jumeirah', nameAr: 'جميرا' },
    { id: 'deira', nameEn: 'Deira', nameAr: 'ديرة' },
    { id: 'bur-dubai', nameEn: 'Bur Dubai', nameAr: 'بر دبي' },
    { id: 'business-bay', nameEn: 'Business Bay', nameAr: 'الخليج التجاري' },
    { id: 'downtown', nameEn: 'Downtown Dubai', nameAr: 'داون تاون دبي' },
    { id: 'jlt', nameEn: 'JLT', nameAr: 'أبراج بحيرات جميرا' },
    { id: 'palm-jumeirah', nameEn: 'Palm Jumeirah', nameAr: 'نخلة جميرا' },
    { id: 'al-barsha', nameEn: 'Al Barsha', nameAr: 'البرشاء' },
    { id: 'silicon-oasis', nameEn: 'Dubai Silicon Oasis', nameAr: 'واحة دبي للسيليكون' },
    { id: 'mirdif', nameEn: 'Mirdif', nameAr: 'مردف' },
    { id: 'international-city', nameEn: 'International City', nameAr: 'المدينة العالمية' },
  ],
  sharjah: [
    { id: 'sharjah-city', nameEn: 'Sharjah City', nameAr: 'مدينة الشارقة' },
    { id: 'al-majaz', nameEn: 'Al Majaz', nameAr: 'المجاز' },
    { id: 'al-nahda-shj', nameEn: 'Al Nahda', nameAr: 'النهضة' },
    { id: 'muwaileh', nameEn: 'Muwaileh', nameAr: 'المويلح' },
    { id: 'university-city', nameEn: 'University City', nameAr: 'المدينة الجامعية' },
    { id: 'al-khan', nameEn: 'Al Khan', nameAr: 'الخان' },
  ],
  ajman: [
    { id: 'ajman-city', nameEn: 'Ajman City', nameAr: 'مدينة عجمان' },
    { id: 'al-nuaimiya', nameEn: 'Al Nuaimiya', nameAr: 'النعيمية' },
    { id: 'al-rashidiya', nameEn: 'Al Rashidiya', nameAr: 'الراشدية' },
    { id: 'al-jurf', nameEn: 'Al Jurf', nameAr: 'الجرف' },
  ],
  uaq: [
    { id: 'uaq-city', nameEn: 'Umm Al Quwain City', nameAr: 'مدينة أم القيوين' },
    { id: 'al-salama', nameEn: 'Al Salama', nameAr: 'السلامة' },
    { id: 'falaj-al-mualla', nameEn: 'Falaj Al Mualla', nameAr: 'فلج المعلا' },
  ],
  rak: [
    { id: 'rak-city', nameEn: 'Ras Al Khaimah City', nameAr: 'مدينة رأس الخيمة' },
    { id: 'al-nakheel', nameEn: 'Al Nakheel', nameAr: 'النخيل' },
    { id: 'al-hamra', nameEn: 'Al Hamra', nameAr: 'الحمرا' },
    { id: 'khuzam', nameEn: 'Khuzam', nameAr: 'خزام' },
  ],
  fujairah: [
    { id: 'fujairah-city', nameEn: 'Fujairah City', nameAr: 'مدينة الفجيرة' },
    { id: 'dibba', nameEn: 'Dibba', nameAr: 'دبا' },
    { id: 'kalba', nameEn: 'Kalba', nameAr: 'كلباء' },
    { id: 'mirbah', nameEn: 'Mirbah', nameAr: 'مربح' },
  ],
}

/** DB columns stay governorate/wilayat — values are emirate/city ids. */
export const GOVERNORATES = EMIRATES
export const WILAYATS = CITIES

const ALL_CITIES = Object.values(CITIES).flat()

const LEGACY_CITY_IDS = {
  jalan: 'jalan-bani-bu-ali',
}

function isArabicLang(lang) {
  return lang === 'ar' || lang === 'ur'
}

export function getGovernorateLabel(gov, lang) {
  if (typeof gov === 'string') {
    return getGovernorateNameById(gov, lang)
  }
  if (isArabicLang(lang)) return gov.nameAr
  return gov.nameEn
}

export function getWilayatLabel(city, lang) {
  if (typeof city === 'string') {
    return getWilayatNameById(city, lang)
  }
  if (isArabicLang(lang)) return city.nameAr
  return city.nameEn
}

export function getGovernorateNameById(id, lang = 'ar') {
  const emirate = EMIRATES.find((item) => item.id === id)
  if (!emirate) return id || 'غير محدد'
  return isArabicLang(lang) ? emirate.nameAr : emirate.nameEn
}

export function getWilayatNameById(id, lang = 'ar') {
  const resolvedId = LEGACY_CITY_IDS[id] || id
  const city = ALL_CITIES.find((item) => item.id === resolvedId)
  if (!city) return id || 'غير محدد'
  return isArabicLang(lang) ? city.nameAr : city.nameEn
}

export function getWilayatsForGovernorate(emirateId) {
  return CITIES[emirateId] || []
}

export const getEmirateLabel = getGovernorateLabel
export const getCityLabel = getWilayatLabel
export const getEmirateNameById = getGovernorateNameById
export const getCityNameById = getWilayatNameById
export const getCitiesForEmirate = getWilayatsForGovernorate
