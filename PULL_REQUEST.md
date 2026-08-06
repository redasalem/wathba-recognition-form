# 🔀 Pull Request: Wathba Kuttab v2.0 — Sheikhs Registration Form, Dual-Scope Admin Dashboard & Public Landing Page Showcase

---

## 📌 PR Metadata
- **PR Title:** `feat(sheikhs-landing): Add Sheikhs registration form, dual-scope admin dashboard, and landing page showcase`
- **Source Branch:** `feature/sheikhs-form-and-landing`
- **Target Branch:** `main`
- **Assignee / Lead Developer:** Wathba Engineering Team
- **Requested Reviewer:** Reda Salem (@redasalem)
- **Status:** Ready for Review & Testing 🧪

---

## 🎯 Context & Motivation

As part of the **Wathba Kuttab Smart System v2.0** initiative for the 2026 Summer Course and Kuttab Digital Transformation, we needed to fulfill three primary operational goals:

1. **Digitalize Teacher & Sheikh Profiles:** Create a dedicated, luxury registration form for Sheikhs (`SheikhForm.jsx`) capturing both core academic credentials (Azharite qualifications, Ijazat, address) and summer course participation data (supervised levels, assigned student count, stipend/volunteer status).
2. **Independent Data Filtering (Kuttab General vs. Summer Course 2026):** Upgrade `AdminDashboard.jsx` to allow Sheikhs and Sheikhs-in-charge to toggle seamlessly between permanent Kuttab data and seasonal 2026 Summer Competition data for both Students and Teachers.
3. **Public Landing Page & Progress Showcase:** Create a high-converting, visually inspiring public landing page (`LandingPage.jsx`) displaying real-time KPI counters (141+ students, 14 Sheikhs, 32 Hikvision cameras, 5 study halls) and daily updates regarding building safety, smart QR code system, daily recitation methodology, and summer ceremony preparations.

---

## 🛠️ Detailed Changes Summary

### 1. `recognition-form/src/components/SheikhForm.jsx` `[NEW]`
- **Purpose:** Dedicated registration and profiling form for Quran Teachers & Sheikhs.
- **Section 1 (Core Identity):** Full Name, Phone/WhatsApp (with Egyptian 11-digit regex validation `01[0125]\d{8}`), Azharite Qualification (*معهد القراءات / كلية الشريعة / حافظ للقرآن*), Ijazat & Transmissions (*رواية حفص عن عاصم / القراءات العشر*), Address/Village, Profile Photo upload.
- **Section 2 (Summer Course 2026):** Summer participation status, supervised level (*القرآن كاملاً / جزء الأعراف / البراعم وجزء عم*), assigned student count, stipend/volunteer status, and teacher notes/recommendations for Kuttab development.
- **Cloudinary Photo Upload:** Integrated unsigned upload with real-time avatar preview, loading spinner, and fallback icon.
- **Feedback:** Success state with `canvas-confetti` animation and one-click reset to register another teacher.

### 2. `recognition-form/src/components/LandingPage.jsx` `[NEW]`
- **Purpose:** Public landing page and project progress showcase.
- **Hero Banner:** Features official brand slogan: *"الأصالة في التحفيظ والتربية .. والسهولة والذكاء في النظام والمتابعة"*.
- **Live KPI Counters:**
  - 🎓 **141+** Enrolled Students (4x growth over previous year).
  - 👳‍♂️ **14** Full-time Sheikhs & Teachers.
  - 📹 **32** Hikvision Security Cameras for student safety.
  - 🏢 **5** Fully equipped study halls + 6th-floor main hall.
- **Daily Progress Trackers:**
  - 🏢 **Building Infrastructure & Safety:** Hikvision 32 camera network, fiber roof for 6th floor, chilled drinking water stations.
  - 💻 **Smart System Updates:** Individual student QR codes, zero paperwork for teachers, instant WhatsApp parent reports.
  - 📖 **Daily Sheikh Methodology:** 3-ring recitations (new memorization, near review, far review), Tajweed & Mutun supervision, weekly student honors.
- **Ceremony Showcase:** Highlights 8 Quran completers, 4 Araf portion students, and 141 awarded kids.

### 3. `recognition-form/src/components/AdminDashboard.jsx` `[MODIFIED]`
- **Purpose:** Admin management interface.
- **Dual-Scope View Switcher:** Toggles for `الكل (الكُتّاب + الدورة)`, `☀️ طلاب/شيوخ الدورة الصيفية 2026`, and `🏛️ بيانات الكُتّاب الدائم` for both Students and Sheikhs tables independently.
- **Tabs Navigation:** Switch between `🎓 الطلاب المكرمون` and `👳‍♂️ الشيوخ والمعلمون`.
- **Expanded Columns for Sheikhs:** Displays Full Name, Address, Azharite Qualification, Ijazat, Supervised Summer Level, Assigned Student Count, Phone, Photo Avatar preview, and Action buttons (Edit / Delete).
- **Filtered Excel Exports:** Downloads BOM UTF-8 CSV reports reflecting current tab and active scope filter.

