<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" alt="React" width="60" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" alt="Vite" width="60" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" alt="Tailwind" width="60" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Firebase-Dark.svg" alt="Firebase" width="60" />

  <h1 align="center">📖 نظام الكُتّاب الذكي</h1>
  <p align="center">
    <strong>منصة رقمية متكاملة لتسجيل وإدارة وتكريم طلاب الدورة الصيفية لحفظ القرآن الكريم 🏆</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Firebase-11.3-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </p>
</div>

<br />

> **الكُتّاب** هو نظام متطور تم تصميمه بأحدث المعايير (Glassmorphism UI) ليكون الواجهة الأمثل لحصر الطلاب المتفوقين في الدورة الصيفية، مع لوحة تحكم ذكية تمنح الإدارة القدرة الكاملة على المتابعة الدقيقة واتخاذ القرارات بسهولة.

---

## ✨ المميزات الرئيسية

### 🧑‍🎓 1. بوابة تسجيل الطلاب (تفاعلية وذكية)
- **تحقق فوري (Real-time Validation):** مراجعة فورية للبيانات (الاسم الثلاثي/الرباعي، رقم الهاتف، السن، والمرحلة الدراسية) لتجنب الأخطاء.
- **رفع الصور سحابياً:** تكامل مع **Cloudinary** لرفع صور الطلاب وتجهيزها للاستخدام في شهادات التكريم.
- **ربط ذكي مع WhatsApp:** تحويل فوري لولي الأمر عبر الواتساب برسالة شكر معدة مسبقاً بعد إتمام التسجيل.

### 📈 2. لوحة تحكم الإدارة (Admin Dashboard)
- **نظام حماية صارم:** تسجيل دخول آمن عبر كلمة مرور مخصصة للإدارة.
- **إحصائيات حية وتفاعلية (Real-time Analytics):** 
  - عدادات متحركة (Animated Counters) للمسجلين.
  - إحصائيات متخصصة (رعاية الأيتام، متوسط الأعمار).
  - رسوم بيانية (Charts) تعرض توزيع المراحل العمرية والدراسية بشكل بصري احترافي.
- **إدارة كاملة (CRUD):** إمكانية (تعديل، حذف، واستعراض) بيانات الطلاب، مع معاينة كارت التكريم الذهبي لكل طالب.
- **تصدير وتقارير متقدمة:**
  - 📊 **Excel (CSV):** تصدير البيانات بدعم كامل للغة العربية.
  - 📄 **PDF:** طباعة التقارير بشكل رسمي ومنسق.
  - 💾 **JSON:** استخراج نسخة احتياطية للبيانات.

---

## 🛠️ التقنيات المستخدمة

- **الواجهة الأمامية (Frontend):** React 19, Vite, Tailwind CSS v4.
- **التصميم (Design):** Glassmorphism UI, Lucide Icons, Canvas Confetti.
- **قواعد البيانات (Database):** Firebase Firestore (مع دعم للعمل دون اتصال بالإنترنت `Offline Capabilities`).
- **التخزين السحابي (Cloud Storage):** Cloudinary API.

---

## 🚀 دليل التشغيل المحلي (Local Setup)

### 1️⃣ المتطلبات المسبقة
تأكد من وجود [Node.js](https://nodejs.org/) و [pnpm](https://pnpm.io/) في جهازك.

### 2️⃣ التثبيت
قم بنسخ المستودع وتثبيت الحزم:
```bash
git clone <repository-url>
cd recognition-form
pnpm install
```

### 3️⃣ إعداد متغيرات البيئة (Environment Variables)
انسخ ملف `.env.example` إلى `.env` وقم بتعبئة بياناتك:
```env
# 1. إعدادات Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# 2. إعدادات Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# 3. إعدادات لوحة التحكم
VITE_ADMIN_PASSWORD=your_secure_password
```

### 4️⃣ التشغيل
```bash
pnpm dev
```
تفضل بزيارة `http://localhost:5173` في متصفحك.

---

## 📦 البناء والنشر (Production Build)

لبناء التطبيق للإنتاج بصيغة محسنة:
```bash
pnpm run build
```
سيتم إنشاء مجلد `dist/` جاهز للرفع على منصات مثل Vercel أو Netlify.

---

## 🛡️ الأمان
- **كلمة مرور مشفرة:** كلمة مرور الإدارة لا تظهر في الكود ويتم إدارتها عبر المتغيرات البيئية `VITE_ADMIN_PASSWORD`.
- **معالجة الأرقام:** معالجة أرقام الهواتف وإضافة مفتاح الدولة `+20` تلقائياً لمنع التوجيه الخاطئ في الواتساب.

---

<div align="center">
  <p>تم التطوير بكل 💚 بواسطة <b>Reda Salem</b></p>
  <p>جميع الحقوق محفوظة لـ <b>مؤسسة الكُتّاب | وثبـة (Wathba) &copy; 2026</b></p>
</div>
