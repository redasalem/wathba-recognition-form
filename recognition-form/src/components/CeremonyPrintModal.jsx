import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  X, 
  Download, 
  Award, 
  BookOpen, 
  CheckSquare, 
  Square, 
  SlidersHorizontal, 
  Sparkles, 
  FileSpreadsheet, 
  Layers, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { 
  QURAN_PARTS_ORDER, 
  getCanonicalPartName, 
  matchesQuranPartCanonical, 
  normalizeArabic 
} from '../data/studentsCatalog';

export default function CeremonyPrintModal({ 
  students = [], 
  isOpen, 
  onClose, 
  initialPart = 'ALL',
  showToast 
}) {
  const [selectedPart, setSelectedPart] = useState(initialPart);
  const [showSettings, setShowSettings] = useState(false);

  // Column toggles
  const [showCode, setShowCode] = useState(true);
  const [showScore, setShowScore] = useState(true);
  const [showTier, setShowTier] = useState(true);
  const [showGift, setShowGift] = useState(true);
  const [showSheikh, setShowSheikh] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [showParentPhone, setShowParentPhone] = useState(false);
  const [showFooterSignatures, setShowFooterSignatures] = useState(true);

  useEffect(() => {
    if (initialPart) {
      setSelectedPart(initialPart);
    }
  }, [initialPart]);

  // Lock body scroll & handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  // ══════════════════════════════════════════════════════════════
  // 📚 GROUP & SORT STUDENTS BY PART (DESCENDING BY EXAM SCORE)
  // ══════════════════════════════════════════════════════════════
  const groupedPartsData = useMemo(() => {
    if (!students || students.length === 0) return [];

    const result = [];
    const usedStudentIds = new Set();

    // 1. Process known standard parts in order
    QURAN_PARTS_ORDER.forEach((partName) => {
      const partStudents = students.filter((s) => {
        if (s.isDeleted === true || s.accountStatus === 'DELETED') return false;
        const matches = matchesQuranPartCanonical(s.partName || s.part, partName);
        if (matches) {
          usedStudentIds.add(s.id || s.studentId || s.idx);
          return true;
        }
        return false;
      });

      if (partStudents.length > 0) {
        // Sort descending by score, then alphabetically by Arabic name when tied
        const sorted = [...partStudents].sort((a, b) => {
          const scA = Number(a.examScore !== undefined && a.examScore !== '' ? a.examScore : (a.score || 0));
          const scB = Number(b.examScore !== undefined && b.examScore !== '' ? b.examScore : (b.score || 0));
          if (scB !== scA) return scB - scA; // Descending
          // Tiebreaker: Arabic alphabetical order by student name
          const nameA = (a.studentName || a.name || '').trim();
          const nameB = (b.studentName || b.name || '').trim();
          return nameA.localeCompare(nameB, 'ar');
        });

        // Compute part metrics
        const maxScore = sorted.reduce((max, s) => {
          const sc = Number(s.examScore !== undefined && s.examScore !== '' ? s.examScore : (s.score || 0));
          return sc > max ? sc : max;
        }, 0);

        const topScorersCount = sorted.filter(s => {
          const sc = Number(s.examScore !== undefined && s.examScore !== '' ? s.examScore : (s.score || 0));
          return sc >= 90;
        }).length;

        result.push({
          partName,
          canonicalName: getCanonicalPartName(partName),
          students: sorted,
          totalCount: sorted.length,
          maxScore,
          topScorersCount
        });
      }
    });

    // 2. Capture any remaining students with custom / non-standard part names
    const leftoverStudents = students.filter(s => {
      if (s.isDeleted === true || s.accountStatus === 'DELETED') return false;
      return !usedStudentIds.has(s.id || s.studentId || s.idx);
    });

    if (leftoverStudents.length > 0) {
      // Group leftovers by their raw part name
      const customGroups = {};
      leftoverStudents.forEach(s => {
        const pName = (s.partName || s.part || 'مستويات إضافية').trim();
        if (!customGroups[pName]) customGroups[pName] = [];
        customGroups[pName].push(s);
      });

      Object.entries(customGroups).forEach(([pName, pStudents]) => {
        const sorted = [...pStudents].sort((a, b) => {
          const scA = Number(a.examScore !== undefined && a.examScore !== '' ? a.examScore : (a.score || 0));
          const scB = Number(b.examScore !== undefined && b.examScore !== '' ? b.examScore : (b.score || 0));
          if (scB !== scA) return scB - scA;
          // Tiebreaker: Arabic alphabetical order by student name
          const nameA = (a.studentName || a.name || '').trim();
          const nameB = (b.studentName || b.name || '').trim();
          return nameA.localeCompare(nameB, 'ar');
        });

        const maxScore = sorted.reduce((max, s) => {
          const sc = Number(s.examScore !== undefined && s.examScore !== '' ? s.examScore : (s.score || 0));
          return sc > max ? sc : max;
        }, 0);

        result.push({
          partName: pName,
          canonicalName: pName,
          students: sorted,
          totalCount: sorted.length,
          maxScore,
          topScorersCount: sorted.filter(s => (Number(s.examScore || s.score || 0)) >= 90).length
        });
      });
    }

    return result;
  }, [students]);

  // Displayed groups according to selected filter
  const displayedGroups = useMemo(() => {
    if (selectedPart === 'ALL') {
      return groupedPartsData;
    }
    return groupedPartsData.filter(g => 
      matchesQuranPartCanonical(g.partName, selectedPart) || g.partName === selectedPart
    );
  }, [groupedPartsData, selectedPart]);

  const totalDisplayedStudentsCount = useMemo(() => {
    return displayedGroups.reduce((sum, g) => sum + g.totalCount, 0);
  }, [displayedGroups]);

  // ══════════════════════════════════════════════════════════════
  // 🖨️ HANDLE DIRECT PRINT
  // ══════════════════════════════════════════════════════════════
  const handlePrint = () => {
    document.body.classList.add('printing-ceremony-sheet');

    const handleAfterPrint = () => {
      document.body.classList.remove('printing-ceremony-sheet');
      window.removeEventListener('afterprint', handleAfterPrint);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // ══════════════════════════════════════════════════════════════
  // 📊 EXPORT SORTED CSV BY PARTS
  // ══════════════════════════════════════════════════════════════
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'المستوى القرآني,الترتيب في الجزء,كود الطالب,اسم الطالب,الدرجة %,فئة التكريم,الهدية المقررة,الشيخ المشرف,هاتف ولي الأمر,المرحلة الدراسية,المدرسة\n';

    displayedGroups.forEach(group => {
      group.students.forEach((s, idx) => {
        const row = [
          `"${group.partName}"`,
          idx + 1,
          `"${s.studentCode || s.code || ''}"`,
          `"${s.studentName || s.name || ''}"`,
          `"${s.examScore !== undefined && s.examScore !== '' ? s.examScore : (s.score || '')}"`,
          `"${s.awardTier || s.tier || ''}"`,
          `"${s.gift || ''}"`,
          `"${s.sheikhName || ''}"`,
          `"${s.fatherPhone || s.phone || ''}"`,
          `"${s.studyStage || ''}"`,
          `"${s.schoolName || s.school || ''}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const filename = selectedPart === 'ALL' 
      ? `كشف_كافة_الاجزاء_تنازلي_${new Date().toISOString().slice(0, 10)}.csv`
      : `كشف_${selectedPart.replace(/\s+/g, '_')}_تنازلي_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast?.(`تم تصدير كشف الإكسيل بنجاح (${totalDisplayedStudentsCount} طالباً) 📊`, 'success');
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-950/95 backdrop-blur-md overflow-hidden animate-fade-in font-['Cairo']">
      
      {/* ══════════════════════════════════════════════════════════ */}
      {/* 🛠️ TOP CONTROL TOOLBAR (Hidden on print) */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="shrink-0 bg-[#041915] border-b border-emerald-800/60 p-3 sm:p-4 shadow-xl z-20 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Title & Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  مركز طباعة كشوفات التكريم الرسمية 2026
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-[#fbbf24] text-slate-950 font-black text-xs shadow">
                  ترتيب تنازلي ⭐
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                كل جزء قرآني في صفحة A4 مستقلة جاهزة للتسليم والمسرح ({totalDisplayedStudentsCount} طالب في المعاينة)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Toggle Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                showSettings 
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400' 
                  : 'bg-slate-900 text-slate-300 border-emerald-800/60 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>تخصيص الأعمدة</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-900 hover:bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow"
              title="تصدير كشف إكسيل مرتب تنازلياً"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>تصدير Excel</span>
            </button>

            {/* Print Primary Button */}
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-gradient-to-r from-[#fbbf24] via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl hover:shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>
                {selectedPart === 'ALL' 
                  ? `طباعة الدفتر الكامل (${totalDisplayedStudentsCount} طالب - ${displayedGroups.length} صفحة/أجزاء)` 
                  : `طباعة كشف (${selectedPart})`}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ═══ Part Selection Bar ═══ */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-emerald-900/60 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-emerald-700">
          <button
            onClick={() => setSelectedPart('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedPart === 'ALL'
                ? 'bg-gradient-to-r from-amber-400 to-[#fbbf24] text-slate-950 shadow-md scale-105'
                : 'bg-slate-900/90 text-slate-300 hover:text-white border border-emerald-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>دفتر الحفل الكامل (كافة الأجزاء: {students.length} طالب)</span>
          </button>

          {groupedPartsData.map((group) => (
            <button
              key={group.partName}
              onClick={() => setSelectedPart(group.partName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedPart === group.partName
                  ? 'bg-emerald-400 text-slate-950 font-black shadow-md scale-105'
                  : 'bg-slate-900/80 text-emerald-300 hover:text-white border border-emerald-800/40'
              }`}
            >
              <span>{group.partName}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950/60 text-[10px] font-mono">
                {group.totalCount}
              </span>
            </button>
          ))}
        </div>

        {/* ═══ Custom Column Toggles Panel ═══ */}
        {showSettings && (
          <div className="max-w-7xl mx-auto mt-3 p-3 bg-slate-900/90 border border-amber-500/30 rounded-2xl animate-fade-in text-xs space-y-3">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>تخصيص الأعمدة والبيانات الظاهرة في الكشف المطبوع:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showCode}
                  onChange={(e) => setShowCode(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>كود الطالب (#)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showScore}
                  onChange={(e) => setShowScore(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>درجة الاختبار (%)</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showTier}
                  onChange={(e) => setShowTier(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>فئة التكريم</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showGift}
                  onChange={(e) => setShowGift(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>نوع الجائزة / الهدية</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showSheikh}
                  onChange={(e) => setShowSheikh(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>الشيخ المشرف</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showSignature}
                  onChange={(e) => setShowSignature(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>خانة توقيع الاستلام</span>
              </label>

              <label className="flex items-center gap-2 text-slate-200 cursor-pointer select-none bg-slate-950/60 p-2 rounded-xl border border-emerald-800/30 hover:border-emerald-500/40">
                <input
                  type="checkbox"
                  checked={showFooterSignatures}
                  onChange={(e) => setShowFooterSignatures(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>توقيعات الاعتماد بالأسفل</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 📄 PRINTABLE A4 PAGES CONTAINER */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/70">
        
        {/* Helper Note (Hidden on Print) */}
        <div className="max-w-4xl mx-auto mb-4 bg-emerald-950/60 border border-emerald-700/40 p-3 rounded-2xl text-emerald-200 text-xs flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>معاينة الطباعة المعتمدة:</strong> تم تنسيق كل جزء قرآني في صفحة A4 مستقلة بترتيب تنازلي للدرجات. عند الضغط على "طباعة"، سيتم إرسال الصفحات للطابعة بتنسيق ورقي ناصع البياض وعالي الدقة.
            </span>
          </div>
          <span className="font-bold text-amber-300 font-mono text-[11px] shrink-0 mr-2">
            {displayedGroups.length} صفحة / جزء
          </span>
        </div>

        {/* ═══ PRINT ROOT CONTAINER (Target for CSS @media print) ═══ */}
        <div id="printable-ceremony-sheets" className="max-w-4xl mx-auto space-y-8">
          
          {displayedGroups.length === 0 ? (
            <div className="bg-white text-slate-900 rounded-3xl p-12 text-center space-y-3 shadow-2xl">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-black">لا توجد سجلات مطابقة لهذا الجزء</h3>
              <p className="text-xs text-slate-500">يرجى اختيار جزء آخر أو اختيار دفتر الحفل الكامل.</p>
            </div>
          ) : (
            displayedGroups.map((group, groupIdx) => (
              <div 
                key={group.partName}
                className="ceremony-part-page bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-300 print:border-none print:shadow-none print:rounded-none print:p-0"
              >
                
                {/* ═══ Page Header ═══ */}
                <div className="border-b-2 border-emerald-900 pb-3 mb-4">
                  
                  {/* Top Bismillah & Logos */}
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-2">
                    <div className="flex items-center gap-2 text-right">
                      <img
                        src="/logo.jpg"
                        alt="كُتّاب"
                        className="w-10 h-10 rounded-full object-cover border border-emerald-800 shadow-sm print:w-8 print:h-8"
                      />
                      <div>
                        <div className="font-black text-sm text-emerald-950">دار تاج الوقار - الكُتّاب</div>
                        <div className="text-[11px] text-slate-600">الدورة الصيفية لحفظ كتاب الله 2026</div>
                      </div>
                    </div>


                    <div className="text-center font-serif text-sm font-bold text-emerald-900">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>

                    <div className="text-left text-[11px] text-slate-600">
                      <div>التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
                      <div className="font-bold text-emerald-900">حفل التكريم والمسرح</div>
                    </div>
                  </div>

                  {/* Big Banner for the Quran Part */}
                  <div className="bg-[#064e3b] text-white p-3 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                        {groupIdx + 1}
                      </div>
                      <div>
                        <div className="text-[11px] text-amber-300 font-bold">كشف صعود المسرح والتكريم المعتمد</div>
                        <h1 className="text-base sm:text-lg font-black tracking-wide text-white">
                          المستوى القرآني: {group.partName}
                        </h1>
                      </div>
                    </div>

                    {/* Part Stats */}
                    <div className="flex items-center gap-3 text-right">
                      <div className="bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-600/40 text-center">
                        <div className="text-[10px] text-amber-300 font-bold">عدد الطلاب</div>
                        <div className="text-sm font-black text-white">{group.totalCount}</div>
                      </div>

                      {showScore && group.maxScore > 0 && (
                        <div className="bg-emerald-950/80 px-3 py-1 rounded-lg border border-emerald-600/40 text-center">
                          <div className="text-[10px] text-amber-300 font-bold">أعلى درجة</div>
                          <div className="text-sm font-black text-amber-300">{group.maxScore}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ═══ Students Table ═══ */}
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#064e3b] text-white font-black">
                        <th className="p-2 text-center w-12 border border-slate-800">الدور</th>
                        {showCode && <th className="p-2 text-center w-16 border border-slate-800">الكود</th>}
                        <th className="p-2 border border-slate-800">اسم الطالب المكرم</th>
                        {showScore && <th className="p-2 text-center w-16 border border-slate-800">الدرجة</th>}
                        {showTier && <th className="p-2 border border-slate-800">فئة التكريم</th>}
                        {showGift && <th className="p-2 border border-slate-800">الجائزة والهدية</th>}
                        {showSheikh && <th className="p-2 border border-slate-800">الشيخ المحفظ</th>}
                        {showSignature && <th className="p-2 text-center w-28 border border-slate-800">توقيع الاستلام</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300 text-[11px]">
                      {group.students.map((student, sIdx) => {
                        const scoreVal = student.examScore !== undefined && student.examScore !== '' 
                          ? Number(student.examScore) 
                          : Number(student.score || 0);

                        return (
                          <tr 
                            key={student.id || student.studentId || sIdx}
                            className={sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                          >
                            {/* Rank # (Sorted Descending) */}
                            <td className="p-2 text-center font-black border border-slate-300">
                              <span className={`inline-block w-6 h-6 rounded-full leading-6 text-center text-xs ${
                                sIdx === 0 
                                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm' 
                                  : sIdx === 1 
                                  ? 'bg-slate-300 text-slate-950 font-bold' 
                                  : sIdx === 2 
                                  ? 'bg-amber-700 text-white font-bold' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {sIdx + 1}
                              </span>
                            </td>

                            {/* Student Code */}
                            {showCode && (
                              <td className="p-2 text-center font-mono font-bold text-slate-900 border border-slate-300 bg-slate-50/80">
                                {student.studentCode || student.code || `#${String(sIdx + 1).padStart(3, '0')}`}
                              </td>
                            )}

                            {/* Student Name */}
                            <td className="p-2 font-bold text-slate-950 text-xs border border-slate-300">
                              <div>{student.studentName || student.name}</div>
                              {showParentPhone && (student.fatherPhone || student.phone) && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ولي الأمر: {student.fatherPhone || student.phone}
                                </span>
                              )}
                            </td>

                            {/* Score */}
                            {showScore && (
                              <td className="p-2 text-center font-bold border border-slate-300">
                                <span className={`px-1.5 py-0.5 rounded font-mono text-xs ${
                                  scoreVal >= 90 
                                    ? 'text-emerald-950 font-black' 
                                    : scoreVal >= 75 
                                    ? 'text-slate-900 font-bold' 
                                    : 'text-slate-700'
                                }`}>
                                  {scoreVal > 0 ? `${scoreVal}%` : '-'}
                                </span>
                              </td>
                            )}

                            {/* Tier */}
                            {showTier && (
                              <td className="p-2 font-bold text-slate-800 border border-slate-300">
                                {student.awardTier || student.tier || '✨ فئة متميزة'}
                              </td>
                            )}

                            {/* Gift */}
                            {showGift && (
                              <td className="p-2 text-slate-800 border border-slate-300">
                                {student.gift || 'شهادة تقدير وتكريم'}
                              </td>
                            )}

                            {/* Sheikh Name */}
                            {showSheikh && (
                              <td className="p-2 text-slate-700 border border-slate-300">
                                {student.sheikhName || 'شيوخ الكُتّاب'}
                              </td>
                            )}

                            {/* Stage Receipt Signature Box */}
                            {showSignature && (
                              <td className="p-2 border border-slate-300 text-center">
                                <div className="h-6 border-b border-dashed border-slate-400"></div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ═══ Footer Signatures & Page Details ═══ */}
                {showFooterSignatures && (
                  <div className="pt-3 border-t-2 border-emerald-900 text-xs mt-auto">
                    <div className="grid grid-cols-3 gap-4 text-center font-bold text-slate-800">
                      <div className="space-y-6">
                        <div>مسؤول المنصة والنداء</div>
                        <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
                      </div>

                      <div className="space-y-6">
                        <div>الشيخ المحفظ / المشرف</div>
                        <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
                      </div>

                      <div className="space-y-6">
                        <div>إدارة كُتّاب 2026</div>
                        <div className="border-b border-dotted border-slate-400 w-32 mx-auto"></div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                      <span>كشف رسمي معتمد لصعود المسرح - مرتب تنازلياً حسب درجات الاختبار</span>
                      <span>صفحة {groupIdx + 1} من {displayedGroups.length}</span>
                    </div>
                  </div>
                )}

              </div>
            ))
          )}

        </div>
      </div>

    </div>,
    document.body
  );
}
