import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Award, BookOpen, Sparkles, CheckCircle2, ShieldCheck, Gift, Share2, PartyPopper } from 'lucide-react';
import { launchStageCelebration } from '../services/celebration';

export default function StudentBadgeModal({ student, onClose }) {
  // 🔑 Close on Escape key and lock body scroll + launch celebration
  useEffect(() => {
    if (!student) return;
    launchStageCelebration();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [student, onClose]);

  if (!student) return null;

  // 🖨️ Handle Print
  const handlePrint = () => {
    document.body.classList.add('printing-badge');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-badge');
    }, 1500);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-badge');
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handleShareWhatsApp = () => {
    const text = `🎉 كارت وتصريح تكريم الطالب في كُتّاب: ${student.studentName || student.name}\nكود التكريم: ${student.studentCode || ''}\nفئة التكريم: ${student.awardTier || student.tier || ''}\nمستوى الحفظ: ${student.partName || student.part || 'القرآن الكريم'}\nالجائزة: ${student.gift || ''}\n\nرابط الكارت والـ QR:\n${studentQrUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app';
  const studentQrUrl = `${origin}/#/permanent-form`;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white print:static"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-[#041915] rounded-3xl border-2 border-[#fbbf24]/50 max-w-xl w-full p-5 sm:p-6 text-slate-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-scaleIn my-auto print:max-h-none print:border-none print:shadow-none print:p-0"
      >
        
        {/* Top Controls (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-800/40 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#fbbf24]" />
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">كارت وتصريح التكريم الرسمي</h3>
              <p className="text-xs text-amber-400 font-mono font-bold">{student.studentCode || (student.idx ? `#${String(student.idx).padStart(3, '0')}` : '#KUT-VIP')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => launchStageCelebration()}
              className="p-2 bg-gradient-to-r from-amber-500 to-[#fbbf24] text-slate-950 rounded-xl transition-all cursor-pointer shadow active:scale-95 animate-pulse"
              title="إطلاق احتفال وألعاب نارية"
            >
              <PartyPopper className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="p-2 bg-emerald-700/40 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 rounded-xl transition-all cursor-pointer"
              title="مشاركة عبر الواتساب"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-[#fbbf24] hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الكارت</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE BADGE CARD */}
        <div
          id="printable-badge"
          className="bg-gradient-to-b from-[#062b24] via-[#041915] to-[#02100d] border-2 border-[#fbbf24] rounded-3xl p-6 relative overflow-hidden shadow-2xl text-center space-y-4"
        >
          {/* Background Glow Ornaments */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#fbbf24]/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-[#fbbf24]/30 pb-3">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#fbbf24]">
                <BookOpen className="w-4 h-4" />
                <span>كُتّاب | KUTTAB</span>
              </div>
              <p className="text-[10px] text-emerald-300 font-medium">المنظومة الذكية لتحفيظ القرآن الكريم والتربية</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-[#fbbf24] border border-[#fbbf24]/40 font-mono font-black text-xs whitespace-nowrap">
                {student.studentCode || (student.idx ? `#${String(student.idx).padStart(3, '0')}` : '#001')}
              </span>
              <div className="px-2.5 py-1 bg-[#fbbf24]/15 border border-[#fbbf24]/40 rounded-full text-[10px] font-black text-[#fbbf24] flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>حفل 2026</span>
              </div>
            </div>
          </div>

          {/* Student Photo & QR Code Section */}
          <div className="flex items-center justify-around gap-4 py-1">
            {/* Student Photo */}
            <div className="relative">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.studentName || student.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-3 border-[#fbbf24] shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-950 border-3 border-[#fbbf24] flex flex-col items-center justify-center text-emerald-400">
                  <Award className="w-10 h-10 mb-1 text-[#fbbf24]" />
                  <span className="text-[10px] font-bold">طالب مُكَرَّم</span>
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full text-xs font-black shadow">
                ✓
              </span>
            </div>

            {/* Official Student QR Code */}
            <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-[#fbbf24]/40 flex flex-col items-center gap-1">
              <QRCodeSVG
                value={studentQrUrl}
                size={85}
                bgColor={"#FFFFFF"}
                fgColor={"#041915"}
                level={"M"}
                includeMargin={false}
              />
              <span className="text-[9px] font-black text-slate-800 tracking-wider font-mono">
                {student.studentCode || `STU-${student.idx || '2026'}`}
              </span>
            </div>
          </div>

          {/* Student Info Details */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow">
              {student.studentName || student.name}
            </h2>
            
            {/* Award Tier & Level */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#fbbf24]" />
                <span>{student.awardTier || student.tier || "✨ الفئة المتميزة"}</span>
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                {student.partName || student.part || 'القرآن الكريم'}
              </span>
            </div>

            {/* Recognition Gift & Certificate Description */}
            <div className="p-2.5 bg-gradient-to-r from-amber-500/15 via-[#062b24] to-amber-500/15 rounded-xl border border-[#fbbf24]/30 text-amber-300 text-xs font-black flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-[#fbbf24]" />
              <span>{student.gift || 'شهادة تقدير وتكريم الكُتّاب'}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-emerald-800/40">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-emerald-800/30 text-right">
              <span className="text-slate-400 text-[10px] block">المرحلة والمدرسة:</span>
              <strong className="text-white font-bold">{student.studyStage || 'طالب بالكُتّاب'} {student.schoolName ? `— ${student.schoolName}` : ''}</strong>
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
    </div>,
    document.body
  );
}
