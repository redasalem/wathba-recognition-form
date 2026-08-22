import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Gift,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  UserCheck,
  UserX,
  LayoutList,
  LayoutGrid,
  Copy,
  MessageCircle,
  ExternalLink,
  Phone,
  School,
  Calendar,
  Percent,
  Building,
  Sun,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Star,
  Check,
  Heart
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
import {
  STUDENTS_CATALOG,
  QURAN_PARTS_ORDER,
  normalizeArabic,
  isStudentMatch,
  getMemorizedPartsCount,
  matchesStudentSearch,
  matchesQuranPartCanonical,
  getCanonicalPartName,
  getPartOrderRank
} from '../data/studentsCatalog';
import { uploadToCloudinary } from '../services/cloudinary';
import StudentEditModal from './StudentEditModal';
import StudentBadgeModal from './StudentBadgeModal';

// ─── Helper: Check if student has entered ALL required registration inputs ───
export const isStudentFullyRegistered = (student) => {
  if (!student) return false;

  const name = (student.studentName || student.name || '').trim();
  if (!name || name.length < 3) return false;

  const phone = (student.fatherPhone || student.phone || '').trim();
  const hasValidPhone = /^01[0-9]{9}$/.test(phone);
  if (!hasValidPhone) return false;

  const hasBirthDate = Boolean((student.birthDate || '').trim());
  if (!hasBirthDate) return false;

  const hasStudyStage = Boolean((student.studyStage || '').trim());
  if (!hasStudyStage) return false;

  const school = (student.schoolName || student.school || '').trim();
  if (!school || school.length < 2) return false;

  return true;
};

// ─── Helper: Get list of missing fields for an incomplete student ────────────
export const getMissingStudentFields = (student) => {
  if (!student) return ['جميع البيانات الأساسية'];
  const missing = [];

  const name = (student.studentName || student.name || '').trim();
  if (!name || name.length < 3) {
    missing.push('اسم الطالب ثلاثياً');
  }

  const phone = (student.fatherPhone || student.phone || '').trim();
  if (!phone || !/^01[0-9]{9}$/.test(phone)) {
    missing.push('رقم الهاتف (11 رقماً)');
  }

  if (!(student.birthDate || '').trim()) {
    missing.push('تاريخ الميلاد');
  }

  if (!(student.studyStage || '').trim()) {
    missing.push('المرحلة الدراسية');
  }

  const school = (student.schoolName || student.school || '').trim();
  if (!school || school.length < 2) {
    missing.push('اسم المدرسة / الحضانة');
  }

  return missing;
};