### 4. `recognition-form/src/components/Header.jsx` & `src/App.jsx` `[MODIFIED]`
- **Header Navigation:** Added quick tabs: `الرئيسية والتعريف` | `نموذج الطالب` | `نموذج الشيخ` | `دخول الإدارة`.
- **Mobile Menu Drawer:** Added responsive toggle drawer for small screens.
- **Root Router:** Managed active views (`'landing'`, `'form'`, `'sheikh-form'`, `'success'`, `'admin'`).
- **Global Toast Container:** Color-coded notification banner (emerald success, rose error, gold info).

### 5. `recognition-form/src/firebase.js` `[MODIFIED]`
- **Firebase Firestore Service:** Added real-time subscription listener `subscribeSheikhs` and CRUD handlers (`addSheikhRecord`, `updateSheikhRecord`, `deleteSheikhRecord`).

---

## 🧪 Step-by-Step QA & Testing Guide for Reviewer (@redasalem)

Please follow these steps to test and verify the implementation:

### 1. Checkout Branch & Inspect Code
```bash
cd /Users/mac/Documents/wathba-kuttab
git checkout feature/sheikhs-form-and-landing
git status
```

### 2. Test Sheikh Registration Form (`/sheikh-form`)
1. Click on **نموذج الشيخ** in the header.
2. Fill out Section 1 (Name, Phone, Qualification, Ijazat, Address, upload profile picture).
3. Fill out Section 2 (Summer participation, level, assigned student count, stipend status, notes).
4. Click **حفظ وتأكيد بيانات فضيلة الشيخ بالكامل**.
5. **Expected Result:** Confetti animation fires, toast notification appears, and data is written to Firestore `sheikhs` collection.

### 3. Test Admin Dashboard Dual-Scope Views (`/admin`)
1. Click **دخول الإدارة** in header and enter password `kuttab2026@@`.
2. Navigate to **الشيوخ والمعلمون** tab.
3. Test scope filter buttons:
   - Click `☀️ شيوخ الدورة الصيفية 2026` -> Verify only summer Sheikhs are shown.
   - Click `🏛️ شيوخ الكُتّاب الدائمين` -> Verify general Kuttab Sheikhs are shown.
4. Click **تصدير حصر الشيوخ (Excel)** -> Verify CSV file downloads with UTF-8 BOM encoding.
5. Repeat scope filter test on the **الطلاب المكرمون** tab.

### 4. Test Landing Page Showcase (`/`)
1. Click **الرئيسية والتعريف** in the header.
2. Verify all KPI counters (141 students, 14 Sheikhs, 32 cameras, 5 rooms) render properly.
3. Verify progress cards (Building, Smart System, Sheikh Methodology, Ceremony Highlights) render cleanly on desktop and mobile viewports.

---

## 🔍 Code Review & Enhancement Checklists for Reda (@redasalem)

Here are suggested areas where your review and enhancements would be greatly appreciated:

- [ ] **Security Refactoring:** Transition hardcoded admin password (`kuttab2026@@`) in `AdminLoginModal.jsx` / `App.jsx` to environment variables or Firebase Auth rules.
- [ ] **HEIC Image Handling:** Add client-side conversion for iPhone `.heic` photos before uploading to Cloudinary.
- [ ] **Data Validation & Sanitization:** Check edge-case inputs in form fields (e.g. max text length, whitespace trimming).
- [ ] **UI/UX Polish:** Review font sizes, padding, and animations on ultra-mobile screens.
- [ ] **Code Modularity:** Review if `SheikhForm.jsx` or `AdminDashboard.jsx` could benefit from sub-component extraction.

---

## 📝 Git Commit Trail

```bash
30c9873 - feat: add independent Kuttab vs Summer Course 2026 data views in admin dashboard, update landing page showcases, and refresh review docs
743ac37 - feat: enhance Sheikhs form with complete profile data (qualifications, ijazat, address, summer course notes) as requested
d2e4c24 - feat: add Sheikhs registration form, Sheikhs admin dashboard management tab, and interactive Landing Page with progress counters
```

---
*Happy reviewing! Please leave your feedback, comments, and enhancement commits directly on this branch.* 🚀
