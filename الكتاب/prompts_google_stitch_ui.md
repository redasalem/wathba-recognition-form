# 🎨 Google Stitch Master Prompt — Kuttab Wathba Mobile Application
## البرومبت الشامل لتوليد شاشات تطبيق "كُتّاب وَثْبَة" عبر أدوات الذكاء الاصطناعي (Google Stitch / Figma / v0)

---

### 📋 كيفية الاستخدام (How to Use):
انسخ النص الموجود داخل المربع أدناه ووجهه مباشرة لأداة **Google Stitch** أو أي أداة توليد واجهات (مثل Stitch, v0.dev, أو Claude Artifacts). النص مكتوب بالإنجليزية التقنية الدقيقة الموصى بها لأدوات التوليد للحصول على أفضل نتيجة بصرياً (High Fidelity UI).

---

```markdown
Role & Task:
You are a Senior Mobile UI/UX Product Designer creating a world-class, modern, ultra-clean mobile app UI suite for "Wathba Kuttab" (وَثْبَة) — a rural Quran Education & Community Development platform in Janaj Village, Egypt.

Design System & Aesthetics:
- Target Platform: Android & iOS Mobile (Kotlin Multiplatform / Jetpack Compose / Flutter look).
- Language & Direction: Arabic Right-to-Left (RTL) natively supported, with clean typography (Inter / Tajawal / Cairo font family).
- Color Palette:
  - Primary Background: Sleek Light Theme (Pure White #FFFFFF & Soft Off-White #F8FAFC) with Dark Mode compatibility.
  - Primary Brand Accent: Deep Navy Blue (#0A192F) — represents trust & structure.
  - Secondary Accent: Emerald Green (#10B981) — represents Quran/Life/Success & Attendance.
  - Highlight Accent: Warm Gold (#F59E0B) — represents excellence, badges & stars.
  - Warning/Absence Red: Coral Red (#EF4444).
- Card Style: Rounded corners (16px border-radius), subtle floating elevation shadows, generous padding, touch-friendly tap targets (min 48dp height).

------------------------------------------------────────────────────────────────

SCREEN 1: AUTHENTICATION & TEACHER ONBOARDING (تسجيل الدخول وإنشاء حساب المحفظ)
- Header: Elegant Wathba Kuttab Logo, welcoming title "مرحباً بك في كُتّاب وَثْبَة".
- Segmented Tab Toggle: [تسجيل الدخول] | [إنشاء حساب محفظ جديد].
- Login View: Phone number input with country code picker, password field, "تسجيل الدخول" primary button.
- Registration View: Full Name, Phone Number, University Qualification dropdown, Quran Ijaza/Specialization tags, Shift Preference (8-hour split shift / 4-hour quick shift).
- OTP Modal Overlay: 4-digit code input field for free WhatsApp verification code with countdown timer ("إعادة إرسال رمز الواتساب").

------------------------------------------------────────────────────────────────
--------------------------------------------------------------------------------

SCREEN 2: TEACHER MAIN DASHBOARD & GROUP VIEW (لوحة تحكم الشيخ والمجموعة الحالية)
- Top Bar: Teacher profile avatar, Name "فضيلة الشيخ أحمد", active shift pill "الفترة الصباحية (8 ص - 1 ظ)", and notification bell.
- Progress Banner Card: Visual summary of current group ("مجموعة أجزاء عم وتبارك"):
  - Circular Progress Ring: 72% Completed Today.
  - Stat Badges: 🟢 18 تم التسميع | 🟡 7 لم يتم التسميع بعد | ⚪ 25 إجمالي المجموعة.
- Hero Floating Action Button (FAB): Huge prominent center button with camera icon: [ 📷 مسح كارت الطالب QR ].
- Search Bar: Quick instant search bar with placeholder "ابحث باسم الطالب أو الكود..." for manual search fallback.
- Student Quick List: Grid/List of student avatars with progress badges (Green checkmark for attended, amber clock for pending).

--------------------------------------------------------------------------------

SCREEN 3: ZERO-FRICTION MULTI-SECTION RECITATION & STUDENT DETAILS (شاشة التسميع الفردي: اللوح، الثابت، الماضي البعيد، الواجب، والتسجيل)
- Trigger: Opens instantly when student QR card is scanned or selected from search.
- Top Profile Card: Large Student Photo, Full Name "عمر محمد علي", Age "9 سنوات", Grade "الصف الثالث الابتدائي", Current Level "الجزء الثالث 📖", and Auto-Save Status Pill: "💾 تم حفظ المسوّدة تلقائياً (توفير البطارية)".
- Four Recitation Assessment Sections (اللوح + الثابت + الماضي البعيد + الواجب):
  1. Section 1: "اللوح الجديد" (New Memorization):
     - Surah Selector Dropdown ("سورة الجِن ▾") & Ayah Range ("من 1 إلى 15").
     - 4 Gold Star Rating Selector: ⭐⭐⭐⭐ ممتاز | ⭐⭐⭐ جيد جداً | ⭐⭐ جيد | ⚠️ إعـادة.
  2. Section 2: "الثابت" (Immediate Past Surah / المراجعة القريبة):
     - Surah Field ("سورة المزّمّل - السورة السابقة").
     - 4 Gold Star Rating Selector: ⭐⭐⭐⭐ ممتاز | ⭐⭐⭐ جيد جداً | ⭐⭐ جيد | ⚠️ ضعيف/إعادة.
  3. Section 3: "الماضي البعيد" (Long-term Review / الأجزاء السابقة):
     - Juz / Surah Range Selector ("الجزء الأول والثاني").
     - 4 Gold Star Rating Selector: ⭐⭐⭐⭐ ممتاز | ⭐⭐⭐ جيد جداً | ⭐⭐ جيد | ⚠️ ضعيف/إعادة.
  4. Section 4: "🎯 اللوح القادم (واجب الجلسة القادمة)":
     - Surah Selector Dropdown ("سورة الجِن ▾") & Ayah Range ("من 16 إلى 28").
- Optional Video / Audio Recording Field (تسجيل فيديو تلاوة اختياري):
  - Card Title: "🎥 فيديو تلاوة متميزة لولي الأمر (اختياري)".
  - Compact Action Button: `[ 🔴 تسجيل مقطع فيديو 15 ثانية ]` or `[ 📁 رفع مقطع صوتي ]`.
- Quick Teacher Notes Field: Optional teacher note ("ممتاز في اللوح والثابت، الماضي البعيد يحتاج تثبيت").
- Auto-Save & Screen-Lock Recovery Feature (الحفظ التلقائي الفوري لتوفير البطارية):
  - Continuous local background auto-save on every selection change.
  - If teacher locks phone screen to conserve battery during long recitation, student remains pinned with badge `[ 📝 مسودة جارية ]` on the group list to instantly resume upon unlock.
- Fast Workflow & Action Controls (زر الحفظ والانتقال السريع):
  - Toggle Switch: `[ ✓ ] المسح التلقائي للطالب التالي فور الحفظ` (Auto Camera Scan).
  - Primary Action Button: Large prominent Emerald Green button `[ 💾 تأكيد التسميع ومسح الطالب التالي 📷 ]`.
  - Secondary Action Link: `حفظ فقط` (Save only without launching camera).

----------------------------------------------------------------------------------------------------------------

SCREEN 4: END-OF-SHIFT & PENDING ABSENCE MANAGEMENT (شاشة ختام الفترة وإدارة المتبقين)
- Top Warning Pill: "تنبيه: متبقي 7 طلاب لم يتم مسح كروت لهم اليوم في هذه الفترة".
- Pending Students List: Cards displaying unverified student names, photos, and last attendance date.
- Per-Student Quick Actions (3 buttons per card):
  - Red Button: [ 🚫 غياب ]
  - Yellow Button: [ ⏳ تأجيل للفترة المسائية ]
  - Green Button: [ 📝 تسميع يدوي ]
- Bottom Floating Footer: Full-width red outline button: [ 📥 تحديد الكل وتأكيد الغياب المجمع لختام اليوم ].

------------------------------------------------────────────────────────────────

SCREEN 5: SMART ADD NEW STUDENT & INSTANT QR CARD (شاشة إضافة طالب جديد وتوليد الـ QR)
- Top Navigation: Header "تسجيل طالب جديد في الكُتّاب".
- Smart Input Form:
  - Full Name Input with auto-duplication warning banner.
  - Date of Birth Picker with auto-calculated age badge ("السن: 8 سنوات - الصف الثالث الابتدائي").
  - Guardian Contact Picker Button: [ 📇 سحب رقم ولي الأمر من الأسماء ] next to Phone Input field.
- Social & Scholarship Tag Selectors:
  - Orphan Status Chips: [ غير يتيم ] | [ 💜 يتيم الأب ] | [ يتيمة الأم ] | [ يتيم الأبوين ].
  - Fee Status Chips: [ 🟢 قادر - 100ج ] | [ 🎁 معفي لليتم ] | [ 🤝 معفي لظروف مادية ] | [ تعثر جزئي ].
- Assignment Section: Assigned Teacher Dropdown, Assigned Shift (Morning / Evening), Starting Juz (1-30).
- Bottom Action & Modal Preview:
  - Primary Button: [ ➕ حفظ وتوليد كارت QR ].
  - Modal Pop-up on Save: Renders a printable Student ID Card preview with photo, name, unique code, and crisp QR Code + Button [ 📱 إرسال صورة الكارت فوراً لواتساب ولي الأمر ].

----------------------------------------------------------------────────────────

SCREEN 6: ADMIN SUPER-DASHBOARD & ANALYTICS (لوحة تحكم الإدارة العليا والتحليلات)
- Header Bar: "لوحة تحكم إدارة كُتّاب وَثْبَة" | Date Picker Filter [ اليوم: 21 يوليو 2026 ].
- Executive Metric Cards Grid (4 KPI Cards):
  1. Total Active Students: 250 (📈 +12% this month).
  2. Today's Attendance Rate: 94% (🟢 High Commitment).
  3. Active Teachers On-Duty: 14 Teachers.
  4. Monthly Tuition Collected: 18,500 EGP / 25,000 EGP Target.
- Smart Multi-Filter Controls Bar:
  - Filter Chips: [ جميع الفترات ▾ ] [ جميع المجموعات ▾ ] [ جميع الحالات الاجتماعية ▾ ].
- Student Progress & Risk Analytics Widget:
  - Progress Velocity Bar Chart: Average Juz completion rate per month.
  - At-Risk Warning Box: "⚠️ 5 طلاب تجاوزوا نسبة غياب 3 أيام هذا الشهر" with 1-tap WhatsApp contact trigger to parents.
- Teacher Performance & Workload Monitoring Table/Grid.

--------------------------------------------------------------------------------

SCREEN 7: ULTRA-FAST QR & SEARCH STUDENT ATTENDANCE CHECK-IN (شاشة تسجيل الحضور السريع)
- Purpose: Dedicated screen for 1-tap rapid arrival check-in when students enter the Kuttab.
- Header Bar: "تسجيل حضور الطلاب ⏱️" | Shift Pill: "الفترة الصباحية" | Live Time: "08:15 AM".
- Top Live Attendance Stat Bar:
  - 🟢 حاضر: 42 | 🟡 متبقي: 18 | ⚪ الإجمالي: 60 طالباً.
- Prominent Dual-Input Mode Section:
  1. Primary Mode (Instant Camera Scanner Box):
     - Large Scanner Viewport with framing guide: "ضع كارت الـ QR أمام الكاميرا لتسجيل الحضور فوراً".
     - Success Flash Toast: "🟢 تم تسجيل حضور الطالب: عمر محمد علي بنجاح (الساعة 8:15 ص)".
  2. Fallback Mode (Instant Search Bar):
     - Search Field: "🔍 ابحث باسم الطالب أو رقم الكود للتسجيل اليدوي...".
- Quick Attendance Student List / Grid:
  - List of today's group students with quick toggle buttons:
  - Card layout: Photo, Student Name, Code, Status Badge.
  - One-Tap Quick Actions: `[ 🟢 تسجيل حضور ]` | `[ 🚫 تسجيل غياب ]`.

================================================================================
BONUS: STUDENT QR CARD GRAPHIC DESIGN & IMAGE PROMPT (برومبت تصميم كارت الـ QR)
================================================================================

Use this prompt in Midjourney v6 / DALL-E 3 / Google Imagen 3 / Stitch to generate realistic 3D mockups of the physical Student QR ID Card:

```text
Photorealistic studio product shot of a premium, modern Student ID Card for "Wathba Kuttab" (كُتّاب وَثْبَة - قرية جناج). Vertical portrait plastic PVC smart card, hanging from a premium dark navy woven fabric lanyard with a sleek silver metallic clip.

