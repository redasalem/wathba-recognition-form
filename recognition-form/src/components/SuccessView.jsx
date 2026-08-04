import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageSquare, PlusCircle, ArrowRight } from 'lucide-react';

export default function SuccessView({ studentData, onReset, onViewDashboard, isAdminLoggedIn }) {
  useEffect(() => {
    // Launch Confetti animation
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#f59e0b', '#6366f1', '#10b981']
      });
    } catch (e) {
      console.log('Confetti failed to launch:', e);
    }
  }, []);

  const studentName = studentData?.studentName || '';
  const fatherPhone = studentData?.fatherPhone || '';
  const waMessage = encodeURIComponent(`السلام عليكم، تم استكمال بيانات الطالب (${studentName}) لحضور حفلة تكريم الدورة الصيفية 2026 بنجاح في الكُتّاب.`);
  const waUrl = `https://wa.me/20${fatherPhone}?text=${waMessage}`;

  return (
    <div className="w-full max-w-md mx-auto my-6 p-4 animate-scaleIn">
      <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Success Check Icon */}
        <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-700/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-900/30 animate-popIn">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        {/* Confetti Emoji Icons */}
        <div className="flex justify-center gap-3 mb-4">
          <span className="text-2xl animate-float">🎉</span>
          <span className="text-2xl animate-float delay-200">🏆</span>
          <span className="text-2xl animate-float delay-400">⭐</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-black text-emerald-400 mb-3 drop-shadow-md">
          تم حفظ البيانات بنجاح! 🏆
        </h2>

        {/* Message */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6 font-medium">
          شكراً لكم ولي أمر ابننا الفاضل <strong className="text-teal-300 font-extrabold">{studentName}</strong>.<br />
          سعداء بانضمامكم لمسيرة كُتّاب الذكية. تم تسجيل البيانات بنجاح وسنرحب بحضوركم في حفل التكريم.
        </p>

        {/* Photo Badge Preview if exists */}
        {studentData?.photoUrl && (
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img
                src={studentData.photoUrl}
                alt={studentName}
                className="w-20 h-20 rounded-full object-cover border-3 border-teal-400 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 text-xs bg-emerald-500 text-white p-1 rounded-full">✓</span>
            </div>
          </div>
        )}

        {/* WhatsApp Direct Action Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 hover:shadow-emerald-500/30 transition-all duration-300 flex items-center justify-center gap-2 mb-4"
        >
          <MessageSquare className="w-5 h-5 text-emerald-100" />
          <span>تواصل مباشر وتأكيد عبر الواتساب</span>
        </a>

        {/* Bottom Actions */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-white/10">
          <button
            onClick={onReset}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-white/10"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>تسجيل طالب آخر</span>
          </button>

          {isAdminLoggedIn && (
            <button
              onClick={onViewDashboard}
              className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-amber-500/30"
            >
              <span>عرض لوحة التحكم</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
