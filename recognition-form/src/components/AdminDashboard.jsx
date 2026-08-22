import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Download,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Eye,
  LogOut,
  Printer,
  ShieldCheck,
  Building,
  Sun,
  Gift,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import {
  deleteStudentRecord,
  subscribeSheikhs,
  addSheikhRecord,
  updateSheikhRecord,
  deleteSheikhRecord,
  batchSyncStudentsToFirestore,
  batchSyncSheikhsToFirestore,
  resetAndWipeStudentsFirestore
} from '../firebase';
import { STUDENTS_CATALOG, QURAN_PARTS_ORDER, normalizeArabic, isStudentMatch } from '../data/studentsCatalog';
import { uploadToCloudinary } from '../services/cloudinary';
import StudentEditModal from './StudentEditModal';
import StudentBadgeModal from './StudentBadgeModal';

export default function AdminDashboard({ records = [], onLogout, showToast }) {
  // Tab control: 'summer' | 'ceremony' | 'kuttab' | 'sheikhs' | 'families'
  const [activeTab, setActiveTab] = useState('summer');

  // Scope Filter: 'ALL' (الكُتّاب والدورة) | 'SUMMER_2026' (الدورة الصيفية فقط) | 'KUTTAB_ONLY' (الكُتّاب العام)
  const [studentScope, setStudentScope] = useState('ALL');
  const [sheikhScope, setSheikhScope] = useState('ALL');

  // ---------------------------------------------------
  // ⚡ حالة المزامنة مع Firebase (Batch Sync Engine State)
  // ---------------------------------------------------
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ processed: 0, total: STUDENTS_CATALOG.length, percentage: 0 });
  const [syncResult, setSyncResult] = useState(null);

  // ---------------------------------------------------
  // 🏆 حالة حفل التكريم والمسرح (Ceremony Hub State)
  // ---------------------------------------------------
  const [ceremonyPartFilter, setCeremonyPartFilter] = useState('ALL');
  const [ceremonySearch, setCeremonySearch] = useState('');
  const [stagePrompterStudent, setStagePrompterStudent] = useState(null);
  const [stagePrompterIndex, setStagePrompterIndex] = useState(0);
  const [badgeModalStudent, setBadgeModalStudent] = useState(null);

  // ---------------------------------------------------
  // 👨‍👩‍👧‍👦 حالة وبيانات الأسر والأشقاء (Families & Siblings State)
  // ---------------------------------------------------
  const [familySearch, setFamilySearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('ALL'); // 'ALL' | 'WITH_SIBLINGS' | 'SINGLE_CHILD'

  // ---------------------------------------------------
  // 👳‍♂️ حالة الشيوخ والمعلمين (Sheikhs State)
  // ---------------------------------------------------
  const [sheikhs, setSheikhs] = useState([]);
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
  const [uploadingSheikhPhoto, setUploadingSheikhPhoto] = useState(false);

  // ---------------------------------------------------
  // 👨‍🎓 حالة الطلاب وتحرير البيانات (Students Modal State)
  // ---------------------------------------------------
  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilterPart, setStudentFilterPart] = useState('ALL');
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // ---------------------------------------------------
  // 🗑️ حالة نافذة تأكيد الحذف المخصصة (Custom Delete Modal)
  // ---------------------------------------------------
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: null, // 'student' | 'sheikh'
    data: null,
    isDeleting: false
  });

  // 🔑 Close any active modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deleteConfirmModal.isOpen) {
          setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false });
        } else if (syncModalOpen && !isSyncing) {
          setSyncModalOpen(false);
        } else if (stagePrompterStudent) {
          setStagePrompterStudent(null);
        } else if (sheikhModalOpen) {
          setSheikhModalOpen(false);
        } else if (badgeModalStudent) {
          setBadgeModalStudent(null);
        } else if (studentModalOpen) {
          setStudentModalOpen(false);
          setEditingStudent(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirmModal.isOpen, syncModalOpen, isSyncing, stagePrompterStudent, sheikhModalOpen, badgeModalStudent, studentModalOpen]);

  // اشتراك الشيوخ لحظياً
  useEffect(() => {
    const unsubscribe = subscribeSheikhs(
      (data) => {
        setSheikhs(data);
      },
      (err) => {
        console.error('Error fetching sheikhs:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // ---------------------------------------------------
  // ⚡ دالة تنفيذ المزامنة للطلاب في Firebase
  // ---------------------------------------------------
  const handleExecuteSyncStudents = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    setSyncProgress({ processed: 0, total: STUDENTS_CATALOG.length, percentage: 0 });

    try {
      const res = await batchSyncStudentsToFirestore(STUDENTS_CATALOG, (processed, total) => {
        setSyncProgress({
          processed,
          total,
          percentage: Math.round((processed / total) * 100)
        });
      });

      setSyncResult({ success: true, count: res.count });
      showToast?.(`تمت مزامنة وتعيين ${res.count} طالباً في فايربيز بنجاح! ⚡🎉`, 'success');
    } catch (err) {
      console.error('Batch sync error:', err);
      setSyncResult({ success: false, error: err.message });
      showToast?.('حدث خطأ أثناء مزامنة الطلاب مع فايربيز', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // 🗑️⚡ دالة مسح السجلات القديمة وإعادة الضبط الشامل لقاعدة البيانات
  const handleExecuteWipeAndResetStudents = async () => {
    const isConfirmed = window.confirm(
      '⚠️ هل أنت متأكد من رغبتك في مسح كافة السجلات السابقة في Firebase وإعادة الضبط الشامل من قاعدة البيانات المعتمدة؟\n\nسيتم مسح أي سجلات قديمة أو مكررة وتعيين الـ 146 طالباً معتمداً بشكل نظيف مع روابط الـ QR.'
    );
    if (!isConfirmed) return;

    setIsSyncing(true);
    setIsWiping(true);
    setSyncResult(null);
    setSyncProgress({ processed: 0, total: STUDENTS_CATALOG.length, percentage: 0 });

    try {
      const res = await resetAndWipeStudentsFirestore(STUDENTS_CATALOG, (processed, total) => {
        setSyncProgress({
          processed,
          total,
          percentage: Math.round((processed / total) * 100)
        });
      });

      setSyncResult({ success: true, count: res.count });
      showToast?.(`تم مسح السجلات السابقة وتعيين ${res.count} طالباً معتمداً بنجاح! ⚡🎉`, 'success');
    } catch (err) {
      console.error('Reset and wipe error:', err);
      setSyncResult({ success: false, error: err.message });
      showToast?.('حدث خطأ أثناء إعادة ضبط ومزامنة الطلاب', 'error');
    } finally {
      setIsSyncing(false);
      setIsWiping(false);
    }
  };

  // ---------------------------------------------------
  // ⚡ دالة استيراد ومزامنة الشيوخ في Firebase
  // ---------------------------------------------------
  const handleExecuteSyncSheikhs = async () => {
    setIsSyncing(true);
    try {
      await batchSyncSheikhsToFirestore();
      showToast?.(`تم استيراد الكوادر والشيوخ المعتمدين في فايربيز بنجاح 👳‍♂️✨`, 'success');
      setSyncModalOpen(false);
    } catch (err) {
      console.error('Sheikhs sync error:', err);
      showToast?.('حدث خطأ أثناء استيراد بيانات الشيوخ', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // دالة مساعدة لتحديد ترتيب الجزء القرآني
  const getPartOrderRank = (partName = '') => {
    if (!partName) return 999;
    const norm = normalizeArabic(partName);
    const idx = QURAN_PARTS_ORDER.findIndex(p => {
      const pNorm = normalizeArabic(p);
      return pNorm === norm || norm.includes(pNorm) || pNorm.includes(norm);
    });
    return idx !== -1 ? idx : 999;
  };

  // ---------------------------------------------------
  // 🌟 دمج وإعداد قائمة الطلاب المكرمين الشاملة مرتبة بالأجزاء والدرجات
  // ---------------------------------------------------
  const masterStudentsList = useMemo(() => {
    const list = STUDENTS_CATALOG.map((catStudent) => {
      const matchedRecord = records.find((r) => isStudentMatch(r, catStudent));

      return {
        id: matchedRecord?.id || catStudent.studentId,
        idx: catStudent.idx,
        studentId: catStudent.studentId,
        studentCode: matchedRecord?.studentCode || catStudent.code || `#${String(catStudent.idx).padStart(3, '0')}`,
        studentName: matchedRecord?.studentName || catStudent.name,
        partName: matchedRecord?.partName || catStudent.part,
        examScore: Number(matchedRecord?.examScore ?? catStudent.score) || 0,
        awardTier: matchedRecord?.awardTier || catStudent.tier,
        gift: matchedRecord?.gift || catStudent.gift,
        totalParts: catStudent.totalParts || 1,
        sheikhName: matchedRecord?.sheikhName || 'فضيلة شيوخ الكُتّاب',
        parentName: matchedRecord?.parentName || '',
        fatherPhone: matchedRecord?.fatherPhone || '',
        motherPhone: matchedRecord?.motherPhone || '',
        fatherStatus: matchedRecord?.fatherStatus || 'نعم (على قيد الحياة)',
        schoolName: matchedRecord?.schoolName || '',
        studyStage: matchedRecord?.studyStage || 'ابتدائي',
        birthDate: matchedRecord?.birthDate || '',
        studentAge: matchedRecord?.studentAge || '',
        photoUrl: matchedRecord?.photoUrl || '',
        completed: !!matchedRecord?.completed,
        totalChildrenCount: matchedRecord?.totalChildrenCount || 1,
        kuttabChildrenCount: matchedRecord?.kuttabChildrenCount || 1,
        siblings: matchedRecord?.siblings || [],
        smartUrl: catStudent.smart_url,
        qrCodeUrl: catStudent.qr_code_url,
        qrImgUrl: catStudent.qr_img_url,
        isSummerStudent: true
      };
    });

    // ترتيب بحسب رتبة الجزء ثم تنازلياً بالدرجة داخل كل جزء
    list.sort((a, b) => {
      const rankA = getPartOrderRank(a.partName);
      const rankB = getPartOrderRank(b.partName);
      if (rankA !== rankB) return rankA - rankB;
      return (b.examScore || 0) - (a.examScore || 0);
    });

    return list;
  }, [records]);

  // Combined records for Students Tab
  const allDisplayStudents = useMemo(() => {
    if (records.length === 0) return masterStudentsList;
    
    const standaloneRecords = records.filter(r => 
      !masterStudentsList.some(m => isStudentMatch(r, m))
    ).map((r, extraIdx) => ({
      ...r,
      studentCode: r.studentCode || (r.idx ? `#${String(r.idx).padStart(3, '0')}` : `#${String(masterStudentsList.length + extraIdx + 1).padStart(3, '0')}`),
      awardTier: r.awardTier || '✨ فئة متميزة',
      gift: r.gift || 'شهادة تقدير وتكريم الكُتّاب',
      partName: r.partName || 'القرآن الكريم',
      examScore: Number(r.examScore) || 0
    }));

    const combined = [...masterStudentsList, ...standaloneRecords];
    combined.sort((a, b) => {
      const rankA = getPartOrderRank(a.partName);
      const rankB = getPartOrderRank(b.partName);
      if (rankA !== rankB) return rankA - rankB;
      return (b.examScore || 0) - (a.examScore || 0);
    });

    return combined;
  }, [masterStudentsList, records]);

  // الأجزاء المتاحة للفلترة مرتبة رسمياً
  const availableParts = useMemo(() => {
    return QURAN_PARTS_ORDER;
  }, []);

  // ---------------------------------------------------
  // 🏆 تصفية وترتيب طلاب حفل التكريم والمسرح (Ceremony Hub Roster)
  // ---------------------------------------------------
  const ceremonyStudents = useMemo(() => {
    let list = [...masterStudentsList];

    // فلترة بحسب الجزء القرآني المختار
    if (ceremonyPartFilter !== 'ALL') {
      const normFilter = normalizeArabic(ceremonyPartFilter);
      list = list.filter((s) => {
        const normPart = normalizeArabic(s.partName || '');
        return normPart === normFilter || normPart.includes(normFilter) || normFilter.includes(normPart);
      });
    }

    // فلترة البحث
    if (ceremonySearch.trim()) {
      const q = normalizeArabic(ceremonySearch);
      list = list.filter((s) => 
        normalizeArabic(s.studentName).includes(q) ||
        (s.studentCode && s.studentCode.includes(ceremonySearch)) ||
        (s.studentId && s.studentId.toLowerCase().includes(ceremonySearch.toLowerCase())) ||
        normalizeArabic(s.partName || '').includes(q) ||
        normalizeArabic(s.sheikhName || '').includes(q)
      );
    }

    // الترتيب: حسب رتبة الجزء ثم بالدرجة تنازلياً داخل كل جزء
    list.sort((a, b) => {
      const rankA = getPartOrderRank(a.partName);
      const rankB = getPartOrderRank(b.partName);
      if (rankA !== rankB) return rankA - rankB;
      return (b.examScore || 0) - (a.examScore || 0);
    });

    return list;
  }, [masterStudentsList, ceremonyPartFilter, ceremonySearch]);

  // ---------------------------------------------------
  // 📊 تصفية الطلاب للسجل العام والدورة الصيفية
  // ---------------------------------------------------
  const filteredStudents = useMemo(() => {
    const filtered = allDisplayStudents.filter((student) => {
      const q = normalizeArabic(studentSearch);
      const matchSearch =
        !studentSearch ||
        normalizeArabic(student.studentName || '').includes(q) ||
        (student.studentCode && student.studentCode.includes(studentSearch)) ||
        (student.fatherPhone && student.fatherPhone.includes(studentSearch)) ||
        normalizeArabic(student.parentName || '').includes(q);

      const matchScope =
        studentScope === 'ALL' ||
        (studentScope === 'SUMMER_2026' && (student.isSummerStudent || student.partName)) ||
        (studentScope === 'KUTTAB_ONLY' && !student.isSummerStudent);

      const matchPart =
        studentFilterPart === 'ALL' ||
        (student.partName && normalizeArabic(student.partName).includes(normalizeArabic(studentFilterPart)));

      return matchSearch && matchScope && matchPart;
    });

    // ترتيب بحسب الجزء والدرجة تنازلياً
    filtered.sort((a, b) => {
      const rankA = getPartOrderRank(a.partName);
      const rankB = getPartOrderRank(b.partName);
      if (rankA !== rankB) return rankA - rankB;
      return (b.examScore || 0) - (a.examScore || 0);
    });

    return filtered;
  }, [allDisplayStudents, studentSearch, studentScope, studentFilterPart]);

  // ---------------------------------------------------
  // 👳‍♂️ تصفية الشيوخ
  // ---------------------------------------------------
  const filteredSheikhs = useMemo(() => {
    return sheikhs.filter((s) => {
      const q = normalizeArabic(sheikhSearch);
      const matchSearch =
        !sheikhSearch ||
        normalizeArabic(s.name || '').includes(q) ||
        (s.phone && s.phone.includes(sheikhSearch)) ||
        normalizeArabic(s.qualification || '').includes(q);

      const matchScope =
        sheikhScope === 'ALL' ||
        (sheikhScope === 'SUMMER_2026' && s.participatingSummer?.includes('نعم')) ||
        (sheikhScope === 'KUTTAB_ONLY' && !s.participatingSummer?.includes('نعم'));

      return matchSearch && matchScope;
    });
  }, [sheikhs, sheikhSearch, sheikhScope]);

  // ---------------------------------------------------
  // 👨‍👩‍👧‍👦 تجميع وإحصائيات الأسر والأشقاء
  // ---------------------------------------------------
  const familiesData = useMemo(() => {
    const familyMap = new Map();

    allDisplayStudents.forEach((student) => {
      const phoneKey = student.fatherPhone?.trim() || student.parentName?.trim() || student.id;
      if (!familyMap.has(phoneKey)) {
        familyMap.set(phoneKey, {
          key: phoneKey,
          parentName: student.parentName || 'ولي أمر طالب',
          fatherPhone: student.fatherPhone || '',
          motherPhone: student.motherPhone || '',
          fatherStatus: student.fatherStatus || 'الأب على قيد الحياة',
          totalChildrenCount: student.totalChildrenCount || 1,
          kuttabChildrenCount: student.kuttabChildrenCount || 1,
          students: [],
          siblingsList: []
        });
      }

      const fam = familyMap.get(phoneKey);
      fam.students.push(student);
      if (Array.isArray(student.siblings)) {
        student.siblings.forEach((sib) => {
          if (!fam.siblingsList.some((s) => s.name === sib.name)) {
            fam.siblingsList.push(sib);
          }
        });
      }
    });

    return Array.from(familyMap.values());
  }, [allDisplayStudents]);

  const filteredFamilies = useMemo(() => {
    return familiesData.filter((fam) => {
      const q = normalizeArabic(familySearch);
      const matchSearch =
        !familySearch ||
        normalizeArabic(fam.parentName).includes(q) ||
        fam.fatherPhone.includes(familySearch) ||
        fam.students.some((s) => normalizeArabic(s.studentName).includes(q));

      const hasMultiple = fam.students.length > 1 || fam.siblingsList.length > 0 || fam.kuttabChildrenCount > 1;
      const matchFilter =
        familyFilter === 'ALL' ||
        (familyFilter === 'WITH_SIBLINGS' && hasMultiple) ||
        (familyFilter === 'SINGLE_CHILD' && !hasMultiple);

      return matchSearch && matchFilter;
    });
  }, [familiesData, familySearch, familyFilter]);

  // ---------------------------------------------------
  // 📊 إحصائيات عامة وسريعة
  // ---------------------------------------------------
  const stats = useMemo(() => {
    const totalHonored = masterStudentsList.length;
    const topScorersCount = masterStudentsList.filter(s => (s.examScore || 0) >= 90).length;
    const totalPartsCount = QURAN_PARTS_ORDER.length;

    return {
      totalHonored,
      topScorersCount,
      totalPartsCount,
      totalSheikhs: sheikhs.length,
      totalFamilies: familiesData.length
    };
  }, [masterStudentsList, sheikhs, familiesData]);

  // ---------------------------------------------------
  // 📥 دوال تصدير Excel و CSV
  // ---------------------------------------------------
  const exportCeremonyToCSV = () => {
    let csvContent = '\uFEFF';
    csvContent += 'الترتيب,كود الطالب,اسم الطالب المكرم,مستوى الحفظ القرآني,درجة الاختبار,التكريم وشهادة التقدير,الشيخ المشرف,اسم ولي الأمر,هاتف ولي الأمر\n';

    ceremonyStudents.forEach((s, idx) => {
      const row = [
        idx + 1,
        `"${s.studentCode || ''}"`,
        `"${s.studentName || ''}"`,
        `"${s.partName || ''}"`,
        `"${s.examScore || ''}%"`,
        `"${s.gift || s.awardTier || ''}"`,
        `"${s.sheikhName || ''}"`,
        `"${s.parentName || ''}"`,
        `"${s.fatherPhone || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_حفل_تكريم_الطلاب_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('تم تصدير كشف حفل التكريم بنجاح 📊🎉', 'success');
  };

  const exportStudentsToExcel = () => {
    let csvContent = '\uFEFF';
    csvContent += 'م,كود الطالب,اسم الطالب,السن,المرحلة,المدرسة,فئة التكريم,درجة الاختبار,الجائزة,الشيخ,هاتف الأب,هاتف الأم,حالة الأب\n';

    filteredStudents.forEach((r, idx) => {
      const row = [
        idx + 1,
        `"${r.studentCode || ''}"`,
        `"${r.studentName || ''}"`,
        r.studentAge || '',
        `"${r.studyStage || ''}"`,
        `"${r.schoolName || ''}"`,
        `"${r.partName || ''}"`,
        `"${r.examScore || ''}"`,
        `"${r.gift || ''}"`,
        `"${r.sheikhName || ''}"`,
        `"${r.fatherPhone || ''}"`,
        `"${r.motherPhone || ''}"`,
        `"${r.fatherStatus || ''}"`
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

  const exportSheikhsToCSV = () => {
    if (filteredSheikhs.length === 0) {
      showToast?.('لا توجد بيانات شيوخ لتصديرها', 'error');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'م,اسم الشيخ / المحفظ,رقم التليفون,المؤهل العلمي,الإجازات القرآنية,مشارك بالدورة الصيفية,المستوى المشرف عليه,طبيعة التفرغ,عدد الطلاب,الملاحظات\n';

    filteredSheikhs.forEach((s, idx) => {
      const row = [
        idx + 1,
        `"${s.name || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.qualification || ''}"`,
        `"${s.ijazat || ''}"`,
        `"${s.participatingSummer || 'نعم'}"`,
        `"${s.summerLevel || ''}"`,
        `"${s.availability || ''}"`,
        s.studentsCount || 0,
        `"${s.notes || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_شيوخ_الكتاب_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('تم تصدير سجل الشيوخ بنجاح 📊', 'success');
  };

  const exportFamiliesToCSV = () => {
    if (filteredFamilies.length === 0) {
      showToast?.('لا توجد بيانات أسر لتصديرها', 'error');
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += 'م,اسم ولي الأمر / الأسرة,هاتف الأب,هاتف الأم,حالة الأب,عدد الأبناء بالكتاب,أسماء ومستويات الأبناء\n';

    filteredFamilies.forEach((fam, idx) => {
      const childrenSummary = fam.students.map(s => `${s.studentName} (${s.partName || 'القرآن'})`).join(' - ');
      const row = [
        idx + 1,
        `"${fam.parentName || ''}"`,
        `"${fam.fatherPhone || ''}"`,
        `"${fam.motherPhone || ''}"`,
        `"${fam.fatherStatus || ''}"`,
        fam.students.length,
        `"${childrenSummary}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `سجل_الأسر_والأشقاء_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.('تم تصدير سجل الأسر والأشقاء بنجاح 📊', 'success');
  };

  // 🗑️ فتح نافذة تأكيد حذف طالب
  const handleRequestDeleteStudent = (student) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'student',
      data: student,
      isDeleting: false
    });
  };

  // 🗑️ فتح نافذة تأكيد حذف شيخ
  const handleRequestDeleteSheikh = (sheikh) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'sheikh',
      data: sheikh,
      isDeleting: false
    });
  };

  // 🗑️ تنفيذ الحذف النهائي من Firebase
  const handleConfirmDelete = async () => {
    if (!deleteConfirmModal.data) return;
    setDeleteConfirmModal(prev => ({ ...prev, isDeleting: true }));

    try {
      if (deleteConfirmModal.type === 'student') {
        const student = deleteConfirmModal.data;
        const studentDocId = student.id || student.studentId;
        if (studentDocId) {
          await deleteStudentRecord(studentDocId);
        }
        showToast?.(`تم حذف سجل الطالب "${student.studentName || student.name}" بنجاح 🗑️`, 'success');
      } else if (deleteConfirmModal.type === 'sheikh') {
        const sheikh = deleteConfirmModal.data;
        if (sheikh.id) {
          await deleteSheikhRecord(sheikh.id);
        }
        showToast?.(`تم حذف الشيخ "${sheikh.name}" من السجل بنجاح 🗑️`, 'success');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast?.('حدث خطأ أثناء تنفيذ الحذف من قاعدة البيانات', 'error');
    } finally {
      setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false });
    }
  };

  // نداء الطالب على المسرح في البرومبتر
  const handleOpenStagePrompter = (student, index) => {
    setStagePrompterStudent(student);
    setStagePrompterIndex(index);
    showToast?.(`تم تحضير نداء الطالب: ${student.studentName || student.name} على منصة التكريم 🎤`, 'success');
  };

  const handleNextPrompterStudent = () => {
    if (stagePrompterIndex < ceremonyStudents.length - 1) {
      const nextIdx = stagePrompterIndex + 1;
      setStagePrompterIndex(nextIdx);
      setStagePrompterStudent(ceremonyStudents[nextIdx]);
    }
  };

  const handlePrevPrompterStudent = () => {
    if (stagePrompterIndex > 0) {
      const prevIdx = stagePrompterIndex - 1;
      setStagePrompterIndex(prevIdx);
      setStagePrompterStudent(ceremonyStudents[prevIdx]);
    }
  };

  // تحكم الشيخ وحفظه
  const handleSaveSheikh = async (e) => {
    e.preventDefault();
    try {
      if (editingSheikh) {
        await updateSheikhRecord(editingSheikh.id, sheikhFormData);
        showToast?.('تم تحديث بيانات الشيخ بنجاح 🌟', 'success');
      } else {
        await addSheikhRecord(sheikhFormData);
        showToast?.('تم تسجيل الشيخ بنجاح 🎉', 'success');
      }
      setSheikhModalOpen(false);
      setEditingSheikh(null);
    } catch (err) {
      console.error('Sheikh save error:', err);
      showToast?.('حدث خطأ أثناء حفظ بيانات الشيخ', 'error');
    }
  };

  const handleSheikhPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSheikhPhoto(true);
    try {
      const url = await uploadToCloudinary(file);
      setSheikhFormData(prev => ({ ...prev, photoUrl: url }));
      showToast?.('تم رفع صورة الشيخ بنجاح 📸', 'success');
    } catch (err) {
      console.error('Sheikh photo upload error:', err);
      showToast?.('حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setUploadingSheikhPhoto(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👑 TOP HEADER & MAIN CONTROLS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0c3d34] via-[#062b24] to-[#041915] p-6 sm:p-8 rounded-3xl border border-[#fbbf24]/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5">
          {/* Brand & Title */}
          <div className="text-center lg:text-right space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-black">
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الإدارة المركزية والربط السحابي | كُتّاب 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              منظومة كُتّاب <span className="text-[#fbbf24]">| قاعدة البيانات وحفل التكريم</span>
            </h1>
            <p className="text-xs text-emerald-200/80 font-medium max-w-xl">
              إدارة بروتوكول التكريم المباشر، ترتيب صعود الطلاب على المسرح حسب الأجزاء والدرجات، ومزامنة البيانات في Firebase.
            </p>
          </div>

          {/* Action Buttons & Sync Engine Trigger */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              onClick={() => setSyncModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 border border-amber-300/40"
              title="مزامنة وإدارة قاعدة بيانات الطلاب في Firebase"
            >
              <Database className="w-4 h-4" />
              <span>⚡ إدارة ومزامنة الطلاب ({masterStudentsList.length} طالب)</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3.5 py-2.5 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-rose-500/30"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* Luxury Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 bg-slate-950/80 p-2 rounded-2xl border border-emerald-700/50 shadow-inner">
          <button
            onClick={() => { setActiveTab('summer'); setStudentScope('SUMMER_2026'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'summer'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <Sun className={`w-4 h-4 ${activeTab === 'summer' ? 'text-slate-950' : 'text-amber-400'}`} />
            <span>الدورة الصيفية ({masterStudentsList.length} طالب)</span>
          </button>

          <button
            onClick={() => setActiveTab('ceremony')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'ceremony'
                ? 'bg-gradient-to-r from-amber-400 to-[#fbbf24] text-slate-950 shadow-lg shadow-amber-400/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>🏆 حفل التكريم والمسرح ({masterStudentsList.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('kuttab'); setStudentScope('KUTTAB_ONLY'); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'sheikhs'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>سجل الشيوخ ({sheikhs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('families')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer ${
              activeTab === 'families'
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 shadow-lg shadow-teal-400/30 scale-105'
                : 'text-slate-300 hover:text-white hover:bg-emerald-900/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الأسر والأشقاء ({familiesData.length})</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🏆 TAB 2: CEREMONY HUB (حفل التكريم والمسرح ودليل التقديم) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'ceremony' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Ceremony Stats KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#fbbf24] mx-auto mb-2">
                <Award className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#fbbf24]">{stats.totalHonored} طالب</div>
              <div className="text-xs font-bold text-slate-300 mt-1">إجمالي الطلاب المكرمين بالدورة</div>
            </div>

            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.topScorersCount} طلاب</div>
              <div className="text-xs font-bold text-slate-300 mt-1">🌟 الطلاب المتفوقون (≥90%)</div>
            </div>

            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">{stats.totalPartsCount} مستويات</div>
              <div className="text-xs font-bold text-slate-300 mt-1">📖 مستويات الحفظ والأجزاء</div>
            </div>

            <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-2xl p-5 text-center shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-teal-300">{stats.totalSheikhs} محفظاً</div>
              <div className="text-xs font-bold text-slate-300 mt-1">👳‍♂️ المشرفون والمعلمون المعتمدون</div>
            </div>
          </div>

          {/* Ceremony Controls: Search, Parts Filter & Action Buttons */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 p-4 sm:p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ceremonySearch}
                  onChange={(e) => setCeremonySearch(e.target.value)}
                  placeholder="ابحث باسم الطالب، الكود #001، الجزء..."
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-950/80 border border-emerald-700/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              {/* Action Buttons: Print Roster & Export CSV */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 border border-[#fbbf24]/50 text-[#fbbf24] rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة كشف صعود المسرح</span>
                </button>

                <button
                  onClick={exportCeremonyToCSV}
                  className="px-4 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تصدير كشف التكريم (Excel)</span>
                </button>
              </div>
            </div>

            {/* Quran Parts Filter Pills */}
            <div className="space-y-2 pt-2 border-t border-emerald-800/40">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#fbbf24]">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>تصنيف وترتيب حسب الأجزاء القرآنية:</span>
                <span className="text-[11px] text-slate-400 font-normal">(الترتيب داخل كل جزء تنازلياً بحسب الدرجة)</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 max-h-36 overflow-y-auto p-1">
                <button
                  onClick={() => setCeremonyPartFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    ceremonyPartFilter === 'ALL'
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                  }`}
                >
                  جميع الأجزاء ({masterStudentsList.length})
                </button>

                {QURAN_PARTS_ORDER.map((part) => {
                  const normP = normalizeArabic(part);
                  const count = masterStudentsList.filter(s => {
                    const normPart = normalizeArabic(s.partName || '');
                    return normPart === normP || normPart.includes(normP) || normP.includes(normPart);
                  }).length;

                  return (
                    <button
                      key={part}
                      onClick={() => setCeremonyPartFilter(part)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        ceremonyPartFilter === part
                          ? 'bg-emerald-400 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-900/80 text-emerald-300 hover:text-white border border-emerald-500/30'
                      }`}
                    >
                      {part} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stage Ascension Roster Table */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-emerald-800/40 pb-4 gap-2">
              <div className="flex items-center gap-2.5 font-black text-[#fbbf24] text-base">
                <Award className="w-5 h-5" />
                <span>كشف صعود المسرح المعتمد ({ceremonyStudents.length} طالب معروض)</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-700/40">
                مرتب بحسب الأجزاء والدرجات تنازلياً ⭐
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0c3d34] text-[#fbbf24] font-black border-b border-emerald-700/50">
                    <th className="p-3 text-center rounded-r-xl w-16">الدور #</th>
                    <th className="p-3 text-center w-20">كود الطالب</th>
                    <th className="p-3">اسم الطالب المُكَرَّم</th>
                    <th className="p-3">مستوى الحفظ (الجزء)</th>
                    <th className="p-3 text-center w-28">درجة الاختبار</th>
                    <th className="p-3">التكريم وشهادة التقدير</th>
                    <th className="p-3 text-center rounded-l-xl w-36">إجراءات المسرح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/30">
                  {ceremonyStudents.map((student, idx) => (
                    <tr key={student.id || idx} className="hover:bg-emerald-900/30 transition-colors">
                      <td className="p-3 text-center font-black">
                        <span className={`inline-block w-7 h-7 rounded-full leading-7 text-center text-xs ${
                          idx === 0 ? 'bg-amber-400 text-slate-950 font-black shadow-lg' :
                          idx === 1 ? 'bg-slate-300 text-slate-950 font-black' :
                          idx === 2 ? 'bg-amber-700 text-white font-black' : 'bg-slate-900 text-slate-300 border border-emerald-800/40'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-bold text-[11px]">
                          {student.studentCode}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{student.studentName}</div>
                        <span className="text-[10px] text-slate-400">{student.sheikhName || 'شيوخ الكُتّاب'}</span>
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] inline-block">
                          {student.partName || 'القرآن الكريم'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        {student.examScore ? (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-black text-xs inline-block">
                            {student.examScore}%
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="text-amber-200 text-[11px] font-bold flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#fbbf24] shrink-0" />
                          <span>{student.gift || student.awardTier || 'شهادة تقدير وتكريم'}</span>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenStagePrompter(student, idx)}
                            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow transition-all active:scale-95"
                            title="عرض بطاقة التقديم الحية للمسرح"
                          >
                            🎤 نداء
                          </button>

                          <button
                            onClick={() => setBadgeModalStudent(student)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all cursor-pointer border border-emerald-700/40"
                            title="معاينة وطباعة كارت التكريم والـ QR"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🎓 TABS 1 & 3: SUMMER 2026 & KUTTAB DASHBOARD */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {(activeTab === 'summer' || activeTab === 'kuttab' || activeTab === 'students') && (
        <div className="space-y-6 animate-fade-in">
          
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
                <span>☀️ طلاب الدورة الصيفية ({masterStudentsList.length})</span>
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

          {/* Controls Bar */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            
            {/* Search Input & Part Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="ابحث بالاسم، الكود، الهاتف..."
                  className="w-full pr-10 pl-4 py-2 bg-slate-950/80 border border-emerald-700/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              {/* Part Filter Dropdown */}
              <select
                value={studentFilterPart}
                onChange={(e) => setStudentFilterPart(e.target.value)}
                className="px-3 py-2 bg-slate-950/80 border border-emerald-700/50 rounded-xl text-xs text-white focus:outline-none focus:border-[#fbbf24]"
              >
                <option value="ALL">جميع الأجزاء والمستويات</option>
                {availableParts.map((part) => (
                  <option key={part} value={part}>{part}</option>
                ))}
              </select>
            </div>

            {/* Actions: Export Excel & Add Student */}
            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={exportStudentsToExcel}
                className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تصدير Excel</span>
              </button>

              <button
                onClick={() => {
                  setEditingStudent(null);
                  setStudentModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طالب جديد</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-2 font-black text-[#fbbf24] text-base">
                <Users className="w-5 h-5" />
                <span>سجل الطلاب المعتمد ({filteredStudents.length} طالب)</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#0c3d34] text-[#fbbf24] font-black border-b border-emerald-700/50">
                    <th className="p-3 text-center rounded-r-xl w-14">م</th>
                    <th className="p-3 text-center w-24 whitespace-nowrap">كود الطالب</th>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3">فئة التكريم والجائزة</th>
                    <th className="p-3">المرحلة والمدرسة</th>
                    <th className="p-3">ولي الأمر والهاتف</th>
                    <th className="p-3 text-center rounded-l-xl w-32">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-800/30">
                  {filteredStudents.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-emerald-900/30 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-black text-xs whitespace-nowrap inline-block">
                          {r.studentCode || (r.idx ? `#${String(r.idx).padStart(3, '0')}` : `#${String(idx + 1).padStart(3, '0')}`)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-white text-sm">{r.studentName}</div>
                        <span className="text-[10px] text-emerald-300 font-semibold">{r.partName || 'القرآن الكريم'}</span>
                      </td>
                      <td className="p-3">
                        <div className="text-amber-300 font-bold text-[11px]">{r.awardTier || '✨ فئة متميزة'}</div>
                        <div className="text-slate-400 text-[10px] truncate max-w-xs">{r.gift}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200 font-bold">{r.studyStage || 'ابتدائي'}</div>
                        <span className="text-[10px] text-slate-400">{r.schoolName ? `${r.schoolName}${r.birthDate ? ` (${r.birthDate})` : ''}` : (r.birthDate ? `مواليد: ${r.birthDate}` : '—')}</span>
                      </td>
                      <td className="p-3">
                        <div className="text-emerald-400 font-mono font-bold">{r.fatherPhone || '—'}</div>
                        <span className="text-[10px] text-amber-200/90 font-bold">{r.fatherStatus || 'على قيد الحياة'}</span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setBadgeModalStudent(r)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all cursor-pointer"
                            title="معاينة كارت التكريم والـ QR"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(r);
                              setStudentModalOpen(true);
                            }}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl transition-all cursor-pointer"
                            title="تعديل البيانات"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRequestDeleteStudent(r)}
                            className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl transition-all cursor-pointer"
                            title="حذف الطالب من السجل"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👳‍♂️ TAB 4: SHEIKHS REGISTRY (سجل الشيوخ والمعلمين) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'sheikhs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#062b24]/90 border border-emerald-700/40 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sheikhSearch}
                onChange={(e) => setSheikhSearch(e.target.value)}
                placeholder="ابحث باسم الشيخ، المؤهل، الهاتف..."
                className="w-full pr-10 pl-4 py-2 bg-slate-950/80 border border-emerald-700/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={exportSheikhsToCSV}
                className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>تصدير كشف الشيوخ</span>
              </button>

              <button
                onClick={handleExecuteSyncSheikhs}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-[#fbbf24]/50 text-[#fbbf24] rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>استيراد الكوادر المعتمدة</span>
              </button>

              <button
                onClick={() => {
                  setEditingSheikh(null);
                  setSheikhFormData({
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
                  setSheikhModalOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة محفظ جديد</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSheikhs.map((s) => (
              <div key={s.id} className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-5 shadow-xl space-y-4 relative hover:border-[#fbbf24]/50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt={s.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#fbbf24]" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-[#fbbf24] flex items-center justify-center text-[#fbbf24]">
                        <Users className="w-7 h-7" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-black text-white">{s.name}</h3>
                      <p className="text-[11px] text-amber-300 font-medium">{s.adminRole === 'SUPER_ADMIN' ? '👑 المشرف العام' : (s.adminRole === 'DEPUTY_ADMIN' ? '⭐ المشرف الأكاديمي' : '📘 محفظ ومعلم')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSheikh(s);
                        setSheikhFormData(s);
                        setSheikhModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRequestDeleteSheikh(s)}
                      className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                      title="حذف المحفظ من السجل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-emerald-800/40">
                  <div className="flex justify-between">
                    <span className="text-slate-400">الهاتف:</span>
                    <span className="font-bold text-emerald-300 font-mono">{s.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المؤهل:</span>
                    <span className="font-bold text-white truncate max-w-[180px]">{s.qualification || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الإشراف:</span>
                    <span className="font-bold text-[#fbbf24] truncate max-w-[180px]">{s.summerLevel || '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👨‍👩‍👧‍👦 TAB 5: FAMILIES & SIBLINGS (الأسر والأشقاء) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'families' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#062b24]/90 border border-emerald-700/40 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={familySearch}
                onChange={(e) => setFamilySearch(e.target.value)}
                placeholder="ابحث باسم الأسرة، ولي الأمر، الهاتف..."
                className="w-full pr-10 pl-4 py-2 bg-slate-950/80 border border-emerald-700/50 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
              />
            </div>

            <button
              onClick={exportFamiliesToCSV}
              className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" />
              <span>تصدير كشف الأسر</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredFamilies.map((fam, idx) => (
              <div key={fam.key || idx} className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2.5">
                  <div>
                    <h3 className="font-black text-white text-sm">{fam.parentName}</h3>
                    <p className="text-xs text-emerald-300 font-mono font-bold">{fam.fatherPhone}</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/20 text-[#fbbf24] font-black rounded-xl text-xs border border-[#fbbf24]/30">
                    {fam.students.length} أبناء مقيدين
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <p className="text-[11px] text-slate-400 font-bold">الأبناء بالكُتّاب:</p>
                  <div className="flex flex-wrap gap-2">
                    {fam.students.map((s, sIdx) => (
                      <span key={s.id || sIdx} className="px-2.5 py-1 rounded-xl bg-slate-900 border border-emerald-700/40 text-xs font-bold text-white flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
                        <span>{s.studentName}</span>
                        <span className="text-[10px] text-amber-400">({s.partName})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ⚡ MODAL 1: FIREBASE BATCH SYNC ENGINE MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {syncModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSyncing) {
              setSyncModalOpen(false);
            }
          }}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#041915] rounded-3xl border-2 border-[#fbbf24]/50 max-w-lg w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto"
          >
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-3">
              <div className="flex items-center gap-2 text-[#fbbf24] font-black text-base">
                <Database className="w-5 h-5" />
                <span>محرك إدارة ومزامنة قاعدة البيانات مع Firebase</span>
              </div>
              <button
                type="button"
                onClick={() => !isSyncing && setSyncModalOpen(false)}
                disabled={isSyncing}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer disabled:opacity-30"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                يتيح لك هذا المحرك مزامنة أو إعادة ضبط قاعدة بيانات الطلاب المعتمدة (<strong>{STUDENTS_CATALOG.length} طالباً</strong>) مباشرة مع Firebase Firestore مع الأجزاء والدرجات وأكواد الـ QR.
              </p>

              <div className="p-3.5 bg-emerald-950/60 rounded-2xl border border-emerald-700/40 text-emerald-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
                  <span>1. المزامنة والدمج الآمن (Safe Update & Merge):</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  يقوم بتحديث بيانات الطلاب مع الاحتفاظ بأي بيانات إضافية (أرقام الهواتف أو صور الطلاب) المسجلة مسبقاً.
                </p>
              </div>

              <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-700/40 text-rose-300 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>2. مسح السجلات وإعادة الضبط الشامل (Full Reset & Fresh Sync):</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  يمسح أي بيانات قديمة أو مكررة في فايربيز ويقوم بإعادة إيداع قائمة الـ {STUDENTS_CATALOG.length} طالباً المعتمدين من البداية.
                </p>
              </div>

              {isSyncing && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold text-amber-300">
                    <span>{isWiping ? 'جاري مسح السجلات القديمة وإعادة البناء...' : 'جاري المزامنة مع Firebase Firestore...'}</span>
                    <span>{syncProgress.percentage}% ({syncProgress.processed} / {syncProgress.total})</span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-amber-500/40">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                      style={{ width: `${syncProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {syncResult?.success && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تم تعيين وحفظ {syncResult.count} طالباً بنجاح في Firebase! 🎉</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-emerald-800/40">
              <button
                type="button"
                onClick={handleExecuteWipeAndResetStudents}
                disabled={isSyncing}
                className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 font-bold rounded-xl cursor-pointer text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                title="مسح كافة البيانات السابقة والبدء من جديد"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح وإعادة ضبط شامل</span>
              </button>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSyncModalOpen(false)}
                  disabled={isSyncing}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer transition-all text-xs"
                >
                  إغلاق
                </button>

                <button
                  type="button"
                  onClick={handleExecuteSyncStudents}
                  disabled={isSyncing}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'جاري التنفيذ...' : 'مزامنة وتحديث'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 🎤 MODAL 2: STAGE LIVE PROMPTER MODAL */}
      {stagePrompterStudent && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setStagePrompterStudent(null);
            }
          }}
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-b from-[#062b24] via-[#041915] to-[#02100d] rounded-3xl border-2 border-[#fbbf24]/50 max-w-2xl w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto"
          >
            <div className="flex items-center justify-between border-b border-[#fbbf24]/30 pb-3">
              <div className="flex items-center gap-2 text-[#fbbf24] font-black">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm sm:text-base">منصة التكريم | النداء المباشر على المسرح 🎙️</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-900 border border-[#fbbf24]/40 text-[#fbbf24] text-xs font-mono font-black">
                  #{stagePrompterIndex + 1} من {ceremonyStudents.length}
                </span>
                <button
                  type="button"
                  onClick={() => setStagePrompterStudent(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-center space-y-4 py-2">
              <div className="inline-block px-4 py-1 rounded-full bg-[#fbbf24]/20 border border-[#fbbf24]/50 text-[#fbbf24] font-mono font-black text-sm">
                كود التكريم: {stagePrompterStudent.studentCode}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow tracking-wide">
                {stagePrompterStudent.studentName || stagePrompterStudent.name}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                  {stagePrompterStudent.partName || stagePrompterStudent.part}
                </span>
                {stagePrompterStudent.examScore && (
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-black">
                    الدرجة: {stagePrompterStudent.examScore}%
                  </span>
                )}
              </div>

              <div className="p-4 bg-slate-950/90 rounded-2xl border border-emerald-700/40 text-right space-y-2">
                <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-semibold">
                  "بسم الله الرحمن الرحيم .. ويتفضل الآن لصعود منصة التكريم الطالب الحافظ / <strong className="text-[#fbbf24] text-sm sm:text-base">{stagePrompterStudent.studentName || stagePrompterStudent.name}</strong> .. بمستوى <strong className="text-emerald-300">{stagePrompterStudent.partName || stagePrompterStudent.part}</strong> .. تحت إشراف فضيلة الشيخ / <strong className="text-amber-300">{stagePrompterStudent.sheikhName || 'شيوخ الكُتّاب'}</strong>."
                </p>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-500/20 via-[#062b24] to-amber-500/20 rounded-2xl border border-[#fbbf24]/50 text-center space-y-1">
                <div className="text-xs font-bold text-emerald-300">🎖️ شهادة التقدير والتكريم المعتمدة:</div>
                <div className="text-sm sm:text-base font-black text-[#fbbf24]">{stagePrompterStudent.gift || stagePrompterStudent.awardTier || 'شهادة تقدير وتكريم الكُتّاب'}</div>
              </div>
            </div>

            {/* Bottom Navigator Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[#fbbf24]/20">
              <button
                type="button"
                onClick={handlePrevPrompterStudent}
                disabled={stagePrompterIndex === 0}
                className="px-3.5 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-bold rounded-xl flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all text-xs sm:text-sm"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={() => setBadgeModalStudent(stagePrompterStudent)}
                className="px-3 sm:px-4 py-2 bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 border border-[#fbbf24]/40 text-[#fbbf24] font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>معاينة الكارت</span>
              </button>

              <button
                type="button"
                onClick={handleNextPrompterStudent}
                disabled={stagePrompterIndex === ceremonyStudents.length - 1}
                className="px-3.5 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-slate-950 font-black rounded-xl flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-lg transition-all text-xs sm:text-sm"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🎫 MODAL 3: STUDENT BADGE & VIP PASS MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {badgeModalStudent && (
        <StudentBadgeModal
          student={badgeModalStudent}
          onClose={() => setBadgeModalStudent(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👨‍🎓 MODAL 4: EDIT / ADD STUDENT MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {studentModalOpen && (
        <StudentEditModal
          student={editingStudent}
          onClose={() => {
            setStudentModalOpen(false);
            setEditingStudent(null);
          }}
          showToast={showToast}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👳‍♂️ MODAL 5: ADD / EDIT SHEIKH MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {sheikhModalOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSheikhModalOpen(false);
            }
          }}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#062b24] p-5 sm:p-6 rounded-3xl border-2 border-[#fbbf24]/50 max-w-xl w-full text-right space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-white">
                {editingSheikh ? 'تعديل بيانات المحفظ / المشرف' : 'تسجيل شيخ ومحفظ جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setSheikhModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSheikh} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-200 mb-1">اسم الشيخ / المحفظ *</label>
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
                  <label className="block font-bold text-slate-200 mb-1">رقم التليفون *</label>
                  <input
                    type="tel"
                    required
                    value={sheikhFormData.phone}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-200 mb-1">المؤهل العلمي</label>
                  <input
                    type="text"
                    value={sheikhFormData.qualification}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, qualification: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">المستوى المشرف عليه بالدورة</label>
                <input
                  type="text"
                  value={sheikhFormData.summerLevel}
                  onChange={(e) => setSheikhFormData({ ...sheikhFormData, summerLevel: e.target.value })}
                  placeholder="مثال: إشراف عام وفصول القرآن كاملاً"
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-700/50 rounded-xl text-white focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-200 mb-1">صورة الشيخ الشخصية</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSheikhPhotoUpload}
                  className="w-full text-xs text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:bg-emerald-700 file:text-white cursor-pointer"
                />
                {uploadingSheikhPhoto && <p className="text-[11px] text-amber-400 mt-1">جاري رفع الصورة...</p>}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setSheikhModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={uploadingSheikhPhoto}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg transition-all active:scale-95"
                >
                  حفظ البيانات 🌟
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🗑️ MODAL 6: CUSTOM DELETE CONFIRMATION MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {deleteConfirmModal.isOpen && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteConfirmModal.isDeleting) {
              setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false });
            }
          }}
          className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#081f1b] border-2 border-rose-500/50 rounded-3xl max-w-md w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-4 animate-scaleIn my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/30">
              <div className="flex items-center gap-2 text-rose-400 font-black text-base">
                <Trash2 className="w-5 h-5 text-rose-400" />
                <span>
                  {deleteConfirmModal.type === 'student' ? 'تأكيد حذف سجل الطالب ⚠️' : 'تأكيد حذف المحفظ / الشيخ ⚠️'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false })}
                disabled={deleteConfirmModal.isDeleting}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                هل أنت متأكد من رغبتك في حذف{' '}
                <strong className="text-white text-sm font-black">
                  {deleteConfirmModal.type === 'student'
                    ? deleteConfirmModal.data?.studentName || deleteConfirmModal.data?.name
                    : deleteConfirmModal.data?.name}
                </strong>{' '}
                من قاعدة البيانات؟
              </p>

              {deleteConfirmModal.type === 'student' && (
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-rose-500/20 text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span>كود التكريم:</span>
                    <span className="font-mono text-amber-400 font-bold">{deleteConfirmModal.data?.studentCode || (deleteConfirmModal.data?.idx ? `#${String(deleteConfirmModal.data.idx).padStart(3, '0')}` : '#NEW')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المستوى:</span>
                    <span className="text-emerald-300 font-bold">{deleteConfirmModal.data?.partName || deleteConfirmModal.data?.part || 'القرآن الكريم'}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-[11px] font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>تنبيه: لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-rose-500/20">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false })}
                disabled={deleteConfirmModal.isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmModal.isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl cursor-pointer shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleteConfirmModal.isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
