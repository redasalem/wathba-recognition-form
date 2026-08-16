import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Download,
  Filter,
  UserCheck,
  Phone,
  BookOpen,
  School,
  Heart,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Camera,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Eye,
  LogOut,
  ChevronDown,
  Printer,
  ShieldCheck,
  Building,
  GraduationCap,
  MapPin,
  Sun,
  Calendar,
  MessageSquare,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import {
  updateStudentRecord,
  deleteStudentRecord,
  subscribeSheikhs,
  addSheikhRecord,
  updateSheikhRecord,
  deleteSheikhRecord
} from '../firebase';
import { uploadToCloudinary } from '../services/cloudinary';
import StudentEditModal from './StudentEditModal';

export default function AdminDashboard({ records, onLogout, showToast }) {
  // Tab control: 'summer' | 'ceremony' | 'kuttab' | 'sheikhs' | 'families'
  const [activeTab, setActiveTab] = useState('summer');

  // Scope Filter: 'ALL' (الكُتّاب والدورة) | 'SUMMER_2026' (الدورة الصيفية فقط) | 'KUTTAB_ONLY' (الكُتّاب العام)
  const [studentScope, setStudentScope] = useState('ALL');
  const [sheikhScope, setSheikhScope] = useState('ALL');

  // ---------------------------------------------------
  // 👨‍👩‍👧‍👦 حالة وبيانات الأسر والأشقاء (Families & Siblings State)
  // ---------------------------------------------------
  const [familySearch, setFamilySearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('ALL'); // 'ALL' | 'WITH_SIBLINGS' | 'SINGLE_CHILD'

  // ---------------------------------------------------
  // 1. حالة الشيوخ والمعلمين (Sheikhs State & Subscriptions)
  // ---------------------------------------------------
  const [sheikhs, setSheikhs] = useState([]);
  const [sheikhsLoading, setSheikhsLoading] = useState(true);
  const [sheikhSearch, setSheikhSearch] = useState('');
  const [sheikhModalOpen, setSheikhModalOpen] = useState(false);
  const [editingSheikh, setEditingSheikh] = useState(null);
  const [sheikhFormData, setSheikhFormData] = useState({
    name: '',
    phone: '',
    qualification: '',
    ijazat: '',
    address: '',
    participatingSummer: 'نعم - مشارك بالدورة الصيفية',
    summerLevel: 'إشراف عام وفصول القرآن كاملاً',
    availability: 'متفرغ كلياً (مكافأة شهرية)',
    studentsCount: 0,
    socialStatus: 'متزوج',
    notes: '',
    photoUrl: ''
  });
  const [sheikhPhotoPreview, setSheikhPhotoPreview] = useState(null);
  const [uploadingSheikhPhoto, setUploadingSheikhPhoto] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSheikhs(
      (data) => {
        setSheikhs(data);
        setSheikhsLoading(false);
      },
      (err) => {
        console.error('Error fetching sheikhs:', err);
        setSheikhsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------
  // 2. حالة الطلاب (Students State & Controls)
  // ---------------------------------------------------
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState('ALL');
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [orphanFilter, setOrphanFilter] = useState('ALL');
  const [previewImage, setPreviewImage] = useState(null);

  // ---------------------------------------------------
  // 3. تصفية وحسابات الطلاب المتقدمة
  // ---------------------------------------------------
  const filteredStudents = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        !searchTerm ||
        r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.fatherPhone?.includes(searchTerm) ||
        r.motherPhone?.includes(searchTerm) ||
        r.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentCode?.includes(searchTerm);

      const matchPart = selectedPart === 'ALL' || r.partName === selectedPart;
      const matchStage = selectedStage === 'ALL' || r.studyStage === selectedStage;
      const matchOrphan =
        orphanFilter === 'ALL' ||
        (orphanFilter === 'ORPHAN' && r.fatherStatus === 'يتيم الأب') ||
        (orphanFilter === 'ALIVE' && r.fatherStatus !== 'يتيم الأب');

      const isSummer = r.partName || r.sheikhName || r.totalParts !== undefined;
      const matchScope =
        studentScope === 'ALL' ||
        (studentScope === 'SUMMER_2026' && isSummer) ||
        (studentScope === 'KUTTAB_ONLY' && !isSummer);

      return matchSearch && matchPart && matchStage && matchOrphan && matchScope;
    });
  }, [records, searchTerm, selectedPart, selectedStage, orphanFilter, studentScope]);

  const studentStats = useMemo(() => {
    const total = records.length;
    const summerCount = records.filter((r) => r.partName || r.sheikhName).length;
    const orphans = records.filter((r) => r.fatherStatus === 'يتيم الأب').length;
    const quranCompleters = records.filter((r) => r.partName === 'القرآن كاملاً').length;
    const withPhotos = records.filter((r) => r.photoUrl).length;

    return { total, summerCount, orphans, quranCompleters, withPhotos };
  }, [records]);

  // ---------------------------------------------------
  // 4. تصفية وحسابات الشيوخ المتقدمة
  // ---------------------------------------------------
  const filteredSheikhs = useMemo(() => {
    return sheikhs.filter((s) => {
      const matchSearch =
        !sheikhSearch ||
        s.name?.toLowerCase().includes(sheikhSearch.toLowerCase()) ||
        s.phone?.includes(sheikhSearch) ||
        s.qualification?.toLowerCase().includes(sheikhSearch.toLowerCase()) ||
        s.ijazat?.toLowerCase().includes(sheikhSearch.toLowerCase());

      const isSummerSheikh =
        s.participatingSummer?.includes('نعم') ||
        s.summerLevel ||
        s.availability?.includes('متفرغ');

      const matchScope =
        sheikhScope === 'ALL' ||
        (sheikhScope === 'SUMMER_2026' && isSummerSheikh) ||
        (sheikhScope === 'KUTTAB_ONLY' && !isSummerSheikh);

      return matchSearch && matchScope;
    });
  }, [sheikhs, sheikhSearch, sheikhScope]);

  const sheikhStats = useMemo(() => {
    const total = sheikhs.length;
    const summerSheikhs = sheikhs.filter((s) => s.participatingSummer?.includes('نعم') || s.summerLevel).length;
    const fullTime = sheikhs.filter((s) => s.availability?.includes('متفرغ')).length;
    const totalStudentsAssigned = sheikhs.reduce((acc, s) => acc + (Number(s.studentsCount) || 0), 0);

    return { total, summerSheikhs, fullTime, totalStudentsAssigned };
  }, [sheikhs]);

  // ---------------------------------------------------
  // 👨‍👩‍👧‍👦 5. تجميع وتصفية بيانات الأسر والأشقاء
  // ---------------------------------------------------
  const familiesData = useMemo(() => {
    const map = new Map();

    records.forEach((rec) => {
      const phoneKey = (rec.fatherPhone || '').trim();
      const nameKey = (rec.parentName || '').trim();
      const key = (phoneKey.length >= 10) ? phoneKey : (nameKey || rec.id);

      if (!map.has(key)) {
        map.set(key, {
          key,
          parentName: rec.parentName || 'ولي أمر غير محدد',
          fatherPhone: rec.fatherPhone || '',
          motherPhone: rec.motherPhone || '',
          fatherStatus: rec.fatherStatus || 'الأب على قيد الحياة',
          totalChildrenCount: Number(rec.totalChildrenCount || 1),
          kuttabChildrenCount: Number(rec.kuttabChildrenCount || 1),
          students: [],
          siblingsList: []
        });
      }

      const fam = map.get(key);
      fam.students.push(rec);

      if (rec.parentName && (fam.parentName === 'ولي أمر غير محدد' || !fam.parentName)) {
        fam.parentName = rec.parentName;
      }
      if (rec.fatherPhone && !fam.fatherPhone) {
        fam.fatherPhone = rec.fatherPhone;
      }
      if (rec.motherPhone && !fam.motherPhone) {
        fam.motherPhone = rec.motherPhone;
      }
      if (rec.totalChildrenCount && Number(rec.totalChildrenCount) > fam.totalChildrenCount) {
        fam.totalChildrenCount = Number(rec.totalChildrenCount);
      }
      if (rec.kuttabChildrenCount && Number(rec.kuttabChildrenCount) > fam.kuttabChildrenCount) {
        fam.kuttabChildrenCount = Number(rec.kuttabChildrenCount);
      }

      if (Array.isArray(rec.siblings)) {
        rec.siblings.forEach(sib => {
          if (sib.name && !fam.siblingsList.some(s => s.name === sib.name)) {
            fam.siblingsList.push(sib);
          }
        });
      }
    });

    return Array.from(map.values());
  }, [records]);

  const filteredFamilies = useMemo(() => {
    return familiesData.filter((fam) => {
      const matchSearch =
        !familySearch ||
        fam.parentName?.toLowerCase().includes(familySearch.toLowerCase()) ||
        fam.fatherPhone?.includes(familySearch) ||
        fam.motherPhone?.includes(familySearch) ||
        fam.students.some(s => s.studentName?.toLowerCase().includes(familySearch.toLowerCase())) ||
        fam.siblingsList.some(sib => sib.name?.toLowerCase().includes(familySearch.toLowerCase()));

      const hasSiblings = fam.students.length > 1 || fam.siblingsList.length > 0 || fam.kuttabChildrenCount > 1;
      const matchFilter =
        familyFilter === 'ALL' ||
        (familyFilter === 'WITH_SIBLINGS' && hasSiblings) ||
        (familyFilter === 'SINGLE_CHILD' && !hasSiblings);

      return matchSearch && matchFilter;
    });
  }, [familiesData, familySearch, familyFilter]);

  const familyStats = useMemo(() => {
    const totalFamilies = familiesData.length;
    const totalStudents = records.length;
    const familiesWithSiblings = familiesData.filter(f => f.students.length > 1 || f.siblingsList.length > 0 || f.kuttabChildrenCount > 1).length;
    const totalKids = familiesData.reduce((acc, f) => acc + (f.totalChildrenCount || 1), 0);
    const avgKids = totalFamilies ? (totalKids / totalFamilies).toFixed(1) : '0';

    return { totalFamilies, totalStudents, familiesWithSiblings, avgKids };
  }, [familiesData, records]);

  // ---------------------------------------------------
  // 6. دوال تصدير Excel
  // ---------------------------------------------------
  const exportStudentsToExcel = () => {
    if (filteredStudents.length === 0) {
      showToast?.('لا توجد بيانات طلاب لتصديرها', 'error');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'م,كود الطالب,اسم الطالب,السن,المرحلة,المدرسة,فئة الدورة,درجة الاختبار,الشيخ,هاتف الأب,هاتف الأم,حالة الأب,الملاحظات\n';

    filteredStudents.forEach((r, idx) => {
      const row = [
        idx + 1,
        `"${r.studentCode || ''}"`,
        `"${r.studentName || ''}"`,
        r.studentAge || '',
        `"${r.studyStage || ''}"`,
        `"${r.schoolName || ''}"`,
        `"${r.partName ? 'مشارك بالدورة الصيفية 2026' : 'كُتّاب عام'}"`,
        `"${r.examScore || ''}"`,
        `"${r.sheikhName || ''}"`,
        `"${r.fatherPhone || ''}"`,
        `"${r.motherPhone || ''}"`,
        `"${r.fatherStatus || ''}"`,
        `"${r.notes || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_طلاب_الكتاب_${studentScope}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('تم تصدير سجل الطلاب بنجاح 📊', 'success');
  };

  const exportSheikhsToExcel = () => {
    if (filteredSheikhs.length === 0) {
      showToast?.('لا توجد بيانات شيوخ لتصديرها', 'error');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'م,اسم الشيخ,رقم التليفون,المؤهل العلمي,الإجازات,العنوان,مشاركة الدورة,مستوى الدورة,عدد الطلاب,المكافأة/التفرغ,الملاحظات والمقترحات\n';

    filteredSheikhs.forEach((s, idx) => {
      const row = [
        idx + 1,
        `"${s.name || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.qualification || ''}"`,
        `"${s.ijazat || ''}"`,
        `"${s.address || ''}"`,
        `"${s.participatingSummer || 'نعم'}"`,
        `"${s.summerLevel || s.specialization || ''}"`,
        s.studentsCount || 0,
        `"${s.stipendStatus || s.availability || ''}"`,
        `"${s.notes || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `حصر_بيانات_الشيوخ_الكتاب_${sheikhScope}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('تم تصدير حصر الشيوخ بنجاح 📊', 'success');
  };

  const exportFamiliesToExcel = () => {
    if (filteredFamilies.length === 0) {
      showToast?.('لا توجد بيانات أسر لتصديرها', 'error');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'م,اسم ولي الأمر,هاتف ولي الأمر (واتساب),هاتف الأم,حالة الأب,إجمالي الأولاد,المقيدين في الكُتّاب,الطلاب المكرمون المسجلون,بيانات الأشقاء الإضافيين\n';

    filteredFamilies.forEach((fam, idx) => {
      const studentNames = fam.students.map(s => `${s.studentName || ''} (${s.partName || 'القرآن'} - ${s.studyStage || ''})`).join(' | ');
      const siblingNames = fam.siblingsList.map(sib => `${sib.name || ''} (${sib.studyStage || ''})`).join(' | ');

      const row = [
        idx + 1,
        `"${fam.parentName || ''}"`,
        `"${fam.fatherPhone || ''}"`,
        `"${fam.motherPhone || ''}"`,
        `"${fam.fatherStatus || ''}"`,
        fam.totalChildrenCount || 1,
        fam.kuttabChildrenCount || 1,
        `"${studentNames}"`,
        `"${siblingNames}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_الأسر_والأشقاء_الكتاب_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('تم تصدير سجل الأسر والأشقاء بنجاح 👨‍👩‍👧‍👦', 'success');
  };

  // ---------------------------------------------------
  // 7. إدارة الشيوخ والطلاب
  // ---------------------------------------------------
  const handleOpenSheikhModal = (sheikh = null) => {
    if (sheikh) {
      setEditingSheikh(sheikh);
      setSheikhFormData({
        name: sheikh.name || '',
        phone: sheikh.phone || '',
        qualification: sheikh.qualification || 'معهد القراءات / الأزهر الشريف',
        ijazat: sheikh.ijazat || 'رواية حفص عن عاصم',
        address: sheikh.address || 'قرية جناج - مركز بسيون',
        participatingSummer: sheikh.participatingSummer || 'نعم - مشارك بالدورة الصيفية',
        summerLevel: sheikh.summerLevel || sheikh.specialization || 'إشراف عام وفصول القرآن كاملاً',
        availability: sheikh.stipendStatus || sheikh.availability || 'متفرغ كلياً (مكافأة شهرية)',
        studentsCount: sheikh.studentsCount || 0,
        socialStatus: sheikh.socialStatus || 'متزوج',
        notes: sheikh.notes || '',
        photoUrl: sheikh.photoUrl || ''
      });
      setSheikhPhotoPreview(sheikh.photoUrl || null);
    } else {
      setEditingSheikh(null);
      setSheikhFormData({
        name: '',
        phone: '',
        qualification: 'معهد القراءات / الأزهر الشريف',
        ijazat: 'رواية حفص عن عاصم',
        address: 'قرية جناج - مركز بسيون',
        participatingSummer: 'نعم - مشارك بالدورة الصيفية',
        summerLevel: 'إشراف عام وفصول القرآن كاملاً',
        availability: 'متفرغ كلياً (مكافأة شهرية)',
        studentsCount: 0,
        socialStatus: 'متزوج',
        notes: '',
        photoUrl: ''
      });
      setSheikhPhotoPreview(null);
    }
    setSheikhModalOpen(true);
  };

  const handleSheikhPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSheikhPhotoPreview(URL.createObjectURL(file));
    setUploadingSheikhPhoto(true);

    try {
      const url = await uploadToCloudinary(file);
      setSheikhFormData((prev) => ({ ...prev, photoUrl: url }));
      showToast?.('تم رفع صورة الشيخ بنجاح', 'success');
    } catch (err) {
      console.error('Photo upload error:', err);
      showToast?.('حدث خطأ أثناء رفع صورة الشيخ', 'error');
    } finally {
      setUploadingSheikhPhoto(false);
    }
  };

  const handleSaveSheikh = async (e) => {
    e.preventDefault();
    if (!sheikhFormData.name.trim()) {
      showToast?.('اسم الشيخ مطلوب', 'error');
      return;
    }

    try {
      const payload = {
        name: sheikhFormData.name.trim(),
        phone: sheikhFormData.phone.trim() || '-',
        qualification: sheikhFormData.qualification.trim(),
        ijazat: sheikhFormData.ijazat.trim(),
        address: sheikhFormData.address.trim(),
        participatingSummer: sheikhFormData.participatingSummer,
        summerLevel: sheikhFormData.summerLevel,
        specialization: sheikhFormData.summerLevel,
        availability: sheikhFormData.availability,
        stipendStatus: sheikhFormData.availability,
        studentsCount: Number(sheikhFormData.studentsCount) || 0,
        socialStatus: sheikhFormData.socialStatus,
        notes: sheikhFormData.notes.trim(),
        photoUrl: sheikhFormData.photoUrl
      };

      if (editingSheikh) {
        await updateSheikhRecord(editingSheikh.id, payload);
        showToast?.('تم تحديث بيانات الشيخ بنجاح', 'success');
      } else {
        await addSheikhRecord(payload);
        showToast?.('تم إدراج بيانات الشيخ بنجاح 🎉', 'success');
      }

      setSheikhModalOpen(false);
    } catch (err) {
      console.error('Error saving sheikh:', err);
      showToast?.('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDeleteSheikh = async (id, name) => {
    if (window.confirm(`هل أنت تأكد من حذف بيانات الشيخ: ${name}؟`)) {
      try {
        await deleteSheikhRecord(id);
        showToast?.('تم حذف الشيخ بنجاح', 'info');
      } catch (err) {
        console.error('Error deleting sheikh:', err);
        showToast?.('حدث خطأ أثناء الحذف', 'error');
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await deleteStudentRecord(id);
      showToast?.('تم حذف الطالب بنجاح', 'info');
    } catch (err) {
      console.error('Error deleting student:', err);
      showToast?.('حدث خطأ أثناء حذف الطالب', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeInUp text-slate-100 p-2 sm:p-4">
      
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🚀 1. EXECUTIVE HEADER & TABS NAVIGATION */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0c3d34] via-[#062b24] to-[#041915] border border-[#fbbf24]/40 p-5 sm:p-7 shadow-2xl backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Brand & Title */}
          <div className="text-center lg:text-right space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة والمتابعة المركزية | كُتّاب 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              منظومة كُتّاب <span className="text-[#fbbf24]">| التحليلات والربط الشامل</span>
            </h1>
            <p className="text-xs text-emerald-200/80 font-medium max-w-xl">
              إدارة بروتوكول التكريم، حصر الأسر والأشقاء، وإحصاءات الشيوخ والطلاب بكفاءة وسرعة فائقة.
            </p>
          </div>

          {/* Luxury Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-emerald-700/50 shadow-inner max-w-full">
            <button
              onClick={() => { setActiveTab('summer'); setStudentScope('SUMMER_2026'); }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'summer'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Sun className={`w-4 h-4 ${activeTab === 'summer' ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>الدورة الصيفية ({studentStats.summerCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('ceremony')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'ceremony'
                  ? 'bg-gradient-to-r from-amber-400 to-[#fbbf24] text-slate-950 shadow-lg shadow-amber-400/30 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>حفل التكريم والمسرح</span>
            </button>

            <button
              onClick={() => { setActiveTab('kuttab'); setStudentScope('KUTTAB_ONLY'); }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'kuttab'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-lg shadow-blue-500/30 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>الكُتّاب الدائم</span>
            </button>

            <button
              onClick={() => setActiveTab('sheikhs')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'sheikhs'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>سجل الشيوخ ({sheikhStats.total})</span>
            </button>

            <button
              onClick={() => setActiveTab('families')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                activeTab === 'families'
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-teal-400/30 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>الأسر والأشقاء ({familyStats.totalFamilies})</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/30 mr-1"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🏆 TAB 2: CEREMONY HUB (حفلة التكريم والمسرح) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'ceremony' && (
        <div className="space-y-6 animate-fadeInUp">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 via-[#062b24] to-emerald-900/40 border border-[#fbbf24]/40 p-6 rounded-3xl text-center space-y-2 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-black">
              <Sparkles className="w-4 h-4" />
              Ceremony Hub | مركز إتاحة ودليل حفلة التكريم 2026
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">كشف صعود المسرح، دليل المقدم، ودعوات كبار الزوار</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
              إدارة بروتوكول التكريم المباشر، ترتيب صعود الطلاب حسب إتمام أجزاء القرآن، وكروت الـ QR الخاصة بكبار الشخصيات.
            </p>
          </div>

          {/* 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Stage Ascension Roster (2 Cols) */}
            <div className="lg:col-span-2 bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
                <div className="flex items-center gap-2.5 font-black text-[#fbbf24] text-base">
                  <Award className="w-5 h-5" />
                  <span>كشف ترتيب صعود المسرح (Stage Ascension Roster)</span>
                </div>
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-700/40">
                  مرتب تنازلياً حسب الحفظ ⭐
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0c3d34] text-[#fbbf24] font-black border-b border-emerald-700/50">
                      <th className="p-3 text-center rounded-r-xl">الترتيب</th>
                      <th className="p-3">اسم الطالب المكرم</th>
                      <th className="p-3">الفئة ومستوى الحفظ</th>
                      <th className="p-3">الشيخ المشرف</th>
                      <th className="p-3 text-center rounded-l-xl">نداء المقدم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800/30">
                    {records
                      .slice()
                      .sort((a, b) => (b.totalParts || 0) - (a.totalParts || 0))
                      .slice(0, 20)
                      .map((r, idx) => (
                        <tr key={r.id || idx} className="hover:bg-emerald-900/30 transition-colors">
                          <td className="p-3 text-center font-black text-[#fbbf24]">
                            <span className={`inline-block w-6 h-6 rounded-full leading-6 text-center text-xs ${
                              idx === 0 ? 'bg-amber-400 text-slate-950 font-black' :
                              idx === 1 ? 'bg-slate-300 text-slate-950 font-black' :
                              idx === 2 ? 'bg-amber-700 text-white font-black' : 'text-slate-300'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-white text-sm">{r.studentName}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[11px] border border-amber-500/30">
                              {r.partName || `${r.totalParts || 0} أجزاء`}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">{r.sheikhName || 'الشيخ المشرف'}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => showToast?.(`جاري نداء الطالب: ${r.studentName} على المسرح 🎤`, 'success')}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow transition-all active:scale-95"
                            >
                              🎤 نداء الآن
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Presenter Guide & VIP Cards (1 Col) */}
            <div className="space-y-6">
              
              {/* Presenter Cue Card */}
              <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-6 space-y-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5 font-black text-[#fbbf24] text-sm border-b border-emerald-800/40 pb-3">
                  <Printer className="w-5 h-5 text-amber-400" />
                  <span>دليل مقدم الحفل التفاعلي</span>
                </div>
                <div className="p-4 bg-slate-950/80 rounded-2xl border border-emerald-800/40 text-xs text-slate-300 space-y-3 leading-relaxed">
                  <div className="font-black text-amber-300 flex items-center gap-1.5">
                    <span>🎙️ صيغة التقديم المعتمدة على المسرح:</span>
                  </div>
                  <p className="italic text-slate-200 p-3 bg-emerald-950/50 rounded-xl border border-emerald-700/30 text-xs leading-loose">
                    "بسم الله الرحمن الرحيم .. ويتفضل الآن لصعود منصة التكريم الطالب الحافظ لكتاب الله تعالى / <strong className="text-[#fbbf24]">[اسم الطالب]</strong> .. تحت إشراف فضيلة الشيخ / <strong className="text-emerald-300">[اسم الشيخ]</strong>."
                  </p>
                </div>
              </div>

              {/* VIP Invitation Pass */}
              <div className="bg-[#062b24]/90 border border-[#fbbf24]/30 rounded-3xl p-6 space-y-3 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2.5 font-black text-white text-sm border-b border-emerald-800/40 pb-3">
                  <ShieldCheck className="w-5 h-5 text-[#fbbf24]" />
                  <span>دعوة كبار الشخصيات والمنصة (VIP Card)</span>
                </div>
                <div className="p-5 bg-gradient-to-br from-amber-500/10 via-[#062b24] to-emerald-950 rounded-2xl border border-[#fbbf24]/30 text-center space-y-3">
                  <div className="text-xs font-black text-[#fbbf24]">بطاقة شرفية لحضور المنصة الرئيسي</div>
                  <div className="w-24 h-24 bg-slate-950 rounded-2xl border-2 border-[#fbbf24] mx-auto flex flex-col items-center justify-center text-amber-300 shadow-xl">
                    <Sparkles className="w-8 h-8 mb-1 text-[#fbbf24]" />
                    <span className="text-[10px] font-mono font-black">VIP-2026</span>
                  </div>
                  <div className="text-xs text-slate-300 font-bold">منظومة كُتّاب 2026 - حفل ختام الدورة المباركة</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🎓 TABS 1 & 3: SUMMER 2026 & KUTTAB DASHBOARD */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {(activeTab === 'summer' || activeTab === 'kuttab' || activeTab === 'students') && (
        <div className="space-y-6 animate-fadeInUp">
          
          {/* Scope Filter Pill Bar */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-black text-[#fbbf24]">
              <Filter className="w-4 h-4" />
              <span>نطاق العرض المعتمد للطلاب:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStudentScope('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  studentScope === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>الكل (الكُتّاب + الدورة)</span>
              </button>

              <button
                onClick={() => setStudentScope('SUMMER_2026')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  studentScope === 'SUMMER_2026'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-900" />
                <span>☀️ طلاب الدورة الصيفية 2026 ({studentStats.summerCount})</span>
              </button>

              <button
                onClick={() => setStudentScope('KUTTAB_ONLY')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  studentScope === 'KUTTAB_ONLY'
                    ? 'bg-blue-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>🏛️ بيانات الكُتّاب الدائم</span>
              </button>
            </div>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden bg-[#062b24]/90 border border-emerald-700/40 hover:border-[#fbbf24]/50 rounded-2xl p-5 text-center shadow-xl transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#fbbf24] mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{filteredStudents.length}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                {studentScope === 'SUMMER_2026' ? 'طلاب الدورة الصيفية' : 'إجمالي الطلاب المعروضين'}
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#062b24]/90 border border-emerald-700/40 hover:border-rose-500/50 rounded-2xl p-5 text-center shadow-xl transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-2">
                <Heart className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-400">{studentStats.orphans}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">أيتام الأب ❤️</div>
            </div>

            <div className="relative overflow-hidden bg-[#062b24]/90 border border-emerald-700/40 hover:border-amber-400/50 rounded-2xl p-5 text-center shadow-xl transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">{studentStats.quranCompleters}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">خاتمو القرآن كاملاً 🏆</div>
            </div>

            <div className="relative overflow-hidden bg-[#062b24]/90 border border-emerald-700/40 hover:border-emerald-400/50 rounded-2xl p-5 text-center shadow-xl transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{studentStats.withPhotos}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">صور شخصية مرفوعة</div>
            </div>
          </div>

          {/* Search, Filter & Export Bar */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xl">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب، الكود، أو الهاتف..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={orphanFilter}
                onChange={(e) => setOrphanFilter(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-xs text-white focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="ALL">جميع الحالات الإنسانية</option>
                <option value="ORPHAN">أيتام الأب فقط ❤️</option>
                <option value="ALIVE">على قيد الحياة</option>
              </select>

              <button
                onClick={exportStudentsToExcel}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تصدير لـ Excel 📊</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0c3d34] text-[#fbbf24] font-black border-b border-emerald-700/50">
                    <th className="p-3.5 text-center">م</th>
                    <th className="p-3.5">اسم الطالب المكرم</th>
                    <th className="p-3.5">التصنيف والتبعية</th>
                    <th className="p-3.5">الجزء والدرجة</th>
                    <th className="p-3.5">المرحلة والمدرسة</th>
                    <th className="p-3.5">هواتف التواصل</th>
                    <th className="p-3.5 text-center">الصورة</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/30">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-10 text-center text-slate-400">
                        لا توجد بيانات طلاب مطابقة للبحث أو النطاق المحدد
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5 font-black text-white text-sm">
                          <div className="flex items-center gap-2">
                            <span>{r.studentName}</span>
                            {r.studentCode && (
                              <span className="text-[#fbbf24] text-[10px] px-1.5 py-0.5 bg-amber-500/15 rounded-md font-mono border border-amber-500/30">
                                {r.studentCode}
                              </span>
                            )}
                          </div>
                          {r.fatherStatus === 'يتيم الأب' && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                              يتيم الأب ❤️
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {r.partName ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold text-[11px] flex items-center gap-1 w-fit border border-amber-500/30">
                              <Sun className="w-3 h-3 text-amber-400" />
                              الدورة الصيفية 2026
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-bold text-[11px] flex items-center gap-1 w-fit border border-blue-500/30">
                              <Building className="w-3 h-3 text-blue-400" />
                              الكُتّاب الدائم
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black">
                            {r.partName || 'القرآن كاملاً'}
                          </span>
                          {r.examScore && (
                            <span className="mr-1 text-[11px] text-amber-200 font-bold">({r.examScore}%)</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {r.studyStage} {r.schoolName ? `— ${r.schoolName}` : ''}
                        </td>
                        <td className="p-3.5 dir-ltr text-right text-slate-300 font-mono">
                          {r.fatherPhone || r.motherPhone || '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          {r.photoUrl ? (
                            <button
                              onClick={() => setPreviewImage(r.photoUrl)}
                              className="inline-block cursor-pointer hover:scale-110 transition-transform"
                            >
                              <img
                                src={r.photoUrl}
                                alt={r.studentName}
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#fbbf24] mx-auto shadow-md"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">لا توجد</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingStudent(r);
                                setStudentModalOpen(true);
                              }}
                              className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all"
                              title="تعديل بيانات الطالب وتعيين الشيخ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(r.id)}
                              className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
                              title="حذف الطالب"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👳‍♂️ TAB 4: SHEIKHS DASHBOARD */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'sheikhs' && (
        <div className="space-y-6 animate-fadeInUp">
          
          {/* Scope Filter for Sheikhs */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2 text-xs font-black text-[#fbbf24]">
              <Filter className="w-4 h-4" />
              <span>نطاق حصر الشيوخ والمعلمين:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSheikhScope('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheikhScope === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>جميع الشيوخ ({sheikhStats.total})</span>
              </button>

              <button
                onClick={() => setSheikhScope('SUMMER_2026')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheikhScope === 'SUMMER_2026'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-900" />
                <span>☀️ شيوخ الدورة الصيفية 2026 ({sheikhStats.summerSheikhs})</span>
              </button>

              <button
                onClick={() => setSheikhScope('KUTTAB_ONLY')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheikhScope === 'KUTTAB_ONLY'
                    ? 'bg-blue-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>🏛️ شيوخ الكُتّاب الدائمين</span>
              </button>
            </div>
          </div>

          {/* Sheikhs KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{filteredSheikhs.length}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">الشيوخ بالبحث والنطاق</div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">{sheikhStats.fullTime}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">المتفرغون كلياً بالمكافأة</div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{sheikhStats.totalStudentsAssigned}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">إجمالي الطلاب المسندين</div>
            </div>
          </div>

          {/* Sheikhs Controls */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xl">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={sheikhSearch}
                onChange={(e) => setSheikhSearch(e.target.value)}
                placeholder="ابحث باسم الشيخ، المؤهل، أو الهاتف..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleOpenSheikhModal()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة بيانات شيخ جديد 🌟</span>
              </button>

              <button
                onClick={exportSheikhsToExcel}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>تصدير حصر الشيوخ (Excel) 📊</span>
              </button>
            </div>
          </div>

          {/* Sheikhs Table */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0c3d34] text-[#fbbf24] font-black border-b border-emerald-700/50">
                    <th className="p-3.5 text-center">م</th>
                    <th className="p-3.5">اسم الشيخ / المحفظ</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">المؤهل والأزهرية</th>
                    <th className="p-3.5">الإجازات القراءات</th>
                    <th className="p-3.5">مستوى الدورة</th>
                    <th className="p-3.5 text-center">الطلاب المسندين</th>
                    <th className="p-3.5 dir-ltr text-right">رقم الهاتف</th>
                    <th className="p-3.5 text-center">الصورة</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/30">
                  {filteredSheikhs.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-10 text-center text-slate-400">
                        لا توجد بيانات شيوخ مطابقة للبحث أو النطاق المحدد
                      </td>
                    </tr>
                  ) : (
                    filteredSheikhs.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5 font-black text-white text-sm">
                          {s.name}
                          {s.address && (
                            <div className="text-[11px] text-slate-400 font-normal">{s.address}</div>
                          )}
                        </td>
                        <td className="p-3.5">
                          {s.participatingSummer?.includes('نعم') || s.summerLevel ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-bold text-[10px] flex items-center gap-1 w-fit border border-amber-500/30">
                              <Sun className="w-3 h-3 text-amber-400" />
                              شيوخ الدورة 2026
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-bold text-[10px] flex items-center gap-1 w-fit border border-blue-500/30">
                              <Building className="w-3 h-3 text-blue-400" />
                              شيوخ الكُتّاب الدائمين
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-300">
                          {s.qualification || 'حافظ القرآن'}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-[#fbbf24] font-black text-[11px]">
                            {s.ijazat || 'حفص عن عاصم'}
                          </span>
                        </td>
                        <td className="p-3.5 text-emerald-300 font-bold">
                          {s.summerLevel || s.specialization || 'تحفيظ وتجويد'}
                        </td>
                        <td className="p-3.5 text-center font-black text-[#fbbf24] text-sm">
                          {s.studentsCount || 0} طالب
                        </td>
                        <td className="p-3.5 dir-ltr text-right text-slate-300 font-mono">
                          {s.phone || '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          {s.photoUrl ? (
                            <button
                              onClick={() => setPreviewImage(s.photoUrl)}
                              className="inline-block cursor-pointer hover:scale-110 transition-transform"
                            >
                              <img
                                src={s.photoUrl}
                                alt={s.name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#fbbf24] mx-auto shadow-md"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">لا توجد</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenSheikhModal(s)}
                              className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all"
                              title="تعديل بيانات الشيخ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSheikh(s.id, s.name)}
                              className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all"
                              title="حذف الشيخ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👨‍👩‍👧‍👦 TAB 5: FAMILIES & SIBLINGS HUB (سجل الأسر والأشقاء) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'families' && (
        <div className="space-y-6 animate-fadeInUp">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900/60 via-[#062b24] to-teal-900/60 border border-[#fbbf24]/40 p-6 rounded-3xl text-center space-y-2 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-xs font-black">
              <Users className="w-4 h-4" />
              سجل الأسر وتحليل الأشقاء في الكُتّاب 2026
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">حصر أولياء الأمور وربط الطلاب بأسرهم وإخوانهم</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
              تجميع ذكي تلقائي لكل أسرة وولي أمر، حصر الأشقاء المقيدين في الكُتّاب، وتيسير التواصل المباشر عبر الواتساب.
            </p>
          </div>

          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#062b24]/90 p-5 rounded-2xl border border-emerald-700/40 text-center shadow-xl">
              <span className="text-2xl block mb-1">👨‍👩‍👧</span>
              <span className="text-slate-400 text-xs font-bold block">إجمالي أولياء الأمور (الأسر)</span>
              <strong className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{familyStats.totalFamilies}</strong>
            </div>

            <div className="bg-[#062b24]/90 p-5 rounded-2xl border border-emerald-700/40 text-center shadow-xl">
              <span className="text-2xl block mb-1">👦</span>
              <span className="text-slate-400 text-xs font-bold block">إجمالي الطلاب المكرمين</span>
              <strong className="text-2xl sm:text-3xl font-black text-white">{familyStats.totalStudents}</strong>
            </div>

            <div className="bg-[#062b24]/90 p-5 rounded-2xl border border-emerald-700/40 text-center shadow-xl">
              <span className="text-2xl block mb-1">👥</span>
              <span className="text-slate-400 text-xs font-bold block">أسر لديها أشقاء بالكُتّاب</span>
              <strong className="text-2xl sm:text-3xl font-black text-emerald-300">{familyStats.familiesWithSiblings}</strong>
            </div>

            <div className="bg-[#062b24]/90 p-5 rounded-2xl border border-emerald-700/40 text-center shadow-xl">
              <span className="text-2xl block mb-1">📊</span>
              <span className="text-slate-400 text-xs font-bold block">متوسط الأبناء لكل أسرة</span>
              <strong className="text-2xl sm:text-3xl font-black text-amber-200">{familyStats.avgKids}</strong>
            </div>
          </div>

          {/* Filter & Export Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#062b24]/90 rounded-2xl border border-emerald-700/40 shadow-xl">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
                <input
                  type="text"
                  value={familySearch}
                  onChange={(e) => setFamilySearch(e.target.value)}
                  placeholder="بحث باسم ولي الأمر، الهاتف، أو اسم الطالب/الأخ..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-700/50 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              <select
                value={familyFilter}
                onChange={(e) => setFamilyFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-emerald-700/50 text-white text-xs focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="ALL">جميع الأسر ({familiesData.length})</option>
                <option value="WITH_SIBLINGS">أسر لديها أشقاء في الكُتّاب فقط ({familyStats.familiesWithSiblings})</option>
                <option value="SINGLE_CHILD">أسر بطالب واحد ({familiesData.length - familyStats.familiesWithSiblings})</option>
              </select>
            </div>

            <button
              onClick={exportFamiliesToExcel}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl border border-emerald-400/40 flex items-center gap-2 shadow-lg cursor-pointer w-full sm:w-auto justify-center active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير تقرير الأسر والأشقاء Excel 📊</span>
            </button>
          </div>

          {/* Families Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredFamilies.length === 0 ? (
              <div className="md:col-span-2 text-center py-12 bg-[#062b24]/60 rounded-3xl border border-emerald-800/40 text-slate-400 text-xs">
                لا توجد أسر مطابقة للبحث أو التصفية الحالية
              </div>
            ) : (
              filteredFamilies.map((fam, idx) => {
                const hasMultiple = fam.students.length > 1 || fam.siblingsList.length > 0 || fam.kuttabChildrenCount > 1;
                const waUrl = fam.fatherPhone ? `https://api.whatsapp.com/send?phone=2${fam.fatherPhone.replace(/^0/, '')}` : null;

                return (
                  <div
                    key={fam.key || idx}
                    className={`rounded-3xl border p-5 sm:p-6 space-y-4 transition-all shadow-2xl backdrop-blur-xl ${
                      hasMultiple
                        ? 'bg-gradient-to-b from-[#08352d] to-[#041d18] border-emerald-500/50 hover:border-[#fbbf24]'
                        : 'bg-[#062b24]/90 border-emerald-800/40'
                    }`}
                  >
                    {/* Family Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-emerald-800/40 pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-black text-white">{fam.parentName}</span>
                          {hasMultiple && (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[#fbbf24] text-[10px] font-black">
                              أشقاء في الكُتّاب 👥
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                          {fam.fatherPhone ? (
                            <span className="font-mono text-emerald-300 font-bold flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {fam.fatherPhone}
                            </span>
                          ) : (
                            <span>هاتف غير مسجل</span>
                          )}

                          {fam.fatherStatus && (
                            <span className="text-amber-200">| {fam.fatherStatus}</span>
                          )}
                        </div>
                      </div>

                      {/* WhatsApp Action */}
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shrink-0 shadow active:scale-95"
                          title="محادثة واتساب مباشرة مع ولي الأمر"
                        >
                          <span>واتساب</span>
                          <span className="text-base">💬</span>
                        </a>
                      )}
                    </div>

                    {/* Family Counts Metrics */}
                    <div className="flex items-center justify-between text-xs bg-slate-950/70 p-3 rounded-2xl border border-emerald-800/40">
                      <div className="text-slate-300">
                        <span className="text-slate-400 text-[10px] block">إجمالي أولاد الأسرة:</span>
                        <strong className="text-[#fbbf24] font-black text-sm">{fam.totalChildrenCount} أبناء</strong>
                      </div>
                      <div className="text-slate-300 text-left">
                        <span className="text-slate-400 text-[10px] block">المقيدين بالكُتّاب:</span>
                        <strong className="text-emerald-300 font-black text-sm">{fam.kuttabChildrenCount} بالكُتّاب</strong>
                      </div>
                    </div>

                    {/* Honored Students in Family */}
                    <div className="space-y-2">
                      <span className="text-xs font-black text-[#fbbf24] block">
                        الطلاب المكرمون المسجلون بالدورة ({fam.students.length}):
                      </span>
                      <div className="space-y-2">
                        {fam.students.map((stu) => (
                          <div
                            key={stu.id}
                            className="p-3 rounded-2xl bg-slate-900/90 border border-emerald-700/40 flex items-center justify-between text-xs hover:border-emerald-500/60 transition-all"
                          >
                            <div className="space-y-0.5">
                              <div className="font-bold text-white text-sm flex items-center gap-2">
                                <span>{stu.studentName}</span>
                                {stu.studentCode && (
                                  <span className="text-[#fbbf24] text-[10px] px-1.5 py-0.5 bg-amber-500/15 rounded-md font-mono border border-amber-500/30">
                                    {stu.studentCode}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-300">
                                {stu.partName || 'القرآن'} {stu.examScore ? `(${stu.examScore}%)` : ''} — {stu.studyStage || ''} ({stu.schoolName || ''})
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingStudent(stu);
                                  setStudentModalOpen(true);
                                }}
                                className="p-2 text-amber-400 hover:bg-amber-500/20 rounded-xl transition-all cursor-pointer"
                                title="تعديل بيانات الطالب"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(stu.id)}
                                className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all cursor-pointer"
                                title="حذف الطالب"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sibling Repeaters in Family */}
                    {fam.siblingsList.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-emerald-900/50">
                        <span className="text-xs font-black text-emerald-300 block">
                          أشقاء آخرون مقيدون بالكُتّاب ({fam.siblingsList.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {fam.siblingsList.map((sib, sIdx) => (
                            <div key={sib.id || sIdx} className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-xs">
                              <span className="font-bold text-white block">{sib.name}</span>
                              <span className="text-slate-400 text-[10px]">{sib.studyStage} {sib.schoolName ? `— ${sib.schoolName}` : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🖼️ MODAL FOR PREVIEWING PHOTO */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fadeInUp">
          <div className="relative bg-[#062b24] p-5 rounded-3xl border border-[#fbbf24]/40 max-w-md w-full text-center shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 left-3 text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="معاينة الصورة" className="w-full h-80 object-cover rounded-2xl border border-emerald-700/50 mb-4 shadow-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👳‍♂️ MODAL FOR ADDING / EDITING SHEIKH */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {sheikhModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto animate-fadeInUp">
          <div className="relative bg-[#062b24] p-6 rounded-3xl border border-[#fbbf24]/40 max-w-xl w-full text-right space-y-4 my-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-lg font-black text-[#fbbf24]">
                {editingSheikh ? 'تعديل حصر بيانات الشيخ' : 'إضافة بيانات شيخ / محفظ جديد 🌟'}
              </h3>
              <button onClick={() => setSheikhModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSheikh} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">اسم الشيخ / المحفظ الكامل *</label>
                <input
                  type="text"
                  required
                  value={sheikhFormData.name}
                  onChange={(e) => setSheikhFormData({ ...sheikhFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    value={sheikhFormData.phone}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">العنوان والقرية</label>
                  <input
                    type="text"
                    value={sheikhFormData.address}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">المؤهل الأزهرية/العلمي</label>
                  <input
                    type="text"
                    value={sheikhFormData.qualification}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">الإجازات القراءات</label>
                  <input
                    type="text"
                    value={sheikhFormData.ijazat}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, ijazat: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">المشاركات بالدورة</label>
                  <select
                    value={sheikhFormData.participatingSummer}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, participatingSummer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  >
                    <option value="نعم - مشارك بالدورة الصيفية">نعم - مشارك بالدورة الصيفية 2026</option>
                    <option value="لا - محفظ دائم بالكُتّاب">لا - محفظ دائم بالكُتّاب فقط</option>
                    <option value="مشارك جزئي / بديل">مشارك جزئي / بديل</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">المستوى المشرف عليه بالدورة</label>
                  <select
                    value={sheikhFormData.summerLevel}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, summerLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  >
                    <option value="إشراف عام وفصول القرآن كاملاً">إشراف عام وفصول القرآن كاملاً</option>
                    <option value="فصول جزء الأعراف إلى 15 جزء">فصول جزء الأعراف إلى 15 جزء</option>
                    <option value="فصول البراعم وجزء عم">فصول البراعم وجزء عم</option>
                    <option value="فصول التجويد والمتون والتأهيل">فصول التجويد والمتون والتأهيل</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">عدد الطلاب المسندين</label>
                  <input
                    type="number"
                    value={sheikhFormData.studentsCount}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, studentsCount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">طبيعة التفرغ والمكافأة</label>
                  <select
                    value={sheikhFormData.availability}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, availability: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  >
                    <option value="متفرغ كلياً (مكافأة شهرية)">متفرغ كلياً (مكافأة شهرية)</option>
                    <option value="عمل تطوعي لله تعالى">عمل تطوعي لله تعالى</option>
                    <option value="متفرغ جزئياً">متفرغ جزئياً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">ملاحظات ومقترحات الشيخ</label>
                <textarea
                  rows="2"
                  value={sheikhFormData.notes}
                  onChange={(e) => setSheikhFormData({ ...sheikhFormData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white resize-none focus:outline-none focus:border-[#fbbf24]"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">صورة الشيخ الشخصية</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSheikhPhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-700 file:text-white"
                />
                {uploadingSheikhPhoto && <p className="text-[11px] text-amber-400 mt-1">جاري رفع الصورة...</p>}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setSheikhModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploadingSheikhPhoto}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg transition-all"
                >
                  حفظ البيانات 🌟
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👨‍🎓 MODAL FOR EDITING STUDENT & SIBLINGS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {studentModalOpen && editingStudent && (
        <StudentEditModal
          student={editingStudent}
          onClose={() => {
            setStudentModalOpen(false);
            setEditingStudent(null);
          }}
          showToast={showToast}
        />
      )}

    </div>
  );
}