Design & Layout:
- Header: Elegant Deep Navy Blue (#0A192F) top banner featuring a gold Arabic calligraphy logo "كُتّاب وَثْبَة" and subtitled "قرية جناج - بسيون".
- Border: Subtle geometric Islamic pattern along the edges in Emerald Green (#10B981) and Gold (#F59E0B).
- Photo Section: Oval portrait placeholder of a smiling young 8-year-old Egyptian boy with a clean white background, framed with a circular gold border.
- Arabic Student Info (RTL alignment):
  - Name: "عمر محمد علي" (Bold Arabic typography)
  - Student ID: "WATHBA-2026-084"
  - Group: "مجموعة عم وتبارك 📖"
  - Shift Pill: Emerald Green badge with white text "الفترة الصباحية"
- Bottom QR Code Section: A crisp, large, high-contrast black and gold 2D QR Code centered at the bottom, with a small caption below in Arabic: "امسح الكارت للتسميع والحضور".

Background & Lighting:
- Card is placed at a dynamic 30-degree angle on a dark walnut wooden desk next to a copy of the Holy Quran with gold page edges. Soft cinematic studio lighting, shallow depth of field, 8k resolution, photorealistic rendering.
```
```

---

*ملف برومبت تصميم واجهات وكروت تطبيق كُتّاب وثبة — يوليو 2026*

