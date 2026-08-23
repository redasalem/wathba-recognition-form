import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Printer,
  Volume2,
  Sparkles,
  Award,
  BookOpen,
  Eye,
  Share2,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export default function StagePrompterModal({
  student,
  currentIndex,
  totalStudents,
  onNext,
  onPrev,
  onClose,
  onOpenBadge,
  categoryName = 'كشف صعود المسرح'
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeMode, setActiveMode] = useState('both'); // 'both' | 'certificate' | 'speech'
  const containerRef = useRef(null);

  // 🔑 Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // 🎹 Keyboard Shortcuts for live ceremony operation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !document.fullscreenElement) {
        onClose();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowRight' || e.key === 'PageUp') {
        e.preventDefault();
        onPrev();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  // 🖨️ Handle Print
  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://wathba-kuttab.vercel.app';
  const studentQrUrl = student.smartUrl || student.qrCodeUrl || `${origin}/#/student/form?name=${encodeURIComponent(student.studentName || student.name || '')}&id=${student.studentId || student.id || ''}`;
  const studentCode = student.studentCode || (student.idx ? `#${String(student.idx).padStart(3, '0')}` : '#001');
  const studentName = student.studentName || student.name || 'طالب دار تاج الوقار';
  const partName = student.partName || student.part || 'القرآن كاملاً';
  const sheikhName = student.sheikhName && student.sheikhName !== 'شيوخ الكُتّاب' ? student.sheikhName : 'شيوخ الكُتّاب';
  const gift = student.gift || student.awardTier || 'شهادة تقدير وتكريم الكُتّاب';

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-[#020d0a]/95 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 overflow-y-auto text-slate-100 select-none animate-fade-in print:bg-white print:p-0 print:static"
    >
      {/* ─── 1. TOP STAGE CONTROLS HEADER (Hidden in Print & Pure Stage Projector) ─── */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-3 bg-[#062b24]/90 border border-emerald-700/60 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl mb-3 shrink-0 print:hidden">
        
        {/* Left: Ceremony Badge & Order Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-base flex items-center justify-center shadow-lg border border-amber-300">
            {currentIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fbbf24]" />
              <h3 className="font-black text-white text-sm sm:text-base">منصة التكريم | النداء المباشر على المسرح 🎙️</h3>
            </div>
            <p className="text-[11px] text-amber-300 font-bold">
              {categoryName} — <span className="font-mono text-emerald-300 font-black">طالب #{currentIndex + 1} من {totalStudents}</span>
            </p>
          </div>
        </div>

        {/* Center: View Modes Toggles */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-emerald-800/60">
          <button
            onClick={() => setActiveMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'both' ? 'bg-[#fbbf24] text-slate-950 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            العرض والنداء معاً
          </button>
          <button
            onClick={() => setActiveMode('certificate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'certificate' ? 'bg-emerald-500 text-slate-950 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            شهادة المسرح الكبرى 🏆
          </button>
          <button
            onClick={() => setActiveMode('speech')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'speech' ? 'bg-emerald-500 text-slate-950 shadow font-black' : 'text-slate-300 hover:text-white'
            }`}
          >
            نص الإلقاء الصوتي 🎙️
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-700/60 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={isFullscreen ? 'الخروج من ملء الشاشة (F)' : 'شاشة كاملة للبروجكتور (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden lg:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 sm:px-3 sm:py-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
            title="طباعة الشهادة"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">طباعة</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ─── 2. MAIN PRESENTATION BODY ─── */}
      <div className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center gap-4 my-auto print:max-w-none print:w-full print:m-0">
        
        {/* 🌟 LUXURY OFFICIAL STAGE CERTIFICATE CANVAS (دار تاج الوقار) */}
        {(activeMode === 'both' || activeMode === 'certificate') && (
          <div
            id="stage-certificate-print"
            className="relative w-full max-w-4xl aspect-[1.414/1] rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.8)] border-2 sm:border-4 border-[#fbbf24]/70 bg-[#062b24] transition-all print:border-none print:shadow-none print:w-full print:aspect-auto"
            style={{
              backgroundImage: `url('/certificate-template.jpg')`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* 1. STUDENT NAME OVERLAY (Perfect vertical & horizontal center inside the green ornate banner) */}
            <div
              className="absolute text-center flex items-center justify-center px-4"
              style={{
                top: '55.2%',
                left: '26%',
                width: '48%',
                height: '7%',
                transform: 'translateY(-50%)'
              }}
            >
              <h1
                className="font-black text-[#fef08a] tracking-wide truncate drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: 'clamp(1.15rem, 2.6vw, 2.25rem)',
                  fontFamily: `'Amiri', 'Cairo', 'Traditional Arabic', serif`,
                  textShadow: '0 0 16px rgba(251, 191, 36, 0.75), 0 3px 8px rgba(0,0,0,0.95)'
                }}
              >
                {studentName}
              </h1>
            </div>

            {/* 2. QURANIC LEVEL OVERLAY (Inside the dark green oval frame on the left of "المستوى القرآني") */}
            <div
              className="absolute text-center flex flex-col items-center justify-center gap-0.5 px-1"
              style={{
                top: '76.4%',
                left: '42.0%',
                width: '10.5%',
                height: '5.6%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span
                className="font-black text-[#fbbf24] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] truncate leading-tight"
                style={{
                  fontSize: 'clamp(0.65rem, 1.0vw, 0.90rem)',
                  fontFamily: `'Amiri', 'Cairo', serif`,
                  textShadow: '0 0 10px rgba(251, 191, 36, 0.6), 0 2px 5px rgba(0,0,0,0.9)'
                }}
              >
                {partName}
              </span>
              {score > 0 && (
                <span className="text-white font-mono font-black text-[0.65rem] sm:text-[0.75rem] leading-none drop-shadow">
                  ({score}%)
                </span>
              )}
            </div>

            {/* 3. SUPERVISING SHEIKH (On the line to the left of "الشيخ المحفظ") */}
            <div
              className="absolute text-center flex items-center justify-center px-1"
              style={{
                bottom: '6.5%',
                right: '21.0%',
                width: '14.0%',
                height: '4.0%'
              }}
            >
              <p
                className="font-black text-[#fef08a] truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ fontSize: 'clamp(0.6rem, 0.9vw, 0.82rem)' }}
              >
                {sheikhName}
              </p>
            </div>

            {/* 4. QR CODE (Directly inside the white box) */}
            <div
              className="absolute flex items-center justify-center bg-white rounded-sm p-0.5 shadow-sm"
              style={{
                bottom: '4.8%',
                left: '50.3%',
                width: '3.8%',
                height: '7.2%'
              }}
            >
              <QRCodeSVG
                value={studentQrUrl}
                size={70}
                level="M"
                includeMargin={false}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Student Code Badge (On the space next to "كود الطالب:") */}
            <div
              className="absolute text-center flex items-center justify-center px-0.5"
              style={{
                bottom: '8.8%',
                left: '45.8%',
                width: '4.0%',
                height: '3.0%'
              }}
            >
              <span
                className="font-mono font-black text-[#fbbf24] drop-shadow leading-none"
                style={{ fontSize: 'clamp(0.65rem, 0.95vw, 0.85rem)' }}
              >
                {studentCode}
              </span>
            </div>

            {/* 5. CEREMONY MANAGEMENT (On the line to the right of "مدير الكتاب") */}
            <div
              className="absolute text-center flex items-center justify-center px-1"
              style={{
                bottom: '6.5%',
                left: '21.0%',
                width: '14.0%',
                height: '4.0%'
              }}
            >
              <p
                className="font-black text-[#fef08a] truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ fontSize: 'clamp(0.6rem, 0.9vw, 0.82rem)' }}
              >
                إدارة دار تاج الوقار
              </p>
            </div>
          </div>
        )}

        {/* 🎙️ SPOKEN STAGE ANNOUNCEMENT SCRIPT BOX */}
        {(activeMode === 'both' || activeMode === 'speech') && (
          <div className="w-full max-w-4xl bg-gradient-to-r from-[#041915] via-[#062b24] to-[#041915] border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 print:hidden">
            <div className="flex items-center justify-between border-b border-emerald-800/40 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                <Volume2 className="w-4 h-4 text-[#fbbf24]" />
                <span>نص الإلقاء والتقديم المباشر على ميكروفون المسرح:</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#fbbf24] text-[11px] font-mono font-bold border border-amber-500/30">
                {studentCode}
              </span>
            </div>

            <p className="text-sm sm:text-lg text-slate-100 font-semibold leading-relaxed text-right">
              "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ .. يَتَفَضَّلُ الآنَ لِصُعُودِ مِنَصَّةِ التَّكْرِيمِ الطَّالِبُ الحَافِظُ / <strong className="text-[#fbbf24] text-base sm:text-xl font-black">{studentName}</strong> .. بِمُسْتَوَى <strong className="text-emerald-300 font-black">{partName}</strong> {score > 0 && <span>(بِدَرَجَةِ <strong className="text-amber-300 font-mono font-black">{score}%</strong>)</span>} .. تَحْتَ إِشْرَافِ فَضِيلَةِ الشَّيْخِ / <strong className="text-amber-300 font-black">{sheikhName}</strong>."
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-800/40 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                <Award className="w-4 h-4 text-[#fbbf24]" />
                <span>التكريم والهدية:</span>
                <span className="text-[#fbbf24] font-black">{gift}</span>
              </div>

              {student.fatherPhone && (
                <div className="text-[11px] text-slate-400 font-mono">
                  📱 هاتف ولي الأمر: {student.fatherPhone}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. BOTTOM NAVIGATION BAR ─── */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-3 bg-[#062b24]/90 border border-emerald-700/60 rounded-2xl p-3 shadow-2xl backdrop-blur-xl shrink-0 mt-3 print:hidden">
        <button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="px-4 sm:px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all border border-emerald-700/40 active:scale-95 shadow"
        >
          <ChevronRight className="w-5 h-5 text-amber-400" />
          <span>الطالب السابق (→)</span>
        </button>

        <div className="text-center hidden sm:block">
          <div className="text-xs text-slate-400 font-bold">التنقل السريع بالأسهم (← / →) أو مسطرة المسافات</div>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= totalStudents - 1}
          className="px-5 sm:px-7 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-lg"
        >
          <span>الطالب التالي (←)</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>,
    document.body
  );
}
