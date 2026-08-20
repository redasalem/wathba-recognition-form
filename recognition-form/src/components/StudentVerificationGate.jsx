import React, { useState } from 'react';
import {
  Search,
  Award,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { findStudentInCatalog, normalizeArabic } from '../data/studentsCatalog';

export default function StudentVerificationGate({ records = [], onStudentVerified, onGoHome, showToast }) {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchError, setSearchError] = useState('');

  const handleSearch = (e) => {
    e?.preventDefault();
    const cleanQuery = query.trim();
    setSearchError('');
    setHasSearched(true);

    if (!cleanQuery) {
      setSearchError('يرجى كتابة كود الطالب أو اسمه للتحقق.');
      setFoundStudent(null);
      return;
    }

    // 1. Check in 143 Catalog
    const catalogMatch = findStudentInCatalog(cleanQuery);

    // 2. Check in Firestore records
    const existingDoc = records.find(rec => {
      if (catalogMatch && (rec.studentId === catalogMatch.studentId || rec.id === catalogMatch.studentId)) return true;
      if (rec.studentCode && rec.studentCode.replace('#', '') === cleanQuery.replace('#', '')) return true;
      if (normalizeArabic(rec.studentName || '').includes(normalizeArabic(cleanQuery))) return true;
      return false;
    });

    if (catalogMatch || existingDoc) {
      const merged = {
        ...(catalogMatch || {}),
        ...(existingDoc || {}),
        studentId: catalogMatch ? catalogMatch.studentId : (existingDoc.studentId || existingDoc.id),
        studentCode: catalogMatch ? catalogMatch.code : (existingDoc.studentCode || ''),
        studentName: catalogMatch ? catalogMatch.name : (existingDoc.studentName || cleanQuery),
        partName: catalogMatch ? catalogMatch.part : (existingDoc.partName || 'القرآن الكريم'),
        awardTier: catalogMatch ? catalogMatch.tier : (existingDoc.awardTier || '✨ فئة متميزة'),
        examScore: catalogMatch ? catalogMatch.score : (existingDoc.examScore || ''),
        gift: catalogMatch ? catalogMatch.gift : (existingDoc.gift || 'مكافأة وهدية التكريم'),
        totalParts: catalogMatch ? catalogMatch.totalParts : (existingDoc.totalParts || 1)
      };
      setFoundStudent(merged);
      setSearchError('');
    } else {
      setFoundStudent(null);
      setSearchError('عذراً، لم يتم العثور على هذا الاسم أو الكود ضمن قائمة الـ 143 طالباً المعتمدين لتكريم الدورة الصيفية 2026. يرجى التأكد من الكود المكتوب على كارت الدعوة.');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-6 sm:my-10 animate-fade-in text-slate-100 px-4">
      <div className="rounded-3xl border border-[#fbbf24]/40 bg-[#062b24]/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-[#fbbf24]/40 flex items-center justify-center text-[#fbbf24] shadow-lg shadow-amber-900/30">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbbf24]/15 border border-[#fbbf24]/30 text-[#fbbf24] text-[11px] font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>بوابة التحقق من الطلاب المُكَرَّمين 2026</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            التحقق واعتماد بيانات الطالب المُكَرَّم
          </h2>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            الاستمارة مخصصة حصرياً لأبنائنا الطلاب الـ 143 المعتمدين في حفل تكريم الدورة الصيفية. يرجى كتابة كود الطالب أو اسمه للتحقق.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (hasSearched) setHasSearched(false);
              }}
              placeholder="اكتب كود الطالب (مثال: #001) أو اسم الطالب..."
              className="w-full px-4 py-3.5 pl-12 rounded-2xl text-sm bg-slate-900/90 border border-emerald-700/60 text-white placeholder-slate-500 focus:outline-none focus:border-[#fbbf24] transition-all shadow-inner"
              autoFocus
            />
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center"
              title="بحث وتحقق"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
            <span>💡 مثال للبحث: <strong className="text-amber-300">#001</strong> أو <strong className="text-amber-300">تسنيم أحمد</strong></span>
            <span className="text-emerald-400">143 طالباً معتمداً</span>
          </div>
        </form>

        {/* Result 1: Student Verified Successfully */}
        {foundStudent && (
          <div className="p-5 rounded-2xl bg-[#041915] border-2 border-[#fbbf24] space-y-4 animate-scaleIn shadow-2xl">
            <div className="flex items-center gap-3 border-b border-emerald-800/40 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">تم التحقق بنجاح من السجل الرسمي ✓</span>
                <h3 className="text-lg font-black text-white">{foundStudent.studentName}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-800/30">
                <span className="text-[10px] text-slate-400 block">كود التكريم:</span>
                <span className="font-mono font-black text-[#fbbf24] text-sm">{foundStudent.studentCode || '#001'}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-800/30">
                <span className="text-[10px] text-slate-400 block">المستوى القرآني:</span>
                <span className="font-bold text-emerald-300">{foundStudent.partName || 'القرآن الكريم'}</span>
              </div>
            </div>

            <button
              onClick={() => onStudentVerified(foundStudent)}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>متابعة واستكمال بيانات الطالب المُكَرَّم 🌟</span>
            </button>
          </div>
        )}

        {/* Result 2: Error / Not Found in 143 Catalog */}
        {searchError && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-bold space-y-2 animate-fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{searchError}</p>
            </div>
            <p className="text-[11px] text-slate-300 pt-1 border-t border-rose-500/20">
              📌 تنبيه: إذا كنت قد استلمت كارت الدعوة الرسمي المطبوع، يمكنك مسح كود الـ QR المطبوع على الكارت مباشرة بكاميرا هاتفك للوصول السريع.
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-emerald-800/40 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onGoHome}
            className="text-slate-400 hover:text-white flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </button>

          <span className="text-[#fbbf24] font-bold">
            كُتّاب 2026 | حفل التكريم والختام 🏆
          </span>
        </div>

      </div>
    </div>
  );
}
