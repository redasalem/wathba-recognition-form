# 📖 نظام الكُتّاب الذكي - منصة تسجيل وتكريم طلاب الدورة الصيفية 🏆

> **الكُتّاب** هو نظام رقمي متكامل وبأعلى معايير التصميم والتكنولوجيا (Glassmorphism UI) مُخصص لإدارة وحصر وتكريم الطلاب المتفوقين في الدورة الصيفية لحفظ القرآن الكريم لعام 2026.

---

## 🌟 أبرز الميزات والخصائص

### 📝 1. نموذج التسجيل التفاعلي (Student Registration Form)
- **فحص مباشر ولحظي (Real-time Validation):** تنبيهات تفاعلية باللغة العربية تحت كل حقل لضمان إدخال البيانات بدقة (الاسم الثلاثي/الرباعي، أرقام التليفونات المصرية 11 رقم، السن، والمرحلة الدراسية).
- **رفع صورة الطالب (Photo Upload):** إمكانية رفع صورة شخصية للطالب وتخزينها سحابياً لطباعتها في بطاقة التكريم.
- **تأكيد فوري عبر الواتساب (WhatsApp Direct Sync):** تحويل ولي الأمر فور التسجيل ببطاقة شكر مخصصة ورابط تواصل مباشر عبر الواتساب مع إدارة الكُتّاب.

### 📊 2. لوحة تحكم وإحصائيات الإدارة (Admin Dashboard)
- **حماية وأمان (Security Access):** مودال تسجيل دخول محمي بكلمة مرور مخصصة لمسؤولي النظام.
- **مؤشرات إحصائية حية (Real-time Analytics & KPIs):**
  - عداد مائل ومتحرك (Animated Counters) لإجمالي الطلاب المسجلين ونسبة الصور المرفوعة.
  - إحصائية خاصة برعاية الأيتام (يتيم الأب / يتيم الأبوين) للتكريم والمراعاة الخاصة.
  - متوسط أعمار الطلاب وأعلى مرحلة دراسية إقبالاً.
- **رسوم بيانية تفاعلية (Visual Charts):**
  - **Donut Chart:** توزيع الطلاب حسب الحالة الاجتماعية.
  - **Bar Chart:** توزيع الفئات العمرية.
  - **Stage Distribution Bar:** شريط التوزيع النسبي للمراحل الدراسية.
- **إدارة كاملة للبيانات (Full CRUD Operations):**
  - **تعديل (Edit):** مودال تفاعلي لتعديل كافة بيانات الطالب المسجل.
  - **حذف (Delete):** إزالة الطالب مع رسالة تأكيد وإشعار منبثق.
  - **معاينة بطاقة التكريم (Profile View):** عرض كارت التكريم الذهبي للطالب.
- **فلترة وبحث متقدم (Advanced Search & Filters):**
  - بحث لحظي باسم الطالب، المدرسة، أو رقم الهاتف.
  - تصفية حسب المرحلة الدراسية، الحالة الاجتماعية، وترتيب النتائج (الأحدث، الأقدم، أبجدياً، السن).
  - نمطان للعرض: **عرض الجدول (Table View)** أو **عرض الكروت (Cards View)**.
  - **ترقيم الصفحات (Pagination):** تقسيم النتائج (10 طلاب بالصفحة) لسرعة الأداء.
- **تصدير وطباعة التقالير:**
  - تصدير كشف الطلاب بملف **Excel (CSV)** يدعم اللغة العربية بكفاءة (UTF-8 BOM).
  - تصدير نسخة احتياطية بصيغة **JSON**.
  - طباعة تقرير الكشف أو حفظه كملف **PDF** بتنسيق مخصص للطباعة ورسمي.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend Framework:** [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling & Design System:** [Tailwind CSS v4](https://tailwindcss.com/) + Custom Animations & Glassmorphism Effects
- **Database & Realtime Sync:** [Firebase Firestore](https://firebase.google.com/) (مع نظام هجين ذكي يستكمل العمل عبر `LocalStorage` محلياً في حال انقطاع الشبكة).
- **Cloud Storage:** [Cloudinary API](https://cloudinary.com/) لتخزين صور الطلاب سحابياً.
- **Icons:** [Lucide React](https://lucide.dev/)
- **Effects:** Canvas Confetti الاحتفالي عند النجاح.

---

## 🚀 كيفية التشغيل محلياً (Local Setup)

### 1. المتطلبات الأساسية
تأكد من تثبيت [Node.js](https://nodejs.org/) و [pnpm](https://pnpm.io/).

### 2. تثبيت الحزم (Install Dependencies)
افتح المجلد في التيرمينال واكتب:
```bash
pnpm install
```

### 3. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env` في المجلد الرئيسي واضف الإعدادات التالية:
```env
# 1. إعدادات منصة Firebase 🌐
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# 2. إعدادات Cloudinary 📸
VITE_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET=YOUR_UPLOAD_PRESET

# 3. كلمة مرور لوحة التحكم 🔐
VITE_ADMIN_PASSWORD=YOUR_ADMIN_PASSWORD
```

### 4. تشغيل خادم التطوير (Run Dev Server)
```bash
pnpm dev
```
افتح الرابط الظاهر في التيرمينال (عادة `http://localhost:5173`).

---

## 📦 البناء والنشر (Build & Production)

لبناء النسخة الجاهزة للنشر:
```bash
pnpm run build
```
سيتم إنشاء مجلد المخرجات `dist/` المجهز بالكامل ومعه ملف التوجيه الخاص بـ Netlify (`_redirects`).

---

## 🔒 الأمان وتأمين البيانات

- **دخول الإدارة:** محمي برمز مرور لا يظهر بالواجهة ويُقرأ من ملف البيئة `VITE_ADMIN_PASSWORD`.
- **روابط التواصل:** تفعيل كود الدولة المصري الرسمي `+20` لمنع توجيه رسايل الواتساب لأرقام خاطئة.

---

<p align="center">
  تم التطوير بواسطة <b>reda salem </b> 🚀 | حقوق العمل محفوظة لـ <b>الكُتّاب | وثبـة (Wathba)</b> 💚 2026
</p>
