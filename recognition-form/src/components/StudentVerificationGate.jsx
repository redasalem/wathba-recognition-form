import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Award,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  User,
  BookOpen,
  Clock,
  Edit3,
  QrCode,
  X,
  ChevronLeft
} from 'lucide-react';
import {
  STUDENTS_CATALOG,
  normalizeArabic,
  matchesStudentSearch,
  isStudentMatch
} from '../data/studentsCatalog';
import { isStudentFullyRegistered } from './AdminDashboard';

export default function StudentVerificationGate({
  records = [],
  initialQuery = '',
  onStudentVerified,
  onGoHome,
  isAdminLoggedIn = false,
  showToast
}) {
  const [query, setQuery] = useState(initialQuery || '');

  // Synchronize query when initialQuery prop changes (e.g. from QR scan)
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  // 1. Merge catalog students (146 students) with active Firestore records
  const allVerifiedStudents = useMemo(() => {
    const map = new Map();

    // Add all students from official 2026 catalog
    STUDENTS_CATALOG.forEach(cat => {
      map.set(cat.studentId || cat.code, {
        ...cat,
        studentId: cat.studentId,
        studentCode: cat.code,
        studentName: cat.name,
        partName: cat.part,
        awardTier: cat.tier,
        examScore: cat.score,
        gift: cat.gift,
        totalParts: cat.totalParts || 1,
        smartUrl: cat.smart_url,
        qrCodeUrl: cat.qr_code_url
      });
    });

    // Merge in real-time Firestore database records
    records.forEach(rec => {
      let matchedKey = null;

      if (rec.studentId && map.has(rec.studentId)) {
        matchedKey = rec.studentId;
      } else {
        for (const [k, v] of map.entries()) {
          if (isStudentMatch(rec, v)) {
            matchedKey = k;
            break;
          }
        }
      }

      if (matchedKey) {
        const existing = map.get(matchedKey);
        map.set(matchedKey, {
          ...existing,
          ...rec,
          studentId: existing.studentId || rec.studentId || rec.id,
          studentCode: existing.studentCode || rec.studentCode || existing.code,
          studentName: rec.studentName || existing.studentName || existing.name,
          partName: rec.partName || existing.partName || existing.part,
          awardTier: rec.awardTier || existing.awardTier || existing.tier,
          examScore: rec.examScore !== undefined ? rec.examScore : existing.examScore,
          gift: rec.gift || existing.gift,
          totalParts: rec.totalParts || existing.totalParts || 1
        });
      } else if (rec.studentName || rec.name) {
        const docId = rec.id || rec.studentId || `DOC-${Math.random().toString(36).substr(2, 9)}`;
        map.set(docId, {
          ...rec,
          studentId: rec.studentId || rec.id || docId,
          studentCode: rec.studentCode || '',
          studentName: rec.studentName || rec.name,
          partName: rec.partName || rec.part || 'القرآن الكريم',
          awardTier: rec.awardTier || rec.tier || '✨ فئة متميزة',
          examScore: rec.examScore !== undefined ? rec.examScore : '',
          gift: rec.gift || 'شهادة تقدير وتكريم الكُتّاب',
          totalParts: rec.totalParts || 1
        });
      }
    });

    return Array.from(map.values());
  }, [records]);

  // 2. Filter students in real time as the user types
  const filteredStudents = useMemo(() => {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];
    return allVerifiedStudents.filter(stu => matchesStudentSearch(stu, cleanQuery));
  }, [allVerifiedStudents, query]);

  const handleSelectStudent = (student, forceEdit = false) => {
    onStudentVerified(student, forceEdit);
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-4 sm:my-8 animate-fade-in text-slate-100 px-3 sm:px-4">
      <div className="rounded-3xl border border-[#fbbf24]/40 bg-[#062b24]/90 backdrop-blur-xl shadow-2xl p-5 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Decorative Glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-[#fbbf24]/50 flex items-center justify-center text-[#fbbf24] shadow-xl shadow-amber-900/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24] text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوابة التحقق والبحث عن الطلاب المُكَرَّمين 2026</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            ابحث عن اسمك واستعرض بطاقة التكريم 🏆
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            البوابة مخصصة حصرياً لأبنائنا الطلاب المعتمدين في حفل تكريم الدورة الصيفية 2026. اكتب اسمك أو كودك للانتقال فوراً لاستعراض بطاقة تكريمك الرسمية.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اكتب اسم الطالب أو كود الطالب المطبوع على كارت الدعوة..."
              className="w-full px-4 py-4 pl-12 pr-12 rounded-2xl text-sm sm:text-base bg-slate-900/95 border-2 border-emerald-700/70 text-white placeholder-slate-400 focus:outline-none focus:border-[#fbbf24] transition-all shadow-inner"
              autoFocus
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Helper Info Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span className="text-[11px] text-slate-400">
              💡 اكتب الاسم ثلاثياً أو الكود المعتمد للبحث المباشر
            </span>
            <span className="text-emerald-400 font-bold text-[11px]">
              ✓ كشوفات الطلاب معتمدة ومؤمنة
            </span>
          </div>
        </div>

        {/* ─── CASE 1: SEARCH HAS MATCHES (SHOW RESULT CARDS) ─── */}
        {query.trim().length > 0 && filteredStudents.length > 0 && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-black text-[#fbbf24] px-1 border-b border-emerald-800/40 pb-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                نتائج البحث المعتمدة ({filteredStudents.length} طالب):
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                اضغط على اسمك لعرض بطاقة التكريم
              </span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredStudents.map((stu) => {
                const isCompleted = isStudentFullyRegistered(stu);

                return (
                  <div
                    key={stu.studentId || stu.studentCode || stu.name}
                    className="p-4 rounded-2xl bg-[#041915]/95 border-2 border-emerald-700/50 hover:border-[#fbbf24] transition-all duration-200 space-y-3 group shadow-lg"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-black text-white group-hover:text-[#fbbf24] transition-colors">
                            {stu.studentName || stu.name}
                          </h3>
                          {stu.studentCode && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-[#fbbf24] font-mono text-xs font-black border border-[#fbbf24]/40">
                              {stu.studentCode}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                          <span className="text-emerald-300 font-bold flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {stu.partName || stu.part || 'القرآن الكريم'}
                          </span>
                          {stu.awardTier && (
                            <span className="text-amber-200/90 text-[11px]">
                              • {stu.awardTier}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            بيانات مسجلة ومعتمدة
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[#fbbf24] text-[11px] font-bold">
                            <Award className="w-3.5 h-3.5" />
                            طالب معتمد بالتكريم
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-emerald-900/50 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectStudent(stu, false)}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>عرض كارت وبروفايل التكريم 🏆</span>
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={() => handleSelectStudent(stu, true)}
                          className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-emerald-700/50 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          title="تعديل بيانات الطالب (إدارة)"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#fbbf24]" />
                          <span>تعديل (إدارة)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── CASE 2: SEARCH HAS NO MATCHES (ERROR BANNER) ─── */}
        {query.trim().length > 0 && filteredStudents.length === 0 && (
          <div className="p-5 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 text-xs font-bold space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">لم يتم العثور على أي طالب بهذا الاسم أو الكود!</h4>
                <p className="leading-relaxed text-slate-200">
                  عذراً، لم نتمكن من مطابقة "<span className="text-[#fbbf24] font-black">{query}</span>" ضمن كشوفات الطلاب المعتمدين لتكريم الدورة الصيفية 2026.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-300 space-y-1">
              <p>🔒 <strong>قواعد التحقق:</strong> الاستعراض مخصص حصرياً للطلاب المقيدين في قاعدة بيانات حفل التكريم الرسمية.</p>
              <p>💡 <strong>نصيحة:</strong> يرجى التأكد من كتابة الاسم بدون أخطاء إملائية، أو كتابة كود الطالب المطبوع على كارت الدعوة بدقة.</p>
            </div>
          </div>
        )}

        {/* ─── CASE 3: INITIAL IDLE STATE (GUIDE BANNER) ─── */}
        {query.trim().length === 0 && (
          <div className="p-5 rounded-2xl bg-[#041915]/80 border border-emerald-800/40 space-y-3 text-xs text-slate-300">
            <h4 className="text-sm font-black text-[#fbbf24] flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              <span>طرق الوصول السريع لبطاقة التكريم:</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">1.</span>
                <span><strong>كارت الـ QR المطبوع:</strong> مسح كود الـ QR المطبوع على كارت الدعوة ينقلك مباشرة لبوابة البحث لعرض بطاقتك وتكريمك فوراً.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">2.</span>
                <span><strong>البحث الفوري بالاسم أو الكود:</strong> اكتب اسم ابنك/ابنتك أو الكود في صندوق البحث أعلاه للتحقق وعرض بطاقة التكريم.</span>
              </li>
            </ul>
          </div>
        )}

        {/* Bottom Navigation Actions */}
        <div className="pt-3 border-t border-emerald-800/40 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onGoHome}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </button>

          <span className="text-[#fbbf24] font-bold text-[11px] sm:text-xs">
            كُتّاب 2026 | حفل التكريم والختام 🏆
          </span>
        </div>

      </div>
    </div>
  );
}
