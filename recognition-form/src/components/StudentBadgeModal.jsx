import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Award, BookOpen, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function StudentBadgeModal({ student, onClose }) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const qrPayload = JSON.stringify({
    id: student.id,
    name: student.studentName,
    part: student.partName || 'القرآن كاملاً',
    system: 'Wathba Kuttab'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 overflow-y-auto animate-fadeInUp">
      <div className="relative bg-[#041915] rounded-3xl border border-[#fbbf24]/50 max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-6">
        
        {/* Top Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#fbbf24]" />
            <h3 className="text-lg font-black text-white">كارت وتصريح التكريم الرسمي</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكارت الآن</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BADGE CARD */}
        <div
          id="printable-badge"
          className="bg-gradient-to-b from-[#062b24] via-[#041915] to-[#02100d] border-2 border-[#fbbf24] rounded-3xl p-6 relative overflow-hidden shadow-2xl text-center space-y-5"
        >
          {/* Background Glow Ornaments */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-[#fbbf24]/30 pb-4">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#fbbf24]">
                <BookOpen className="w-4 h-4" />
                <span>كُتّاب | KUTTAB</span>
              </div>
              <p className="text-[10px] text-emerald-300 font-medium">المنظومة الذكية لتحفيظ القرآن الكريم والتربية</p>
            </div>

            <div className="px-3 py-1 bg-[#fbbf24]/15 border border-[#fbbf24]/40 rounded-full text-[10px] font-black text-[#fbbf24] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>حفل تكريم 2026</span>
            </div>
          </div>

          {/* Student Photo & QR Code Section */}
          <div className="flex items-center justify-around gap-4 py-2">
            {/* Student Photo */}
            <div className="relative">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.studentName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-3 border-[#fbbf24] shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-950 border-3 border-[#fbbf24] flex flex-col items-center justify-center text-emerald-400">
                  <Award className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-bold">طالب مكرم</span>
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs font-black shadow">
                ✓
              </span>
            </div>

            {/* Official Student QR Code */}
            <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-[#fbbf24]/40 flex flex-col items-center gap-1">
              <QRCodeSVG
                value={qrPayload}
                size={85}
                bgColor={"#FFFFFF"}
                fgColor={"#041915"}
                level={"L"}
                includeMargin={false}
              />
              <span className="text-[9px] font-black text-slate-800 tracking-wider font-mono">
                QR-{student.id?.slice(0, 6).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Student Info Details */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {student.studentName}
            </h2>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
              <Award className="w-4 h-4 text-[#fbbf24]" />
              <span>فئة التكريم: {student.partName || 'القرآن كاملاً 🏆'}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-emerald-800/40">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-emerald-800/30 text-right">
              <span className="text-slate-400 text-[10px] block">المرحلة والمدرسة:</span>
              <strong className="text-white font-bold">{student.studyStage} — {student.schoolName}</strong>
            </div>

            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-emerald-800/30 text-right">
              <span className="text-slate-400 text-[10px] block">الشيخ المشرف:</span>
              <strong className="text-[#fbbf24] font-bold">{student.sheikhName || 'فضيلة شيوخ الكُتّاب'}</strong>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-3 border-t border-[#fbbf24]/20 flex items-center justify-between text-[11px] text-emerald-400/90 font-bold">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#fbbf24]" />
              <span>معتمد من إدارة منظومة كُتّاب الذكية</span>
            </div>
            <span>وثبة | Wathba</span>
          </div>

        </div>

      </div>
    </div>
  );
}