export default function AdminDashboard({ records = [], onLogout, showToast }) {
  // Navigation Tabs: 'ceremony' | 'registered' | 'unregistered' | 'sheikhs'
  const [activeTab, setActiveTab] = useState('ceremony');

  // ══════════════════════════════════════════════════════════════
  // 🔍 UNIFIED ADVANCED FILTER STATES FOR STUDENTS
  // ══════════════════════════════════════════════════════════════
  const [searchQuery, setSearchQuery] = useState('');
  const [partFilter, setPartFilter] = useState('ALL');
  const [scoreFilter, setScoreFilter] = useState('ALL'); // 'ALL' | 'TOP_90' | 'EXCELLENT_80' | 'GOOD_70' | 'ENCOURAGE_BELOW_70'
  const [sheikhFilter, setSheikhFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL'); // 'ALL' | 'حضانة' | 'ابتدائي' | 'إعدادي' | 'ثانوي' | 'جامعي'
  const [sortBy, setSortBy] = useState('STAGE_ORDER'); // 'STAGE_ORDER' | 'SCORE_DESC' | 'SCORE_ASC' | 'CODE_ASC' | 'NAME_ASC' | 'RECENT'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // ══════════════════════════════════════════════════════════════
  // 👳‍♂️ SHEIKHS FILTER & STATE
  // ══════════════════════════════════════════════════════════════
  const [sheikhs, setSheikhs] = useState([]);
  const [sheikhSearch, setSheikhSearch] = useState('');
  const [sheikhRoleFilter, setSheikhRoleFilter] = useState('ALL'); // 'ALL' | 'SUPER_ADMIN' | 'DEPUTY_ADMIN' | 'TEACHER'
  const [sheikhAvailFilter, setSheikhAvailFilter] = useState('ALL'); // 'ALL' | 'FULL_TIME' | 'PART_TIME'
  const [sheikhSortBy, setSheikhSortBy] = useState('STUDENTS_DESC'); // 'STUDENTS_DESC' | 'NAME_ASC'
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

  // ══════════════════════════════════════════════════════════════
  // 🎤 MODALS & SYNC STATES
  // ══════════════════════════════════════════════════════════════
  const [stagePrompterStudent, setStagePrompterStudent] = useState(null);
  const [stagePrompterIndex, setStagePrompterIndex] = useState(0);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ processed: 0, total: STUDENTS_CATALOG.length, percentage: 0 });
  const [syncResult, setSyncResult] = useState(null);
  const [badgeModalStudent, setBadgeModalStudent] = useState(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Custom Delete Modal State
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    isOpen: false,
    type: null, // 'student' | 'sheikh'
    data: null,
    isDeleting: false
  });

  // Close modals on Escape key press
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

  // Realtime Sheikhs subscription
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

  // ══════════════════════════════════════════════════════════════
  // 👥 MASTER STUDENTS LIST (Merging Catalog with Firebase Updates)
  // ══════════════════════════════════════════════════════════════
  const masterStudentsList = useMemo(() => {
    const list = STUDENTS_CATALOG.map((cat, index) => {
      const matchedRecord = records.find((rec) => isStudentMatch(rec, cat));
      
      const merged = {
        // Base official catalog properties (Immutable baseline)
        ...cat,
        idx: cat.idx || index + 1,
        studentId: cat.studentId || `STU-2026-${String(index + 1).padStart(3, '0')}`,
        studentCode: cat.code || `#${String(cat.idx || index + 1).padStart(3, '0')}`,
        studentName: (matchedRecord?.studentName && matchedRecord.studentName.trim()) || cat.name,
        partName: cat.part,
        part: cat.part,
        examScore: cat.score !== undefined ? Number(cat.score) : 0,
        score: cat.score !== undefined ? Number(cat.score) : 0,
        awardTier: cat.tier || '✨ فئة التفوق',
        gift: cat.gift || 'شهادة تقدير وتكريم الكُتّاب',
        totalParts: cat.totalParts || getMemorizedPartsCount(cat.part),

        // Live Registration fields from Firestore
        id: matchedRecord?.id || cat.studentId,
        fatherPhone: matchedRecord?.fatherPhone || matchedRecord?.phone || '',
        birthDate: matchedRecord?.birthDate || '',
        studyStage: matchedRecord?.studyStage || '',
        schoolName: matchedRecord?.schoolName || matchedRecord?.school || '',
        fatherStatus: matchedRecord?.fatherStatus || 'نعم (على قيد الحياة)',
        parentName: matchedRecord?.parentName || '',
        photoUrl: matchedRecord?.photoUrl || '',
        sheikhName: matchedRecord?.sheikhName || 'شيوخ الكُتّاب',
        notes: matchedRecord?.notes || '',
        smartUrl: cat.smart_url || matchedRecord?.smartUrl || '',
        qrCodeUrl: cat.qr_code_url || matchedRecord?.qrCodeUrl || '',
        qrImgUrl: cat.qr_img_url || matchedRecord?.qrImgUrl || '',
        updatedAt: matchedRecord?.updatedAt || null,
        createdAt: matchedRecord?.createdAt || null
      };

      const isComplete = isStudentFullyRegistered(merged);
      return {
        ...merged,
        completed: isComplete,
        missingFields: getMissingStudentFields(merged)
      };
    });

    return list;
  }, [records]);

  // ══════════════════════════════════════════════════════════════
  // 📋 ALL DISPLAY STUDENTS (Master Catalog + Standalone Records)
  // ══════════════════════════════════════════════════════════════
  const allDisplayStudents = useMemo(() => {
    if (records.length === 0) return masterStudentsList;

    const standaloneRecords = records.filter(r => 
      !masterStudentsList.some(m => isStudentMatch(r, m))
    ).map((r, extraIdx) => {
      const isComplete = isStudentFullyRegistered(r);
      return {
        ...r,
        id: r.id || `STANDALONE-${extraIdx + 1}`,
        studentCode: r.studentCode || (r.idx ? `#${String(r.idx).padStart(3, '0')}` : `#${String(masterStudentsList.length + extraIdx + 1).padStart(3, '0')}`),
        studentName: (r.studentName || r.name || 'طالب جديد').trim(),
        partName: (r.partName || r.part || 'القرآن الكريم').trim(),
        examScore: r.examScore !== undefined && r.examScore !== '' ? Number(r.examScore) : 0,
        awardTier: r.awardTier || '✨ فئة متميزة',
        gift: r.gift || 'شهادة تقدير وتكريم الكُتّاب',
        totalParts: getMemorizedPartsCount(r.partName || ''),
        sheikhName: r.sheikhName || 'شيوخ الكُتّاب',
        idx: r.idx || masterStudentsList.length + extraIdx + 1,
        completed: isComplete,
        missingFields: getMissingStudentFields(r)
      };
    });

    return [...masterStudentsList, ...standaloneRecords];
  }, [masterStudentsList, records]);

  // Unique Supervising Sheikhs for Dropdown Filter
  const uniqueSupervisingSheikhs = useMemo(() => {
    const namesSet = new Set();
    allDisplayStudents.forEach(s => {
      if (s.sheikhName && s.sheikhName.trim() && s.sheikhName !== 'شيوخ الكُتّاب') {
        namesSet.add(s.sheikhName.trim());
      }
    });
    sheikhs.forEach(sh => {
      if (sh.name && sh.name.trim()) {
        namesSet.add(sh.name.trim());
      }
    });
    return Array.from(namesSet).sort((a, b) => a.localeCompare(b, 'ar'));
  }, [allDisplayStudents, sheikhs]);

  // ══════════════════════════════════════════════════════════════
  // ⚙️ UNIFIED FILTER & SORTING ENGINE
  // ══════════════════════════════════════════════════════════════
  const filterStudents = useCallback((list) => {
    return list.filter((student) => {
      // 1. Text Search Query
      if (searchQuery.trim() && !matchesStudentSearch(student, searchQuery)) {
        return false;
      }

      // 2. Quran Part Filter
      if (partFilter !== 'ALL' && !matchesQuranPartCanonical(student.partName, partFilter)) {
        return false;
      }

      // 3. Exam Score Range Filter
      if (scoreFilter !== 'ALL') {
        const score = Number(student.examScore) || 0;
        if (scoreFilter === 'TOP_90' && score < 90) return false;
        if (scoreFilter === 'EXCELLENT_80' && (score < 80 || score >= 90)) return false;
        if (scoreFilter === 'GOOD_70' && (score < 70 || score >= 80)) return false;
        if (scoreFilter === 'ENCOURAGE_BELOW_70' && score >= 70) return false;
      }

      // 4. Supervising Sheikh Filter
      if (sheikhFilter !== 'ALL') {
        const sSheikh = normalizeArabic(student.sheikhName || '');
        const targetSheikh = normalizeArabic(sheikhFilter);
        if (!sSheikh.includes(targetSheikh) && !targetSheikh.includes(sSheikh)) {
          return false;
        }
      }

      // 5. Study Stage Filter
      if (stageFilter !== 'ALL') {
        const sStage = normalizeArabic(student.studyStage || '');
        const targetStage = normalizeArabic(stageFilter);
        if (!sStage.includes(targetStage)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, partFilter, scoreFilter, sheikhFilter, stageFilter]);

  const sortStudents = useCallback((list) => {
    const sorted = [...list];
    switch (sortBy) {
      case 'STAGE_ORDER':
        sorted.sort((a, b) => {
          const rankA = getPartOrderRank(a.partName);
          const rankB = getPartOrderRank(b.partName);
          if (rankA !== rankB) return rankA - rankB;
          return (b.examScore || 0) - (a.examScore || 0);
        });
        break;
      case 'SCORE_DESC':
        sorted.sort((a, b) => (b.examScore || 0) - (a.examScore || 0));
        break;
      case 'SCORE_ASC':
        sorted.sort((a, b) => (a.examScore || 0) - (b.examScore || 0));
        break;
      case 'CODE_ASC':
        sorted.sort((a, b) => {
          const numA = parseInt(String(a.studentCode || '').replace(/\D/g, ''), 10) || a.idx || 0;
          const numB = parseInt(String(b.studentCode || '').replace(/\D/g, ''), 10) || b.idx || 0;
          return numA - numB;
        });
        break;
      case 'NAME_ASC':
        sorted.sort((a, b) => (a.studentName || '').localeCompare(b.studentName || '', 'ar'));
        break;
      case 'RECENT':
        sorted.sort((a, b) => {
          const tA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.idx || 0));
          const tB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.idx || 0));
          return tB - tA;
        });
        break;
      default:
        sorted.sort((a, b) => {
          const rankA = getPartOrderRank(a.partName);
          const rankB = getPartOrderRank(b.partName);
          if (rankA !== rankB) return rankA - rankB;
          return (b.examScore || 0) - (a.examScore || 0);
        });
    }
    return sorted;
  }, [sortBy]);

  // 🏆 1. Filtered Ceremony Students
  const ceremonyStudents = useMemo(() => {
    return sortStudents(filterStudents(masterStudentsList));
  }, [masterStudentsList, filterStudents, sortStudents]);

  // ✅ 2. Filtered Registered Students
  const registeredStudents = useMemo(() => {
    const registered = allDisplayStudents.filter(s => s.completed === true);
    return sortStudents(filterStudents(registered));
  }, [allDisplayStudents, filterStudents, sortStudents]);

  // ⏳ 3. Filtered Unregistered Students
  const unregisteredStudents = useMemo(() => {
    const unregistered = allDisplayStudents.filter(s => s.completed !== true);
    return sortStudents(filterStudents(unregistered));
  }, [allDisplayStudents, filterStudents, sortStudents]);

  // 🎯 Active Tab Current Students List
  const currentTabStudents = useMemo(() => {
    if (activeTab === 'registered') return registeredStudents;
    if (activeTab === 'unregistered') return unregisteredStudents;
    return ceremonyStudents;
  }, [activeTab, ceremonyStudents, registeredStudents, unregisteredStudents]);

  // 👳‍♂️ 4. Filtered Sheikhs
  const filteredSheikhs = useMemo(() => {
    let list = [...sheikhs];

    if (sheikhSearch.trim()) {
      const q = normalizeArabic(sheikhSearch);
      list = list.filter((s) => {
        return (
          normalizeArabic(s.name || '').includes(q) ||
          normalizeArabic(s.phone || '').includes(q) ||
          normalizeArabic(s.qualification || '').includes(q) ||
          normalizeArabic(s.summerLevel || '').includes(q) ||
          normalizeArabic(s.ijazat || '').includes(q) ||
          normalizeArabic(s.address || '').includes(q)
        );
      });
    }

    if (sheikhRoleFilter !== 'ALL') {
      list = list.filter(s => s.adminRole === sheikhRoleFilter);
    }

    if (sheikhAvailFilter !== 'ALL') {
      list = list.filter(s => {
        const avail = normalizeArabic(s.availability || '');
        if (sheikhAvailFilter === 'FULL_TIME') return avail.includes('كلي') || avail.includes('متفرغ');
        if (sheikhAvailFilter === 'PART_TIME') return avail.includes('جزئي') || avail.includes('غير');
        return true;
      });
    }

    if (sheikhSortBy === 'STUDENTS_DESC') {
      list.sort((a, b) => (Number(b.studentsCount) || 0) - (Number(a.studentsCount) || 0));
    } else if (sheikhSortBy === 'NAME_ASC') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ar'));
    }

    return list;
  }, [sheikhs, sheikhSearch, sheikhRoleFilter, sheikhAvailFilter, sheikhSortBy]);

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      partFilter !== 'ALL' ||
      scoreFilter !== 'ALL' ||
      sheikhFilter !== 'ALL' ||
      stageFilter !== 'ALL' ||
      sortBy !== 'STAGE_ORDER'
    );
  }, [searchQuery, partFilter, scoreFilter, sheikhFilter, stageFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setPartFilter('ALL');
    setScoreFilter('ALL');
    setSheikhFilter('ALL');
    setStageFilter('ALL');
    setSortBy('STAGE_ORDER');
  };

  // ══════════════════════════════════════════════════════════════
  // 📊 COMPREHENSIVE SYSTEM STATS
  // ══════════════════════════════════════════════════════════════
  const stats = useMemo(() => {
    const totalHonored = masterStudentsList.length;
    const topScorersCount = masterStudentsList.filter(s => (Number(s.examScore) || 0) >= 90).length;
    const excellentScorersCount = masterStudentsList.filter(s => (Number(s.examScore) || 0) >= 80 && (Number(s.examScore) || 0) < 90).length;
    const totalRegistered = allDisplayStudents.filter(s => s.completed === true).length;
    const totalUnregistered = allDisplayStudents.filter(s => s.completed !== true).length;

    return {
      totalHonored,
      topScorersCount,
      excellentScorersCount,
      totalRegistered,
      totalUnregistered,
      totalSheikhs: sheikhs.length
    };
  }, [masterStudentsList, allDisplayStudents, sheikhs]);

  // ══════════════════════════════════════════════════════════════
  // 🔗 SMART URL & ACTIONS FOR STUDENTS
  // ══════════════════════════════════════════════════════════════
  const getStudentDirectUrl = (student) => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app';
    return (
      student.smartUrl ||
      student.qrCodeUrl ||
      `${origin}/#/student/form?name=${encodeURIComponent(student.studentName || student.name || '')}&id=${student.studentId || student.id || ''}`
    );
  };

  const handleCopyStudentLink = (student) => {
    const link = getStudentDirectUrl(student);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      showToast?.(`تم نسخ رابط استمارة الطالب: ${student.studentName || student.name} 📋`, 'success');
    }
  };

  const handleSendWhatsAppReminder = (student) => {
    const link = getStudentDirectUrl(student);
    const text = `السلام عليكم ورحمة الله وبركاته،\nولي أمر الطالب/ة المبارك: *${student.studentName || student.name}*\nنهنئكم بتفوق ابنكم في الدورة الصيفية لكُتّاب 2026 🏆\nيرجى التكرم باستكمال بيانات كارت وتصريح التكريم الرسمي لحضور الحفل عبر الرابط التالي:\n${link}\n\nإدارة كُتّاب 2026`;
    const phone = (student.fatherPhone || student.phone || '').trim().replace(/^0/, '');
    const waUrl = phone
      ? `https://wa.me/20${phone}?text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;

    window.open(waUrl, '_blank');
  };

  // ══════════════════════════════════════════════════════════════
  // 📥 EXPORT ENGINE (Accurately honoring active filters)
  // ══════════════════════════════════════════════════════════════
  const exportStudentsToCSV = (studentsToExport, filenamePrefix = 'كشف_طلاب_كتاب_2026') => {
    let csvContent = '\uFEFF'; // UTF-8 BOM for Arabic support in Excel
    csvContent += 'م,كود الطالب,معرف الطالب,اسم الطالب,المستوى القرآني,درجة الاختبار,فئة التكريم,الهدية والتكريم,الشيخ المشرف,المرحلة الدراسية,المدرسة أو الحضانة,تاريخ الميلاد,اسم ولي الأمر,هاتف ولي الأمر,حالة الأب,حالة الاستمارة\n';

    studentsToExport.forEach((s, idx) => {
      const row = [
        idx + 1,
        `"${s.studentCode || ''}"`,
        `"${s.studentId || ''}"`,
        `"${s.studentName || ''}"`,
        `"${s.partName || ''}"`,
        `"${s.examScore !== undefined ? s.examScore + '%' : ''}"`,
        `"${s.awardTier || ''}"`,
        `"${s.gift || ''}"`,
        `"${s.sheikhName || ''}"`,
        `"${s.studyStage || ''}"`,
        `"${s.schoolName || ''}"`,
        `"${s.birthDate || ''}"`,
        `"${s.parentName || ''}"`,
        `"${s.fatherPhone || s.phone || ''}"`,
        `"${s.fatherStatus || ''}"`,
        `"${s.completed ? 'مكتملة ومسجلة' : 'ناقصة بانتظار الاستكمال'}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.(`تم تصدير كشف يحتوي على (${studentsToExport.length}) طالباً بنجاح 📊`, 'success');
  };

  const exportSheikhsToCSV = () => {
    let csvContent = '\uFEFF';
    csvContent += 'م,اسم الشيخ,رقم الهاتف,المؤهل الدراسي,الإجازات القرآنية,العنوان,مشارك بالدورة الصيفية,مستوى الإشراف,التفرغ,عدد الطلاب,الحالة الاجتماعية,ملاحظات\n';

    filteredSheikhs.forEach((s, idx) => {
      const row = [
        idx + 1,
        `"${s.name || ''}"`,
        `"${s.phone || ''}"`,
        `"${s.qualification || ''}"`,
        `"${s.ijazat || ''}"`,
        `"${s.address || ''}"`,
        `"${s.participatingSummer || ''}"`,
        `"${s.summerLevel || ''}"`,
        `"${s.availability || ''}"`,
        s.studentsCount || 0,
        `"${s.socialStatus || ''}"`,
        `"${s.notes || ''}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `سجل_شيوخ_الكتاب_2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.(`تم تصدير كشف الشيوخ (${filteredSheikhs.length} شيخ) بنجاح 📊`, 'success');
  };

  // ══════════════════════════════════════════════════════════════
  // ⚡ FIREBASE BATCH SYNC & RESET HANDLERS
  // ══════════════════════════════════════════════════════════════
  const handleExecuteSyncStudents = async () => {
    setIsSyncing(true);
    setIsWiping(false);
    setSyncResult(null);
    setSyncProgress({ processed: 0, total: STUDENTS_CATALOG.length, percentage: 0 });

    try {
      const res = await batchSyncStudentsToFirestore(STUDENTS_CATALOG, (prog) => {
        setSyncProgress(prog);
      });
      setSyncResult(res);
      showToast?.(`تمت مزامنة ${res.count} طالباً بنجاح في Firebase 🎉`, 'success');
    } catch (err) {
      console.error('Sync error:', err);
      showToast?.('حدث خطأ أثناء المزامنة، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExecuteWipeAndResetStudents = async () => {
    if (!window.confirm('تحذير هام: هل أنت متأكد من مسح كافة السجلات الحالية في Firebase وإعادة إيداع قائمة الطلاب المعتمدة كاملة؟')) {
      return;
    }
    setIsSyncing(true);
    setIsWiping(true);
    setSyncResult(null);
    setSyncProgress({ processed: 0, total: STUDENTS_CATALOG.length, percentage: 0 });

    try {
      const res = await resetAndWipeStudentsFirestore(STUDENTS_CATALOG, (prog) => {
        setSyncProgress(prog);
      });
      setSyncResult(res);
      showToast?.(`تم مسح السجلات وإعادة بناء وتثبيت ${res.count} طالباً بنجاح! 🚀`, 'success');
    } catch (err) {
      console.error('Wipe & Reset error:', err);
      showToast?.('حدث خطأ أثناء إعادة الضبط، يرجى المحاولة مجدداً', 'error');
    } finally {
      setIsSyncing(false);
      setIsWiping(false);
    }
  };

  const handleExecuteSyncSheikhs = async () => {
    try {
      await batchSyncSheikhsToFirestore();
      showToast?.('تم استيراد الكوادر والشيوخ بنجاح في Firebase 🎉', 'success');
    } catch (err) {
      console.error('Sync sheikhs error:', err);
      showToast?.('حدث خطأ أثناء استيراد الشيوخ', 'error');
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 🗑️ CUSTOM DELETE MODAL LOGIC
  // ══════════════════════════════════════════════════════════════
  const handleRequestDeleteStudent = (student) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'student',
      data: student,
      isDeleting: false
    });
  };

  const handleRequestDeleteSheikh = (sheikh) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'sheikh',
      data: sheikh,
      isDeleting: false
    });
  };

  const handleConfirmDelete = async () => {
    const { type, data } = deleteConfirmModal;
    if (!data) return;

    setDeleteConfirmModal(prev => ({ ...prev, isDeleting: true }));

    try {
      if (type === 'student') {
        const docId = data.id || data.studentId;
        if (docId) {
          await deleteStudentRecord(docId);
          showToast?.(`تم حذف الطالب: ${data.studentName || data.name} بنجاح`, 'success');
        }
      } else if (type === 'sheikh') {
        if (data.id) {
          await deleteSheikhRecord(data.id);
          showToast?.(`تم حذف الشيخ: ${data.name} بنجاح`, 'success');
        }
      }
      setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false });
    } catch (err) {
      console.error('Delete error:', err);
      showToast?.('حدث خطأ أثناء الحذف، يرجى المحاولة مرة أخرى', 'error');
      setDeleteConfirmModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 👳‍♂️ SHEIKH FORM HANDLERS
  // ══════════════════════════════════════════════════════════════
  const handleSheikhSubmit = async (e) => {
    e.preventDefault();
    if (!sheikhFormData.name.trim()) {
      showToast?.('يرجى إدخال اسم الشيخ', 'error');
      return;
    }

    try {
      if (editingSheikh && editingSheikh.id) {
        await updateSheikhRecord(editingSheikh.id, sheikhFormData);
        showToast?.('تم تحديث بيانات المحفظ بنجاح 🎉', 'success');
      } else {
        await addSheikhRecord(sheikhFormData);
        showToast?.('تمت إضافة المحفظ الجديد بنجاح 🎉', 'success');
      }
      setSheikhModalOpen(false);
      setEditingSheikh(null);
    } catch (err) {
      console.error('Save sheikh error:', err);
      showToast?.('حدث خطأ أثناء حفظ بيانات المحفظ', 'error');
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
      console.error('Photo upload error:', err);
      showToast?.('حدث خطأ أثناء رفع الصورة', 'error');
    } finally {
      setUploadingSheikhPhoto(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 🎤 STAGE LIVE PROMPTER NAVIGATION (Sequential on Filtered List)
  // ══════════════════════════════════════════════════════════════
  const handleOpenStagePrompter = (student, index) => {
    setStagePrompterStudent(student);
    setStagePrompterIndex(index);
  };

  const handleNextStageStudent = () => {
    if (stagePrompterIndex < ceremonyStudents.length - 1) {
      const nextIdx = stagePrompterIndex + 1;
      setStagePrompterIndex(nextIdx);
      setStagePrompterStudent(ceremonyStudents[nextIdx]);
    }
  };

  const handlePrevStageStudent = () => {
    if (stagePrompterIndex > 0) {
      const prevIdx = stagePrompterIndex - 1;
      setStagePrompterIndex(prevIdx);
      setStagePrompterStudent(ceremonyStudents[prevIdx]);
    }
  };

  // Keyboard navigation for Prompter modal
  useEffect(() => {
    if (!stagePrompterStudent) return;
    const handlePrompterKeys = (e) => {
      if (e.key === 'ArrowLeft') {
        // In Arabic RTL, left means next
        handleNextStageStudent();
      } else if (e.key === 'ArrowRight') {
        // right means previous
        handlePrevStageStudent();
      }
    };
    window.addEventListener('keydown', handlePrompterKeys);
    return () => window.removeEventListener('keydown', handlePrompterKeys);
  }, [stagePrompterStudent, stagePrompterIndex, ceremonyStudents]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100 px-3 sm:px-6 py-4 animate-fade-in font-sans">
      
      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👑 TOP HEADER & MAIN SYSTEM BAR */}
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

        {/* ═══ Navigation Tabs Bar ═══ */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-4 border-t border-emerald-800/40">
          <button
            onClick={() => setActiveTab('ceremony')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ceremony'
                ? 'bg-gradient-to-r from-[#fbbf24] to-amber-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>🏆 حفل التكريم والمسرح ({ceremonyStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'registered'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>✅ الطلاب المسجلون ({stats.totalRegistered})</span>
          </button>

          <button
            onClick={() => setActiveTab('unregistered')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'unregistered'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>⏳ لم يسجلوا بعد ({stats.totalUnregistered})</span>
          </button>

          <button
            onClick={() => setActiveTab('sheikhs')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sheikhs'
                ? 'bg-gradient-to-r from-[#fbbf24] to-amber-500 text-slate-950 shadow-lg scale-105'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👳‍♂️ سجل الشيوخ ({sheikhs.length})</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 📊 REAL-TIME SUMMARY METRICS STRIP */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#062b24]/90 border border-emerald-700/40 p-4 rounded-3xl shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 block">إجمالي الطلاب المكرمين بالدورة</span>
          <div className="text-2xl font-black text-white mt-1">{stats.totalHonored} <span className="text-xs font-normal text-emerald-400">طالب</span></div>
          <div className="text-[10px] text-amber-300 mt-1 font-semibold">100% معتمدون بحفل التكريم</div>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-500/50 p-4 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-[11px] font-bold text-slate-400 block">✅ الطلاب المسجلون (بيانات كاملة)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.totalRegistered} <span className="text-xs font-normal text-emerald-300">طالب</span></div>
          <div className="text-[10px] text-emerald-300 mt-1 font-semibold">استمارة مكتملة بالكامل</div>
        </div>

        <div className="bg-[#062b24]/90 border border-amber-500/50 p-4 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span className="text-[11px] font-bold text-slate-400 block">⏳ لم يسجلوا بعد (بيانات ناقصة)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.totalUnregistered} <span className="text-xs font-normal text-amber-300">طالب</span></div>
          <div className="text-[10px] text-amber-200 mt-1 font-semibold">في انتظار استكمال البيانات عبر QR</div>
        </div>

        <div className="bg-[#062b24]/90 border border-emerald-700/40 p-4 rounded-3xl shadow-lg relative overflow-hidden">
          <span className="text-[11px] font-bold text-slate-400 block">🌟 الطلاب المتفوقون (≥90%)</span>
          <div className="text-2xl font-black text-amber-300 mt-1">{stats.topScorersCount} <span className="text-xs font-normal text-emerald-400">طلاب</span></div>
          <div className="text-[10px] text-emerald-300 mt-1 font-semibold">درجات الامتياز والتفوق</div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🎛️ ADVANCED UNIFIED FILTER CONTROL PANEL (For Student Tabs) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab !== 'sheikhs' && (
        <div className="bg-[#062b24]/95 border border-emerald-700/50 p-4 sm:p-5 rounded-3xl space-y-4 shadow-2xl backdrop-blur-xl">
          
          {/* Main Top Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* Live Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الكود (#001)، الهاتف، الجزء، الشيخ، المدرسة..."
                className="w-full pr-10 pl-9 py-2.5 bg-slate-950/80 border border-emerald-700/60 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2 justify-end">
              
              {/* Toggle Advanced Filters Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showAdvancedFilters || hasActiveFilters
                    ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]'
                    : 'bg-slate-900 border-emerald-700/50 text-slate-300 hover:text-white'
                }`}
                title="تخصيص الفلاتر المتقدمة (الدرجات، المشايخ، المراحل، الترتيب)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>فلاتر متقدمة</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-ping ml-1"></span>
                )}
              </button>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-emerald-800/60">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="عرض الجدول"
                >
                  <LayoutList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                    viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="عرض البطاقات"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Print Button */}
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer border border-emerald-700/50 transition-all"
                title="طباعة الكشف المعروض حالياً"
              >
                <Printer className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span className="hidden sm:inline">طباعة</span>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={() => exportStudentsToCSV(currentTabStudents, activeTab === 'ceremony' ? 'كشف_المسرح_المعتمد' : (activeTab === 'registered' ? 'كشف_الطلاب_المسجلين' : 'كشف_الطلاب_غير_المسجلين'))}
                className="px-3.5 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow"
                title="تصدير القائمة المصفاة الحالية إلى Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تصدير ({currentTabStudents.length})</span>
              </button>

              {/* Add New Student Button (In Registered / Unregistered tabs) */}
              {activeTab !== 'ceremony' && (
                <button
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentModalOpen(true);
                  }}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>طالب جديد</span>
                </button>
              )}
            </div>
          </div>

          {/* Quranic Parts Quick Filter Scroll Strip */}
          <div className="border-t border-emerald-800/40 pt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>تصفية سريعة بحسب المستوى القرآني:</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentTabStudents.length} طالب مطابق
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-700">
              <button
                onClick={() => setPartFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                  partFilter === 'ALL'
                    ? 'bg-[#fbbf24] text-slate-950 shadow-md scale-105'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white border border-emerald-800/40'
                }`}
              >
                جميع الأجزاء ({activeTab === 'ceremony' ? masterStudentsList.length : (activeTab === 'registered' ? stats.totalRegistered : stats.totalUnregistered)})
              </button>

              {QURAN_PARTS_ORDER.map((part) => {
                const baseList = activeTab === 'ceremony'
                  ? masterStudentsList
                  : (activeTab === 'registered' ? allDisplayStudents.filter(s => s.completed === true) : allDisplayStudents.filter(s => s.completed !== true));
                const count = baseList.filter(s => matchesQuranPartCanonical(s.partName, part)).length;
                return (
                  <button
                    key={part}
                    onClick={() => setPartFilter(part)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                      partFilter === part
                        ? 'bg-emerald-400 text-slate-950 shadow-md scale-105 font-black'
                        : 'bg-slate-900/80 text-emerald-300 hover:text-white border border-emerald-500/30'
                    }`}
                  >
                    {part} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Multi-Criteria Dropdowns (Collapsible) */}
          {showAdvancedFilters && (
            <div className="border-t border-emerald-800/50 pt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-fadeInUp">
              
              {/* Score Range Filter */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#fbbf24]" />
                  <span>فئة الدرجات والامتياز:</span>
                </label>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-700/60 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] cursor-pointer"
                >
                  <option value="ALL">جميع الدرجات والفئات</option>
                  <option value="TOP_90">🌟 أوائل وامتياز (≥ 90%)</option>
                  <option value="EXCELLENT_80">✨ فئة التفوق (80% - 89.9%)</option>
                  <option value="GOOD_70">📜 فئة الإجادة (70% - 79.9%)</option>
                  <option value="ENCOURAGE_BELOW_70">🎁 فئة المواظبة والتشجيع (&lt; 70%)</option>
                </select>
              </div>

              {/* Supervising Sheikh Filter */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>الشيخ المشرف:</span>
                </label>
                <select
                  value={sheikhFilter}
                  onChange={(e) => setSheikhFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-700/60 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] cursor-pointer"
                >
                  <option value="ALL">جميع المشايخ والكوادر</option>
                  {uniqueSupervisingSheikhs.map((name) => {
                    const count = allDisplayStudents.filter(s => normalizeArabic(s.sheikhName || '').includes(normalizeArabic(name))).length;
                    return (
                      <option key={name} value={name}>
                        {name} ({count} طالب)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Study Stage Filter */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <School className="w-3 h-3 text-sky-400" />
                  <span>المرحلة الدراسية:</span>
                </label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-700/60 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] cursor-pointer"
                >
                  <option value="ALL">جميع المراحل الدراسية</option>
                  <option value="حضانة">حضانة ورياض أطفال</option>
                  <option value="ابتدائي">المرحلة الابتدائية</option>
                  <option value="إعدادي">المرحلة الإعدادية</option>
                  <option value="ثانوي">المرحلة الثانوية</option>
                  <option value="جامعي">المرحلة الجامعية</option>
                </select>
              </div>

              {/* Sorting Options */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-amber-400" />
                  <span>ترتيب وفرز السجلات:</span>
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-emerald-700/60 rounded-xl text-white focus:outline-none focus:border-[#fbbf24] cursor-pointer font-bold"
                >
                  <option value="STAGE_ORDER">🏆 ترتيب الحفل الرسمي (الأجزاء فالدرجات)</option>
                  <option value="SCORE_DESC">📈 الدرجة: من الأعلى للأدنى</option>
                  <option value="SCORE_ASC">📉 الدرجة: من الأدنى للأعلى</option>
                  <option value="CODE_ASC">🔢 كود الطالب (#001 إلى #146)</option>
                  <option value="NAME_ASC">🔤 اسم الطالب: أبجدياً (أ - ي)</option>
                  <option value="RECENT">⏱️ آخر تعديل وتحديث</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Chips Bar & Reset Button */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-emerald-800/40 pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400 font-bold text-[11px] ml-1">الفلاتر المطبقة:</span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                    <span>بحث: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {partFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                    <span>الجزء: {partFilter}</span>
                    <button onClick={() => setPartFilter('ALL')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {scoreFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-[11px] font-bold">
                    <span>الدرجة: {scoreFilter === 'TOP_90' ? '≥ 90%' : (scoreFilter === 'EXCELLENT_80' ? '80-89%' : (scoreFilter === 'GOOD_70' ? '70-79%' : '< 70%'))}</span>
                    <button onClick={() => setScoreFilter('ALL')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {sheikhFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-300 text-[11px] font-bold">
                    <span>الشيخ: {sheikhFilter}</span>
                    <button onClick={() => setSheikhFilter('ALL')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {stageFilter !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-300 text-[11px] font-bold">
                    <span>المرحلة: {stageFilter}</span>
                    <button onClick={() => setStageFilter('ALL')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {sortBy !== 'STAGE_ORDER' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px] font-bold">
                    <span>الترتيب مخصص</span>
                    <button onClick={() => setSortBy('STAGE_ORDER')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                title="إلغاء وتصفير كافة الفلاتر"
              >
                <RotateCcw className="w-3 h-3" />
                <span>مسح جميع الفلاتر</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🏆 TAB 1: CEREMONY HUB & STAGE ASCENSION (حفل التكريم والمسرح) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'ceremony' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-[#062b24]/90 border border-emerald-700/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-emerald-800/40 pb-4 gap-2">
              <div className="flex items-center gap-2.5 font-black text-[#fbbf24] text-base sm:text-lg">
                <Award className="w-6 h-6 text-[#fbbf24]" />
                <span>كشف صعود المسرح المعتمد ({ceremonyStudents.length} طالب معروض)</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3.5 py-1.5 rounded-full border border-emerald-700/40 shadow-inner">
                مرتب بحسب الأجزاء والدرجات تنازلياً ⭐
              </span>
            </div>

            {ceremonyStudents.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <Award className="w-12 h-12 text-emerald-500/30 mx-auto" />
                <p className="text-slate-300 text-sm font-bold">لا يوجد طلاب يطابقون خيارات التصفية الحالية</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#fbbf24] text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer mt-2"
                >
                  إلغاء الفلاتر وعرض الجميع
                </button>
              </div>
            ) : viewMode === 'table' ? (
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
                      <th className="p-3 text-center rounded-l-xl w-40">إجراءات المسرح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800/30">
                    {ceremonyStudents.map((student, idx) => (
                      <tr key={student.id || student.studentId || idx} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="p-3 text-center font-black">
                          <span
                            className={`inline-block w-7 h-7 rounded-full leading-7 text-center text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-slate-950 font-black shadow-lg'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-950 font-black'
                                : idx === 2
                                ? 'bg-amber-700 text-white font-black'
                                : 'bg-slate-900 text-slate-300 border border-emerald-800/40'
                            }`}
                          >
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
                          {student.examScore !== undefined && student.examScore !== '' ? (
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
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow transition-all active:scale-95 flex items-center gap-1"
                              title="عرض بطاقة التقديم والنداء المباشر على المسرح"
                            >
                              <span>🎤 نداء</span>
                            </button>

                            <button
                              onClick={() => setBadgeModalStudent(student)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all cursor-pointer"
                              title="معاينة كارت التكريم والـ QR"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setStudentModalOpen(true);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl transition-all cursor-pointer"
                              title="تعديل بيانات الطالب"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Cards Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {ceremonyStudents.map((student, idx) => (
                  <div
                    key={student.id || student.studentId || idx}
                    className="bg-[#041915] border border-emerald-700/50 rounded-2xl p-4 shadow-xl space-y-3 hover:border-[#fbbf24]/60 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#fbbf24] text-slate-950 font-black text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs">
                          {student.studentCode}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                        {student.partName}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white">{student.studentName}</h4>
                      <p className="text-[11px] text-slate-400">إشراف: {student.sheikhName || 'شيوخ الكُتّاب'}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-emerald-800/40 pt-2 text-xs">
                      <div className="text-amber-300 font-mono font-black">
                        الدرجة: {student.examScore}%
                      </div>
                      <div className="text-[11px] text-slate-300 truncate max-w-[140px]">
                        {student.gift || student.awardTier}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        onClick={() => handleOpenStagePrompter(student, idx)}
                        className="flex-1 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer text-center"
                      >
                        🎤 استدعاء للمسرح
                      </button>
                      <button
                        onClick={() => setBadgeModalStudent(student)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl"
                        title="كارت التكريم"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ✅ TAB 2: REGISTERED STUDENTS (الطلاب المسجلون - بيانات كاملة) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'registered' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-900/80 via-[#062b24] to-emerald-900/80 border border-emerald-500/40 p-5 rounded-3xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">✅ الطلاب المسجلون</h2>
                  <p className="text-xs text-emerald-300">طلاب أكملوا جميع بيانات الاستمارة بالكامل — جاهزون للحفل والتكريم</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-black">
                {registeredStudents.length} طالب مسجل مطابق
              </div>
            </div>
          </div>

          {/* Registered Students Table / Cards View */}
          <div className="bg-[#062b24]/90 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-4">
              <div className="flex items-center gap-2 font-black text-emerald-400 text-base">
                <CheckCircle2 className="w-5 h-5" />
                <span>سجل الطلاب المسجلين ({registeredStudents.length} طالب معروض)</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950 px-3.5 py-1 rounded-full border border-emerald-700/40">
                بيانات كاملة ومحققة ✅
              </span>
            </div>

            {registeredStudents.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <UserCheck className="w-12 h-12 text-emerald-500/30 mx-auto" />
                <p className="text-slate-400 text-sm font-bold">لا يوجد طلاب مطابقين للتصفية</p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer mt-2"
                >
                  إلغاء الفلاتر
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-900/50 text-emerald-300 font-black border-b border-emerald-700/50">
                      <th className="p-3 text-center rounded-r-xl w-14">م</th>
                      <th className="p-3 text-center w-24 whitespace-nowrap">كود الطالب</th>
                      <th className="p-3">اسم الطالب</th>
                      <th className="p-3">المستوى القرآني</th>
                      <th className="p-3">المرحلة والمدرسة</th>
                      <th className="p-3">ولي الأمر والهاتف</th>
                      <th className="p-3 text-center rounded-l-xl w-36">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-800/30">
                    {registeredStudents.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-emerald-900/30 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-black text-xs whitespace-nowrap inline-block">
                            {r.studentCode}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white text-sm">{r.studentName}</div>
                          <span className="text-[10px] text-emerald-300 font-semibold">{r.gift || r.awardTier}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                            {r.partName || 'القرآن الكريم'}
                          </span>
                          {r.examScore !== undefined && r.examScore !== '' && (
                            <span className="text-amber-400 font-mono font-bold mr-2 text-[10px]">
                              ({r.examScore}%)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="text-slate-200 font-bold">{r.studyStage || 'ابتدائي'}</div>
                          <span className="text-[10px] text-slate-400">{r.schoolName ? `${r.schoolName}${r.birthDate ? ` (${r.birthDate})` : ''}` : (r.birthDate ? `مواليد: ${r.birthDate}` : '—')}</span>
                        </td>
                        <td className="p-3">
                          <div className="text-emerald-400 font-mono font-bold">{r.fatherPhone || r.phone || '—'}</div>
                          <span className="text-[10px] text-amber-200/90 font-bold">{r.parentName || r.fatherStatus || ''}</span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setBadgeModalStudent(r)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl transition-all cursor-pointer"
                              title="معاينة كارت التكريم والـ QR"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCopyStudentLink(r)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all cursor-pointer"
                              title="نسخ رابط QR"
                            >
                              <Copy className="w-3.5 h-3.5" />
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
            ) : (
              /* Registered Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {registeredStudents.map((r, idx) => (
                  <div key={r.id || idx} className="bg-[#041915] border border-emerald-500/40 rounded-2xl p-4 shadow-xl space-y-3 relative">
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-xs">
                        {r.studentCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                        {r.partName}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white">{r.studentName}</h4>
                      <p className="text-[11px] text-emerald-300">{r.studyStage} • {r.schoolName || '—'}</p>
                    </div>

                    <div className="border-t border-emerald-800/40 pt-2 text-xs space-y-1 text-slate-300">
                      <div>الهاتف: <span className="font-mono text-emerald-400 font-bold">{r.fatherPhone || '—'}</span></div>
                      <div>الدرجة: <span className="font-mono text-amber-300 font-bold">{r.examScore}%</span></div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-emerald-800/40">
                      <button
                        onClick={() => setBadgeModalStudent(r)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
                      >
                        معاينة الكارت
                      </button>
                      <button
                        onClick={() => {
                          setEditingStudent(r);
                          setStudentModalOpen(true);
                        }}
                        className="p-1.5 bg-slate-800 text-slate-200 rounded-xl"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ⏳ TAB 3: UNREGISTERED STUDENTS (لم يسجلوا بعد - بيانات ناقصة) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'unregistered' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-900/60 via-[#062b24] to-amber-900/60 border border-amber-500/40 p-5 rounded-3xl shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <UserX className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">⏳ لم يسجلوا بعد</h2>
                  <p className="text-xs text-amber-300">طلاب لديهم بيانات في النظام لكن ينقصهم حقل واحد على الأقل — يحتاجون لاستكمال البيانات عبر QR Code</p>
                </div>
              </div>
              <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-black flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {unregisteredStudents.length} طالب بانتظار التسجيل
              </div>
            </div>
          </div>

          {/* Unregistered Students Table / Cards View */}
          <div className="bg-[#062b24]/90 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-800/40 pb-4">
              <div className="flex items-center gap-2 font-black text-amber-400 text-base">
                <AlertCircle className="w-5 h-5" />
                <span>الطلاب الذين لم يستكملوا التسجيل ({unregisteredStudents.length} طالب معروض)</span>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 px-3.5 py-1 rounded-full border border-amber-700/40">
                بيانات ناقصة ⏳
              </span>
            </div>

            {unregisteredStudents.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto" />
                <p className="text-emerald-400 text-sm font-bold">🎉 جميع الطلاب المسجلين مكتملون بالكامل!</p>
                <p className="text-slate-400 text-xs">لا يوجد طلاب بحاجة لاستكمال البيانات تحت الفلاتر الحالية</p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-amber-900/30 text-amber-300 font-black border-b border-amber-700/50">
                      <th className="p-3 text-center rounded-r-xl w-14">م</th>
                      <th className="p-3 text-center w-24 whitespace-nowrap">كود الطالب</th>
                      <th className="p-3">اسم الطالب</th>
                      <th className="p-3">المستوى القرآني</th>
                      <th className="p-3">الحقول الناقصة</th>
                      <th className="p-3 text-center rounded-l-xl w-44">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-800/20">
                    {unregisteredStudents.map((r, idx) => (
                      <tr key={r.id || idx} className="hover:bg-amber-900/20 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-3 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-black text-xs whitespace-nowrap inline-block">
                            {r.studentCode}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white text-sm">{r.studentName}</div>
                          <span className="text-[10px] text-slate-400 font-semibold">{r.sheikhName || 'شيوخ الكُتّاب'}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[11px]">
                            {r.partName || 'القرآن الكريم'}
                          </span>
                          {r.examScore !== undefined && r.examScore !== '' && (
                            <span className="text-amber-400 font-mono font-bold mr-2 text-[10px]">
                              ({r.examScore}%)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {(r.missingFields || getMissingStudentFields(r)).map((field, fi) => (
                              <span key={fi} className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold whitespace-nowrap">
                                ❌ {field}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleCopyStudentLink(r)}
                              className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl transition-all cursor-pointer border border-amber-500/30"
                              title="نسخ رابط QR لاستكمال البيانات"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSendWhatsAppReminder(r)}
                              className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-all cursor-pointer border border-emerald-500/30"
                              title="إرسال تذكير واتساب لولي الأمر"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingStudent(r);
                                setStudentModalOpen(true);
                              }}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl transition-all cursor-pointer"
                              title="تعديل البيانات من الداشبورد"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRequestDeleteStudent(r)}
                              className="p-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl transition-all cursor-pointer"
                              title="حذف الطالب"
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
            ) : (
              /* Unregistered Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {unregisteredStudents.map((r, idx) => (
                  <div key={r.id || idx} className="bg-[#041915] border border-amber-500/40 rounded-2xl p-4 shadow-xl space-y-3 relative">
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-400 font-mono font-bold text-xs">
                        {r.studentCode}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                        {r.partName}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white">{r.studentName}</h4>
                      <p className="text-[11px] text-slate-400">{r.sheikhName || 'شيوخ الكُتّاب'}</p>
                    </div>

                    <div className="border-t border-amber-800/30 pt-2 space-y-1">
                      <span className="text-[10px] text-amber-300 font-bold block">الحقول المطلوبة:</span>
                      <div className="flex flex-wrap gap-1">
                        {(r.missingFields || getMissingStudentFields(r)).map((field, fi) => (
                          <span key={fi} className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                            ❌ {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-amber-800/30">
                      <button
                        onClick={() => handleSendWhatsAppReminder(r)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>تذكير واتساب</span>
                      </button>
                      <button
                        onClick={() => handleCopyStudentLink(r)}
                        className="p-2 bg-slate-800 text-amber-300 rounded-xl"
                        title="نسخ رابط QR"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingStudent(r);
                          setStudentModalOpen(true);
                        }}
                        className="p-2 bg-slate-800 text-emerald-300 rounded-xl"
                        title="تعديل البيانات"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 👳‍♂️ TAB 4: SHEIKHS REGISTRY (سجل الشيوخ والمعلمين) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'sheikhs' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-[#062b24]/95 border border-emerald-700/50 p-4 sm:p-5 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sheikhSearch}
                  onChange={(e) => setSheikhSearch(e.target.value)}
                  placeholder="ابحث باسم الشيخ، المؤهل، الهاتف، العنوان..."
                  className="w-full pr-10 pl-8 py-2.5 bg-slate-950/80 border border-emerald-700/50 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24]"
                />
                {sheikhSearch && (
                  <button
                    onClick={() => setSheikhSearch('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    title="مسح البحث"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 justify-end">
                <button
                  onClick={exportSheikhsToCSV}
                  className="px-3.5 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير كشف الشيوخ</span>
                </button>

                <button
                  onClick={handleExecuteSyncSheikhs}
                  className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-[#fbbf24]/50 text-[#fbbf24] rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة محفظ جديد</span>
                </button>
              </div>
            </div>

            {/* Sheikh Role & Sort Strip */}
            <div className="border-t border-emerald-800/40 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-400 font-bold text-[11px]">تصفية الدور:</span>
                <button
                  onClick={() => setSheikhRoleFilter('ALL')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    sheikhRoleFilter === 'ALL' ? 'bg-[#fbbf24] text-slate-950' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  جميع الكوادر ({sheikhs.length})
                </button>
                <button
                  onClick={() => setSheikhRoleFilter('SUPER_ADMIN')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    sheikhRoleFilter === 'SUPER_ADMIN' ? 'bg-[#fbbf24] text-slate-950' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  👑 المشرف العام
                </button>
                <button
                  onClick={() => setSheikhRoleFilter('DEPUTY_ADMIN')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    sheikhRoleFilter === 'DEPUTY_ADMIN' ? 'bg-[#fbbf24] text-slate-950' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  ⭐ المشرف الأكاديمي
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-[11px]">الترتيب:</span>
                <select
                  value={sheikhSortBy}
                  onChange={(e) => setSheikhSortBy(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-emerald-700/50 rounded-xl text-white text-xs cursor-pointer"
                >
                  <option value="STUDENTS_DESC">عدد الطلاب المشرف عليهم (تنازلي)</option>
                  <option value="NAME_ASC">اسم الشيخ (أبجدياً)</option>
                </select>
              </div>
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
                      title="تعديل بيانات الشيخ"
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

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-emerald-800/40 pt-3">
                  <div className="text-slate-300">
                    <span className="text-[10px] text-slate-400 block">الهاتف:</span>
                    <span className="font-mono text-emerald-400 font-bold">{s.phone || '—'}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-[10px] text-slate-400 block">المؤهل:</span>
                    <span className="truncate block font-semibold">{s.qualification || 'جامعي أزهري'}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-[10px] text-slate-400 block">المستوى والإشراف:</span>
                    <span className="text-amber-200 truncate block font-semibold">{s.summerLevel || 'إشراف عام'}</span>
                  </div>
                  <div className="text-slate-300">
                    <span className="text-[10px] text-slate-400 block">الطلاب المشرف عليهم:</span>
                    <span className="font-black text-white">{s.studentsCount || 0} طالب</span>
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
            className="relative bg-[#041915] rounded-3xl border-2 border-[#fbbf24]/50 max-w-lg w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto"
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🎤 MODAL 2: STAGE LIVE PROMPTER MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
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
                  📖 {stagePrompterStudent.partName || stagePrompterStudent.part}
                </span>
                {stagePrompterStudent.examScore !== undefined && (
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

            <div className="flex items-center justify-between pt-3 border-t border-emerald-800/40">
              <button
                type="button"
                onClick={handlePrevStageStudent}
                disabled={stagePrompterIndex === 0}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الطالب السابق</span>
              </button>

              <button
                type="button"
                onClick={() => setBadgeModalStudent(stagePrompterStudent)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow"
              >
                <Eye className="w-4 h-4 text-amber-300" />
                <span>معاينة كارت التكريم</span>
              </button>

              <button
                type="button"
                onClick={handleNextStageStudent}
                disabled={stagePrompterIndex >= ceremonyStudents.length - 1}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow"
              >
                <span>الطالب التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 🏷️ MODAL 3: STUDENT BADGE PREVIEW MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {badgeModalStudent && (
        <StudentBadgeModal
          student={badgeModalStudent}
          onClose={() => setBadgeModalStudent(null)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 📝 MODAL 4: STUDENT EDIT MODAL */}
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
      {/* 👳‍♂️ MODAL 5: SHEIKH EDIT MODAL */}
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
            className="relative bg-[#062b24] p-5 sm:p-6 rounded-3xl border-2 border-[#fbbf24]/50 max-w-lg w-full text-right space-y-4 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800/40">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#fbbf24]" />
                <span>{editingSheikh ? 'تعديل بيانات المحفظ' : 'إضافة محفظ جديد'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSheikhModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSheikhSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">اسم الشيخ رباعي *</label>
                <input
                  type="text"
                  value={sheikhFormData.name}
                  onChange={(e) => setSheikhFormData({ ...sheikhFormData, name: e.target.value })}
                  placeholder="مثال: فضيلة الشيخ أحمد إبراهيم"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    value={sheikhFormData.phone}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">المؤهل الدراسي</label>
                  <input
                    type="text"
                    value={sheikhFormData.qualification}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, qualification: e.target.value })}
                    placeholder="ليسانس أصول دين / شريعة"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">مستوى الإشراف بالدورة</label>
                  <input
                    type="text"
                    value={sheikhFormData.summerLevel}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, summerLevel: e.target.value })}
                    placeholder="إشراف عام / فصول القرآن"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">عدد الطلاب المشرف عليهم</label>
                  <input
                    type="number"
                    value={sheikhFormData.studentsCount}
                    onChange={(e) => setSheikhFormData({ ...sheikhFormData, studentsCount: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">الإجازات والسند</label>
                <input
                  type="text"
                  value={sheikhFormData.ijazat}
                  onChange={(e) => setSheikhFormData({ ...sheikhFormData, ijazat: e.target.value })}
                  placeholder="حفص عن عاصم / القراءات العشر"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">الصورة الشخصية للشيخ</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSheikhPhotoUpload}
                    className="text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-[#fbbf24] file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                  />
                  {uploadingSheikhPhoto && <RefreshCw className="w-4 h-4 animate-spin text-[#fbbf24]" />}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-emerald-800/40">
                <button
                  type="button"
                  onClick={() => setSheikhModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl cursor-pointer text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl cursor-pointer shadow-lg text-xs"
                >
                  حفظ البيانات
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
          className="fixed inset-0 z-[999999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0c1e19] border-2 border-rose-600/50 rounded-3xl p-6 max-w-md w-full text-right space-y-4 shadow-2xl animate-scaleIn text-slate-100"
          >
            <div className="flex items-center gap-3 text-rose-400 border-b border-rose-900/40 pb-3">
              <div className="p-2.5 rounded-2xl bg-rose-950/80 border border-rose-500/40">
                <AlertCircle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">تأكيد عملية الحذف</h3>
                <span className="text-xs text-rose-300 font-medium">هذا الإجراء لا يمكن التراجع عنه</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                هل أنت متأكد تماماً من حذف {deleteConfirmModal.type === 'student' ? 'سجل الطالب' : 'سجل المحفظ'}:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/50 text-white font-bold text-sm">
                {deleteConfirmModal.data?.studentName || deleteConfirmModal.data?.name}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-rose-900/30">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, data: null, isDeleting: false })}
                disabled={deleteConfirmModal.isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmModal.isDeleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs cursor-pointer shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deleteConfirmModal.isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>تأكيد الحذف نهائياً</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
