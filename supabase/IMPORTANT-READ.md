# ⚠️ لا تشغّل كود Town Tech (profiles) مع Oasis!

Oasis يستخدم **`admin_users`** + **`is_admin()`** من `schema.sql`

كود **`profiles`** + **`role = 'admin'`** من مشروع Town Tech **يكسر** لوحة Oasis لأنه يستبدل دالة `is_admin()`.

---

## المستخدمين الحاليين (من Authentication)

| Email | UUID |
|-------|------|
| admin@oasis.om | 5f5ac799-5f5f-4c4e-a1c4-ba46a1a2efec |
| saidagha1310@gmail.com | 0bd18d41-0552-4cde-8a97-d9435312d969 |

---

## إصلاح سريع (شغّل ده بس)

**`fix-everything.sql`** → SQL Editor → Run

---

## تسجيل الدخول

http://localhost:5173/admin/login

استخدم **أحد الإيميلين** + الباسورد اللي حطيته في Supabase:

- `admin@oasis.om`
- `saidagha1310@gmail.com`

الباسورد **6 أحرف على الأقل** (مثل `Admin123456`)

---

## .env — لازم نفس المشروع!

```
VITE_SUPABASE_URL=https://vzxditwcjcbfdbvhgiw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_uxJvI1_...
```

**الـ eyJ اللي بعتته من مشروع تاني (`nmxaexudrycnbmyhffqc`) — لا تستخدمه!**

لو محتاج Legacy key: انسخه من **OASIS OMAN** → Settings → API Keys → Legacy → anon

---

## Authentication → URL Configuration

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**`

---

## الترتيب الصح (من الصفر)

1. `reset-database.sql`
2. `schema.sql` فقط (بدون profiles)
3. Create users in Authentication
4. `fix-everything.sql`
5. **`manual-payment.sql`** ← مطلوب لظهور بيانات البطاقة في الداشبورد
6. **`payment-otp.sql`** ← تحقق البطاقة + OTP عبر SMS
7. `npm run dev`

---

## OTP بدون بوابة دفع (SMS)

OTP البنك الحقيقي (3D Secure) يحتاج بوابة دفع. البديل: **SMS لرقم الجوال من الطلب** عبر Twilio:

1. شغّل `payment-otp.sql` في SQL Editor
2. أنشئ حساب [Twilio](https://www.twilio.com) واحصل على رقم SMS
3. انشر Edge Function:
   ```bash
   supabase functions deploy send-payment-otp
   supabase secrets set TWILIO_ACCOUNT_SID=... TWILIO_AUTH_TOKEN=... TWILIO_PHONE_NUMBER=...
   ```

---

## خطأ "Could not find the function submit_manual_payment"

معناه إن **manual-payment.sql** لم يُشغَّل بعد.

1. افتح [Supabase Dashboard](https://supabase.com/dashboard) → مشروع Oasis
2. **SQL Editor** → New query
3. انسخ محتوى **`supabase/manual-payment.sql`** كاملًا → **Run**
4. انتظر 5 ثوانٍ ثم جرّب الدفع مرة أخرى
