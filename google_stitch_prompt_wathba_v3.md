# 🎨 Google Stitch Master Prompt: Wathba Kuttab v3.0 UI Design Suite

> **Brand Name:** Wathba Kuttab (`كُتّاب | KUTTAB`)  
> **Brand Slogan:** *"الأصالة في التحفيظ والتربية .. والسهولة والذكاء في النظام والمتابعة"*  
> **Design Theme:** Luxury Dark Emerald & Metallic Warm Gold (`#041915`, `#062b24`, `#fbbf24`), Glassmorphism, Modern RTL, Cairo Typography.  
> **Target Tool:** Google Stitch / AI UI Design Generators.

---

## 🎯 Master Prompt Goal

Generate a high-converting, state-of-the-art Web Application design for **Wathba Kuttab (كُتّاب)** with a strict separation between public informational pages and authenticated admin operations, including persistent "Remember Me" authentication.

---

## 🖥️ Screen 1: Public Landing Showcase (`LandingPage.jsx`)

### 1. Public Navigation Header (`Header.jsx`)
- **Logo & Title:** Wathba logo icon + **"كُتّاب | KUTTAB"** + subtitle *"المنظومة الذكية لتحفيظ القرآن الكريم والتربية"*.
- **Public Navigation Link:** Single link `"الرئيسية والتعريف"`.
- **Primary CTA:** Prominent **"تسجيل الدخول" (Login)** button styled in gradient amber (`#fbbf24`).
- **CRITICAL SECURITY RULE:** **Do NOT display any "لوحة التحكم" button** to public unauthenticated visitors.

### 2. Beta System Banner
- Top notice bar specifying: *"⚠️ تنبيه مرحلة التشغيل التجريبي (Beta/Demo System) .. البيانات والأرقام المعروضة قيد المراجعة والتدقيق"*.

### 3. Hero Section
- Bold brand headline, slogan *"الأصالة في التحفيظ والتربية .. والسهولة والذكاء في النظام والمتابعة"*.
- Call-to-Action buttons:
  - 🎓 `استكمال بيانات طالب مكرم` -> Opens `/student-form`
  - 👳‍♂️ `تسجيل معلم / شيخ` -> Opens `/sheikh-form`
  - 📘 `صفحة الفيسبوك الرسمية` -> External link

### 4. 🆕 Latest News & Summer Ceremony Banner (الحاجات الجديدة والتحديثات)
- Highlight banner showcasing **حفل ختام وتكريم الدورة الصيفية 2026**.
- Stats: **141 enrolled students**, **8 Quran completers**, **4 Araf portion completers**, Thursday Asr schedule (5:15 PM).

### 5. Live KPI Stats Grid
- 🎓 **141+** Enrolled Students
- 👳‍♂️ **14** Full-time Sheikhs
- 📹 **32** Hikvision Security Cameras
- 🏢 **5** Equipped Study Halls + 6th-floor Main Hall

### 6. Building Infrastructure & System Development Cards
- **Building & Security Card:** 32 Hikvision cameras, 6th-floor fiber roof insulation, chilled drinking water stations.
- **Smart System Card:** Zero paperwork for sheikhs, student QR codes, real-time parent WhatsApp reports.

### 7. Timeline Archive Section (أرشيف وإنجازات الكُتّاب)
- **Stage 1 (التأسيس والتحفيظ):** Founding Kutتاب rings & Azharite recitation.
- **Stage 2 (تطوير المبنى والأمان):** Hikvision 32 camera network & 6th-floor hall.
- **Stage 3 (التحول الرقمي 2026):** Smart QR codes & 2026 Summer Course.

---

## 🔐 Screen 2: Multi-Role Login Portal & Persistent Session (`LoginPortalModal.jsx`)

- Opens upon clicking **"تسجيل الدخول"** in header.
- **Persistent Auth Checkbox (خاصية تذكر تسجيل الدخول):**
  - Checkbox: `"تذكر تسجيل الدخول على هذا الجهاز (Remember Me)"`.
  - Saves persistent session flag in `localStorage` so Admin stays logged in upon page refresh.
- **3 Switcher Tabs:**
  1. 👑 **الإدارة والشيوخ (Admins & Sheikhs):** Password input (`kuttab2026@@`) -> Unlocks Admin Dashboard.
  2. 👨‍👩‍👧 **أولياء الأمور (Parents & Guardians):** Student search & evaluation report lookup by name or QR code.
  3. 🤝 **المتبرعون والمتطوعون (Donors & Volunteers):** Project financial progress & building safety reports.

---

## 👑 Screen 3: Restructured Admin Dashboard (`AdminDashboard.jsx`)

> **Access Condition:** Visible **ONLY when Admin is logged in** (either via active session or stored `localStorage` token).

### 4 Modular Top Navigation Tabs:
1. ☀️ **شُغل الدورة الصيفية 2026 (Summer Course 2026):**
   - KPI metrics: 141 summer students, 8 Quran completers, orphans count.
   - Search bar, Excel export, full student table with actions (Edit / Delete).

2. 🏆 **شُغل الحفلة والتكريم (Ceremony & Awards Hub):**
   - Stage Ascending Order List preview & link.
   - MC Teleprompter & Presentation Deck link.
   - Designer VIP Invitation Cards link (Stage Guests & VIP Row 1).

3. 🏛️ **شُغل الكُتّاب الدائم (General Kuttab Operations):**
   - Year-round student directory and general Kuttab Excel export.

4. 👳‍♂️ **سجل الشيوخ والمعلمين (Sheikhs & Faculty Directory):**
   - Sheikh profiles table (Name, phone, qualification, ijazat, assigned summer level, student count, Cloudinary avatar preview).
   - Add/Edit Sheikh modal with Cloudinary image uploader.

---

## 🎨 CSS Design System & Palette

```css
:root {
  --bg-dark: #041915;
  --bg-card: #062b24;
  --gold-primary: #fbbf24;
  --gold-hover: #d97706;
  --emerald-accent: #0c3d34;
  --emerald-light: #34d399;
  --rose-alert: #f43f5e;
  --font-family: 'Cairo', sans-serif;
}
```

---
*Generated for Wathba Kuttab Smart System v3.0 — Master Google Stitch Prompt with Persistent Auth*
