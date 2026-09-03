# Oasis Oman — Supabase من الصفر

## الخطوة 1 — ملف `.env`

```
VITE_SUPABASE_URL=https://vzxditwcjcbfdbvhgiw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

**لو الدخول مش شغال:** استخدم **Legacy anon key** (أضمن):
1. **Settings → API Keys → Legacy API Keys → anon public** (`eyJ...`)
2. في `.env`:
   `VITE_SUPABASE_ANON_KEY=eyJ...`
3. أعد تشغيل `npm run dev`

**Authentication → URL Configuration:**
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

## الخطوة 2 — شغّل Schema (مرة واحدة)

1. افتح [SQL Editor](https://supabase.com/dashboard/project/vzxditwcjcbfdbvhgiw/sql/new)
2. انسخ **كل** محتوى `supabase/schema.sql`
3. اضغط **Run**
4. لازم يقول **Success** بدون errors

## الخطوة 3 — أنشئ مستخدم Admin

1. [Authentication → Users](https://supabase.com/dashboard/project/vzxditwcjcbfdbvhgiw/auth/users)
2. **Add user → Create new user**
3. املأ:
   - **Email:** `admin@oasis.om`
   - **Password:** `Admin123456` (6 أحرف على الأقل)
   - ✅ **Auto Confirm User**
4. **Create user**

## الخطوة 4 — اربط Admin بالداشبورد

1. افتح SQL Editor
2. انسخ محتوى `supabase/link-admin.sql`
3. لو استخدمت إيميل غير `admin@oasis.om` — غيّره في السطر `WHERE email = '...'`
4. **Run**
5. لازم تشوف: `OK ✅ admin ready`

## الخطوة 5 — شغّل الموقع

```bash
cd C:\Users\Heba\Desktop\oasis-website
npm run dev
```

| الرابط | |
|--------|--|
| الموقع | http://localhost:5173 |
| الداشبورد | http://localhost:5173/admin/login |

**تسجيل الدخول:**
- Email: `admin@oasis.om`
- Password: `Admin123456`

---

## لو حابب تمسح كل حاجة وتبدأ تاني

شغّل **`supabase/reset-database.sql`** كامل في SQL Editor، ثم **`schema.sql`**.

(لا تستخدم `DROP FUNCTION is_admin()` لوحده — في policies معتمدة عليه.)

---

## أخطاء شائعة

| الرسالة | الحل |
|---------|------|
| بيانات الدخول غلط | الباسورد 6+ أحرف — اعمل Reset password |
| غير مصرح بالدخول | شغّل `link-admin.sql` |
| Supabase غير مُعد | تأكد من `.env` وأعد تشغيل `npm run dev` |
