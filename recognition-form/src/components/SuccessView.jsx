import React, { useEffect } from 'react';
import { CheckCircle2, MessageSquare, PlusCircle, ArrowRight, Award } from 'lucide-react';
import { launchStageCelebration } from '../services/celebration';

export default function SuccessView({ studentData, submittedData, onReset, onRegisterAnother, onViewProfile, onViewDashboard, onGoHome, isAdminLoggedIn }) {
  const data = studentData || submittedData;

  useEffect(() => {
    launchStageCelebration();
  }, []);

  const studentName = data?.studentName || '';
  const fatherPhone = data?.fatherPhone || '';
  const waMessage = encodeURIComponent(`السلام عليكم، تم استكمال وتأكيد بيانات الطالب المُكَرَّم (${studentName}) لحضور حفل تكريم الدورة الصيفية 2026 بنجاح في كُتّاب.`);
  const waUrl = `https://wa.me/20${(fatherPhone || '').replace(/^0/, '')}?text=${waMessage}`;

  const handleRegisterAnother = onReset || onRegisterAnother;
  const handleViewProfile = onViewProfile || onViewDashboard;

  return (
    <div className="w-full max-w-md mx-auto my-6 p-4 animate-scaleIn">
      <div className="rounded-3xl border border-[#fbbf24]/40 bg-[#062b24]/90 backdrop-blur-xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden text-slate-100">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#fbbf24]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Success Check Icon */}
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-900/30 animate-popIn">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Confetti Emoji Icons */}
        <div className="flex justify-center gap-3 mb-3">
          <span className="text-2xl animate-float">🎉</span>
          <span className="text-2xl animate-float delay-200">🏆</span>
          <span className="text-2xl animate-float delay-400">⭐</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-black text-[#fbbf24] mb-2 drop-shadow-md">
          تم حفظ وتأكيد البيانات بنجاح! 🏆
        </h2>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-5 font-semibold">
          شكراً لكم ولي أمر ابننا الفاضل <strong className="text-[#fbbf24] font-black">{studentName}</strong>.<br />
          سعداء بكم في مسيرة كُتّاب. تم اعتماد البيانات وسنرحب بحضوركم في حفل التكريم المبارك.
        </p>

        {/* Photo Badge Preview if exists */}
        {data?.photoUrl && (
          <div className="mb-5 flex justify-center">
            <div className="relative">
              <img
                src={data.photoUrl}
                alt={studentName}
                className="w-20 h-20 rounded-full object-cover border-3 border-[#fbbf24] shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 text-xs bg-emerald-500 text-white p-1 rounded-full">✓</span>
            </div>
          </div>
        )}

        {/* Primary Action: View Official Profile Badge */}
        {handleViewProfile && (
          <button
            onClick={handleViewProfile}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all duration-300 flex items-center justify-center gap-2 mb-3 cursor-pointer"
          >
            <Award className="w-5 h-5 text-slate-950" />
            <span>عرض كارت وبادج التكريم الرسمي 🏆</span>
          </button>
        )}

        {/* WhatsApp Direct Action Button */}
        {fatherPhone && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mb-4 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-emerald-200" />
            <span>تأكيد ومراسلة إدارة الكُتّاب عبر الواتساب 💬</span>
          </a>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-emerald-800/40">
          <button
            onClick={handleRegisterAnother}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-700/30 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#fbbf24]" />
            <span>تسجيل طالب آخر</span>
          </button>

          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-700/40 cursor-pointer"
            >
              <span>الرئيسية</span>
            </button>
          )}

          {isAdminLoggedIn && (
            <button
              onClick={onViewDashboard}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[#fbbf24] text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-amber-500/30 cursor-pointer"
            >
              <span>لوحة الإدارة</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
