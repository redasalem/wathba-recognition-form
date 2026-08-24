import React from 'react';
import { HelpCircle, Search, ArrowRight, ExternalLink, MessageCircle, AlertTriangle } from 'lucide-react';

export default function StudentNotFoundView({ searchedName = '', searchedId = '', searchedCode = '', onSearchAgain, onGoHome }) {
  const facebookSupportUrl = 'https://www.facebook.com/profile.php?id=61593331866319';

  const searchQuery = searchedName || searchedCode || searchedId;

  return (
    <div className="w-full max-w-xl mx-auto my-6 sm:my-10 animate-fade-in text-slate-100 px-4">
      <div className="rounded-3xl border border-amber-500/30 bg-[#062b24]/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-center">
        
        {/* Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Support Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-950/40 animate-popIn">
          <HelpCircle className="w-10 h-10" />
        </div>

        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[#fbbf24] text-[11px] font-black">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>مركز الدعم الفني والمساعدة | كُتّاب 2026</span>
        </div>

        {/* Main Heading */}
        <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
          بيانات الطالب غير مسجلة أو تحتاج تحديث
        </h2>

        {/* Required Message */}
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-slate-200 text-sm leading-relaxed font-semibold">
          <p className="mb-2 text-amber-300 font-bold">
            عذراً، بيانات الطالب غير موجودة.
          </p>
          <p className="text-xs sm:text-sm text-slate-300">
            من فضلك الرجوع إلى إدارة الكُتّاب أو أرسل لنا رسالة على الرابط التالي للمساعدة في استكمال وتحديث البيانات:
          </p>
        </div>

        {/* Searched Details if available */}
        {searchQuery && (
          <div className="p-3 rounded-xl bg-slate-900/70 border border-emerald-800/30 text-xs text-slate-300 flex flex-wrap items-center justify-center gap-2">
            <span className="text-slate-400">القيمة المستعلم عنها:</span>
            <span className="font-mono font-bold text-[#fbbf24] px-2 py-0.5 bg-emerald-950/80 rounded border border-emerald-700/40">
              {searchQuery}
            </span>
          </div>
        )}

        {/* Primary Action: Official Facebook Support Page */}
        <div className="space-y-3 pt-2">
          <a
            href={facebookSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-sm shadow-xl shadow-blue-900/30 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5 text-white" />
            <span>مراسلة إدارة الكُتّاب عبر فيسبوك للدعم والمساعدة</span>
            <ExternalLink className="w-4 h-4 text-blue-200" />
          </a>

          <p className="text-[11px] text-slate-400">
            فريق إدارة الكُتّاب متاح للرد الفوري وتحديث بيانات التكريم والشهادات 💬
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-emerald-800/40">
          {onSearchAgain && (
            <button
              type="button"
              onClick={onSearchAgain}
              className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/60 text-[#fbbf24] hover:text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-2 border border-emerald-600/40 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>التحقق من الكود أو البحث مجدداً</span>
            </button>
          )}

          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700/50 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة للصفحة الرئيسية</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
