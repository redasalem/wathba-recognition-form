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
  Calendar
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
  // Tab control: 'students' | 'sheikhs'
  const [activeTab, setActiveTab] = useState('students');

  // Scope Filter: 'ALL' (الكُتّاب والدورة) | 'SUMMER_2026' (الدورة الصيفية فقط) | 'KUTTAB_ONLY' (الكُتّاب العام)
  const [studentScope, setStudentScope] = useState('ALL');
  const [sheikhScope, setSheikhScope] = useState('ALL');

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
        r.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());

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
  // 5. تصدير أكسيل للطلاب والشيوخ
  // ---------------------------------------------------
  const exportStudentsToExcel = () => {
    if (filteredStudents.length === 0) {
      showToast?.('لا توجد بيانات طلاب لتصديرها', 'error');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'م,اسم الطالب,السن,المرحلة,المدرسة,فئة الدورة,جزء المشاركة,الأجزاء المحفوظة,الشيخ,هاتف الأب,هاتف الأم,حالة الأب,الملاحظات\n';

    filteredStudents.forEach((r, idx) => {
      const row = [
        idx + 1,
        `"${r.studentName || ''}"`,
        r.studentAge || '',
        `"${r.studyStage || ''}"`,
        `"${r.schoolName || ''}"`,
        `"${r.partName ? 'مشارك بالدورة الصيفية 2026' : 'كُتّاب عام'}"`,
        `"${r.partName || ''}"`,
        r.totalParts || 0,
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

  // ---------------------------------------------------
  // 6. إدارة الشيوخ (Add/Edit/Delete Sheikh)
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

  // ---------------------------------------------------
  // 7. إدارة الطلاب (Delete Student)
  // ---------------------------------------------------
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
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100 p-4">
      
      {/* 🚀 1. HEADER & NAVIGATION TABS */}
      <div className="bg-[#062b24]/90 border border-[#fbbf24]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbbf24]/15 text-[#fbbf24] text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            لوحة حصر ومتابعة بيانات الكُتّاب والدورة الصيفية
          </div>
          <h1 className="text-2xl font-black text-white">منظومة كُتّاب | العرض المستقل والتحليلات</h1>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-emerald-700/40">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'students'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <Award className="w-4 h-4" />
            سجل الطلاب ({studentStats.total})
          </button>

          <button
            onClick={() => setActiveTab('sheikhs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sheikhs'
                ? 'bg-[#fbbf24] text-slate-950 shadow-md font-black'
                : 'text-slate-200 hover:text-white hover:bg-emerald-800/30'
            }`}
          >
            <Users className="w-4 h-4" />
            سجل الشيوخ للمعلمين ({sheikhStats.total})
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            خروج
          </button>
        </div>
      </div>

      {/* --------------------------------------------------- */}
      {/* 🎓 TAB 1: STUDENTS DASHBOARD */}
      {/* --------------------------------------------------- */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          
          {/* 🔘 SCOPE FILTER FOR STUDENTS (الكُتّاب العام vs الدورة الصيفية 2026) */}
          <div className="bg-[#0c3d34]/80 border border-emerald-700/40 p-3 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#fbbf24]">
              <Filter className="w-4 h-4" />
              <span>نطاق العرض المعتمد للطلاب:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudentScope('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  studentScope === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                الكل (الكُتّاب + الدورة)
              </button>

              <button
                onClick={() => setStudentScope('SUMMER_2026')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  studentScope === 'SUMMER_2026'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-900" />
                ☀️ طلاب الدورة الصيفية 2026 ({studentStats.summerCount})
              </button>

              <button
                onClick={() => setStudentScope('KUTTAB_ONLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  studentScope === 'KUTTAB_ONLY'
                    ? 'bg-blue-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                🏛️ بيانات الكُتّاب الدائم
              </button>
            </div>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#fbbf24]">{filteredStudents.length}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                {studentScope === 'SUMMER_2026' ? 'طلاب الدورة الصيفية' : 'إجمالي الطلاب المعروضين'}
              </div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-rose-400">{studentStats.orphans}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">أيتام الأب ❤️</div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{studentStats.quranCompleters}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">خاتمو القرآن كاملاً 🏆</div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">{studentStats.withPhotos}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">صور شخصية مرفوعة</div>
            </div>
          </div>

          {/* SEARCH & FILTERS */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم الطالب أو الهاتف..."
                className="w-full pl-4 pr-9 py-2 bg-slate-900/60 border border-emerald-700/40 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={orphanFilter}
                onChange={(e) => setOrphanFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900/60 border border-emerald-700/40 rounded-lg text-xs text-white"
              >
                <option value="ALL">جميع الحالات الإنسانية</option>
                <option value="ORPHAN">أيتام الأب فقط ❤️</option>
                <option value="ALIVE">على قيد الحياة</option>
              </select>

              <button
                onClick={exportStudentsToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                تصدير لـ Excel
              </button>
            </div>
          </div>

          {/* STUDENTS TABLE */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0c3d34] text-[#fbbf24] font-bold border-b border-emerald-700/50">
                    <th className="p-3 text-center">م</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">التصنيف والتبعية</th>
                    <th className="p-3">الجزء المشارك به</th>
                    <th className="p-3">المرحلة والمدرسة</th>
                    <th className="p-3">هواتف التواصل</th>
                    <th className="p-3 text-center">الصورة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/30">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        لا توجد بيانات طلاب مطابقة للبحث أو النطاق المحدد
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-emerald-900/20 transition-all">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-white">
                          {r.studentName}
                          {r.fatherStatus === 'يتيم الأب' && (
                            <span className="mr-2 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px]">
                              يتيم الأب
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {r.partName ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Sun className="w-3 h-3 text-amber-400" />
                              الدورة الصيفية 2026
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Building className="w-3 h-3 text-blue-400" />
                              الكُتّاب الدائم
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                            {r.partName || 'متابعة حفظ الكُتّاب'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          {r.studyStage} - {r.schoolName}
                        </td>
                        <td className="p-3 dir-ltr text-right text-slate-300 font-mono">
                          {r.fatherPhone || r.motherPhone || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {r.photoUrl ? (
                            <button
                              onClick={() => setPreviewImage(r.photoUrl)}
                              className="inline-block cursor-pointer"
                            >
                              <img
                                src={r.photoUrl}
                                alt={r.studentName}
                                className="w-8 h-8 rounded-full object-cover border border-[#fbbf24] mx-auto"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">لا توجد</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingStudent(r);
                                setStudentModalOpen(true);
                              }}
                              className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all"
                              title="تعديل بيانات الطالب وتعيين الشيخ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(r.id)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
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

      {/* --------------------------------------------------- */}
      {/* 👳‍♂️ TAB 2: SHEIKHS DASHBOARD */}
      {/* --------------------------------------------------- */}
      {activeTab === 'sheikhs' && (
        <div className="space-y-6">
          
          {/* 🔘 SCOPE FILTER FOR SHEIKHS (شيوخ الكُتّاب الدائمين vs شيوخ الدورة الصيفية 2026) */}
          <div className="bg-[#0c3d34]/80 border border-emerald-700/40 p-3 rounded-xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#fbbf24]">
              <Filter className="w-4 h-4" />
              <span>نطاق حصر الشيوخ والمعلمين:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSheikhScope('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheikhScope === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                جميع الشيوخ ({sheikhStats.total})
              </button>

              <button
                onClick={() => setSheikhScope('SUMMER_2026')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheikhScope === 'SUMMER_2026'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-900" />
                ☀️ شيوخ الدورة الصيفية 2026 ({sheikhStats.summerSheikhs})
              </button>

              <button
                onClick={() => setSheikhScope('KUTTAB_ONLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  sheikhScope === 'KUTTAB_ONLY'
                    ? 'bg-blue-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                🏛️ شيوخ الكُتّاب الدائمين
              </button>
            </div>
          </div>

          {/* SHEIKHS STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-[#fbbf24]">{filteredSheikhs.length}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">الشيوخ بالبحث والنطاق</div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-emerald-400">{sheikhStats.fullTime}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">المتفرغون كلياً بالمكافأة</div>
            </div>
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-amber-400">{sheikhStats.totalStudentsAssigned}</div>
              <div className="text-xs font-bold text-slate-300 mt-1">إجمالي الطلاب المسندين</div>
            </div>
          </div>

          {/* SEARCH & CONTROLS FOR SHEIKHS */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                value={sheikhSearch}
                onChange={(e) => setSheikhSearch(e.target.value)}
                placeholder="ابحث باسم الشيخ، المؤهل، أو الهاتف..."
                className="w-full pl-4 pr-9 py-2 bg-slate-900/60 border border-emerald-700/40 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => handleOpenSheikhModal()}
                className="px-4 py-2 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                إضافة بيانات شيخ جديد
              </button>

              <button
                onClick={exportSheikhsToExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                تصدير حصر الشيوخ (Excel)
              </button>
            </div>
          </div>

          {/* SHEIKHS TABLE WITH DETAILED FIELDS */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0c3d34] text-[#fbbf24] font-bold border-b border-emerald-700/50">
                    <th className="p-3 text-center">م</th>
                    <th className="p-3">اسم الشيخ / المحفظ</th>
                    <th className="p-3">التصنيف</th>
                    <th className="p-3">المؤهل والأزهرية</th>
                    <th className="p-3">الإجازات القراءات</th>
                    <th className="p-3">مستوى الدورة المشرف عليه</th>
                    <th className="p-3 text-center">الطلاب المسندين</th>
                    <th className="p-3 dir-ltr text-right">رقم الهاتف</th>
                    <th className="p-3 text-center">الصورة</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/30">
                  {filteredSheikhs.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="p-8 text-center text-slate-400">
                        لا توجد بيانات شيوخ مطابقة للبحث أو النطاق المحدد
                      </td>
                    </tr>
                  ) : (
                    filteredSheikhs.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-emerald-900/20 transition-all">
                        <td className="p-3 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-white">
                          {s.name}
                          {s.address && (
                            <div className="text-[10px] text-slate-400 font-normal">{s.address}</div>
                          )}
                        </td>
                        <td className="p-3">
                          {s.participatingSummer?.includes('نعم') || s.summerLevel ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Sun className="w-3 h-3 text-amber-400" />
                              شيوخ الدورة 2026
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] flex items-center gap-1 w-fit">
                              <Building className="w-3 h-3 text-blue-400" />
                              شيوخ الكُتّاب الدائمين
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {s.qualification || 'حافظ القرآن'}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-[#fbbf24] font-bold text-[11px]">
                            {s.ijazat || 'حفص عن عاصم'}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-300 font-bold">
                          {s.summerLevel || s.specialization || 'تحفيظ وتجويد'}
                        </td>
                        <td className="p-3 text-center font-black text-[#fbbf24]">
                          {s.studentsCount || 0} طالب
                        </td>
                        <td className="p-3 dir-ltr text-right text-slate-300 font-mono">
                          {s.phone || '-'}
                        </td>
                        <td className="p-3 text-center">
                          {s.photoUrl ? (
                            <button
                              onClick={() => setPreviewImage(s.photoUrl)}
                              className="inline-block cursor-pointer"
                            >
                              <img
                                src={s.photoUrl}
                                alt={s.name}
                                className="w-8 h-8 rounded-full object-cover border border-[#fbbf24] mx-auto"
                              />
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[10px]">لا توجد</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenSheikhModal(s)}
                              className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition-all"
                              title="تعديل بيانات الشيخ"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSheikh(s.id, s.name)}
                              className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all"
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

      {/* 🖼️ MODAL FOR PREVIEWING PHOTO */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative bg-[#062b24] p-4 rounded-2xl border border-[#fbbf24]/40 max-w-md w-full text-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 left-3 text-slate-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={previewImage} alt="معاينة الصورة" className="w-full h-80 object-cover rounded-xl border border-emerald-700/50 mb-3" />
            <button
              onClick={() => setPreviewImage(null)}
              className="px-6 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* 👳‍♂️ MODAL FOR ADDING / EDITING SHEIKH */}
      {sheikhModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-[#062b24] p-6 rounded-2xl border border-[#fbbf24]/40 max-w-xl w-full text-right space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-lg font-black text-[#fbbf24]">
                {editingSheikh ? 'تعديل حصر بيانات الشيخ' : 'إضافة بيانات شيخ / محفظ جديد'}
              </h3>
              <button onClick={() => setSheikhModalOpen(false)} className="text-slate-400 hover:text-white">
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
                  className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">رقم الهاتف / الواتساب</label>
                  <input
                    type="text"
                    value={sheikhFormData.phone}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">العنوان والقرية</label>
                  <input
                    type="text"
                    value={sheikhFormData.address}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
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
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">الإجازات القراءات</label>
                  <input
                    type="text"
                    value={sheikhFormData.ijazat}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, ijazat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-200 mb-1">المشاركات بالدورة</label>
                  <select
                    value={sheikhFormData.participatingSummer}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, participatingSummer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
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
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
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
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">طبيعة التفرغ والمكافأة</label>
                  <select
                    value={sheikhFormData.availability}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, availability: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white"
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
                  className="w-full px-3 py-2 bg-slate-900/80 border border-emerald-700/50 rounded-lg text-white resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">صورة الشيخ الشخصية</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSheikhPhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-700 file:text-white"
                />
                {uploadingSheikhPhoto && <p className="text-[11px] text-amber-400 mt-1">جاري رفع الصورة...</p>}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSheikhModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploadingSheikhPhoto}
                  className="px-5 py-2 bg-[#fbbf24] text-slate-950 font-black rounded-lg"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
