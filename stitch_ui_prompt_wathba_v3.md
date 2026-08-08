# 🎨 Google Stitch & AI UI Prompt: Wathba Kuttab v3.0

> **System Name:** Wathba Kuttab Smart System v3.0 (`كُتّاب`)  
> **Brand Slogan:** *"الأصالة في التحفيظ والتربية .. والسهولة والذكاء في النظام والمتابعة"*  
> **Target Audience:** Public Visitors, Parents, Sheikhs/Teachers, System Admins, VIP Donors  
> **Theme Aesthetics:** Luxury Dark Emerald (`#041915`, `#062b24`), Metallic Warm Gold (`#fbbf24`, `#d97706`), Glassmorphism, Arabic Typography (`Cairo`), Modern RTL Layout.

---

## 🎯 Master Prompt Goal

Generate a luxury, high-converting, state-of-the-art Web Application for **Wathba Kuttab (كُتّاب)** with two primary user interfaces:

1. **Public Landing Showcase (الصفحة الرئيسية التعريفية والتحديثات الجديدة):**
   - Highlighting Wathba Kuttab identity and Azharite memorization methodology.
   - Prominently showcasing **Latest News & 2026 Summer Course Honor Ceremony (حفل ختام الدورة الصيفية 2026)**.
   - Displaying **Building Infrastructure & Safety Development (التطوير في المبنى والأمان)** (32 Hikvision cameras, 6th-floor fiber roof, chilled water stations).
   - Displaying **Smart Digital System (التحول الرقمي)** (Zero paperwork, student QR codes, real-time parent WhatsApp reports).
   - **Timeline Archive (أرشيف وإنجازات الكُتّاب)** tracking historical milestones from founding to current digital transformation.
   - Clean public navigation header with a single **Unified "تسجيل الدخول" (Login)** portal button (**Strictly NO public admin dashboard links**).

2. **Restructured & Reorganized Admin Dashboard (لوحة التحكم والإدارة المنظمة):**
   - Visible **ONLY to authenticated Admins** upon logging in via the Multi-Role Login Portal.
   - Organized into **4 distinct, modular top navigation tabs**:
     1. 🏛️ **شُغل الكُتّاب الدائم (General Kuttab Operations):** Year-round students, permanent sheikhs, attendance & stats.
     2. ☀️ **شُغل الدورة الصيفية 2026 (Summer Course 2026):** Summer registrants, levels (Quran completers, Araf portion, Juza Amma), assigned sheikhs.
     3. 🏆 **شُغل الحفلة والتكريم (Ceremony & Awards Hub):** Stage ascending order lists, student award categories, printable MC teleprompter & stage cue-cards, VIP guest invitation QR cards.
     4. 👳‍♂️ **سجل الشيوخ والمعلمين (Sheikhs & Faculty Directory):** Full Sheikh profiles, qualifications, ijazat, assigned classes, Cloudinary avatars.

---

## 📐 Page Structure & Visual Layout Guidelines

### 🏛️ Component 1: Public Header (`Header.jsx`)
- **Logo & Title:** Clean brand logo icon + **"كُتّاب | KUTTAB"** title + subtitle *"المنظومة الذكية لتحفيظ القرآن الكريم والتربية"*.
- **Public Navigation:** Single link `"الرئيسية والتعريف"`.
- **Right Action Button:** Prominent **"تسجيل الدخول" (Login)** button styled in gradient amber (`#fbbf24`).
- **Security Rule:** **Do NOT display any "لوحة التحكم" button** to public unauthenticated visitors.

### 🌟 Component 2: Public Landing Page (`LandingPage.jsx`)
- **Beta Demo System Notice:** Top alert banner specifying *"تنبيه مرحلة التشغيل التجريبي (Beta/Demo System) .. البيانات والأرقام قيد المراجعة والتدقيق"*.
- **Hero Section:** Wathba brand slogan, call-to-action buttons for student registration, sheikh registration, and official Facebook page.
- **Latest Updates & 2026 Summer Ceremony Showcase:** Highlight card showcasing 141 enrolled students, 8 Quran completers, 4 Araf portion completers, and Thursday Asr ceremony schedule.
- **Live KPI Counters Grid:**
  - 🎓 **141+** Enrolled Students
  - 👳‍♂️ **14** Full-time Sheikhs
  - 📹 **32** Hikvision Security Cameras
  - 🏢 **5** Equipped Study Halls + 6th-floor Main Hall
- **Building Infrastructure & Smart System Feature Cards:** Side-by-side cards highlighting 32 Hikvision cameras, fiber roof, chilled drinking water stations, student QR codes, zero paperwork.
- **Timeline Archive Section:** 3-stage visual cards (Stage 1: Founding -> Stage 2: Building Development -> Stage 3: Digital Transformation 2026).

### 🔐 Component 3: Multi-Role Login Portal Modal (`LoginPortalModal.jsx`)
- **Tabbed Login Modal:**
  - 👑 **الإدارة والشيوخ (Admins & Sheikhs):** Password input (`kuttab2026@@`).
  - 👨‍👩‍👧 **أولياء الأمور (Parents & Guardians):** Student search & evaluation lookup by name or QR.
  - 🤝 **المتبرعون والمتطوعون (Donors & Volunteers):** Building progress & financial reports.

### 👑 Component 4: Restructured Admin Dashboard (`AdminDashboard.jsx`)
- **Header Banner:** Welcome title, system status, and red Logout button.
- **Top Modular Tabs Switcher:**
  - `☀️ شُغل الدورة الصيفية 2026`
  - `🏆 شُغل الحفلة والتكريم`
  - `🏛️ شُغل الكُتّاب الدائم`
  - `👳‍♂️ سجل الشيوخ والمعلمين`
- **Tab 1 (Summer Course 2026):** Metrics grid (141 students, 8 Quran completers, orphans count), search bar, Excel export, full student table.
- **Tab 2 (Ceremony & Awards Hub):** Direct links & cards for Stage Ascending Order List HTML, MC Teleprompter Guide HTML, and Designer VIP Invitation Cards HTML.
- **Tab 3 (General Kuttab):** Year-round student directory and Kuttab Excel export.
- **Tab 4 (Sheikhs Directory):** Sheikh table displaying name, qualification, ijazat, assigned summer level, student count, phone, Cloudinary avatar preview, and Add/Edit/Delete modals.

---

## 🎨 Color Palette & UI Tokens

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
*Generated for Wathba Kuttab Smart System v3.0 — AI UI Prompt Package*
