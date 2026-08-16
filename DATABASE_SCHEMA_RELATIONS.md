# 🗄️ توثيق وهيكلة قاعدة البيانات الموحدة لمنظومة كُتّاب (KUTTAB Master Relational Database Schema)

> **المسار الرئيسي لقاعدة البيانات (Master DB):** [`system/db/kuttab_master_database.xlsx`](file:///Users/mac/Desktop/Wathba/kuttab/system/db/kuttab_master_database.xlsx)  
> **مستند المصدر المباشر:** [`system/original_kuttab_data_inventory.xlsx`](file:///Users/mac/Desktop/Wathba/kuttab/system/original_kuttab_data_inventory.xlsx)

---

## 📐 1. مخطط العلاقات النمطية المعتمد (Third Normal Form - 3NF ERD)

تم إضافة **نظام الصلاحيات والأدوار الإدارية (`admin_role` & `permissions_level`)** للشيوخ والمشرفين لإتاحة متابعة التقرير والمراقبة البرمجية للمنظومة:

```mermaid
erDiagram
    tbl_students {
        string student_id PK "STD-001"
        string student_code "كود الطالب #001"
        string student_name "اسم الطالب/ة"
        string gender "M / F"
        string qr_code_url "رابط QR الفريد"
        string account_status "ACTIVE"
    }

    tbl_courses {
        string course_id PK "CRS-2026-SUMMER"
        string course_name "اسم الدورة"
        string season "الصيف 2026"
        date start_date "2026-06-01"
        date end_date "2026-08-28"
    }

    tbl_course_participations {
        string participation_id PK "PRT-2026-001"
        string student_id FK "رابط الطالب الأصلي"
        string course_id FK "رابط الدورة"
        string teacher_id FK "رابط المحفظ المشرف"
        string memorized_level "المستوى القرآني بالدورة"
        decimal exam_score "الدرجة من 100"
        string award_tier_id FK "رابط فئة الجائزة"
        string participation_status "COMPLETED_HONORED"
    }

    tbl_teachers {
        string teacher_id PK "TCH-001"
        string teacher_name "اسم المحفظ/ة"
        string admin_role "SUPER_ADMIN / DEPUTY_ADMIN / TEACHER"
        boolean has_admin_access "TRUE / FALSE"
        string permissions_level "FULL_SYSTEM_CONTROL"
        string employment_category "PAID_STAFF / VOLUNTEER"
        boolean is_paid "حالة المكافأة"
    }

    tbl_award_tiers {
        string tier_id PK "TIER-1 to TIER-5"
        string tier_name "فئة الجائزة والتكريم"
        decimal individual_reward_egp "المكافأة الفردية"
    }

    tbl_students ||--o{ tbl_course_participations : "يشترك ويختبر في (1:N)"
    tbl_courses ||--o{ tbl_course_participations : "تضم وتحوي (1:N)"
    tbl_teachers ||--o{ tbl_course_participations : "يشرف ويحفظ بالدورة (1:N)"
    tbl_award_tiers ||--o{ tbl_course_participations : "تمنح وتكافئ بالدورة (1:N)"
```

---

## 👑 2. جدول الأدوار الإدارية ومصفوفة الصلاحيات (Admin Roles & Permissions Matrix)

| الدور الإداري (`admin_role`) | المسمى التنفيذي بالعربي | المشرفون المحددون | نطاق الصلاحيات البرمجية (`permissions_level`) |
|---|---|---|---|
| **`SUPER_ADMIN`** | 👑 المشرف العام ومدير المنظومة | **الشيخ عبدالله حسن الديهى** | `FULL_SYSTEM_CONTROL`: التحكم التام في جميع أجزاء السيستم، تقارير جميع الطلاب والشيوخ، الميزانيات، وتعيين الصلاحيات. |
| **`DEPUTY_ADMIN`** | ⭐ المشرف الأكاديمي والتنفيذي | **الشيخ محمد الشعراوي الفوال** | `ACADEMIC_EXAM_CONTROL`: الإشراف التنفيذي الأكاديمي، متابعة قاعات الاختبارات، مراجعة درجات وتقارير الشيوخ والطلاب. |
| **`TEACHER`** | 📘 محفظ ومعلم دائم | طاقم المحفظين العاملين (16 محفظاً) | `GROUP_ONLY`: متابعة وتقييم مجموعة الطلاب المكلف بهم فقط، وتسجيل الحضور والغياب اليومي. |
| **`ASSISTANT`** | 🤝 معلم وطالب مساعد | المعلمون والطلاب المتطوعون (15 متطوعاً) | `ASSIST_ONLY`: صلاحيات مساعدة وتسميع للمجموعات المكلف بها دون تعديل في النتائج النهائية. |

---

## 🗄️ 3. جداول العلاقات والكيانات (Normalized Database Tables)

### 1️⃣ `tbl_teachers` (جدول المحفظين والشيوخ والأدوار الإدارية)
* `teacher_id` (PK): `TCH-001` إلى `TCH-033`.
* `admin_role`: تحديد المستوى الإداري (`SUPER_ADMIN`, `DEPUTY_ADMIN`, `TEACHER`, `ASSISTANT`).
* `has_admin_access`: قيمة منطقية لتفعيل لوحات التحكم والتصدير (`TRUE` / `FALSE`).
* `permissions_level`: المستوى الفعلي للتراخيص.
